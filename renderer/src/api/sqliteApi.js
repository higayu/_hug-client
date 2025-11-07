// src/api/sqliteApi.js
export const sqliteApi = {
  async getAllTables() {
    try {
      const uid = Math.random().toString(36).slice(2, 8);
      console.group(`🧩 [sqliteApi] getAllTables [${uid}]`);

      if (!window.electronAPI) {
        console.error("❌ electronAPI が定義されていません");
        console.groupEnd();
        return null;
      }

      console.log("🔍 electronAPI keys:", Object.keys(window.electronAPI));

      const timerName = `⌛ DB全テーブル取得時間_${uid}`;
      console.time(timerName);

      const [
        children,
        staffs,
        managers,
        pc,
        pc_to_children,
        pronunciation,
        children_type,
      ] = await Promise.all([
        window.electronAPI.children_getAll?.() ?? [],
        window.electronAPI.staffs_getAll?.() ?? [],
        window.electronAPI.managers_getAll?.() ?? [],
        window.electronAPI.pc_getAll?.() ?? [],
        window.electronAPI.pc_to_children_getAll?.() ?? [],
        window.electronAPI.pronunciation_getAll?.() ?? [],
        window.electronAPI.children_type_getAll?.() ?? [],
      ]);

      console.timeEnd(timerName);

      console.log("📊 取得件数:", {
        children: children?.length ?? 0,
        staffs: staffs?.length ?? 0,
        managers: managers?.length ?? 0,
        pc: pc?.length ?? 0,
        pc_to_children: pc_to_children?.length ?? 0,
        pronunciation: pronunciation?.length ?? 0,
        children_type: children_type?.length ?? 0,
      });

      console.log("📋 取得データ:", {
        children,
        staffs,
        managers,
        pc,
        pc_to_children,
        pronunciation,
        children_type,
      });
      console.groupEnd();

      return {
        children,
        staffs,
        managers,
        pc,
        pc_to_children,
        pronunciation,
        children_type,
      };
    } catch (error) {
      console.error("❌ [sqliteApi] getAllTables エラー:", error);
      console.groupEnd();
      return null;
    }
  },
};
