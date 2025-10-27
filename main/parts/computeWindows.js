// main/parts/computeWindows.js
const { BrowserWindow } = require("electron");
const path = require("path");

let isRegistered = false;

function open_addition_compare_btn(ipcMain, facility_id, date_str) {
  // console.log("🔧 [MAIN] open_addition_compare_btn 関数が呼び出されました");
  // console.log("🔍 [MAIN] isRegistered:", isRegistered);
  // console.log("🔍 [MAIN] ipcMain:", ipcMain ? "存在" : "未定義");
  // console.log("🔍 [MAIN] 引数:", { facility_id, date_str });
  
  if (isRegistered) {
    //console.log("⚠️ open-addition-compare-btn は既に登録済みです");
    return;
  }
  isRegistered = true;
 // console.log("✅ open-addition-compare-btn IPCハンドラーを登録しました");

  // すべてのIPCイベントをログ出力するリスナーを追加
  ipcMain.on("open-addition-compare-btn", (event, args) => {
    // 引数から施設IDと日付を取得（デフォルト値も設定）
    const received_facility_id = args?.facility_id || facility_id;
    const received_date_str = args?.date_str || date_str;
    
    console.log("🔍 [MAIN] 受信した引数:", { received_facility_id, received_date_str });

    try {
      openDoubleWebviewWithTabs(
        `https://www.hug-ayumu.link/hug/wm/attendance.php?mode=detail&f_id=${received_facility_id}&date=${received_date_str}`,
        "https://www.hug-ayumu.link/hug/wm/record_proceedings.php",
        "HUGデータ取得"
      );
      //console.log("✅ [MAIN] ダブルWebViewウィンドウを開きました");
    } catch (error) {
      console.error("❌ [MAIN] ダブルWebViewウィンドウの作成に失敗:", error);
    }
  });

  // デバッグ用：IPCイベントの監視（正しい方法）
  const originalOn = ipcMain.on;
  ipcMain.on = function(channel, listener) {
    console.log("🔍 [MAIN] IPCハンドラーを登録:", channel);
    return originalOn.call(this, channel, listener);
  };
}

function openDoubleWebviewWithTabs(url1, url2, label) {
  const win = new BrowserWindow({
    width: 1800,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, "../../preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true,
      sandbox: false,        // ← 🔥 これを追加
      webSecurity: false,   // ← 追加
    },
  });

  function resolvePreloadPath() {
    const fs = require("fs");
    // ① 開発時（npm start等）
    const devPath = path.join(__dirname, "../../preload.js");
    // ② パッケージ後
    const prodPath = path.join(process.resourcesPath, "data", "preload.js");

    if (fs.existsSync(devPath)) return devPath;
    if (fs.existsSync(prodPath)) return prodPath;
    console.warn("⚠ preload.js が見つかりません。", devPath, prodPath);
    return devPath;
  }



  console.log(`🆕 ${label}ウィンドウを開きます (2画面＋タブ)`);
  const preloadPath = resolvePreloadPath();

 const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta http-equiv="Content-Security-Policy"
    content="default-src 'self' https: data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline';">
  <style>
    html, body { height:100%; width:100%; margin:0; padding:0; display:flex; flex-direction:column; font-family:sans-serif; }
    #tabs { display:flex; background:#eee; border-bottom:2px solid #ccc; }
    .tab { flex:1; text-align:center; padding:10px; cursor:pointer; }
    .tab.active { background:#fff; border-top:2px solid #555; border-left:1px solid #ccc; border-right:1px solid #ccc; }
    #content { flex:1; position:relative; }
    #webviews { position:absolute; top:0; left:0; width:100%; height:100%; display:flex; }
    webview { flex:1; height:100%; border:none; }
    #left { border-right:2px solid #ccc; }
    #resultView { position:absolute; top:0; left:0; width:100%; height:100%; background:#fafafa; overflow:auto;
      white-space:pre; font-family:monospace; padding:20px; display:none; }


    #resultView h2 {
      background:#f3f3f3; padding:6px 10px; border-left:5px solid #888;
    }
    .table-wrapper {
      overflow-x:auto; margin-bottom:40px;
    }
    table.table {
      border-collapse: collapse;
      width: 100%;
      margin-top: 10px;
    }
    table.table th, table.table td {
      border: 1px solid #ccc;
      padding: 4px 8px;
      font-size: 13px;
    }
    table.table th { background: #e0e0e0; }
    tr:nth-child(even) { background: #fafafa; }
    #resultContainer {
       display: flex;
       flex-direction: row;
       gap: 20px;
    }
    
    .result-half {
       flex: 1;
       min-width: 0;
       display: flex;
       flex-direction: column;
    }
    
    .result-half h2 {
       background:#f3f3f3;
       padding:6px 10px;
       border-left:5px solid #888;
       margin-top:0;
    }
    
    .table-wrapper {
       flex: 1;
       overflow-x: auto;
       overflow-y: auto;
       background: white;
       border: 1px solid #ccc;
       border-radius: 6px;
       padding: 6px;
    }
    
    button {
      padding: 8px 12px;
      background: #007acc;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    
    button:hover {
      background: #005a9e;
    }

  </style>
</head>
<body>
  <div id="tabs">
    <div id="tabView" class="tab active">📄 ページ表示</div>
    <div id="tabResult" class="tab">📊 取得結果</div>
  </div>
  <div id="content">
    <div style="position:absolute; top:10px; right:20px; z-index:5; display:flex; gap:10px;">
      <button id="clickAdditionBtn">➕ 加算登録クリック</button>
      <button id="getDataBtn">📥 データ取得</button>
    </div>
    <div id="webviews">
      <webview id="left"
        src="` + url1 + `"
        preload="file://` + preloadPath + `"
        allowpopups
        disablewebsecurity></webview>
      <webview id="right"
        src="` + url2 + `"
        preload="file://` + preloadPath + `"
        allowpopups
        disablewebsecurity></webview>
    </div>
    <div id="resultView"></div>
  </div>

  <script>
    const tabView = document.getElementById("tabView");
    const tabResult = document.getElementById("tabResult");
    const webviews = document.getElementById("webviews");
    const resultView = document.getElementById("resultView");
    const left = document.getElementById("left");
    const right = document.getElementById("right");

    // タブ切り替え
    tabView.addEventListener("click", () => {
      tabView.classList.add("active");
      tabResult.classList.remove("active");
      webviews.style.display = "flex";
      resultView.style.display = "none";
    });
    tabResult.addEventListener("click", () => {
      tabResult.classList.add("active");
      tabView.classList.remove("active");
      webviews.style.display = "none";
      resultView.style.display = "block";
    });

    // 加算登録ラジオボタンクリック処理
    async function clickAdditionRadio() {
      try {
        console.log("🟢 加算登録ラジオボタンをクリック中...");
        
        const success = await left.executeJavaScript(\`
          const radio = document.querySelector('input[type="radio"][name="tableChange"][value="2"]');
          if (radio) {
            radio.click();
            console.log("✅ 加算登録ラジオボタンをクリックしました");
            true;
          } else {
            console.log("❌ 加算登録ラジオボタンが見つかりません");
            false;
          }
        \`);
        
        if (success) {
          console.log("✅ 加算登録ラジオボタンのクリックが完了しました");
        } else {
          console.log("⚠️ 加算登録ラジオボタンのクリックに失敗しました");
        }
      } catch (error) {
        console.error("❌ 加算登録ラジオボタンクリック中にエラー:", error);
      }
    }

    // 加算登録クリックボタン
    document.getElementById("clickAdditionBtn").addEventListener("click", async () => {
      await clickAdditionRadio();
    });

    // データ取得
    document.getElementById("getDataBtn").addEventListener("click", async () => {
      try {
        console.log("🟢 ページ全体の構造を取得開始...");

        async function waitForPageReady(view) {
          for (let i = 0; i < 30; i++) {
            const state = await view.executeJavaScript('document.readyState');
            if (state === "complete") return true;
            await new Promise(r => setTimeout(r, 500));
          }
          throw new Error("ページロードが完了しませんでした");
        }

        await waitForPageReady(left);
        await waitForPageReady(right);
        
        // 加算登録ラジオボタンをクリック
        await clickAdditionRadio();

        const htmlLeft = await left.executeJavaScript(\`
          console.log("🔍 左ページ:", document.title);
          const el = document.querySelector("table");
          if (!el) throw new Error("左ページに<table>が見つかりません");
          el.outerHTML;
        \`);

        const htmlRight = await right.executeJavaScript(\`
          console.log("🔍 右ページ:", document.title);
          const el = document.querySelector("table");
          if (!el) throw new Error("右ページに<table>が見つかりません");
          el.outerHTML;
        \`);

        resultView.innerHTML =
          '<div id="resultContainer">' +
            '<div class="result-half">' +
              '<h2>📘 左ページ（記録一覧）</h2>' +
              '<div class="table-wrapper">' + htmlLeft + '</div>' +
            '</div>' +
            '<div class="result-half">' +
              '<h2>📙 右ページ（計画状況）</h2>' +
              '<div class="table-wrapper">' + htmlRight + '</div>' +
            '</div>' +
          '</div>';

        tabResult.click();

      } catch (err) {
        console.error("💥 構造取得中にエラー:", err);
        alert("構造取得エラー: " + err.message);
      }
    });
  </script>
</body>
</html>
`;



  win.loadURL("data:text/html;charset=utf-8," + encodeURIComponent(html));
  win.webContents.once("did-finish-load", () => {
    console.log(`✅ ${label}ウィンドウ（2ページ＋結果タブ）読み込み完了`);
  });
}

module.exports = { open_addition_compare_btn };
