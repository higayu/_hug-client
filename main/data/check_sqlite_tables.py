import sqlite3
from pathlib import Path

db_path = Path("E:/_共有用_フォルダ/_hug-client/main/data/houday.db")

if not db_path.exists():
    print("❌ DBファイルが存在しません:", db_path)
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    print(f"✅ 接続成功: {db_path}")
    print("📋 テーブル一覧:")

    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    for t in tables:
        print(" -", t[0])

    conn.close()
