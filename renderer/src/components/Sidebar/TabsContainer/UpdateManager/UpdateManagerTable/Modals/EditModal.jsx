// renderer/src/components/Sidebar/Tools/UpdateManager/Modals/EditModal.jsx

import { useState, useEffect, useMemo } from "react";
import SelectableWeekDayButton from "@/components/ui/SelectableWeekDayButton.jsx";
import { ModalPortal } from "@/components/common/ModalPortal";
import { useAppState } from "@/AppStateContext";

const PRIORITY_OPTIONS = [
  {
    value: 0,
    label: "通常",
  },
  {
    value: 1,
    label: "時折（たまに）対応する",
  },
  {
    value: 2,
    label: "一時的（滅多に無い）に対応する",
  },
];

const formatTimeForInput = (value) => {
  if (!value) return "";

  return String(value).slice(0, 5);
};

const formatTimeForDb = (value) => {
  if (!value) return null;

  if (String(value).length === 5) {
    return `${value}:00`;
  }

  return value;
};

const createEmptyDaySetting = () => ({
  selected: false,
  originallySelected: false,
  priority: 0,
  support_start_time: "",
  support_end_time: "",
});

export default function EditModal({ open, onClose, manager, onConfirm }) {
  const { databaseState, FACILITY_ID } = useAppState();

  const [daySettings, setDaySettings] = useState({});
  const [showUnassignedDays, setShowUnassignedDays] = useState(false);

  // ------------------------------------------
  // 固定表示用
  // facility_id / children_id / staff_id などは manager から取得
  // manager に facility_id がない場合は AppState の FACILITY_ID を fallback にする
  // ------------------------------------------
  const facilityId = useMemo(() => {
    const rawFacilityId =
      manager?.facility_id ??
      manager?.facilityId ??
      manager?.FACILITY_ID ??
      FACILITY_ID;

    const id = Number(rawFacilityId);

    return Number.isFinite(id) ? id : "";
  }, [manager, FACILITY_ID]);

  const childrenId = manager?.children_id ?? "";
  const staffId = manager?.staff_id ?? "";
  const childrenName = manager?.children_name ?? "";
  const staffName = manager?.staff_name ?? "";

  // ------------------------------------------
  // DB
  // ------------------------------------------
  const database = useMemo(() => {
    return databaseState ?? {};
  }, [databaseState]);

  const dayOfWeekMaster = useMemo(() => {
    return Array.isArray(database.day_of_week) ? database.day_of_week : [];
  }, [database.day_of_week]);

  const managers2 = useMemo(() => {
    return Array.isArray(database.managers2) ? database.managers2 : [];
  }, [database.managers2]);

  // ------------------------------------------
  // facilitys テーブル
  // databaseState.facilitys から施設名を取得する
  // ------------------------------------------
  const facilitys = useMemo(() => {
    return Array.isArray(database.facilitys) ? database.facilitys : [];
  }, [database.facilitys]);

  const facilityName = useMemo(() => {
    const directName =
      manager?.facility_name ??
      manager?.facilityName ??
      manager?.facility?.name ??
      "";

    if (directName) {
      return directName;
    }

    const targetFacilityId = Number(facilityId);

    if (!Number.isFinite(targetFacilityId)) {
      return "";
    }

    const facility = facilitys.find((f) => {
      const id =
        f?.id ??
        f?.facility_id ??
        f?.FACILITY_ID;

      return Number(id) === targetFacilityId;
    });

    return (
      facility?.name ??
      facility?.facility_name ??
      facility?.facilityName ??
      facility?.施設名 ??
      ""
    );
  }, [manager, facilityId, facilitys]);

  // ------------------------------------------
  // managers2 から対象施設・対象児童・対象スタッフの曜日データを抽出
  // ------------------------------------------
  const targetManagerRows = useMemo(() => {
    if (!manager) return [];

    const targetFacilityId = Number(facilityId);
    const targetChildrenId = Number(manager.children_id);
    const targetStaffId = Number(manager.staff_id);

    if (
      !Number.isFinite(targetFacilityId) ||
      !Number.isFinite(targetChildrenId) ||
      !Number.isFinite(targetStaffId)
    ) {
      console.warn("⚠️ EditModal: targetManagerRows 抽出条件が不正です", {
        facilityId,
        targetFacilityId,
        children_id: manager.children_id,
        targetChildrenId,
        staff_id: manager.staff_id,
        targetStaffId,
      });

      return [];
    }

    return managers2.filter(
      (m) =>
        Number(m.facility_id) === targetFacilityId &&
        Number(m.children_id) === targetChildrenId &&
        Number(m.staff_id) === targetStaffId
    );
  }, [managers2, manager, facilityId]);

  // ------------------------------------------
  // 初期値セット
  // 担当ありの曜日だけ originallySelected: true
  // ------------------------------------------
  useEffect(() => {
    if (!manager) return;

    const nextDaySettings = {};

    dayOfWeekMaster.forEach((day) => {
      const dayId = Number(day.id);

      const existingRow = targetManagerRows.find(
        (row) => Number(row.day_of_week_id) === dayId
      );

      const hasManager = Boolean(existingRow);

      nextDaySettings[dayId] = {
        selected: hasManager,
        originallySelected: hasManager,
        priority: Number(existingRow?.priority ?? 0),
        support_start_time: formatTimeForInput(
          existingRow?.support_start_time
        ),
        support_end_time: formatTimeForInput(
          existingRow?.support_end_time
        ),
      };
    });

    setDaySettings(nextDaySettings);

    // モーダルを開き直したときは、担当なし曜日は非表示に戻す
    setShowUnassignedDays(false);
  }, [manager, dayOfWeekMaster, targetManagerRows]);

  // ------------------------------------------
  // 表示する曜日
  // 初期状態では担当ありのみ表示
  // showUnassignedDays が true のときだけ担当なしも表示
  // originallySelected は削除予定になっても表示を残す
  // ------------------------------------------
  const visibleDayOfWeekMaster = useMemo(() => {
    return [...dayOfWeekMaster]
      .sort((a, b) => Number(a.sort_order) - Number(b.sort_order))
      .filter((day) => {
        const dayId = Number(day.id);
        const setting = daySettings[dayId] ?? createEmptyDaySetting();

        return (
          showUnassignedDays ||
          setting.selected ||
          setting.originallySelected
        );
      });
  }, [dayOfWeekMaster, daySettings, showUnassignedDays]);

  const hiddenUnassignedCount = useMemo(() => {
    return dayOfWeekMaster.filter((day) => {
      const dayId = Number(day.id);
      const setting = daySettings[dayId] ?? createEmptyDaySetting();

      return !setting.selected && !setting.originallySelected;
    }).length;
  }, [dayOfWeekMaster, daySettings]);

  // ------------------------------------------
  // 曜日トグル
  // ------------------------------------------
  const toggleDay = (id) => {
    const dayId = Number(id);

    setDaySettings((prev) => {
      const current = prev[dayId] ?? createEmptyDaySetting();

      return {
        ...prev,
        [dayId]: {
          ...current,
          selected: !current.selected,
        },
      };
    });
  };

  // ------------------------------------------
  // 曜日ごとの値更新
  // ------------------------------------------
  const updateDaySetting = (id, key, value) => {
    const dayId = Number(id);

    setDaySettings((prev) => {
      const current = prev[dayId] ?? createEmptyDaySetting();

      return {
        ...prev,
        [dayId]: {
          ...current,
          [key]: value,
        },
      };
    });
  };

  // ------------------------------------------
  // 保存
  // ------------------------------------------
  const handleSubmit = () => {
    const targetFacilityId = Number(facilityId);
    const targetChildrenId = Number(childrenId);
    const targetStaffId = Number(staffId);

    if (
      !Number.isFinite(targetFacilityId) ||
      !Number.isFinite(targetChildrenId) ||
      !Number.isFinite(targetStaffId)
    ) {
      console.warn("⚠️ EditModal: 保存に必要なIDが不足しています", {
        facilityId,
        childrenId,
        staffId,
      });
      return;
    }

    const selectedDayIds = Object.entries(daySettings)
      .filter(([, setting]) => setting.selected)
      .map(([dayId]) => Number(dayId))
      .filter((dayId) => Number.isFinite(dayId))
      .sort((a, b) => a - b);

    const selectedManagerRows = selectedDayIds.map((dayId) => {
      const setting = daySettings[dayId] ?? createEmptyDaySetting();

      const existingRow = targetManagerRows.find(
        (row) => Number(row.day_of_week_id) === Number(dayId)
      );

      return {
        ...existingRow,
        facility_id: targetFacilityId,
        children_id: targetChildrenId,
        staff_id: targetStaffId,
        day_of_week_id: Number(dayId),
        priority: Number(setting.priority ?? 0),
        support_start_time: formatTimeForDb(setting.support_start_time),
        support_end_time: formatTimeForDb(setting.support_end_time),
      };
    });

    const removedManagerRows = targetManagerRows.filter(
      (row) =>
        !selectedDayIds.some(
          (dayId) => Number(dayId) === Number(row.day_of_week_id)
        )
    );

    const removedDayOfWeekIds = removedManagerRows.map((row) =>
      Number(row.day_of_week_id)
    );

    const updated = {
      ...manager,

      // 固定値
      facility_id: targetFacilityId,
      children_id: targetChildrenId,
      staff_id: targetStaffId,
      children_name: childrenName,
      staff_name: staffName,
      facility_name: facilityName,

      // 選択中の曜日ID
      day_of_week_ids: selectedDayIds,

      // 保存対象の managers2 行
      managers2: selectedManagerRows,

      // 削除対象の曜日ID
      // 既存処理との互換用
      removed_day_of_week_ids: removedDayOfWeekIds,

      // 削除対象の managers2 行
      // facility_id 込みで削除したい場合はこちらを使う
      removed_managers2: removedManagerRows.map((row) => ({
        ...row,
        facility_id: targetFacilityId,
        children_id: targetChildrenId,
        staff_id: targetStaffId,
        day_of_week_id: Number(row.day_of_week_id),
      })),

      // 元の managers2 行
      original_managers2: targetManagerRows.map((row) => ({
        ...row,
        facility_id: targetFacilityId,
      })),
    };

    onConfirm(updated, "edit");
  };

  if (!open) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-xl w-[520px] max-h-[90vh] overflow-y-auto shadow-xl">
          <h2 className="text-lg font-bold mb-4">編集</h2>

          <div className="flex flex-col gap-3 mt-2">
            <div className="grid grid-cols-1 gap-3">
              <div className="flex flex-col">
                <label className="text-sm font-semibold">施設</label>
                <div className="border p-2 rounded-md text-sm bg-gray-100 text-gray-700">
                  {facilityId || "-"}
                  {facilityName ? ` : ${facilityName}` : " : 施設名未取得"}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <label className="text-sm font-semibold">子ども</label>
                  <div className="border p-2 rounded-md text-sm bg-gray-100 text-gray-700">
                    {childrenId} : {childrenName}
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-semibold">スタッフ</label>
                  <div className="border p-2 rounded-md text-sm bg-gray-100 text-gray-700">
                    {staffId} : {staffName}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <label className="text-sm font-semibold">
                曜日ごとの担当設定
              </label>

              {hiddenUnassignedCount > 0 && (
                <button
                  type="button"
                  className="text-xs px-3 py-1 rounded-md border border-gray-300 text-gray-700 bg-gray-50"
                  onClick={() =>
                    setShowUnassignedDays((prev) => !prev)
                  }
                >
                  {showUnassignedDays
                    ? "担当なし曜日を隠す"
                    : "担当なし曜日も表示"}
                </button>
              )}
            </div>

            {visibleDayOfWeekMaster.length > 0 ? (
              <div className="flex flex-col gap-3">
                {visibleDayOfWeekMaster.map((day) => {
                  const dayId = Number(day.id);
                  const setting =
                    daySettings[dayId] ?? createEmptyDaySetting();

                  const isRemovePending =
                    setting.originallySelected && !setting.selected;

                  return (
                    <div
                      key={day.id}
                      className={`border rounded-lg p-3 ${
                        setting.selected
                          ? "bg-blue-50 border-blue-300"
                          : isRemovePending
                            ? "bg-red-50 border-red-300"
                            : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <SelectableWeekDayButton
                          dayId={day.id}
                          label={day.label_jp}
                          active={setting.selected}
                          onClick={() => toggleDay(day.id)}
                        />

                        <span
                          className={`text-xs ${
                            setting.selected
                              ? "text-blue-600"
                              : isRemovePending
                                ? "text-red-500"
                                : "text-gray-500"
                          }`}
                        >
                          {setting.selected
                            ? "担当あり"
                            : isRemovePending
                              ? "削除予定"
                              : "担当なし"}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-col gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-semibold text-gray-600">
                            優先度
                          </label>

                          <select
                            value={setting.priority}
                            disabled={!setting.selected}
                            onChange={(e) =>
                              updateDaySetting(
                                day.id,
                                "priority",
                                Number(e.target.value)
                              )
                            }
                            className="border p-2 rounded-md text-sm disabled:bg-gray-100 disabled:text-gray-400"
                          >
                            {PRIORITY_OPTIONS.map((option) => (
                              <option
                                key={option.value}
                                value={option.value}
                              >
                                {option.value} : {option.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-600">
                              支援開始時間
                            </label>

                            <input
                              type="time"
                              value={setting.support_start_time}
                              disabled={!setting.selected}
                              onChange={(e) =>
                                updateDaySetting(
                                  day.id,
                                  "support_start_time",
                                  e.target.value
                                )
                              }
                              className="border p-2 rounded-md text-sm disabled:bg-gray-100 disabled:text-gray-400"
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-600">
                              支援終了時間
                            </label>

                            <input
                              type="time"
                              value={setting.support_end_time}
                              disabled={!setting.selected}
                              onChange={(e) =>
                                updateDaySetting(
                                  day.id,
                                  "support_end_time",
                                  e.target.value
                                )
                              }
                              className="border p-2 rounded-md text-sm disabled:bg-gray-100 disabled:text-gray-400"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-6 text-sm border rounded-md bg-gray-50">
                現在担当している曜日はありません
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-3 justify-end">
            <button
              type="button"
              className="px-4 py-2 rounded-md text-sm text-gray-700 border border-gray-300"
              onClick={onClose}
            >
              キャンセル
            </button>

            <button
              type="button"
              className="px-4 py-2 rounded-md text-sm text-white bg-blue-500"
              onClick={handleSubmit}
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}