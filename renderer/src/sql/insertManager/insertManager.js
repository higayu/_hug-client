// src/sql/insertManager/insertManager.js
export const insertManager = {

  async insertManager(manager) {
    try {
      const uid = Math.random().toString(36).slice(2, 8);
      console.group(`🧩 [insertManager] insertManager [${uid}]`);

      const timerName = `⌛ insertManager 時間_${uid}`;
      console.time(timerName);

      // ✅ 修正箇所：呼び出し名を "manager_insert" → "managers_insert" に変更
      const result = await window.electronAPI.managers_insert(manager);

      console.timeEnd(timerName);

      console.log("✅ [insertManager] 登録完了:", result);

      console.log("📊 登録件数:", {
        managers: Array.isArray(manager) ? manager.length : 1,
      });

      console.log("📋 登録データ:", manager);

      console.groupEnd();

      // Redux などに渡す形式で返す
      return {
        managers: manager, // ✅ 複数形で整合
      };
    } catch (error) {
      console.error("❌ [insertManager] insertManager エラー:", error);
      console.groupEnd();
      return null;
    }
  },

};

