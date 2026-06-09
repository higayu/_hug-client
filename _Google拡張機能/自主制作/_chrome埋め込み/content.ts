/// <reference types="chrome"/>

const HOST_ID = 'banso-navi-side-panel-button-host';
const DEBUG = true;

const log = (...args: unknown[]) => {
  if (DEBUG) console.log('[Banso Navi Content]', ...args);
};

const warn = (...args: unknown[]) => console.warn('[Banso Navi Content]', ...args);

const DEVELOPMENT_PAGE_ORIGINS = new Set([
  'http://192.168.3.35:3001',
  'http://192.168.1.229:3001',
  'http://localhost:3001',
]);

const isAllowedPage = () => {
  if (DEVELOPMENT_PAGE_ORIGINS.has(location.origin)) {
    return true;
  }

  return (
    location.origin === 'https://www.hug-ayumu.link' &&
    location.pathname.startsWith('/hug/wm/')
  );
};

const hasChromeRuntime = () =>
  typeof chrome !== 'undefined' &&
  !!chrome.runtime &&
  typeof chrome.runtime.sendMessage === 'function';

const sendRuntimeMessage = (message: unknown): Promise<any> => {
  return new Promise((resolve) => {
    const runtimeAvailable = hasChromeRuntime();

    log('sendRuntimeMessage start:', {
      message,
      runtimeAvailable,
      href: location.href,
    });

    if (!runtimeAvailable) {
      warn('chrome.runtime が使えません。content.ts がWebアプリ側に混ざっている可能性があります。');

      resolve({
        ok: false,
        error: 'chrome.runtime is not available.',
      });

      return;
    }

    chrome.runtime.sendMessage(message, (response) => {
      const lastError = chrome.runtime.lastError;

      if (lastError) {
        warn('runtime message failed:', lastError.message, {
          message,
        });

        resolve({
          ok: false,
          error: lastError.message,
        });

        return;
      }

      log('sendRuntimeMessage response:', response);
      resolve(response);
    });
  });
};

const updateButtonState = (button: HTMLButtonElement, open: boolean) => {
  log('updateButtonState:', { open });

  button.dataset.open = String(open);
  button.textContent = open ? '×' : '›';
  button.title = open ? '伴走ナビを閉じる' : '伴走ナビを開く';
  button.setAttribute('aria-label', button.title);
};

const ensureButton = () => {
  const existing = document.getElementById(HOST_ID);
  const allowed = isAllowedPage();

  log('ensureButton:', {
    allowed,
    existing: !!existing,
    href: location.href,
    runtimeAvailable: hasChromeRuntime(),
  });

  if (!allowed) {
    if (existing) {
      log('remove embedded button because current URL is not allowed.');
      existing.remove();
    }

    void sendRuntimeMessage({
      type: 'close-side-panel',
    });

    return;
  }

  if (existing) return;

  const host = document.createElement('div');
  host.id = HOST_ID;

  const shadow = host.attachShadow({
    mode: 'closed',
  });

  const style = document.createElement('style');

  style.textContent = `
    :host { all: initial; }

    button {
      position: fixed;
      top: 50%;
      right: 0;
      transform: translateY(-50%);
      z-index: 2147483647;
      width: 36px;
      height: 72px;
      border: 0;
      border-radius: 12px 0 0 12px;
      background: #1a73e8;
      color: #fff;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 28px;
      font-weight: 700;
      line-height: 1;
      cursor: pointer;
      box-shadow: 0 2px 8px rgb(0 0 0 / 25%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      transition: background 120ms ease, width 120ms ease;
    }

    button:hover {
      width: 40px;
      background: #1558b0;
    }

    button[data-open="true"] {
      background: #d93025;
    }

    button[data-open="true"]:hover {
      background: #a50e0e;
    }

    button:focus-visible {
      outline: 3px solid #8ab4f8;
      outline-offset: 2px;
    }
  `;

  const button = document.createElement('button');
  button.type = 'button';

  updateButtonState(button, false);

  button.addEventListener('click', async () => {
    log('embedded button clicked:', {
      href: location.href,
      currentlyOpen: button.dataset.open,
    });

    const response = await sendRuntimeMessage({
      type: 'toggle-side-panel',
    });

    if (response?.ok && typeof response.open === 'boolean') {
      log('toggle success:', response);
      updateButtonState(button, response.open);
      return;
    }

    warn('side panel toggle failed:', response?.error, response);
  });

  if (hasChromeRuntime()) {
    log('register runtime.onMessage listener.');

    chrome.runtime.onMessage.addListener((message) => {
      log('runtime.onMessage received:', message);

      if (message?.type === 'side-panel-state' && typeof message.open === 'boolean') {
        updateButtonState(button, message.open);
      }
    });
  } else {
    warn('runtime.onMessage listener skipped because chrome.runtime is not available.');
  }

  shadow.append(style, button);
  document.documentElement.appendChild(host);

  log('embedded button appended.');
};

ensureButton();

const onUrlChanged = () => {
  log('URL changed detected:', location.href);
  ensureButton();
};

const originalPushState = history.pushState;

history.pushState = function (...args) {
  log('history.pushState:', args);

  const result = originalPushState.apply(this, args);
  window.dispatchEvent(new Event('banso-navi-url-changed'));

  return result;
};

const originalReplaceState = history.replaceState;

history.replaceState = function (...args) {
  log('history.replaceState:', args);

  const result = originalReplaceState.apply(this, args);
  window.dispatchEvent(new Event('banso-navi-url-changed'));

  return result;
};

window.addEventListener('popstate', onUrlChanged);
window.addEventListener('hashchange', onUrlChanged);
window.addEventListener('banso-navi-url-changed', onUrlChanged);