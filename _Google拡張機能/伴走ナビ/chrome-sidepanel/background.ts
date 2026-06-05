/// <reference types="chrome"/>

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== 'api-fetch') return;

  fetch(message.url, message.options || {})
    .then(async (res) => {
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
      sendResponse({
        ok: res.ok,
        status: res.status,
        body,
        error: res.ok ? undefined : errorText,
      });
    })
    .catch((err: Error) => {
      sendResponse({ ok: false, error: err.message });
    });

  return true;
});
