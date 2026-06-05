window.addEventListener("load", () => {

  console.log("=== kasan-copy script start ===");

  /* =========================================
     アニメーションCSSを追加
  ========================================= */
  const addBlinkStyle = () => {
    if (document.querySelector("#kasan-blink-style")) return;

    const style = document.createElement("style");
    style.id = "kasan-blink-style";
    style.textContent = `
      @keyframes kasanBlink {
        0% {
          opacity: 1;
          transform: scale(1);
          box-shadow: 0 0 0 rgba(255, 0, 0, 0);
        }
        50% {
          opacity: 0.35;
          transform: scale(1.08);
          box-shadow: 0 0 10px rgba(255, 0, 0, 0.9);
        }
        100% {
          opacity: 1;
          transform: scale(1);
          box-shadow: 0 0 0 rgba(255, 0, 0, 0);
        }
      }

      .kasan-blink-alert {
        animation: kasanBlink 1s infinite;
        color: #fff !important;
        background: #e60000 !important;
        border-color: #e60000 !important;
        font-weight: bold !important;
      }
    `;

    document.head.appendChild(style);
  };

  addBlinkStyle();

  /* =========================================
     共通関数：セル内から HH:MM の時間だけ取得
  ========================================= */
  const extractTime = (cell) => {
    if (!cell) return "";

    const text = cell.innerText.trim();
    const match = text.match(/\b\d{1,2}:\d{2}\b/);

    return match ? match[0] : "";
  };

  /* =========================================
     HH:MM を今日の日付の Date に変換
  ========================================= */
  const timeToTodayDate = (timeText) => {
    if (!timeText) return null;

    const match = timeText.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return null;

    const hour = Number(match[1]);
    const minute = Number(match[2]);

    const date = new Date();
    date.setHours(hour, minute, 0, 0);

    return date;
  };

  /* =========================================
     入室から2時間以上経過しているか判定
  ========================================= */
  const isOverTwoHoursFromEnter = (enterTime) => {
    const enterDate = timeToTodayDate(enterTime);
    if (!enterDate) return false;

    const now = new Date();

    const twoHoursMs = 2 * 60 * 60 * 1000;
    const elapsedMs = now.getTime() - enterDate.getTime();

    return elapsedMs >= twoHoursMs;
  };

  /* =========================================
     退室欄のボタンを取得
     ※ ボタンがない場合も考慮
  ========================================= */
  const getLeaveButton = (leaveTd) => {
    if (!leaveTd) return null;

    const button = leaveTd.querySelector("button");
    if (button) return button;

    return null;
  };

  /* =========================================
     2時間超過チェック本体
  ========================================= */
  const checkTwoHoursPassed = () => {
    console.log("【CHECK】2時間超過チェック開始");

    const listTable = document.querySelector(
      "table.sortTable01:not(.sortTableAdding):not(.js_adding_table)"
    );

    if (!listTable) {
      console.log("【CHECK】listTable なし");
      return;
    }

    listTable.querySelectorAll("tbody tr").forEach((tr, rowIndex) => {

      const link = tr.querySelector(
        ".realname a[href*='profile_children.php']"
      );

      const match = link?.getAttribute("href")?.match(/id=(\d+)/);
      if (!match) return;

      const c_id = match[1];

      const enterTd = tr.querySelector("td.enter");
      const leaveTd = tr.querySelector("td.leave");

      const enterTime = extractTime(enterTd);
      const leaveTime = extractTime(leaveTd);

      console.log(`【CHECK】row[${rowIndex}] c_id =`, c_id);
      console.log(`【CHECK】row[${rowIndex}] 入室時間 =`, enterTime);
      console.log(`【CHECK】row[${rowIndex}] 退室時間 =`, leaveTime);

      // 入室時間がない場合は対象外
      if (!enterTime) {
        console.log(`【CHECK】row[${rowIndex}] 入室時間なし → 対象外`);
        return;
      }

      // 退室時間がある場合
      // 点滅中かどうかに関係なく、退室ボタンが残っていれば退室時間に置き換える
      if (leaveTime) {
        const leaveButton = getLeaveButton(leaveTd);

        if (leaveButton) {
          leaveTd.textContent = leaveTime;

          console.log(
            `【CHECK】row[${rowIndex}] 退室時間あり → 残っていた退室ボタンを退室時間に置き換え`,
            {
              c_id,
              leaveTime
            }
          );
        } else {
          console.log(`【CHECK】row[${rowIndex}] 退室済み → ボタンなし`);
        }

        return;
      }

      // 入室から2時間未満なら対象外
      if (!isOverTwoHoursFromEnter(enterTime)) {
        console.log(`【CHECK】row[${rowIndex}] 2時間未満 → 対象外`);
        return;
      }

      const leaveButton = getLeaveButton(leaveTd);

      if (!leaveButton) {
        console.log(`【CHECK】row[${rowIndex}] 退室ボタンなし`);
        return;
      }

      // すでにアニメーションクラスが付いていれば何もしない
      if (leaveButton.classList.contains("kasan-blink-alert")) {
        console.log(`【CHECK】row[${rowIndex}] 既に点滅中`);
        return;
      }

      leaveButton.classList.add("kasan-blink-alert");

      console.log(
        `【CHECK】row[${rowIndex}] 入室から2時間経過 → 退室ボタン点滅開始`,
        {
          c_id,
          enterTime,
          leaveTime
        }
      );
    });

    console.log("【CHECK】2時間超過チェック終了");
  };

  /* =========================================
     【2】一覧画面用テーブル（sortTable01）
     ※ 入室時間・退室時間はこちらに存在する
  ========================================= */
  const listTable = document.querySelector(
    "table.sortTable01:not(.sortTableAdding):not(.js_adding_table)"
  );

  if (!listTable) {
    console.log("【2】listTable なし");
  } else {
    console.log("【2】listTable 取得OK", listTable);

    const theadRow = listTable.querySelector("thead tr");

    if (theadRow && !theadRow.querySelector("th.kasan-copy")) {
      const th = document.createElement("th");
      th.textContent = "加算記録";
      th.classList.add("kasan-copy");
      theadRow.appendChild(th);
    }

    listTable.querySelectorAll("tbody tr").forEach((tr, rowIndex) => {

      const link = tr.querySelector(
        ".realname a[href*='profile_children.php']"
      );

      const match = link?.getAttribute("href")?.match(/id=(\d+)/);
      if (!match) return;

      const c_id = match[1];

      const enterTd = tr.querySelector("td.enter");
      const leaveTd = tr.querySelector("td.leave");

      const enterTime = extractTime(enterTd);
      const leaveTime = extractTime(leaveTd);

      console.log(`【2-TIME】row[${rowIndex}] c_id =`, c_id);
      console.log(`【2-TIME】row[${rowIndex}] 入室時間 =`, enterTime);
      console.log(`【2-TIME】row[${rowIndex}] 退室時間 =`, leaveTime);

      if (!enterTime) {
        console.log(`【2-TIME】row[${rowIndex}] 入室時間なし`);
      }

      if (!leaveTime) {
        console.log(`【2-TIME】row[${rowIndex}] 退室時間なし`);
      }

    });
  }

  /* =========================================
     初回チェック
  ========================================= */
  checkTwoHoursPassed();

  /* =========================================
     5分ごとに再チェック
     5分 = 300,000ms
  ========================================= */
  setInterval(() => {
    checkTwoHoursPassed();
  }, 5 * 60 * 1000);

  console.log("=== kasan-copy script end ===");

});