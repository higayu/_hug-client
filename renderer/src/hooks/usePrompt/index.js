import { useCallback } from "react";
import { getActiveAiPrompts } from "./get";
import { upsertAiPrompt } from "./upsert";

export { getActiveAiPrompts, normalizeActiveAiPrompts,} from "./get";
export { upsertAiPrompt } from "./upsert";

export function usePrompt() {
  const loadActivePrompts = useCallback(
    (params) => getActiveAiPrompts(params),
    [],
  );
  const savePrompt = useCallback((params) => upsertAiPrompt(params), []);

  return {
    getActiveAiPrompts: loadActivePrompts,
    upsertAiPrompt: savePrompt,
  };
}
