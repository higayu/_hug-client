# 自動入力サンプル

```bash
  const clickEnterButton = async () => {
    console.log("① clickEnterButton 開始");

    const vw = getActiveWebview();
    console.log("② webview取得", vw);

    if (!vw) {
      console.warn("❌ webview が取得できない");
      return;
    }

    console.log("③ webview isLoading:", vw.isLoading?.());

    // WebView ready 待ち
  await vw.executeJavaScript(`
  (() => {
    const SELECTORS = [
      '[contenteditable="true"][role="textbox"]',
      '[data-testid="prompt-textarea"][contenteditable="true"]',
      'div[contenteditable="true"]'
    ];

    const findEditor = () => {
      for (const sel of SELECTORS) {
        const el = document.querySelector(sel);
        if (el) return el;
      }
      return null;
    };

    const inject = (editor) => {
      editor.focus();
      editor.innerHTML = "";

      const text = ${JSON.stringify(aiText)};
      document.execCommand("insertText", false, text);

      editor.dispatchEvent(new Event("input", { bubbles: true }));
      console.log("✅ editor input injected");
    };

    return new Promise((resolve) => {
      const editor = findEditor();
      if (editor) {
        inject(editor);
        return resolve(true);
      }

      console.log("⏳ editor not found, waiting...");

      const observer = new MutationObserver(() => {
        const ed = findEditor();
        if (ed) {
          observer.disconnect();
          inject(ed);
          resolve(true);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      setTimeout(() => {
        observer.disconnect();
        console.warn("❌ editor still not found (timeout)");
        resolve(false);
      }, 7000);
    });
  })();
  `);


    console.log("⑥ executeJavaScript 呼び出し直前");

    let success;
    try {
      success = await vw.executeJavaScript(`/* 後述 */`);
    } catch (e) {
      console.error("❌ executeJavaScript 例外", e);
      return;
    }

    console.log("⑦ executeJavaScript 完了:", success);
  };
```

# 改行を追加
```bash
  const clickEnterButton = async () => {
    console.log("① clickEnterButton 開始");

    const vw = getActiveWebview();
    console.log("② webview取得", vw);

    if (!vw) {
      console.warn("❌ webview が取得できない");
      return;
    }
    if(!isChatGPT(url)){
      console.warn("❌ ChartGPT のドメインが取得できない");
      return;
    }

    console.log("③ webview isLoading:", vw.isLoading?.());

    const TextValue = `${text1}\n\n${aiText}`;


    // WebView ready 待ち
  await vw.executeJavaScript(`
  (() => {
    const SELECTORS = [
      '[contenteditable="true"][role="textbox"]',
      '[data-testid="prompt-textarea"][contenteditable="true"]',
      'div[contenteditable="true"]'
    ];

    const findEditor = () => {
      for (const sel of SELECTORS) {
        const el = document.querySelector(sel);
        if (el) return el;
      }
      return null;
    };

    const inject = (editor) => {
      editor.focus();
      editor.innerHTML = "";

      const text = ${JSON.stringify(TextValue)};
      document.execCommand("insertText", false, text);

      editor.dispatchEvent(new Event("input", { bubbles: true }));
      console.log("✅ editor input injected");
    };

    return new Promise((resolve) => {
      const editor = findEditor();
      if (editor) {
        inject(editor);
        return resolve(true);
      }

      console.log("⏳ editor not found, waiting...");

      const observer = new MutationObserver(() => {
        const ed = findEditor();
        if (ed) {
          observer.disconnect();
          inject(ed);
          resolve(true);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      setTimeout(() => {
        observer.disconnect();
        console.warn("❌ editor still not found (timeout)");
        resolve(false);
      }, 7000);
    });
  })();
  `);


    console.log("⑥ executeJavaScript 呼び出し直前");

    let success;
    try {
      success = await vw.executeJavaScript(`/* 後述 */`);
    } catch (e) {
      console.error("❌ executeJavaScript 例外", e);
      return;
    }

    console.log("⑦ executeJavaScript 完了:", success);
  };
```