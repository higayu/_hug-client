import sqlite3
import json
from pprint import pprint

# === SQLite データベースのパス ===
db_path = r"houday.db"  # ← 実際のSQLiteファイルに合わせて修正

# === 検証パラメータ ===
staff_id = 73
day = "土"  # 例：曜日カラムに一致する値

# === 検証SQL (プロシージャの代替SQL) ===
query = """
SELECT 
    c.id AS children_id,
    c.name AS children_name,
    c.pronunciation_id AS children_pronunciation_id,
    p.pronunciation AS children_pronunciation,
    c.notes,
    c.children_type_id AS children_type_id,
    ct.name AS children_type_name,
    pc.id AS pc_id,
    pc.name AS pc_name,
    pc.explanation AS pc_explanation,
    pc.memo AS pc_memo,
    ptc.day_of_week AS pc_day_of_week,
    ptc.id AS ptc_id,
    ptc.start_time AS start_time,
    ptc.end_time AS end_time
FROM Children c
INNER JOIN managers m ON c.id = m.children_id
INNER JOIN staffs s ON m.staff_id = s.id
LEFT JOIN pc_to_children ptc 
    ON c.id = ptc.children_id
    AND (ptc.day_of_week = ? OR ptc.day_of_week = '')
LEFT JOIN pc 
    ON ptc.pc_id = pc.id
LEFT JOIN pronunciation p 
    ON c.pronunciation_id = p.id
LEFT JOIN children_type ct
    ON c.children_type_id = ct.id
WHERE 
    s.id = ?
    AND json_extract(m.day_of_week, '$.days') LIKE ?
ORDER BY s.id DESC, c.name;
"""

# === 接続 ===
conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row
cur = conn.cursor()

try:
    # JSON_CONTAINS の代替（SQLite では LIKE を使用）
    day_json_pattern = f'%"{day}"%'  # 例：  "days": ["月","火","金"] のようなJSONをLIKEで検出
    
    cur.execute(query, (day, staff_id, day_json_pattern))
    rows = cur.fetchall()

    print(f"🔍 検索結果: {len(rows)} 件")

    if len(rows) == 0:
        print("\n⚠️ 結果が空でした。データが存在するか確認してください。")
        print("- Children, managers, staffs, pc_to_children テーブルにデータがありますか？")
        print("- day_of_week のJSON形式が正しいですか？（例: {'days': ['月','火']}）")
        print("- 曜日が {day} に一致してますか？")
    else:
        for row in rows:
            pprint(dict(row))

finally:
    conn.close()
