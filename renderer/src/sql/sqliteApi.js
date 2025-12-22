// src/sql/sqliteApi.js

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

      // すべてのテーブルを同時に取得
      const [
        children,
        staffs,
        managers2,
        facility_children,
        facility_staff,
        facilitys,
        pc,
        pc_to_children,
        pronunciation,
        children_type,
        day_of_week,
      ] = await Promise.all([
        window.electronAPI.sqlite_children_getAll?.() ?? [],
        window.electronAPI.sqlite_staffs_getAll?.() ?? [],
        window.electronAPI.sqlite_managers2_getAll?.() ?? [],
        window.electronAPI.sqlite_facility_children_getAll?.() ?? [],
        window.electronAPI.sqlite_facility_staff_getAll?.() ?? [],
        window.electronAPI.sqlite_facilitys_getAll?.() ?? [],
        window.electronAPI.sqlite_pc_getAll?.() ?? [],
        window.electronAPI.sqlite_pc_to_children_getAll?.() ?? [],
        window.electronAPI.sqlite_pronunciation_getAll?.() ?? [],
        window.electronAPI.sqlite_children_type_getAll?.() ?? [],
        window.electronAPI.sqlite_day_of_week_getAll?.() ?? [],
      ]);

      console.timeEnd(timerName);

      // ===== 取得件数ログ =====
      console.log("📊 取得件数:", {
        children: children?.length ?? 0,
        staffs: staffs?.length ?? 0,
        managers2: managers2?.length ?? 0,
        facility_children: facility_children?.length ?? 0,
        facility_staff: facility_staff?.length ?? 0,
        facilitys: facilitys?.length ?? 0,
        pc: pc?.length ?? 0,
        pc_to_children: pc_to_children?.length ?? 0,
        pronunciation: pronunciation?.length ?? 0,
        children_type: children_type?.length ?? 0,
        day_of_week: day_of_week?.length ?? 0, // ★ 追加
      });

      // ===== 取得データログ =====
      console.log("📋 取得データ:", {
        children,
        staffs,
        managers2,
        facility_children,
        facility_staff,
        facilitys,
        pc,
        pc_to_children,
        pronunciation,
        children_type,
        day_of_week, // ★ 追加
      });

      console.groupEnd();

      // ===== Redux に渡す形式 =====
      return {
        children,
        staffs,
        managers2,
        facility_children,
        facility_staff,
        facilitys,
        pc,
        pc_to_children,
        pronunciation,
        children_type,
        day_of_week, // ★ 追加
      };
    } catch (error) {
      console.error("❌ [sqliteApi] getAllTables エラー:", error);
      console.groupEnd();
      return null;
    }
  },
};
