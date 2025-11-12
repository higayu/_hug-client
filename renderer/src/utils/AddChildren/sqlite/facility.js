export async function insertFacilityChild(children_id, facility_id) {
    const result = await window.electronAPI.facility_children_insert({
      children_id,
      facility_id,
    });
    console.log("🏫ファシリティに児童を紐付けました:", result);
    return result;
  }
  