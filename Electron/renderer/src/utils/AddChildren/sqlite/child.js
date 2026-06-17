export async function insertChild(child) {
    const result = await window.electronAPI.sqlite_children_insert({
      id: child.children_id,
      name: child.children_name,
      notes: child.notes,
      notes2: child.notes2,
      personal_tmp: child.personal_tmp,
      pronunciation_id: child.pronunciation_id,
      children_type_id: child.children_type_id,
      is_delete: child.is_delete ?? 0,
      leaving_at: child.leaving_at ?? null,
    });
    console.log("🧒児童を登録しました:", result);
    return result;
  }
  
