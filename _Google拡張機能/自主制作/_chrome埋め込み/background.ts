/// <reference types="chrome"/>

const PANEL_PATH = 'index.html';
const openTabIds = new Set<number>();
const DEBUG = true;

const log = (...args: unknown[]) => {
  if (DEBUG) console.log('[Banso Navi BG]', ...args);
};

const warn = (...args: unknown[]) => console.warn('[Banso Navi BG]', ...args);
const errorLog = (...args: unknown[]) => console.error('[Banso Navi BG]', ...args);

const DEVELOPMENT_PAGE_ORIGINS = new Set([
  'http://192.168.3.35:3001',
  'http://192.168.1.229:3001',
  'http://localhost:3001',
]);

const isAllowedUrl = (url?: string) => {
  if (!url) return false;

  try {
    const parsed = new URL(url);

    if (DEVELOPMENT_PAGE_ORIGINS.has(parsed.origin)) {
      return true;
    }

    return (
      parsed.origin === 'https://www.hug-ayumu.link' &&
      parsed.pathname.startsWith('/hug/wm/')
    );
  } catch (error) {
    warn('URL parse failed:', url, error);
    return false;
  }
};

const notifyTabPanelState = async (tabId: number | undefined, open: boolean) => {
  if (typeof tabId !== 'number') return;

  try {
    log('notify content script:', { tabId, open });
    await chrome.tabs.sendMessage(tabId, {
      type: 'side-panel-state',
      open,
    });
  } catch (error) {
    warn('notify failed. content script may not exist:', {
      tabId,
      open,
      error,
    });
  }
};

const setPanelEnabled = async (tabId: number, enabled: boolean) => {
  log('sidePanel.setOptions:', {
    tabId,
    path: PANEL_PATH,
    enabled,
  });

  await chrome.sidePanel.setOptions({
    tabId,
    path: PANEL_PATH,
    enabled,
  });
};

const openPanelFromUserGesture = async (tabId: number) => {
  log('openPanelFromUserGesture start:', { tabId });

  // 重要:
  // chrome.sidePanel.open() はユーザー操作の直後でないと失敗することがあります。
  // この関数の前に await setOptions() などを挟まないようにしています。
  await chrome.sidePanel.open({ tabId });

  openTabIds.add(tabId);

  log('openPanelFromUserGesture success:', {
    tabId,
    openTabIds: [...openTabIds],
  });

  await notifyTabPanelState(tabId, true);
};

const closePanel = async (tabId: number, windowId?: number) => {
  log('closePanel start:', {
    tabId,
    windowId,
    hasClose: typeof chrome.sidePanel.close === 'function',
  });

  if (typeof chrome.sidePanel.close === 'function') {
    try {
      // open() を tabId 指定で行っているため、close() も tabId を優先します。
      await chrome.sidePanel.close({ tabId });
    } catch (tabCloseError) {
      warn('sidePanel.close by tabId failed. try windowId fallback:', {
        tabId,
        windowId,
        tabCloseError,
      });

      if (typeof windowId === 'number') {
        await chrome.sidePanel.close({ windowId });
      } else {
        throw tabCloseError;
      }
    }
  } else {
    // chrome.sidePanel.close がない Chrome 向けのフォールバックです。
    // enabled:false にして閉じた後、許可URLなら再度 enabled:true に戻します。
    warn('chrome.sidePanel.close is not available. fallback setOptions enabled:false:', {
      tabId,
    });

    await chrome.sidePanel.setOptions({
      tabId,
      enabled: false,
    });

    try {
      const tab = await chrome.tabs.get(tabId);

      if (isAllowedUrl(tab.url)) {
        await setPanelEnabled(tabId, true);
      }
    } catch (error) {
      warn('tab get failed after fallback close:', {
        tabId,
        error,
      });
    }
  }

  openTabIds.delete(tabId);

  log('closePanel success:', {
    tabId,
    openTabIds: [...openTabIds],
  });

  await notifyTabPanelState(tabId, false);
};

chrome.sidePanel
  .setPanelBehavior({
    openPanelOnActionClick: true,
  })
  .then(() => log('setPanelBehavior success'))
  .catch((error) => errorLog('setPanelBehavior failed:', error));

// Chrome の sidePanel イベントが使える環境では、それも使って同期します。
if ('onOpened' in chrome.sidePanel && chrome.sidePanel.onOpened) {
  chrome.sidePanel.onOpened.addListener((info) => {
    log('sidePanel.onOpened:', info);

    if (typeof info.tabId === 'number') {
      openTabIds.add(info.tabId);
      void notifyTabPanelState(info.tabId, true);
    }
  });
}

if ('onClosed' in chrome.sidePanel && chrome.sidePanel.onClosed) {
  chrome.sidePanel.onClosed.addListener((info) => {
    log('sidePanel.onClosed:', info);

    if (typeof info.tabId === 'number') {
      openTabIds.delete(info.tabId);
      void notifyTabPanelState(info.tabId, false);
    }
  });
}

// サイドパネルページ側から runtime.connect されたら、
// パネルが実際に開いている状態として管理します。
// パネルが閉じられると port.onDisconnect が走るため、
// Chrome 側の × で閉じた場合も openTabIds を正しく更新できます。
chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== 'banso-navi-side-panel') return;

  let connectedTabId: number | undefined;

  port.onMessage.addListener((message) => {
    log('runtime.onConnect message:', message);

    if (message?.type !== 'side-panel-mounted') return;

    if (typeof message.tabId !== 'number') {
      warn('side-panel-mounted received without tabId:', message);
      return;
    }

    connectedTabId = message.tabId;
    openTabIds.add(connectedTabId);

    log('side panel connected:', {
      tabId: connectedTabId,
      openTabIds: [...openTabIds],
    });

    void notifyTabPanelState(connectedTabId, true);
  });

  port.onDisconnect.addListener(() => {
    if (typeof connectedTabId !== 'number') return;

    openTabIds.delete(connectedTabId);

    log('side panel disconnected:', {
      tabId: connectedTabId,
      openTabIds: [...openTabIds],
    });

    void notifyTabPanelState(connectedTabId, false);
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!changeInfo.url && changeInfo.status !== 'complete') return;

  const url = changeInfo.url ?? tab.url;
  const allowed = isAllowedUrl(url);

  log('tabs.onUpdated:', {
    tabId,
    url,
    status: changeInfo.status,
    allowed,
    windowId: tab.windowId,
  });

  setPanelEnabled(tabId, allowed).catch((error) =>
    errorLog('setOptions failed onUpdated:', error),
  );

  if (!allowed) {
    closePanel(tabId, tab.windowId).catch((error) =>
      errorLog('closePanel failed onUpdated:', error),
    );
  }
});

chrome.tabs.onActivated.addListener(async ({ tabId, windowId }) => {
  try {
    const tab = await chrome.tabs.get(tabId);
    const allowed = isAllowedUrl(tab.url);

    log('tabs.onActivated:', {
      tabId,
      windowId,
      url: tab.url,
      allowed,
    });

    await setPanelEnabled(tabId, allowed);

    if (!allowed) {
      await closePanel(tabId, windowId);
    }
  } catch (error) {
    errorLog('tabs.onActivated failed:', error);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const tabId = sender.tab?.id;
  const windowId = sender.tab?.windowId;
  const tabUrl = sender.tab?.url;

  log('runtime.onMessage received:', {
    message,
    tabId,
    windowId,
    tabUrl,
  });

  const run = async () => {
    if (message?.type === 'toggle-side-panel') {
      if (typeof tabId !== 'number') {
        warn('toggle failed. tabId missing:', {
          message,
          sender,
        });

        return {
          ok: false,
          error: 'Tab was not found.',
        };
      }

      const allowed = isAllowedUrl(tabUrl);
      const isOpen = openTabIds.has(tabId);

      log('toggle request:', {
        tabId,
        windowId,
        tabUrl,
        allowed,
        isOpen,
      });

      if (!allowed) {
        return {
          ok: false,
          error: 'This URL is not allowed.',
        };
      }

      if (isOpen) {
        await closePanel(tabId, windowId);

        return {
          ok: true,
          open: false,
        };
      }

      // ここで setOptions を await しないことが重要です。
      // open() をユーザー操作直後のAPI呼び出しにします。
      await openPanelFromUserGesture(tabId);

      return {
        ok: true,
        open: true,
      };
    }

    if (message?.type === 'open-side-panel') {
      if (typeof tabId !== 'number') {
        warn('open failed. tabId missing:', {
          message,
          sender,
        });

        return {
          ok: false,
          error: 'Tab was not found.',
        };
      }

      const allowed = isAllowedUrl(tabUrl);

      log('open request:', {
        tabId,
        windowId,
        tabUrl,
        allowed,
      });

      if (!allowed) {
        return {
          ok: false,
          error: 'This URL is not allowed.',
        };
      }

      await openPanelFromUserGesture(tabId);

      return {
        ok: true,
        open: true,
      };
    }

    if (message?.type === 'close-side-panel') {
      if (typeof tabId !== 'number') {
        warn('close failed. tabId missing:', {
          message,
          sender,
        });

        return {
          ok: false,
          error: 'Tab was not found.',
        };
      }

      log('close request:', {
        tabId,
        windowId,
        tabUrl,
      });

      await closePanel(tabId, windowId);

      return {
        ok: true,
        open: false,
      };
    }

    if (message?.type !== 'api-fetch') {
      log('unknown message ignored:', message);
      return undefined;
    }

    log('api-fetch start:', {
      url: message.url,
      options: message.options,
    });

    const options = {
      ...(message.options || {}),
    };

    if (!options.credentials) {
      options.credentials = 'include';
    }

    const res = await fetch(message.url, options);
    const contentType = res.headers.get('content-type') || '';

    const body = contentType.includes('application/json')
      ? await res.json()
      : await res.text();

    const errorText =
      typeof body === 'object' && body !== null && 'error' in body
        ? String((body as { error: string }).error)
        : typeof body === 'string' && body
          ? body
          : `HTTP ${res.status}`;

    log('api-fetch end:', {
      url: message.url,
      ok: res.ok,
      status: res.status,
    });

    return {
      ok: res.ok,
      status: res.status,
      body,
      error: res.ok ? undefined : errorText,
    };
  };

  run()
    .then((response) => {
      log('runtime.onMessage response:', response);

      if (response !== undefined) {
        sendResponse(response);
      }
    })
    .catch((error: Error) => {
      errorLog('runtime.onMessage failed:', error);

      sendResponse({
        ok: false,
        error: error.message,
      });
    });

  return true;
});