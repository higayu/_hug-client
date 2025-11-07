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
      
      console.log('🔍 [TempNoteHandler] NODE_ENV:', process.env.NODE_ENV);
      console.log('🔍 [TempNoteHandler] process.resourcesPath:', process.resourcesPath);
      console.log('🔍 [TempNoteHandler] __dirname:', __dirname);
      
      if (isDev) {
        // 開発環境: data/ ディレクトリ
        dataDir = path.join(__dirname, '../../data');
        console.log('🔍 [TempNoteHandler] 開発環境モード');
      } else {
        // 本番環境: 複数のパスを試行
        console.log('🔍 [TempNoteHandler] 本番環境モード');
        
        // パス候補を定義
        const possiblePaths = [
          path.join(process.resourcesPath, 'data'), // 既存のresources/dataディレクトリ
          path.join(process.env.APPDATA || process.env.HOME || process.env.USERPROFILE || process.cwd(), 'HugClient', 'data'), // ユーザーディレクトリ
          path.join(process.cwd(), 'data'), // アプリケーションディレクトリ
          path.join(require('os').tmpdir(), 'hug-client', 'data') // 一時ディレクトリ
        ];
        
        console.log('🔍 [TempNoteHandler] パス候補:', possiblePaths);
        
        // 最初に存在するディレクトリを使用、なければ最初のパスでディレクトリを作成
        let selectedPath = null;
        for (const testPath of possiblePaths) {
          console.log('🔍 [TempNoteHandler] パス確認:', testPath);
          if (fs.existsSync(testPath)) {
            console.log('✅ [TempNoteHandler] 既存ディレクトリが見つかりました:', testPath);
            selectedPath = testPath;
            break;
          } else {
            console.log('❌ [TempNoteHandler] ディレクトリが存在しません:', testPath);
          }
        }
        
        dataDir = selectedPath || possiblePaths[0]; // 見つからない場合は最初のパスを使用
        console.log('🔍 [TempNoteHandler] 選択されたパス:', dataDir);
      }

      console.log('🔍 [TempNoteHandler] データディレクトリ:', dataDir);
      console.log('🔍 [TempNoteHandler] 開発環境:', isDev);

      // データディレクトリが存在しない場合は作成
      if (!fs.existsSync(dataDir)) {
        console.log('📁 [TempNoteHandler] データディレクトリを作成中...');
        console.log('🔍 [TempNoteHandler] 作成対象パス:', dataDir);
        
        // 親ディレクトリを段階的に作成
        const parentDir = path.dirname(dataDir);
        console.log('🔍 [TempNoteHandler] 親ディレクトリ:', parentDir);
        
        try {
          // 親ディレクトリが存在しない場合は作成
          if (!fs.existsSync(parentDir)) {
            console.log('📁 [TempNoteHandler] 親ディレクトリを作成中...');
            fs.mkdirSync(parentDir, { recursive: true });
            console.log('✅ [TempNoteHandler] 親ディレクトリ作成完了');
          }
          
          // データディレクトリを作成
          fs.mkdirSync(dataDir, { recursive: true });
          console.log('✅ [TempNoteHandler] データディレクトリ作成完了');
        } catch (mkdirErr) {
          console.error('❌ [TempNoteHandler] ディレクトリ作成エラー:', mkdirErr);
          console.error('❌ [TempNoteHandler] エラー詳細:', mkdirErr.message);
          console.error('❌ [TempNoteHandler] エラーコード:', mkdirErr.code);
          
          // フォールバック: 一時ディレクトリを使用
          console.log('🔄 [TempNoteHandler] フォールバック: 一時ディレクトリを使用');
          dataDir = path.join(require('os').tmpdir(), 'hug-client', 'data');
          console.log('🔍 [TempNoteHandler] フォールバックパス:', dataDir);
          
          try {
            fs.mkdirSync(dataDir, { recursive: true });
            console.log('✅ [TempNoteHandler] フォールバックディレクトリ作成完了');
          } catch (fallbackErr) {
            console.error('❌ [TempNoteHandler] フォールバックディレクトリ作成エラー:', fallbackErr);
            throw new Error('データディレクトリの作成に失敗しました: ' + fallbackErr.message);
          }
        }
      } else {
        console.log('✅ [TempNoteHandler] データディレクトリは既に存在します');
      }
      
      // ディレクトリの存在確認
      if (!fs.existsSync(dataDir)) {
        throw new Error(`データディレクトリが作成されませんでした: ${dataDir}`);
      }
      
      // ディレクトリの書き込み権限確認
      try {
        fs.accessSync(dataDir, fs.constants.W_OK);
        console.log('✅ [TempNoteHandler] ディレクトリの書き込み権限確認完了');
      } catch (accessErr) {
        console.error('❌ [TempNoteHandler] ディレクトリの書き込み権限エラー:', accessErr);
        throw new Error(`データディレクトリに書き込み権限がありません: ${dataDir}`);
      }

      this.dbPath = path.join(dataDir, 'houday.db');
      console.log('🔍 [TempNoteHandler] データベースパス:', this.dbPath);
      
      // データベース接続
      console.log('🔗 [TempNoteHandler] データベース接続中...');
      console.log('🔍 [TempNoteHandler] 接続先パス:', this.dbPath);
      console.log('🔍 [TempNoteHandler] パス存在確認:', fs.existsSync(this.dbPath));
      
      // データベースファイルが存在しない場合は明示的に作成
      if (!fs.existsSync(this.dbPath)) {
        console.log('📄 [TempNoteHandler] データベースファイルが存在しないため作成します');
        console.log('🔍 [TempNoteHandler] 作成対象ファイル:', this.dbPath);
        try {
          // 空のファイルを作成
          fs.writeFileSync(this.dbPath, '');
          console.log('✅ [TempNoteHandler] データベースファイル作成完了');
          
          // ファイルの存在確認
          if (fs.existsSync(this.dbPath)) {
            console.log('✅ [TempNoteHandler] データベースファイル存在確認完了');
          } else {
            throw new Error('データベースファイルの作成に失敗しました');
          }
        } catch (createErr) {
          console.error('❌ [TempNoteHandler] データベースファイル作成エラー:', createErr);
          console.error('❌ [TempNoteHandler] エラー詳細:', createErr.message);
          console.error('❌ [TempNoteHandler] エラーコード:', createErr.code);
          throw createErr;
        }
      } else {
        console.log('✅ [TempNoteHandler] データベースファイルは既に存在します');
      }
      
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('❌ [TempNoteHandler] SQLite接続エラー:', err);
          console.error('❌ [TempNoteHandler] エラー詳細:', err.message);
          console.error('❌ [TempNoteHandler] エラーコード:', err.code);
          throw err;
        }
        console.log('✅ [TempNoteHandler] SQLiteデータベース接続成功:', this.dbPath);
        console.log('🔍 [TempNoteHandler] データベースオブジェクト:', this.db ? '作成済み' : '未作成');
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
      // テーブルが存在するかチェック（大文字小文字を区別しない）
      const checkTableSQL = `
        SELECT name FROM sqlite_master 
        WHERE type='table' AND LOWER(name)=LOWER(?)
      `;
      
      this.db.get(checkTableSQL, ['temp_notes'], (err, row) => {
        if (err) {
          console.error('❌ [TempNoteHandler] テーブル存在確認エラー:', err);
          reject(err);
          return;
        }
        
        if (row) {
          console.log('✅ [TempNoteHandler] temp_notesテーブルは既に存在します');
          resolve();
        } else {
          console.log('📋 [TempNoteHandler] temp_notesテーブルを作成中...');
          
          // 新しいテーブルを作成
          const createTableSQL = `
            CREATE TABLE temp_notes (
              children_id TEXT NOT NULL,
              staff_id TEXT NOT NULL,
              date_str TEXT NOT NULL,
              week_day TEXT NOT NULL,
              enter_time TEXT,
              exit_time TEXT,
              memo TEXT,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              PRIMARY KEY (children_id, week_day)
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
        }
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
          (children_id, staff_id, date_str, week_day, enter_time, exit_time, memo, updated_at)
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
          WHERE children_id = ? AND week_day = ?
        `;

        this.db.get(selectSQL, [childId, weekDay], (err, row) => {
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

  // データベース接続状態を確認
  isDatabaseConnected() {
    const isConnected = this.db !== null;
    console.log('🔍 [TempNoteHandler] データベース接続状態:', isConnected ? '接続済み' : '未接続');
    console.log('🔍 [TempNoteHandler] this.db:', this.db);
    console.log('🔍 [TempNoteHandler] this.dbPath:', this.dbPath);
    return isConnected;
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