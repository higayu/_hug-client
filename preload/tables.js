// preload/tables.js

const sqliteTables = [
  "children",
  "children_type",
  "day_of_week",
  "facility_children",
  "facility_staff",
  "facilitys",
  "individual_support",
  "managers2",
  "pc",
  "pc_to_children",
  "pronunciation",
  "staffs",
  "temp_notes",
  "ai_temp_notes",
  "service_record",

  // MariaDB 追加分を SQLite フォールバックでも使う場合
  "record_types",
  "child_records",
  "m_service_items",
  "staff_facility_roles",
  "text_data",
  "toolbox",
  "memo",
];

const mariadbTables = [
  "children",
  "children_type",
  "day_of_week",
  "facility_children",
  "facility_staff",
  "facilitys",
  "individual_support",
  "managers2",
  "pc",
  "pc_to_children",
  "pronunciation",
  "staffs",
  "service_record",
  "temp_notes",

  // MariaDB 追加分
  "record_types",
  "child_records",
  "m_service_items",
  "staff_facility_roles",
  "text_data",
  "toolbox",
  "memo",
];

module.exports = {
  sqliteTables,
  mariadbTables,
};