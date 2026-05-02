(() => {
    window.HugAttendance = window.HugAttendance || {};
  
    /*
      定期実行間隔
      5分 = 300,000ms
    */
    const INTERVAL_MS = 5 * 60 * 1000;
  
    /*
      二重起動防止
    */
    let isRunning = false;
  
    /*
      HH:MM を今日の日付の Date に変換
    */
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
  
    /*
      入室から2時間以上経過しているか判定
    */
    const isOverTwoHoursFromEnter = (enterTime) => {
      const enterDate = timeToTodayDate(enterTime);
      if (!enterDate) return false;
  
      const now = new Date();
  
      const twoHoursMs = 2 * 60 * 60 * 1000;
      const elapsedMs = now.getTime() - enterDate.getTime();
  
      return elapsedMs >= twoHoursMs;
    };
  
    /*
      入退室データに判定結果を追加
    */
    const addOverTwoHoursFlag = (attendanceList) => {
      return attendanceList.map((item) => {
        const hasEnterTime = Boolean(item.enterTime);
        const hasLeaveTime = Boolean(item.leaveTime);
  
        const isOverTwoHours =
          hasEnterTime &&
          !hasLeaveTime &&
          isOverTwoHoursFromEnter(item.enterTime);
  
        return {
          ...item,
          isOverTwoHours
        };
      });
    };
  
    /*
      入退室データ取得 → 判定追加 → フォーム表示
    */
    const runAttendanceUpdate = async () => {
      if (isRunning) {
        console.log("[HUG WM] 前回処理中のためスキップ");
        return;
      }
  
      isRunning = true;
  
      try {
        console.log("[HUG WM] 入退室データ更新開始");
  
        if (!window.HugAttendance.fetchAttendanceData) {
          throw new Error("fetchAttendanceData が見つかりません");
        }
  
        if (!window.HugAttendance.renderAttendanceForm) {
          throw new Error("renderAttendanceForm が見つかりません");
        }
  
        const attendanceList = await window.HugAttendance.fetchAttendanceData();
  
        const attendanceListWithFlags = addOverTwoHoursFlag(attendanceList);
  
        console.log("[HUG WM] 2時間超過判定後:");
        console.table(attendanceListWithFlags);
  
        window.HugAttendance.renderAttendanceForm(attendanceListWithFlags);
  
        console.log("[HUG WM] 入退室データ更新完了");
  
      } catch (error) {
        console.error("[HUG WM] 入退室データ更新エラー:", error);
  
      } finally {
        isRunning = false;
      }
    };
  
    /*
      ページ読み込み後に開始
    */
    window.addEventListener("load", () => {
      console.log("[HUG WM] timer.js start");
  
      runAttendanceUpdate();
  
      setInterval(() => {
        runAttendanceUpdate();
      }, INTERVAL_MS);
    });
  
    /*
      外部から手動実行できるようにする
    */
    window.HugAttendance.runAttendanceUpdate = runAttendanceUpdate;
    window.HugAttendance.addOverTwoHoursFlag = addOverTwoHoursFlag;
  })();