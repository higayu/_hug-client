import { useCallback } from "react";
import { getActiveAiPrompts } from "./get";

export {
  getActiveAiPrompts,
  normalizeActiveAiPrompts,
} from "./get";

export function usePrompt() {
  const loadActivePrompts = useCallback(
    (params) => getActiveAiPrompts(params),
    [],
  );

  return { getActiveAiPrompts: loadActivePrompts };
}
