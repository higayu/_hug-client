// renderer\src\components\common\hug_function\ProfessionalSupportCheckPanel2\useProfessionalSupportCheck2\usePatchChildUseSpeDate.js

import { useCallback } from "react";
import { useAppState } from "@/AppStateContext";

/**
 * AppState 上の childrenData / waiting_childrenData / Experience_childrenData の
 * useSpeDate を安全に更新する専用 hook。
 *
 * 注意:
 * - useDataBase のローカル state / ref は使わない
 * - AppState の現在値を元に patch する
 * - childrenList が空配列で上書きされる事故を防ぐ
 */
export function usePatchChildUseSpeDate() {
  const {
    childrenData,
    waiting_childrenData,
    Experience_childrenData,

    setChildrenData,
    setWaitingChildrenData,
    setExperienceChildrenData,
    updateAppState,
  } = useAppState();

  const patchChildUseSpeDate = useCallback(
    (childId, useSpeDate) => {
      if (!childId) {
        console.warn("[usePatchChildUseSpeDate] childId が空です");
        return;
      }

      const targetId = String(childId);

      const patchList = (list) => {
        if (!Array.isArray(list)) {
          return [];
        }

        return list.map((child) => {
          if (String(child?.children_id) !== targetId) {
            return child;
          }

          return {
            ...child,
            useSpeDate,
          };
        });
      };

      const nextChildrenData = patchList(childrenData);
      const nextWaitingChildrenData = patchList(waiting_childrenData);
      const nextExperienceChildrenData = patchList(Experience_childrenData);

      console.log("[usePatchChildUseSpeDate] useSpeDate patch", {
        childId: targetId,
        useSpeDate,
        before: {
          childrenDataLength: Array.isArray(childrenData)
            ? childrenData.length
            : null,
          waitingChildrenDataLength: Array.isArray(waiting_childrenData)
            ? waiting_childrenData.length
            : null,
          experienceChildrenDataLength: Array.isArray(Experience_childrenData)
            ? Experience_childrenData.length
            : null,
        },
        after: {
          childrenDataLength: nextChildrenData.length,
          waitingChildrenDataLength: nextWaitingChildrenData.length,
          experienceChildrenDataLength: nextExperienceChildrenData.length,
        },
      });

      setChildrenData(nextChildrenData);
      setWaitingChildrenData(nextWaitingChildrenData);
      setExperienceChildrenData(nextExperienceChildrenData);

      updateAppState({
        childrenData: nextChildrenData,
        waiting_childrenData: nextWaitingChildrenData,
        Experience_childrenData: nextExperienceChildrenData,
      });
    },
    [
      childrenData,
      waiting_childrenData,
      Experience_childrenData,
      setChildrenData,
      setWaitingChildrenData,
      setExperienceChildrenData,
      updateAppState,
    ]
  );

  return {
    patchChildUseSpeDate,
  };
}