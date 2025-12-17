// src/utils/attendance/index.js

export { clickEnterButton } from "./enter.js";
export { clickExitButton } from "./exit.js";
export { clickAbsenceButton } from "./absence.js";

// 必要なら extractor も外に出す
export {
  extractEnterButtonOnclick,
  extractExitButtonOnclick,
  extractAbsenceButtonId,
  parseAbsenceId,
  assertAbsenceChildId,
} from "./_shared/extractors.js";
