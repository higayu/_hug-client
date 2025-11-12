import { insertChild } from './sqlite/child.js';
import { insertFacilityChild } from './sqlite/facility.js';
import { insertOrUpdateManager } from './sqlite/manager.js';

/**
 * SQLite用 登録処理
 */
export async function sqliteFnc({
  child,
  childrenData,
  managersData,
  STAFF_ID,
  WEEK_DAY,
  FACILITY_ID,
}) {
  const existingChild = childrenData.find(
    (c) => String(c.id) === String(child.children_id)
  );

  if (!existingChild) {
    await insertChild(child);
    await insertFacilityChild(child.children_id, FACILITY_ID);
  }

  await insertOrUpdateManager(child, managersData, STAFF_ID, WEEK_DAY);
}
