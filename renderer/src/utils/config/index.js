// renderer/src/utils/config/index.js

/**
 * config utilities barrel file
 *
 * このファイルは configUtils / iniUtils をまとめて export するだけにする。
 *
 * 重要:
 * - React Hook は使わない
 * - useDataBase は import しない
 * - loadDataBase はここでは実行しない
 * - 設定ファイル操作の入口だけにする
 */

// =============================================================
// named export
// =============================================================
export * from "./configUtils";
export * from "./iniUtils";

// =============================================================
// namespace export
// =============================================================
export * as configUtils from "./configUtils";
export * as iniUtils from "./iniUtils";