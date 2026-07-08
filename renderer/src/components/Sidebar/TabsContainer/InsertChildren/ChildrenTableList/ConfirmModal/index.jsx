import React, { useState, useEffect, useRef } from "react";
import { useAppState } from "@/AppStateContext";
import { useSelector } from "react-redux";
import { updateManager, getManagerRecord } from "./managersUtils.js";
import { ModalPortal } from "@/components/common/ModalPortal";

/**
 * 時間だけを HH:00:00 に変換する
 *
 * 例:
 * - "9"  → "09:00:00"
 * - "12" → "12:00:00"
 * - ""   → null
 */
function hourToTimeValue(hour) {
  if (hour === "" || hour == null) {
    return null;
  }

  const hourNumber = Number(hour);

  if (Number.isNaN(hourNumber)) {
    return null;
  }

  return `${String(hourNumber).padStart(2, "0")}:00:00`;
}

/**
 * DBから来た TIME / TEXT を hour select 用の値に変換する
 *
 * 例:
 * - "09:00:00" → "9"
 * - "12:00:00" → "12"
 * - null       → ""
 */
function timeToHourValue(time) {
  if (!time) {
    return "";
  }

  const text = String(time).trim();

  if (!text) {
    return "";
  }

  if (text.includes(":")) {
    const [hourText] = text.split(":");
    const hour = Number(hourText);

    if (Number.isNaN(hour)) {
      return "";
    }

    return String(hour);
  }

  const digits = text.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  const normalized = digits.padStart(4, "0");
  const hour = Number(normalized.slice(0, -2));

  if (Number.isNaN(hour)) {
    return "";
  }

  return String(hour);
}

/**
 * select value 用に文字列へ統一する
 */
function toSelectValue(value) {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value);
}

/**
 * 0時〜23時の選択肢
 */
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, hour) => ({
  value: String(hour),
  label: `${String(hour).padStart(2, "0")}:00`,
}));

/**
 * 確認モーダルコンポーネント
 */
function ConfirmModal({ show, message, list = [], onConfirm, onCancel }) {
  const database = useSelector((state) => state.database);

  const pronunciation = database?.pronunciation ?? [];
  const childrenType = database?.children_type ?? [];
  const childrenData = database?.children ?? [];
  const managersList = database?.managers ?? [];

  // 新仕様：CURRENT_DAY_OF_WEEK から weekdayId を直接取得
  const { STAFF_ID, FACILITY_ID, CURRENT_DAY_OF_WEEK,appState } = useAppState();
  const weekdayId = CURRENT_DAY_OF_WEEK?.weekdayId;

  const [selectedValues, setSelectedValues] = useState({});
  const Facilitys = appState.facilitys;

  // モーダルを開いている間、初期値で選択値を上書きし続けないための ref
  const initializedForOpenRef = useRef(false);

  useEffect(() => {
    console.log("職員ID", STAFF_ID);
    console.log("施設ID", FACILITY_ID);
    console.log("曜日ID", weekdayId);
    console.log("day_of_week マスタ", database?.day_of_week);
    console.log("managers データ", database?.managers);
    console.log("managers2 データ", database?.managers2);
  }, [database, STAFF_ID, FACILITY_ID, weekdayId]);

  /**
   * モーダルを開いたとき、list の既存値から時刻初期値を作る
   *
   * 重要:
   * - show=false になったら初期化フラグを戻す
   * - show=true 中はユーザーが選択した値を useEffect で上書きしない
   * - selectedValues のキーは String(children_id) に統一
   */
  useEffect(() => {
    if (!show) {
      initializedForOpenRef.current = false;
      setSelectedValues({});
      return;
    }

    if (initializedForOpenRef.current) {
      return;
    }

    if (!Array.isArray(list) || list.length === 0) {
      setSelectedValues({});
      return;
    }

    const initialValues = {};

    list.forEach((child) => {
      const id = String(child.children_id);

      initialValues[id] = {
        pronunciation_id: toSelectValue(child.pronunciation_id),
        children_type_id: toSelectValue(child.children_type_id),
        support_start_hour: timeToHourValue(child.support_start_time),
        support_end_hour: timeToHourValue(child.support_end_time),
      };
    });

    console.log("🧩 ConfirmModal 初期 selectedValues:", initialValues);

    initializedForOpenRef.current = true;
    setSelectedValues(initialValues);
  }, [show, list]);

  // モーダル非表示
  if (!show) return null;

  const handleSelectChange = (childrenId, key, value) => {
    const id = String(childrenId);

    console.log("🔁 select変更:", {
      childrenId,
      id,
      key,
      value,
    });

    setSelectedValues((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] ?? {}),
        [key]: value,
      },
    }));
  };

  const handleConfirm = () => {
    if (!weekdayId) {
      console.error("❌ weekdayId が未設定です");
      return;
    }

    const updatedList = list.map((child) => {
      const id = String(child.children_id);
      const selected = selectedValues[id] ?? {};

      const existingChild = childrenData.find(
        (c) => String(c.id) === String(child.children_id)
      );

      // ① 既存の manager レコード取得
      const managerRecord = getManagerRecord(
        child.children_id,
        STAFF_ID,
        managersList
      );

      // ② weekdayId をそのまま使う
      const updatedDayJson = updateManager(
        managerRecord?.day_of_week,
        weekdayId
      );

      const supportStartTime = hourToTimeValue(selected.support_start_hour);
      const supportEndTime = hourToTimeValue(selected.support_end_hour);

      return {
        ...child,

        pronunciation_id:
          existingChild?.pronunciation_id ??
          selected.pronunciation_id ??
          null,

        children_type_id:
          existingChild?.children_type_id ??
          selected.children_type_id ??
          null,

        // managers 旧仕様用
        day_of_week: updatedDayJson,

        // managers2 新仕様用
        // 分・秒は 00 固定
        support_start_time: supportStartTime,
        support_end_time: supportEndTime,
      };
    });

    console.log("送信データ(updatedList):", updatedList);
    onConfirm(updatedList);
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white text-black rounded-lg shadow-lg p-6 w-[720px] max-h-[80vh] overflow-y-auto text-center">
          <p className="text-lg font-medium mb-4 text-black">{message}</p>

          {list.length > 0 && (
            <table className="w-full border border-gray-300 text-sm mb-4 text-black">
              <thead className="bg-gray-100 text-black sticky top-0">
                <tr>
                  <th className="border px-2 py-1 text-black">児童ID</th>
                  <th className="border px-2 py-1 text-black">児童名</th>
                  <th className="border px-2 py-1 text-black">検索文字</th>
                  <th className="border px-2 py-1 text-black">利用種別</th>
                  <th className="border px-2 py-1 text-black">開始時刻</th>
                  <th className="border px-2 py-1 text-black">終了時刻</th>
                  <th className="border px-2 py-1 text-black">施設名</th>
                </tr>
              </thead>

              <tbody>
                {list.map((child) => {
                  const id = String(child.children_id);

                  const existingChild = childrenData.find(
                    (c) => String(c.id) === String(child.children_id)
                  );

                  const isExisting = !!existingChild;
                  const selected = selectedValues[id] ?? {};

                  const pronunciationValue = toSelectValue(
                    existingChild?.pronunciation_id ??
                      selected.pronunciation_id
                  );

                  const childrenTypeValue = toSelectValue(
                    existingChild?.children_type_id ??
                      selected.children_type_id
                  );

                  const supportStartHourValue = toSelectValue(
                    selected.support_start_hour
                  );

                  const supportEndHourValue = toSelectValue(
                    selected.support_end_hour
                  );

                  return (
                    <tr
                      key={id}
                      className="hover:bg-blue-50 text-black"
                    >
                      <td className="border px-2 py-1 text-black">
                        {child.children_id}
                      </td>

                      <td className="border px-2 py-1 text-black">
                        {child.children_name}
                      </td>

                      <td className="border px-2 py-1">
                        <select
                          className={`border px-2 py-1 w-full text-black ${
                            isExisting
                              ? "bg-gray-100 text-black opacity-100"
                              : ""
                          }`}
                          value={pronunciationValue}
                          disabled={isExisting}
                          onChange={(e) =>
                            handleSelectChange(
                              child.children_id,
                              "pronunciation_id",
                              e.target.value
                            )
                          }
                        >
                          <option value="">未選択</option>
                          {pronunciation.map((p) => (
                            <option key={p.id} value={String(p.id)}>
                              {p.pronunciation}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="border px-2 py-1">
                        <select
                          className={`border px-2 py-1 w-full text-black ${
                            isExisting
                              ? "bg-gray-100 text-black opacity-100"
                              : ""
                          }`}
                          value={childrenTypeValue}
                          disabled={isExisting}
                          onChange={(e) =>
                            handleSelectChange(
                              child.children_id,
                              "children_type_id",
                              e.target.value
                            )
                          }
                        >
                          <option value="">未選択</option>
                          {childrenType.map((t) => (
                            <option key={t.id} value={String(t.id)}>
                              {t.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="border px-2 py-1">
                        <select
                          className="border bg-slate-50 px-2 py-1 w-full text-black"
                          value={supportStartHourValue}
                          onChange={(e) =>
                            handleSelectChange(
                              child.children_id,
                              "support_start_hour",
                              e.target.value
                            )
                          }
                        >
                          <option value="">未設定</option>
                          {HOUR_OPTIONS.map((option) => (
                            <option
                              key={option.value}
                              value={option.value}
                            >
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="border px-2 py-1">
                        <select
                          className="border bg-slate-50 px-2 py-1 w-full text-black"
                          value={supportEndHourValue}
                          onChange={(e) =>
                            handleSelectChange(
                              child.children_id,
                              "support_end_hour",
                              e.target.value
                            )
                          }
                        >
                          <option value="">未設定</option>
                          {HOUR_OPTIONS.map((option) => (
                            <option
                              key={option.value}
                              value={option.value}
                            >
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          <div className="flex justify-around">
            <button
              onClick={handleConfirm}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              はい
            </button>

            <button
              onClick={onCancel}
              className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
            >
              いいえ
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

export default ConfirmModal;