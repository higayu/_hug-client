// houday/src/pages/ChildKadai/ChildKadaiCreate.jsx
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "@/api"; // ★ ノーマル API を使用
import { showError, showSuccess } from "@/util/Toast";

function ChildKadaiCreate() {
  const navigate = useNavigate();

  const selectedFacility = useSelector(
    (state) => state.facility.selectedFacility
  );
  const selectedStaff = useSelector(
    (state) => state.staff.selectedStaff
  );
  const selectedKadai = useSelector(
    (state) => state.kadai.selectedKadai
  );

  const [childrenList, setChildrenList] = useState([]);
  const [recordTypes, setRecordTypes] = useState([]);

  const [form, setForm] = useState({
    children_id: "",
    record_type_id: "",
    date: "",
    score: "",
    mistakes: "",
    memo1: "",
    memo2: "",
  });

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // ===== 保存処理 =====
  const handleSave = async () => {
    if (!form.children_id || !form.record_type_id || !form.date) {
      showError("必要項目を入力してください");
      return;
    }

    const payload = {
      ...form,
      facility_id: selectedFacility.id,
    };

    console.log("selectedFacility:", selectedFacility);
    console.log("POST 送信データ payload:", payload);

    try {
      await api.sqlApi.post("/houday/child_records", payload);
      showSuccess("登録しました");
      navigate(`/${selectedFacility.url}/childkadai-table`);
    } catch (err) {
      console.error(err);
      showError("登録に失敗しました");
    }
  };

  // 今日の日付（YYYY-MM-DD）
  const today = () => new Date().toISOString().split("T")[0];

  // ===== 初期データ取得 =====
  useEffect(() => {
    Promise.all([
      api.sqlApi.callProcedure(
        "houday",
        "GetChildrenByStaff2", [
        selectedStaff.staff_id,
        null,
      ]),
      api.sqlApi.get("/houday/record_types"),
    ])
      .then(([children, types]) => {
        setChildrenList(children ?? []);
        setRecordTypes(types ?? []);
        console.log("DEBUG: record_types API response:", types);
      })
      .catch((err) => {
        console.error(err);
        showError("初期データの取得に失敗しました");
      });
  }, []);

  // ===== 選択中課題がある場合 =====
  useEffect(() => {
    if (!selectedKadai) return;

    setForm((prev) => ({
      ...prev,
      children_id: selectedKadai.children_id || "",
      record_type_id: selectedKadai.record_type_id || "",
    }));
  }, [selectedKadai, childrenList, recordTypes]);

  // ===== 初期日付 =====
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      date: today(),
    }));
  }, []);

  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold mb-4">児童記録 新規登録</h2>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            保存
          </button>

          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded"
          >
            戻る
          </button>
        </div>
      </div>

      <div className="flex">
        {/* 児童 */}
        <div className="mb-4">
          <label className="block mb-1 font-semibold">児童</label>
          <select
            value={form.children_id}
            onChange={(e) =>
              handleChange("children_id", Number(e.target.value))
            }
            className="border p-2 rounded w-full"
          >
            <option value="">選択してください</option>
            {childrenList.map((c) => (
              <option key={c.children_id} value={c.children_id}>
                {c.children_name}
              </option>
            ))}
          </select>
        </div>

        {/* 記録タイプ */}
        <div className="ml-4 mb-4">
          <label className="block mb-1 font-semibold">記録タイプ</label>
          <select
            value={form.record_type_id}
            onChange={(e) =>
              handleChange("record_type_id", Number(e.target.value))
            }
            className="border p-2 rounded w-full"
          >
            <option value="">選択してください</option>
            {recordTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-row">
        {/* 日付 */}
        <div className="mb-4">
          <input
            type="date"
            value={form.date}
            onChange={(e) => handleChange("date", e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>

        {/* 施設名 */}
        <div className="ml-5 mt-2">
          <label className="block mb-1 font-semibold">
            {selectedFacility?.name ?? ""}
          </label>
        </div>
      </div>

      <div className="flex">
        {/* 点数 */}
        <div className="mb-4">
          <label className="block mb-1 font-semibold">点数</label>
          <input
            type="number"
            value={form.score}
            onChange={(e) =>
              handleChange("score", Number(e.target.value))
            }
            className="border p-2 rounded w-full"
          />
        </div>

        {/* ミス数 */}
        <div className="ml-4 mb-4">
          <label className="block mb-1 font-semibold">ミス数</label>
          <input
            type="number"
            value={form.mistakes}
            onChange={(e) =>
              handleChange("mistakes", Number(e.target.value))
            }
            className="border p-2 rounded w-full"
          />
        </div>
      </div>

      {/* メモ */}
      <div className="mb-4">
        <label className="block mb-1 font-semibold">メモ1</label>
        <textarea
          value={form.memo1}
          onChange={(e) => handleChange("memo1", e.target.value)}
          className="border p-2 rounded w-full"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-semibold">メモ2</label>
        <textarea
          value={form.memo2}
          onChange={(e) => handleChange("memo2", e.target.value)}
          className="border p-2 rounded w-full"
        />
      </div>
    </div>
  );
}

export default ChildKadaiCreate;
