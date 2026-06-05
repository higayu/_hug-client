/// <reference types="chrome"/>

const HOST_ID = 'banso-navi-side-panel-button-host';

if (!document.getElementById(HOST_ID)) {
  const host = document.createElement('div');
  host.id = HOST_ID;

  const shadow = host.attachShadow({ mode: 'closed' });
  const style = document.createElement('style');
  style.textContent = `
    :host {
      all: initial;
    }

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

    button:focus-visible {
      outline: 3px solid #8ab4f8;
      outline-offset: 2px;
    }
  `;

  const button = document.createElement('button');
  button.type = 'button';
  button.title = '伴走ナビを開く';
  button.setAttribute('aria-label', '伴走ナビを開く');
  button.textContent = '›';

  button.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'open-side-panel' });
  });

  shadow.append(style, button);
  document.documentElement.appendChild(host);
}
