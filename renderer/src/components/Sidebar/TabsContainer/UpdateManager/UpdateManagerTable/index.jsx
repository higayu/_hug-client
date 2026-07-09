// renderer/src/components/Sidebar/Tools/UpdateManager/UpdateManagerTable.jsx

import { useEffect, useState, useMemo } from "react";
import EditModal from "./Modals/EditModal";
import DeleteModal from "./Modals/DeleteModal";
import { deleteManager } from "./function/deleteManager";
import { updateManager } from "./function/updateManager";
import { useToast } from "@/components/common/ToastContext.jsx";
import { useDataBase } from "@/hooks/useDataBase";
import { selectManagersFull } from "./selectManagersFull.js";
import { useAppState } from "@/AppStateContext";

const MODAL_COMPONENTS = {
  edit: EditModal,
  delete: DeleteModal,
};

const normalizeTimeForDb = (value) => {
  if (value === "" || value == null) return null;

  if (String(value).length === 5) {
    return `${value}:00`;
  }

  return value;
};

const toNumberOrNull = (value) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : null;
};

const makeManagerKey = ({
  facility_id,
  children_id,
  staff_id,
  day_of_week_id,
}) => {
  const facilityId = toNumberOrNull(facility_id);
  const childrenId = toNumberOrNull(children_id);
  const staffId = toNumberOrNull(staff_id);
  const dayOfWeekId = toNumberOrNull(day_of_week_id);

  if (
    facilityId === null ||
    childrenId === null ||
    staffId === null ||
    dayOfWeekId === null
  ) {
    return null;
  }

  return `${facilityId}-${childrenId}-${staffId}-${dayOfWeekId}`;
};

export default function UpdateManagerTable() {
  const { showInfoToast, showErrorToast } = useToast();
  const { loadDataBase } = useDataBase();

  const {
    STAFF_ID,
    FACILITY_ID,
    DATABASE_TYPE,
    appState,
    CURRENT_DAY_OF_WEEK,
    databaseState,
  } = useAppState();

  const rawDatabaseType =
    DATABASE_TYPE ??
    appState?.DATABASE_TYPE ??
    appState?.appState?.DATABASE_TYPE ??
    null;

  const rawFacilityId =
    FACILITY_ID ??
    appState?.FACILITY_ID ??
    appState?.appState?.FACILITY_ID ??
    null;

  const rawStaffId =
    STAFF_ID ??
    appState?.STAFF_ID ??
    appState?.appState?.STAFF_ID ??
    null;

  const currentFacilityId = Number(rawFacilityId);
  const currentStaffId = Number(rawStaffId);

  // ------------------------------------------
  // DB から取得済みの施設テーブル
  // ------------------------------------------
  const currentFacility = useMemo(() => {
    const facilitys = Array.isArray(databaseState?.facilitys)
      ? databaseState.facilitys
      : [];
  
    return facilitys.find(
      (facility) => Number(facility.id) === Number(currentFacilityId)
    );
  }, [databaseState?.facilitys, currentFacilityId]);
  
  const currentFacilityName = currentFacility?.name ?? "-";

  // ------------------------------------------
  // DB から取得済みのテーブル
  // ------------------------------------------
  const database = useMemo(() => {
    return databaseState ?? {};
  }, [databaseState]);

  const dayOfWeekMaster = useMemo(() => {
    return Array.isArray(database.day_of_week) ? database.day_of_week : [];
  }, [database.day_of_week]);

  const managers = useMemo(() => {
    return selectManagersFull(database);
  }, [database]);

  const [activeDayId, setActiveDayId] = useState(null);

  const [modal, setModal] = useState({
    open: false,
    mode: "edit",
  });

  const [selectedManager, setSelectedManager] = useState(null);

  // ------------------------------------------
  // 初期表示する曜日をセット
  // ------------------------------------------
  useEffect(() => {
    if (dayOfWeekMaster.length === 0) return;
    if (activeDayId != null) return;

    const today = dayOfWeekMaster.find(
      (d) => Number(d.id) === Number(CURRENT_DAY_OF_WEEK?.weekdayId)
    );

    if (today) {
      setActiveDayId(today.id);
      return;
    }

    const firstDay = [...dayOfWeekMaster].sort(
      (a, b) => Number(a.sort_order) - Number(b.sort_order)
    )[0];

    setActiveDayId(firstDay?.id ?? null);
  }, [
    dayOfWeekMaster,
    CURRENT_DAY_OF_WEEK?.weekdayId,
    activeDayId,
  ]);

  const formatTimeForDisplay = (value) => {
    if (!value) return "-";

    return String(value).slice(0, 5);
  };

  // ------------------------------------------
  // 表示用：施設・曜日・スタッフで絞り込み
  // ------------------------------------------
  const filteredManagers = useMemo(() => {
    if (activeDayId == null) return [];

    if (!Number.isFinite(currentFacilityId)) {
      console.warn("[UpdateManagerTable] FACILITY_ID が不正です", {
        rawFacilityId,
        currentFacilityId,
      });

      return [];
    }

    if (!Number.isFinite(currentStaffId)) {
      console.warn("[UpdateManagerTable] STAFF_ID が不正です", {
        rawStaffId,
        currentStaffId,
      });

      return [];
    }

    const result = managers
      .filter(
        (m) =>
          Number(m.facility_id) === Number(currentFacilityId) &&
          Number(m.day_of_week_id) === Number(activeDayId) &&
          Number(m.staff_id) === Number(currentStaffId)
      )
      .sort((a, b) =>
        String(a.children_name ?? "").localeCompare(
          String(b.children_name ?? ""),
          "ja"
        )
      );

    console.log("[UpdateManagerTable] filter debug:", {
      activeDayId,
      FACILITY_ID: rawFacilityId,
      STAFF_ID: rawStaffId,
      currentFacilityId,
      currentStaffId,
      managersCount: managers.length,
      resultCount: result.length,
      managersSample: managers[0],
      result,
    });

    console.table(
      result.map((m) => ({
        facility_id: m.facility_id,
        children_id: m.children_id,
        children_name: m.children_name,
        staff_id: m.staff_id,
        staff_name: m.staff_name,
        day_of_week_id: m.day_of_week_id,
        support_start_time: m.support_start_time,
        support_end_time: m.support_end_time,
        priority: m.priority,
      }))
    );

    return result;
  }, [
    managers,
    activeDayId,
    rawFacilityId,
    rawStaffId,
    currentFacilityId,
    currentStaffId,
  ]);

  // ------------------------------------------
  // 操作系
  // ------------------------------------------
  const handleEdit = (manager) => {
    setSelectedManager(manager);

    setModal({
      open: true,
      mode: "edit",
    });
  };

  const handleDelete = (manager) => {
    setSelectedManager(manager);

    setModal({
      open: true,
      mode: "delete",
    });
  };

  const handleConfirm = async (managerOrUpdated, mode) => {
    try {
      console.log("[UpdateManagerTable] handleConfirm START:", {
        mode,
        managerOrUpdated,
        databaseType: rawDatabaseType,
      });

      const databaseType = String(rawDatabaseType ?? "").toLowerCase();
      const isMariaDb = databaseType === "mariadb";

      if (!databaseType) {
        throw new Error("DATABASE_TYPE が取得できません");
      }

      // ------------------------------------------
      // 削除
      // ------------------------------------------
      if (mode === "delete") {
        const facilityId = toNumberOrNull(
          managerOrUpdated?.facility_id ?? currentFacilityId
        );
        const childrenId = toNumberOrNull(managerOrUpdated?.children_id);
        const staffId = toNumberOrNull(managerOrUpdated?.staff_id);
        const dayOfWeekId = toNumberOrNull(managerOrUpdated?.day_of_week_id);

        if (
          facilityId === null ||
          childrenId === null ||
          staffId === null ||
          dayOfWeekId === null
        ) {
          throw new Error("削除に必要なIDが不足しています");
        }

        const deletePayload = {
          facility_id: facilityId,
          children_id: childrenId,
          staff_id: staffId,
          day_of_week_id: dayOfWeekId,
        };

        console.log("[UpdateManagerTable] delete START:", deletePayload);

        const result = await deleteManager(deletePayload, rawDatabaseType);

        console.log("[UpdateManagerTable] delete result:", result);

        if (!result) {
          throw new Error("削除に失敗しました");
        }
      }

      // ------------------------------------------
      // 編集
      // EditModal から渡ってくる想定:
      // updated.managers2
      // updated.removed_day_of_week_ids
      // updated.removed_managers2
      // updated.original_managers2
      // ------------------------------------------
      if (mode === "edit") {
        const updated = managerOrUpdated;

        const targetFacilityId = toNumberOrNull(
          updated?.facility_id ?? currentFacilityId
        );
        const targetChildrenId = toNumberOrNull(updated?.children_id);
        const targetStaffId = toNumberOrNull(updated?.staff_id);

        if (
          targetFacilityId === null ||
          targetChildrenId === null ||
          targetStaffId === null
        ) {
          throw new Error("編集に必要な facility_id / children_id / staff_id が不足しています");
        }

        console.log("[UpdateManagerTable] edit START:", {
          updated,
          databaseType,
          isMariaDb,
          targetFacilityId,
          targetChildrenId,
          targetStaffId,
        });

        const saveRows = Array.isArray(updated.managers2)
          ? updated.managers2
          : [updated];

        const removedDayOfWeekIds = Array.isArray(
          updated.removed_day_of_week_ids
        )
          ? updated.removed_day_of_week_ids
          : [];

        const removedRows = Array.isArray(updated.removed_managers2)
          ? updated.removed_managers2
          : removedDayOfWeekIds.map((dayOfWeekId) => ({
              facility_id: targetFacilityId,
              children_id: targetChildrenId,
              staff_id: targetStaffId,
              day_of_week_id: Number(dayOfWeekId),
            }));

        const originalRows = Array.isArray(updated.original_managers2)
          ? updated.original_managers2
          : (database.managers2 ?? []).filter(
              (row) =>
                Number(row.facility_id) === Number(targetFacilityId) &&
                Number(row.children_id) === Number(targetChildrenId) &&
                Number(row.staff_id) === Number(targetStaffId)
            );

        const originalKeySet = new Set(
          originalRows
            .map((row) =>
              makeManagerKey({
                ...row,
                facility_id: row.facility_id ?? targetFacilityId,
                children_id: row.children_id ?? targetChildrenId,
                staff_id: row.staff_id ?? targetStaffId,
              })
            )
            .filter(Boolean)
        );

        console.log("[UpdateManagerTable] edit rows:", {
          saveRows,
          removedDayOfWeekIds,
          removedRows,
          originalRows,
          originalKeySet: [...originalKeySet],
        });

        // ------------------------------------------
        // 1. チェックを外した曜日を削除
        // ------------------------------------------
        for (const row of removedRows) {
          const deletePayload = {
            facility_id: Number(row.facility_id ?? targetFacilityId),
            children_id: Number(row.children_id ?? targetChildrenId),
            staff_id: Number(row.staff_id ?? targetStaffId),
            day_of_week_id: Number(row.day_of_week_id),
          };

          if (
            !Number.isFinite(deletePayload.facility_id) ||
            !Number.isFinite(deletePayload.children_id) ||
            !Number.isFinite(deletePayload.staff_id) ||
            !Number.isFinite(deletePayload.day_of_week_id)
          ) {
            throw new Error("削除対象の managers2 ID が不正です");
          }

          console.log("[UpdateManagerTable] edit DELETE payload:", deletePayload);

          const deleteResult = await deleteManager(
            deletePayload,
            rawDatabaseType
          );

          console.log("[UpdateManagerTable] edit DELETE result:", deleteResult);

          if (!deleteResult) {
            throw new Error("曜日削除に失敗しました");
          }
        }

        // ------------------------------------------
        // 2. 選択されている曜日を更新 or 追加
        // ------------------------------------------
        for (const row of saveRows) {
          const payload = {
            facility_id: Number(row.facility_id ?? targetFacilityId),
            children_id: Number(row.children_id ?? targetChildrenId),
            staff_id: Number(row.staff_id ?? targetStaffId),
            day_of_week_id: Number(row.day_of_week_id),
            priority: Number(row.priority ?? 0),
            support_start_time: normalizeTimeForDb(row.support_start_time),
            support_end_time: normalizeTimeForDb(row.support_end_time),
          };

          if (
            !Number.isFinite(payload.facility_id) ||
            !Number.isFinite(payload.children_id) ||
            !Number.isFinite(payload.staff_id) ||
            !Number.isFinite(payload.day_of_week_id)
          ) {
            throw new Error("保存対象の managers2 ID が不正です");
          }

          const payloadKey = makeManagerKey(payload);
          const exists = payloadKey ? originalKeySet.has(payloadKey) : false;

          console.log("[UpdateManagerTable] edit SAVE payload:", {
            exists,
            payload,
            payloadKey,
          });

          if (exists) {
            const updateResult = await updateManager(
              payload,
              rawDatabaseType
            );

            console.log("[UpdateManagerTable] edit UPDATE result:", updateResult);

            if (!updateResult) {
              throw new Error("更新に失敗しました");
            }
          } else {
            console.log("[UpdateManagerTable] edit INSERT start:", {
              isMariaDb,
              payload,
            });

            let insertResult;

            if (isMariaDb) {
              insertResult =
                await window.electronAPI.mariadb_managers2_insert(payload);
            } else {
              insertResult =
                await window.electronAPI.sqlite_managers2_insert(payload);
            }

            console.log("[UpdateManagerTable] edit INSERT result:", insertResult);

            if (insertResult === false) {
              throw new Error("追加に失敗しました");
            }

            if (
              insertResult &&
              typeof insertResult === "object" &&
              insertResult.success === false
            ) {
              throw new Error("追加に失敗しました");
            }
          }
        }

        console.log("[UpdateManagerTable] edit END");
      }

      showInfoToast("更新完了");
      await loadDataBase();
    } catch (error) {
      console.error("[UpdateManagerTable] handleConfirm error:", error);
      showErrorToast("エラー");
    } finally {
      setModal({
        open: false,
        mode: "edit",
      });

      setSelectedManager(null);
    }
  };

  const handleClose = () => {
    setModal((prev) => ({
      ...prev,
      open: false,
    }));

    setSelectedManager(null);
  };

  const DynamicModal = MODAL_COMPONENTS[modal.mode];

  return (
    <div className="p-2 bg-white shadow rounded-xl">
      <h4 className="text-lg font-bold mb-2">児童担当編集</h4>

      <div className="mb-3 text-xs text-gray-500">
          <div>
            現在の施設:{" "}
            {Number.isFinite(currentFacilityId)
              ? `（ID: ${currentFacilityId}）${currentFacilityName}`
              : "-"}
          </div>
          <div>
            現在のスタッフID:{" "}
            {Number.isFinite(currentStaffId) ? currentStaffId : "-"}
          </div>
      </div>

      <div className="flex gap-2 mb-3">
        {[...dayOfWeekMaster]
          .sort((a, b) => Number(a.sort_order) - Number(b.sort_order))
          .map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setActiveDayId(d.id)}
              className={`px-3 py-1 rounded-full text-sm font-semibold border ${
                Number(activeDayId) === Number(d.id)
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-gray-100 text-gray-700 border-gray-300"
              }`}
            >
              {d.label_jp}
            </button>
          ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border px-4 text-xs">編集</th>
              <th className="border px-4 text-xs">削除</th>
              <th className="border px-4 py-2 text-xs">子どもID</th>
              <th className="border px-4 py-2 text-xs">子ども名</th>
              <th className="border px-4 py-2 text-xs">スタッフ名</th>
              <th className="border px-4 py-2 text-xs">支援開始</th>
              <th className="border px-4 py-2 text-xs">支援終了</th>
            </tr>
          </thead>

          <tbody>
            {filteredManagers.length > 0 ? (
              filteredManagers.map((m) => (
                <tr
                  key={`${m.facility_id}-${m.children_id}-${m.staff_id}-${m.day_of_week_id}`}
                >
                  <td className="border px-4 py-2">
                    <button
                      type="button"
                      className="bg-blue-500 text-xs text-white p-2 rounded-md"
                      onClick={() => handleEdit(m)}
                    >
                      編集
                    </button>
                  </td>

                  <td className="border px-4 py-2">
                    <button
                      type="button"
                      className="bg-red-500 text-xs text-white p-2 rounded-md"
                      onClick={() => handleDelete(m)}
                    >
                      削除
                    </button>
                  </td>

                  <td className="border px-4 py-2 text-xs">
                    {m.children_id}
                  </td>

                  <td className="border px-4 py-2 text-xs">
                    {m.children_name}
                  </td>

                  <td className="border px-4 py-2 text-xs">
                    {m.staff_name}
                  </td>

                  <td className="border px-4 py-2 text-xs">
                    {formatTimeForDisplay(m.support_start_time)}
                  </td>

                  <td className="border px-4 py-2 text-xs">
                    {formatTimeForDisplay(m.support_end_time)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="text-center text-gray-400 py-6 text-sm"
                >
                  この曜日の担当はありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modal.open && DynamicModal && (
        <DynamicModal
          open={modal.open}
          mode={modal.mode}
          manager={selectedManager}
          onClose={handleClose}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}