var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};

// preload/tables.js
var require_tables = __commonJS({
  "preload/tables.js"(exports2, module2) {
    var sqliteTables = [
      "children",
      "children_type",
      "day_of_week",
      "facility_children",
      "facility_staff",
      "facilitys",
      "individual_support",
      "managers2",
      "pc",
      "pc_to_children",
      "pronunciation",
      "staffs",
      "temp_notes",
      "ai_temp_notes",
      "service_record",
      // MariaDB 追加分を SQLite フォールバックでも使う場合
      "record_types",
      "child_records",
      "m_service_items",
      "staff_facility_roles",
      "text_data",
      "toolbox",
      "memo"
    ];
    var mariadbTables = [
      "children",
      "children_type",
      "day_of_week",
      "facility_children",
      "facility_staff",
      "facilitys",
      "individual_support",
      "managers2",
      "pc",
      "pc_to_children",
      "pronunciation",
      "staffs",
      "service_record",
      "temp_notes",
      // MariaDB 追加分
      "record_types",
      "child_records",
      "m_service_items",
      "staff_facility_roles",
      "text_data",
      "toolbox",
      "memo"
    ];
    module2.exports = {
      sqliteTables,
      mariadbTables
    };
  }
});

// preload/tableApis.js
var require_tableApis = __commonJS({
  "preload/tableApis.js"(exports2, module2) {
    var { sqliteTables, mariadbTables } = require_tables();
    function createTableApis(ipcRenderer2) {
      const tableAPIs = {};
      for (const table of sqliteTables) {
        tableAPIs[`sqlite_${table}_getAll`] = () => ipcRenderer2.invoke(`sqlite:${table}:getAll`);
        tableAPIs[`sqlite_${table}_getById`] = (id) => ipcRenderer2.invoke(`sqlite:${table}:getById`, id);
        tableAPIs[`sqlite_${table}_insert`] = (data) => ipcRenderer2.invoke(`sqlite:${table}:insert`, data);
        tableAPIs[`sqlite_${table}_update`] = (dataOrId, maybeData) => ipcRenderer2.invoke(`sqlite:${table}:update`, dataOrId, maybeData);
        tableAPIs[`sqlite_${table}_delete`] = (...args) => ipcRenderer2.invoke(`sqlite:${table}:delete`, ...args);
        tableAPIs[`sqlite_${table}_upsert`] = (data) => ipcRenderer2.invoke(`sqlite:${table}:upsert`, data);
      }
      for (const table of mariadbTables) {
        tableAPIs[`mariadb_${table}_getAll`] = () => ipcRenderer2.invoke(`mariadb:${table}:getAll`);
        tableAPIs[`mariadb_${table}_getById`] = (id, pk = "id") => ipcRenderer2.invoke(`mariadb:${table}:getByPk`, {
          pk,
          values: id
        });
        tableAPIs[`mariadb_${table}_getByPk`] = ({ pk, values }) => ipcRenderer2.invoke(`mariadb:${table}:getByPk`, {
          pk,
          values
        });
        tableAPIs[`mariadb_${table}_insert`] = (data) => ipcRenderer2.invoke(`mariadb:${table}:insert`, data);
        tableAPIs[`mariadb_${table}_update`] = ({ pk, values, data }) => ipcRenderer2.invoke(`mariadb:${table}:update`, {
          pk,
          values,
          data
        });
        tableAPIs[`mariadb_${table}_delete`] = ({ pk, values }) => ipcRenderer2.invoke(`mariadb:${table}:delete`, {
          pk,
          values
        });
        tableAPIs[`mariadb_${table}_upsert`] = (data) => ipcRenderer2.invoke(`mariadb:${table}:upsert`, data);
      }
      return tableAPIs;
    }
    module2.exports = {
      createTableApis
    };
  }
});

// preload/electronApi.js
var require_electronApi = __commonJS({
  "preload/electronApi.js"(exports2, module2) {
    var { createTableApis } = require_tableApis();
    function normalizeDatabaseType(value) {
      if (typeof value === "string") {
        return value;
      }
      if (value && typeof value === "object") {
        return value.type || value.databaseType || value.dbType || "sqlite";
      }
      return "sqlite";
    }
    async function getDbPrefix(ipcRenderer2) {
      const result = await ipcRenderer2.invoke("get-database-type");
      const dbType = normalizeDatabaseType(result);
      return dbType === "mariadb" ? "mariadb" : "sqlite";
    }
    function createElectronApi2(ipcRenderer2, isDebugMode2) {
      return {
        // ---- デバッグ ----
        isDebugMode: () => isDebugMode2,
        // ---- DB 種別 ----
        getDatabaseType: () => ipcRenderer2.invoke("get-database-type"),
        // ---- テーブル一括取得 ----
        fetchTableAll: () => ipcRenderer2.invoke("fetchTableAll"),
        // ---- AI プロンプト ----
        loadPrompts: () => ipcRenderer2.invoke("load-prompts"),
        getAiPrompt: (promptKey) => ipcRenderer2.invoke("get-ai-prompt", promptKey),
        buildAiPrompt: (promptKey, userText) => ipcRenderer2.invoke("build-ai-prompt", promptKey, userText),
        // ============================================================
        // 一時メモ
        //
        // 以前:
        //   sqlite:saveTempNote 固定
        //
        // 修正後:
        //   DB種別が mariadb なら mariadb:saveTempNote
        //   それ以外なら sqlite:saveTempNote
        // ============================================================
        saveTempNote: async (data) => {
          const prefix = await getDbPrefix(ipcRenderer2);
          return ipcRenderer2.invoke(`${prefix}:saveTempNote`, data);
        },
        saveTempNote1: async (data) => {
          const prefix = await getDbPrefix(ipcRenderer2);
          return ipcRenderer2.invoke(`${prefix}:saveTempNote1`, data);
        },
        saveTempNote2: async (data) => {
          const prefix = await getDbPrefix(ipcRenderer2);
          return ipcRenderer2.invoke(`${prefix}:saveTempNote2`, data);
        },
        getTempNote: async ({ children_id, staff_id, day_of_week_id }) => {
          const prefix = await getDbPrefix(ipcRenderer2);
          return ipcRenderer2.invoke(`${prefix}:getTempNote`, {
            children_id,
            staff_id,
            day_of_week_id
          });
        },
        // ---- 一時メモ: 明示的に SQLite を呼びたい場合 ----
        sqlite_saveTempNote: (data) => ipcRenderer2.invoke("sqlite:saveTempNote", data),
        sqlite_saveTempNote1: (data) => ipcRenderer2.invoke("sqlite:saveTempNote1", data),
        sqlite_saveTempNote2: (data) => ipcRenderer2.invoke("sqlite:saveTempNote2", data),
        sqlite_getTempNote: ({ children_id, staff_id, day_of_week_id }) => ipcRenderer2.invoke("sqlite:getTempNote", {
          children_id,
          staff_id,
          day_of_week_id
        }),
        // ---- 一時メモ: 明示的に MariaDB を呼びたい場合 ----
        mariadb_saveTempNote: (data) => ipcRenderer2.invoke("mariadb:saveTempNote", data),
        mariadb_saveTempNote1: (data) => ipcRenderer2.invoke("mariadb:saveTempNote1", data),
        mariadb_saveTempNote2: (data) => ipcRenderer2.invoke("mariadb:saveTempNote2", data),
        mariadb_getTempNote: ({ children_id, staff_id, day_of_week_id }) => ipcRenderer2.invoke("mariadb:getTempNote", {
          children_id,
          staff_id,
          day_of_week_id
        }),
        // ============================================================
        // AI 一時メモ
        //
        // ai_temp_notes は SQLite 専用のまま
        // ============================================================
        saveAiTempNote: (childId, note) => ipcRenderer2.invoke("sqlite:saveAiTempNote", { childId, note }),
        getAiTempNote: (childId) => ipcRenderer2.invoke("sqlite:getAiTempNote", { childId }),
        // ---- UI / Window ----
        clearWebviewCache: (wcId) => ipcRenderer2.invoke("clear-webview-cache", wcId),
        openIndividualSupportPlan: (childId) => ipcRenderer2.send("open-individual-support-plan", childId),
        openSpecializedSupportPlan: (childId) => ipcRenderer2.send("open-specialized-support-plan", childId),
        Open_NowDayPage: (args) => ipcRenderer2.send("Open_NowDayPage", args),
        openWebManagerPage: (args) => ipcRenderer2.send("open-web-manager-page", args),
        open_addition_compare_btn: (facility_id, date_str) => ipcRenderer2.send("open-addition-compare-btn", {
          facility_id,
          date_str
        }),
        handleProfessionalSupportSearch: (facility_id, targetFacility, date_str) => ipcRenderer2.send("handle-professional-support-search", {
          facility_id,
          targetFacility,
          date_str
        }),
        // ---- 設定 ----
        readConfig: () => ipcRenderer2.invoke("read-config"),
        saveConfig: (data) => ipcRenderer2.invoke("save-config", data),
        readIni: () => ipcRenderer2.invoke("read-ini"),
        saveIni: (data) => ipcRenderer2.invoke("save-ini", data),
        updateIniSetting: (path, value) => ipcRenderer2.invoke("update-ini-setting", path, value),
        importConfigFile: () => ipcRenderer2.invoke("import-config-file"),
        openConfigFolder: () => ipcRenderer2.invoke("open-config-folder"),
        // ---- Update ----
        getUpdateDebugInfo: () => ipcRenderer2.invoke("get-update-debug-info"),
        checkForUpdates: () => ipcRenderer2.invoke("check-for-updates"),
        // ---- カスタムボタン ----
        readCustomButtons: () => ipcRenderer2.invoke("read-custom-buttons"),
        saveCustomButtons: (data) => ipcRenderer2.invoke("save-custom-buttons", data),
        readAvailableActions: () => ipcRenderer2.invoke("read-available-actions"),
        // ---- Close ----
        onConfirmCloseRequest: (callback) => {
          const listener = () => callback();
          ipcRenderer2.on("confirm-close-request", listener);
          return () => {
            ipcRenderer2.removeListener("confirm-close-request", listener);
          };
        },
        sendConfirmCloseResponse: (shouldClose) => ipcRenderer2.send("confirm-close-response", shouldClose),
        // ---- webview ----
        getPreloadPath: () => ipcRenderer2.invoke("get-preload-path"),
        // ---- Clipboard ----
        copyText: (text) => ipcRenderer2.invoke("clipboard:writeText", text),
        // ---- Attendance ----
        saveAttendanceColumnData: (data) => ipcRenderer2.invoke("saveAttendanceColumnData", data),
        // ---- MariaDB service_record ----
        mariadb_service_record_insert: (data) => ipcRenderer2.invoke("mariadb:service_record:insert", data),
        mariadb_service_record_upsert: (data) => ipcRenderer2.invoke("mariadb:service_record:upsert", data),
        // ---- HUG staffs ----
        syncHugStaffs: (data) => ipcRenderer2.invoke("mariadb:hug_staffs:sync", data),
        // ---- CRUD API 展開 ----
        ...createTableApis(ipcRenderer2)
      };
    }
    module2.exports = {
      createElectronApi: createElectronApi2
    };
  }
});

// preload/devApi.js
var require_devApi = __commonJS({
  "preload/devApi.js"(exports2, module2) {
    function createDevApi2(ipcRenderer2) {
      return {
        openDevTools: () => ipcRenderer2.invoke("open-devtools")
      };
    }
    module2.exports = {
      createDevApi: createDevApi2
    };
  }
});

// preload/whisperApi.js
var require_whisperApi = __commonJS({
  "preload/whisperApi.js"(exports2, module2) {
    function createWhisperApi2(ipcRenderer2) {
      return {
        transcribe: async (audioArrayBuffer, options = {}) => {
          return await ipcRenderer2.invoke(
            "whisper:transcribe",
            audioArrayBuffer,
            options
          );
        }
      };
    }
    module2.exports = {
      createWhisperApi: createWhisperApi2
    };
  }
});

// preload.js
var { contextBridge, ipcRenderer } = require("electron");
console.log("[preload.bundle.cjs] start");
var { createElectronApi } = require_electronApi();
var { createDevApi } = require_devApi();
var { createWhisperApi } = require_whisperApi();
var isDebugMode = process.argv.includes("--dev") || process.argv.includes("--debug");
contextBridge.exposeInMainWorld(
  "electronAPI",
  createElectronApi(ipcRenderer, isDebugMode)
);
contextBridge.exposeInMainWorld(
  "api",
  createDevApi(ipcRenderer)
);
contextBridge.exposeInMainWorld(
  "whisperAPI",
  createWhisperApi(ipcRenderer)
);
