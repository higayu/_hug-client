// src/components/table/EditKadai.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "@/api"; // ★ ノーマル API
import { showSuccess, showError } from "@/util/Toast";

const EditKadai = () => {
  const { id } = useParams(); // /records/edit/:id
  const navigate = useNavigate();

  // ✅ Redux から選択中施設を取得
  const selectedFacility = useSelector(
    (state) => state.facility.selectedFacility
  );

  const [record, setRecord] = useState({
    date: "",
    children_id: "",
    record_type_id: "",
    score: "",
    mistakes: "",
    memo1: "",
    memo2: "",
    facility_id: "",
  });

  const [childrenList, setChildrenList] = useState([]);
  const [recordTypes, setRecordTypes] = useState([]);
  const [facilities, setFacilities] = useState([]);

  // ===== 初期データ取得 =====
  useEffect(() => {
    const fetchData = async () => {
      try {
        // ▼ 全件取得
        const res = await api.sqlApi.get("/houday/child_records");

        // ▼ 対象レコード抽出
        const data = res.find((rec) => rec.id == id);

        if (!data) {
          showError("データが見つかりません");
          return;
        }

        setRecord(data);

        // ▼ マスタ取得
        const [children, types, facs] = await Promise.all([
          api.sqlApi.get("/houday/children"),
          api.sqlApi.get("/houday/record_types"),
          api.sqlApi.get("/houday/facilitys"),
        ]);

        setChildrenList(children);
        setRecordTypes(types);
        setFacilities(facs);
      } catch (err) {
        console.error(err);
        showError("データ取得に失敗しました");
      }
    };

    fetchData();
  }, [id]);

  // ===== 入力変更 =====
  const handleChange = (e) => {
    const { name, value } = e.target;
    setRecord((prev) => ({ ...prev, [name]: value }));
  };

  // ===== 更新 =====
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = { ...record };

      // 不要カラム削除
      delete payload.created_at;
      delete payload.updated_at;

      // date を YYYY-MM-DD に変換
      if (payload.date) {
        payload.date = payload.date.slice(0, 10);
      }

      await api.sqlApi.put("/houday/child_records", payload, {
        params: { pk: "id", values: String(id) },
      });

      showSuccess("更新しました");
      navigate(`/${selectedFacility.url}/childkadai-table`);
    } catch (err) {
      console.error(err);
      showError("更新に失敗しました");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">児童記録 編集</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 日付 */}
        <div>
          <label className="block mb-1">日付 *</label>
          <input
            type="date"
            name="date"
            value={record.date?.slice(0, 10)}
            onChange={handleChange}
            className="border w-full p-2 rounded"
            required
          />
        </div>

        {/* 児童 */}
        <div>
          <label className="block mb-1">児童 *</label>
          <select
            name="children_id"
            value={record.children_id}
            onChange={handleChange}
            className="border w-full p-2 rounded"
            required
          >
            <option value="">選択してください</option>
            {childrenList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* 記録タイプ */}
        <div>
          <label className="block mb-1">記録タイプ *</label>
          <select
            name="record_type_id"
            value={record.record_type_id}
            onChange={handleChange}
            className="border w-full p-2 rounded"
            required
          >
            <option value="">選択してください</option>
            {recordTypes.map((rt) => (
              <option key={rt.id} value={rt.id}>
                {rt.name}
              </option>
            ))}
          </select>
        </div>

        {/* 点数 */}
        <div>
          <label className="block mb-1">点数</label>
          <input
            type="number"
            name="score"
            value={record.score || ""}
            onChange={handleChange}
            className="border w-full p-2 rounded"
          />
        </div>

        {/* ミス数 */}
        <div>
          <label className="block mb-1">ミス数</label>
          <input
            type="number"
            name="mistakes"
            value={record.mistakes || ""}
            onChange={handleChange}
            className="border w-full p-2 rounded"
          />
        </div>

        {/* メモ1 */}
        <div>
          <label className="block mb-1">メモ1</label>
          <input
            name="memo1"
            value={record.memo1 || ""}
            onChange={handleChange}
            className="border w-full p-2 rounded"
          />
        </div>

        {/* メモ2 */}
        <div>
          <label className="block mb-1">メモ2</label>
          <textarea
            name="memo2"
            value={record.memo2 || ""}
            onChange={handleChange}
            className="border w-full p-2 rounded"
            rows={4}
          />
        </div>

        {/* ボタン */}
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={() =>
              navigate(`/${selectedFacility.url}/childkadai-table`)
            }
            className="px-4 py-2 bg-gray-400 text-white rounded"
          >
            戻る
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            更新
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditKadai;
