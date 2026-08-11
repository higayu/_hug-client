// main/parts/handlers/laravelAuthHandler/procedures/index.js

const call =
  require("./call");

const registerFacilityChildren =
  require("./registerFacilityChildren");

const registerManagerAssignment =
  require("./register_manager_assignment");

const syncHugStaffs =
  require("./syncHugStaffs");

const upsertServiceRecord =
  require("./upsertServiceRecord");

const upsertManagers2 =
  require("./upsertManagers2");

const upsertTempNotes =
  require("./upsert_temp_notes");

module.exports = {
  // ============================================================
  // 汎用プロシージャ実行
  // ============================================================

  callHandler:
    call.handler,

  // ============================================================
  // 児童・施設・スタッフ関連
  // ============================================================

  registerFacilityChildrenHandler:
    registerFacilityChildren.handler,

  registerManagerAssignmentHandler:
    registerManagerAssignment.handler,

  syncHugStaffsHandler:
    syncHugStaffs.handler,

  // ============================================================
  // サービス記録
  // ============================================================

  upsertServiceRecordHandler:
    upsertServiceRecord.handler,

  // ============================================================
  // 担当児童
  // ============================================================

  upsertManagers2Handler:
    upsertManagers2.handler,

  // ============================================================
  // 一時メモ
  // ============================================================

  /**
   * modeをpayloadから受け取る共通ハンドラー。
   *
   * mode:
   * - all
   * - memo1
   * - memo2
   */
  upsertTempNotesHandler:
    upsertTempNotes.handler,

  /**
   * memo1・memo2を両方保存する。
   */
  upsertTempNotesAllHandler:
    upsertTempNotes.saveAllHandler,

  /**
   * memo1だけ保存する。
   */
  upsertTempNotesMemo1Handler:
    upsertTempNotes.saveMemo1Handler,

  /**
   * memo2だけ保存する。
   */
  upsertTempNotesMemo2Handler:
    upsertTempNotes.saveMemo2Handler,
};