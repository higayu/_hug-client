// src/utils/childrenJoinProcessor.js
export function joinChildrenData({ tables, staffId, date }) {
    if (!tables) {
      console.error("❌ joinChildrenData: テーブルデータが未定義です");
      return { week_children: [], waiting_children: [], Experience_children: [] };
    }
  
    const {
      children,
      staffs,
      managers,
      pc,
      pc_to_children,
      pronunciation,
      children_type,
    } = tables;
    
    staffId = 73;

    console.group("🔗 [joinChildrenData] JOIN処理開始");
    console.log("👤 staffId:", staffId, "📅 date:", date);
  
    // スタッフの該当マネージャーデータを抽出
    const filteredManagers = managers.filter((m) => m.staff_id === staffId);
    console.log(`📋 該当マネージャー件数: ${filteredManagers.length}`);
  
    // JOIN
    const joined = filteredManagers
      .map((m) => {
        const child = children.find((c) => c.id === m.children_id);
        if (!child) return null;
  
        const ptc = pc_to_children.find(
          (p) =>
            p.children_id === child.id &&
            (!p.day_of_week || p.day_of_week.includes(date))
        );
  
        const pcItem = ptc ? pc.find((p) => p.id === ptc.pc_id) : null;
        const pronun = pronunciation.find((p) => p.id === child.pronunciation_id);
        const ctype = children_type.find((t) => t.id === child.children_type_id);
  
        return {
          children_id: child.id,
          children_name: child.name,
          children_pronunciation_id: child.pronunciation_id,
          children_pronunciation: pronun?.pronunciation || "",
          notes: child.notes || "",
          children_type_id: child.children_type_id,
          children_type_name: ctype?.name || "",
          pc_id: pcItem?.id || null,
          pc_name: pcItem?.name || "",
          pc_explanation: pcItem?.explanation || "",
          pc_memo: pcItem?.memo || "",
          pc_day_of_week: ptc?.day_of_week || "",
          ptc_id: ptc?.id || null,
          start_time: ptc?.start_time || null,
          end_time: ptc?.end_time || null,
        };
      })
      .filter(Boolean);
  
    console.log(`🧮 JOIN結果: ${joined.length}件`);
  
    // 曜日フィルタ
    const weekChildren = joined.filter((child) => {
      if (!child.pc_day_of_week) return true;
      try {
        const parsed = JSON.parse(child.pc_day_of_week);
        if (Array.isArray(parsed.days)) {
          const weekDay = ["日", "月", "火", "水", "木", "金", "土"][
            new Date(date).getDay()
          ];
          return parsed.days.includes(weekDay);
        }
      } catch {
        const weekDay = ["日", "月", "火", "水", "木", "金", "土"][
          new Date(date).getDay()
        ];
        return child.pc_day_of_week.includes(weekDay);
      }
      return false;
    });
  
    weekChildren.sort((a, b) =>
      a.children_name.localeCompare(b.children_name, "ja")
    );
  
    console.log(`✅ 曜日フィルタ後: ${weekChildren.length}件`);
    console.groupEnd();
  
    return {
      week_children: weekChildren,
      waiting_children: [],
      Experience_children: [],
    };
  }
  