import sqlite3
import json
from pathlib import Path
from pprint import pprint

# === SQLite データベースの絶対パスを設定 ===
db_path = Path(__file__).resolve().parent / "houday.db"

# === 検証パラメータ ===
staff_id = 73
day = "土"  # 例：曜日カラムに一致する値

# === SQLクエリ（SQLite対応版）===
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
FROM children c
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
    AND m.day_of_week LIKE ?
ORDER BY s.id DESC, c.name;
"""

# === SQLite接続 ===
if not db_path.exists():
    print(f"❌ DBファイルが存在しません: {db_path}")
    exit(1)

conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row
cur = conn.cursor()

try:
    print(f"✅ 接続成功: {db_path}")
    day_json_pattern = f'%"{day}"%'  # JSON風文字列をLIKEで判定

    cur.execute(query, (day, staff_id, day_json_pattern))
    rows = cur.fetchall()

    print(f"\n🔍 検索結果: {len(rows)} 件")

    if len(rows) == 0:
        print("\n⚠️ 結果が空でした。以下を確認してください：")
        print("  - children, managers, staffs, pc_to_children テーブルにデータがありますか？")
        print("  - managers.day_of_week カラムの形式は JSON風文字列ですか？（例: {'days': ['月','火']}）")
        print(f"  - 曜日が '{day}' に一致していますか？")
    else:
        print("\n📋 検索結果サンプル:")
        for row in rows:
            pprint(dict(row))

except sqlite3.Error as e:
    print(f"❌ SQLiteエラー: {e}")

finally:
    conn.close()
    print("\n✅ データベース接続終了")
