/**
 * アラート種別 2：別ウィンドウで強調表示
 * ※ブラウザのポップアップブロックにより、ユーザー操作なしの初回 open が失敗することがあります。
 */
(() => {
  window.HugAttendance = window.HugAttendance || {};

  const POPUP_WINDOW_NAME = "hugAttendanceAlertType2";
  const POPUP_FEATURES =
    "width=580,height=520,left=80,top=60,resizable=yes,scrollbars=yes";

  const escapeHtml = (value) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  /**
   * @param {object} opt
   * @param {Array<{ name?: string, c_id?: string, enterTime?: string, detailPageDate?: string, hugAlertPref?: { alertAfterMinutes?: number } }>} opt.items
   * @param {string} [opt.detailPageDate] 一覧の日付（1件でも可）
   */
  const openAlertType2Popup = (opt) => {
    const items = Array.isArray(opt?.items) ? opt.items : [];
    if (!items.length) return null;

    const pageDate = String(opt?.detailPageDate || items[0]?.detailPageDate || "").trim();

    let popup;
    try {
      popup = window.open("about:blank", POPUP_WINDOW_NAME, POPUP_FEATURES);
    } catch (e) {
      console.warn("[HUG WM] alert-type2 popup open 例外:", e);
      return null;
    }

    if (!popup) {
      console.warn(
        "[HUG WM] アラート種別2のポップアップを開けませんでした（ポップアップブロックの可能性）"
      );
      return null;
    }

    const rows = items
      .map((row) => {
        const name = escapeHtml(row.name || "");
        const id = escapeHtml(row.c_id || "");
        const enter = escapeHtml(row.enterTime || "");
        const minutes = escapeHtml(
          String(row.hugAlertPref?.alertAfterMinutes ?? "")
        );
        return `<tr><td>${name}</td><td>${id}</td><td>${enter}</td><td>${minutes}</td></tr>`;
      })
      .join("");

    const title = "HUG 入退室：アラート（種別2）";
    const subtitle = pageDate
      ? `対象日: ${escapeHtml(pageDate)} / ${items.length}名`
      : `未退室がしきい値超過: ${items.length}名`;

    const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Segoe UI", Meiryo, sans-serif;
      background: #1a0505;
      color: #fff8f8;
      min-height: 100vh;
      padding: 20px 22px 28px;
    }
    h1 {
      margin: 0 0 6px;
      font-size: 22px;
      color: #ffeded;
      text-shadow: 0 0 12px rgba(255,80,80,0.9);
      animation: hugBlink 1.1s ease-in-out infinite;
    }
    @keyframes hugBlink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.82; }
    }
    .sub { margin: 0 0 16px; font-size: 14px; color: #ffc9c9; }
    .note {
      margin: 0 0 14px;
      padding: 10px 12px;
      background: rgba(180,0,0,0.35);
      border: 1px solid #ff5252;
      border-radius: 8px;
      font-size: 13px;
      line-height: 1.5;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      background: rgba(0,0,0,0.25);
      border-radius: 8px;
      overflow: hidden;
    }
    th, td {
      border: 1px solid #8b0000;
      padding: 8px 10px;
      text-align: left;
    }
    th {
      background: #b71c1c;
      color: #fff;
    }
    tr:nth-child(even) td { background: rgba(80,0,0,0.35); }
    .foot {
      margin-top: 18px;
      font-size: 12px;
      color: #e0b4b4;
    }
  </style>
</head>
<body>
  <h1>要確認：経過アラート（種別2）</h1>
  <p class="sub">${subtitle}</p>
  <p class="note">以下の児童は、設定した経過時間を満たして入室中のままです。パネルから退室記録の確認をお願いします。</p>
  <table>
    <thead>
      <tr>
        <th>氏名</th>
        <th>児童ID</th>
        <th>入室</th>
        <th>しきい値(分)</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <p class="foot">このウィンドウは入退室パネル更新のたびに内容が書き換わります。閉じても次回アラート時に再度開けます。</p>
</body>
</html>`;

    try {
      popup.document.open();
      popup.document.write(html);
      popup.document.close();
      popup.focus();
    } catch (e) {
      console.error("[HUG WM] alert-type2 popup 描画エラー:", e);
    }

    return popup;
  };

  window.HugAttendance.openAlertType2Popup = openAlertType2Popup;
})();
