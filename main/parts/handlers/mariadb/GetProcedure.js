// main/parts/handlers/mariadb/GetProcedure.js
const apiClient = require("../../../../src/apiClient");

async function insert_manager_p(data) {
  let params = []; 

  try {

    params = [
      { name: "p_child_id",            value: data.child_id },
      { name: "p_child_name",          value: data.child_name },
      { name: "p_notes",               value: data.notes },
      { name: "p_pronunciation_id",    value: data.pronunciation_id },
      { name: "p_children_type_id",    value: data.children_type_id },
      { name: "p_staff_id",            value: data.staff_id },
      { name: "p_facility_id",         value: data.facility_id },
      // day_of_week_json は **そのまま JSON 文字列で渡す**
      { name: "p_day_of_week_json",    value: data.day_of_week },
    ];

    const result = await apiClient.callProcedure("insert_manager_p", params);
    return result;
  } catch (error) {
    throw error;
  }
}

async function update_manager_p(data) {
  try {

    const params = [
      data.child_id,
      data.staff_id,
      data.day_of_week,   // ← JSON文字列でOK
    ];

    const result = await apiClient.callProcedure("update_manager", params);
    return result;

  } catch (error) {
    throw error;
  }
}


module.exports = {
  insert_manager_p,
  update_manager_p,
};
