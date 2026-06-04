/**
 * サイドパネルから HUG WM へ cookie 付きでアクセスするための fetch ラッパー
 */
(() => {
  const HUG_HOST = "www.hug-ayumu.link";

  const hugFetchViaBackground = async (url, options = {}) => {
    const urlStr = String(url);
    const opts = { ...options };

    if (opts.body instanceof URLSearchParams) {
      opts.body = opts.body.toString();
      opts._bodyType = "URLSearchParams";
    } else if (opts.body instanceof FormData) {
      const params = new URLSearchParams();
      for (const [key, value] of opts.body.entries()) {
        params.append(key, value);
      }
      opts.body = params.toString();
      opts._bodyType = "FormData";
    }

    if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
      const response = await chrome.runtime.sendMessage({
        type: "api-fetch",
        url: urlStr,
        options: opts
      });
      if (!response?.ok) {
        const err =
          response?.error ||
          (typeof response?.body === "string"
            ? response.body
            : `HTTP ${response?.status}`);
        throw new Error(err);
      }
      const body = response.body;
      return {
        ok: true,
        status: response.status || 200,
        url: urlStr,
        text: async () =>
          typeof body === "string" ? body : JSON.stringify(body),
        json: async () =>
          typeof body === "object" ? body : JSON.parse(String(body))
      };
    }

    return fetch(url, options);
  };

  const nativeFetch = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const urlStr =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input?.url || "";
    if (urlStr.includes(HUG_HOST)) {
      const res = await hugFetchViaBackground(urlStr, init || {});
      return {
        ok: res.ok,
        status: res.status,
        url: res.url,
        text: () => res.text(),
        json: () => res.json()
      };
    }
    return nativeFetch(input, init);
  };

  window.HugAttendance = window.HugAttendance || {};
  window.HugAttendance.hugFetchViaBackground = hugFetchViaBackground;
})();
