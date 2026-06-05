export async function insertChild(child) {
    const result = await window.electronAPI.sqlite_children_insert({
      id: child.children_id,
      name: child.children_name,
      notes: child.notes,
      pronunciation_id: child.pronunciation_id,
      children_type_id: child.children_type_id,
    });
    console.log("🧒児童を登録しました:", result);
    return result;
  }
  