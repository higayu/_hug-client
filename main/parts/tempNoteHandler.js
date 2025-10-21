// main/parts/tempNoteHandler.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class TempNoteHandler {
  constructor() {
    this.db = null;
    this.dbPath = null;
  }

  // データベースの初期化
  async initDatabase() {
    try {
      console.log('🚀 [TempNoteHandler] データベース初期化開始');
      
      // データディレクトリのパスを決定
      const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
      let dataDir;
      
      if (isDev) {
        // 開発環境: data/ ディレクトリ
        dataDir = path.join(__dirname, '../../data');
      } else {
        // 本番環境: dist/win-unpacked/resources/data/ ディレクトリ
        dataDir = path.join(process.resourcesPath, 'data');
      }

      console.log('🔍 [TempNoteHandler] データディレクトリ:', dataDir);
      console.log('🔍 [TempNoteHandler] 開発環境:', isDev);

      // データディレクトリが存在しない場合は作成
      if (!fs.existsSync(dataDir)) {
        console.log('📁 [TempNoteHandler] データディレクトリを作成中...');
        fs.mkdirSync(dataDir, { recursive: true });
      }

      this.dbPath = path.join(dataDir, 'temp_notes.db');
      console.log('🔍 [TempNoteHandler] データベースパス:', this.dbPath);
      
      // データベース接続
      console.log('🔗 [TempNoteHandler] データベース接続中...');
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('❌ [TempNoteHandler] SQLite接続エラー:', err);
          throw err;
        }
        console.log('✅ [TempNoteHandler] SQLiteデータベース接続成功:', this.dbPath);
      });

      // テーブル作成
      console.log('📋 [TempNoteHandler] テーブル作成中...');
      await this.createTable();
      
      console.log('✅ [TempNoteHandler] データベース初期化完了');
      return { success: true, dbPath: this.dbPath };
    } catch (error) {
      console.error('❌ [TempNoteHandler] データベース初期化エラー:', error);
      console.error('❌ [TempNoteHandler] エラー詳細:', error.message);
      console.error('❌ [TempNoteHandler] スタック:', error.stack);
      return { success: false, error: error.message };
    }
  }

  // テーブル作成
  async createTable() {
    return new Promise((resolve, reject) => {
      // まず既存のテーブルを削除（スキーマ変更のため）
      const dropTableSQL = `DROP TABLE IF EXISTS temp_notes`;
      
      this.db.run(dropTableSQL, (err) => {
        if (err) {
          console.error('❌ [TempNoteHandler] テーブル削除エラー:', err);
          reject(err);
          return;
        }
        
        console.log('🗑️ [TempNoteHandler] 既存テーブルを削除しました');
        
        // 新しいテーブルを作成
        const createTableSQL = `
          CREATE TABLE temp_notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            child_id TEXT NOT NULL,
            staff_id TEXT NOT NULL,
            date_str TEXT NOT NULL,
            week_day TEXT NOT NULL,
            enter_time TEXT,
            exit_time TEXT,
            memo TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(child_id, staff_id, date_str, week_day)
          )
        `;

        this.db.run(createTableSQL, (err) => {
          if (err) {
            console.error('❌ [TempNoteHandler] テーブル作成エラー:', err);
            reject(err);
          } else {
            console.log('✅ [TempNoteHandler] temp_notesテーブル作成完了');
            resolve();
          }
        });
      });
    });
  }

  // 一時メモの保存
  async saveTempNote(data) {
    try {
      console.log('🚀 [TempNoteHandler] saveTempNote 開始');
      const { childId, staffId, dateStr, weekDay, enterTime, exitTime, memo } = data;
      
      // データベース接続の確認
      if (!this.db) {
        console.error('❌ [TempNoteHandler] データベースが接続されていません');
        console.error('❌ [TempNoteHandler] this.db:', this.db);
        console.error('❌ [TempNoteHandler] this.dbPath:', this.dbPath);
        return { success: false, error: 'データベースが接続されていません' };
      }
      
      console.log('✅ [TempNoteHandler] データベース接続確認完了');

      console.log('💾 [TempNoteHandler] 一時メモ保存開始:', { childId, staffId, dateStr, weekDay, enterTime, exitTime });

      return new Promise((resolve, reject) => {
        const insertSQL = `
          INSERT OR REPLACE INTO temp_notes 
          (child_id, staff_id, date_str, week_day, enter_time, exit_time, memo, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `;

        this.db.run(insertSQL, [childId, staffId, dateStr, weekDay, enterTime, exitTime, memo], function(err) {
          if (err) {
            console.error('❌ [TempNoteHandler] 一時メモ保存エラー:', err);
            reject({ success: false, error: err.message });
          } else {
            console.log(`✅ [TempNoteHandler] 一時メモ保存成功: ${childId} - ${enterTime} ～ ${exitTime} (${weekDay})`);
            resolve({ success: true, id: this.lastID });
          }
        });
      });
    } catch (error) {
      console.error('❌ [TempNoteHandler] 一時メモ保存処理エラー:', error);
      return { success: false, error: error.message };
    }
  }

  // 一時メモの取得
  async getTempNote(data) {
    try {
      console.log('🚀 [TempNoteHandler] getTempNote 開始');
      const { childId, staffId, dateStr, weekDay } = data;
      
      // データベース接続の確認
      if (!this.db) {
        console.error('❌ [TempNoteHandler] データベースが接続されていません');
        console.error('❌ [TempNoteHandler] this.db:', this.db);
        console.error('❌ [TempNoteHandler] this.dbPath:', this.dbPath);
        return { success: false, error: 'データベースが接続されていません' };
      }
      
      console.log('✅ [TempNoteHandler] データベース接続確認完了');
      
      console.log('🔍 [TempNoteHandler] 一時メモ取得開始:', { childId, staffId, dateStr, weekDay });
      
      return new Promise((resolve, reject) => {
        const selectSQL = `
          SELECT * FROM temp_notes 
          WHERE child_id = ? AND staff_id = ? AND date_str = ? AND week_day = ?
        `;

        this.db.get(selectSQL, [childId, staffId, dateStr, weekDay], (err, row) => {
          if (err) {
            console.error('❌ [TempNoteHandler] 一時メモ取得エラー:', err);
            reject({ success: false, error: err.message });
          } else {
            if (row) {
              console.log(`📖 [TempNoteHandler] 一時メモ取得成功: ${childId} - ${row.enter_time} ～ ${row.exit_time} (${row.week_day})`);
              resolve({ success: true, data: row });
            } else {
              console.log(`📖 [TempNoteHandler] 一時メモなし: ${childId} (${weekDay})`);
              resolve({ success: true, data: null });
            }
          }
        });
      });
    } catch (error) {
      console.error('❌ [TempNoteHandler] 一時メモ取得処理エラー:', error);
      return { success: false, error: error.message };
    }
  }

  // データベース接続を閉じる
  closeDatabase() {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          console.error('❌ [TempNoteHandler] データベース接続終了エラー:', err);
        } else {
          console.log('✅ [TempNoteHandler] データベース接続終了');
        }
      });
    }
  }
}

module.exports = TempNoteHandler;