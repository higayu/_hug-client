// renderer/modules/config/customButtons.js
import { showSuccessToast, showErrorToast } from '../ui/toast/toast.js';

// カスタムボタンの状態管理
export const CustomButtonsState = {
  customButtons: [],
  availableActions: []
};

// カスタムボタンの読み込み
export async function loadCustomButtons() {
  try {
    console.log("🔄 [CUSTOM_BUTTONS] カスタムボタンを読み込み中...");
    const result = await window.electronAPI.readCustomButtons();
    
    if (!result.success) {
      console.error("❌ [CUSTOM_BUTTONS] カスタムボタン読み込みエラー:", result.error);
      return false;
    }

    CustomButtonsState.customButtons = result.data.customButtons || [];
    console.log("✅ [CUSTOM_BUTTONS] カスタムボタン読み込み成功:", CustomButtonsState.customButtons);
    return true;
  } catch (err) {
    console.error("❌ [CUSTOM_BUTTONS] カスタムボタン読み込みエラー:", err);
    return false;
  }
}

// 利用可能なアクションの読み込み
export async function loadAvailableActions() {
  try {
    console.log("🔄 [CUSTOM_BUTTONS] 利用可能なアクションを読み込み中...");
    const result = await window.electronAPI.readAvailableActions();
    
    if (!result.success) {
      console.error("❌ [CUSTOM_BUTTONS] 利用可能なアクション読み込みエラー:", result.error);
      return false;
    }

    CustomButtonsState.availableActions = result.data.availableActions || [];
    console.log("✅ [CUSTOM_BUTTONS] 利用可能なアクション読み込み成功:", CustomButtonsState.availableActions);
    return true;
  } catch (err) {
    console.error("❌ [CUSTOM_BUTTONS] 利用可能なアクション読み込みエラー:", err);
    return false;
  }
}

// カスタムボタンの保存
export async function saveCustomButtons() {
  try {
    console.log("🔄 [CUSTOM_BUTTONS] カスタムボタンを保存中...");
    console.log("🔍 [CUSTOM_BUTTONS] 保存するカスタムボタン:", CustomButtonsState.customButtons);
    console.log("🔍 [CUSTOM_BUTTONS] カスタムボタン数:", CustomButtonsState.customButtons.length);
    
    const data = {
      version: "1.0.0",
      customButtons: CustomButtonsState.customButtons
    };
    
    console.log("🔍 [CUSTOM_BUTTONS] 保存データ:", JSON.stringify(data, null, 2));
    
    const result = await window.electronAPI.saveCustomButtons(data);
    
    if (!result.success) {
      console.error("❌ [CUSTOM_BUTTONS] カスタムボタン保存エラー:", result.error);
      showErrorToast("カスタムボタンの保存に失敗しました");
      return false;
    }

    console.log("✅ [CUSTOM_BUTTONS] カスタムボタン保存成功");
    console.log("🔍 [CUSTOM_BUTTONS] 保存後のCustomButtonsState:", CustomButtonsState.customButtons);
    return true;
  } catch (err) {
    console.error("❌ [CUSTOM_BUTTONS] カスタムボタン保存エラー:", err);
    showErrorToast("カスタムボタンの保存に失敗しました");
    return false;
  }
}

// カスタムボタンの取得
export function getCustomButtons() {
  return CustomButtonsState.customButtons.filter(btn => btn.enabled);
}

// 利用可能なアクションの取得
export function getAvailableActions() {
  return CustomButtonsState.availableActions;
}

// カテゴリ別にアクションをグループ化
export function getActionsByCategory() {
  const actions = getAvailableActions();
  const grouped = {};
  
  actions.forEach(action => {
    if (!grouped[action.category]) {
      grouped[action.category] = [];
    }
    grouped[action.category].push(action);
  });
  
  return grouped;
}

// カスタムボタンの追加
export function addCustomButton(actionId, text, color) {
  const action = CustomButtonsState.availableActions.find(a => a.id === actionId);
  if (!action) {
    console.error("❌ [CUSTOM_BUTTONS] アクションが見つかりません:", actionId);
    return false;
  }

  const newButton = {
    id: `custom${Date.now()}`,
    enabled: true,
    text: text || action.name,
    color: color || "#007bff",
    action: actionId,
    order: Math.max(...CustomButtonsState.customButtons.map(b => b.order || 0), 0) + 1
  };

  CustomButtonsState.customButtons.push(newButton);
  console.log("✅ [CUSTOM_BUTTONS] カスタムボタンを追加:", newButton);
  return true;
}

// カスタムボタンの更新（インデックスベース）
export function updateCustomButton(index, updates) {
  if (index >= 0 && index < CustomButtonsState.customButtons.length) {
    const button = CustomButtonsState.customButtons[index];
    Object.assign(button, updates);
    
    // orderプロパティが更新された場合、重複を避けるために調整
    if (updates.hasOwnProperty('order')) {
      const newOrder = updates.order;
      if (newOrder && newOrder > 0) {
        // 同じorder値を持つ他のボタンがある場合は、それらを調整
        CustomButtonsState.customButtons.forEach((otherButton, otherIndex) => {
          if (otherIndex !== index && otherButton.order === newOrder) {
            otherButton.order = otherIndex + 1;
          }
        });
      }
    }
    
    console.log("✅ [CUSTOM_BUTTONS] カスタムボタンを更新:", button);
    return true;
  }
  return false;
}

// カスタムボタンの更新（IDベース）
export function updateCustomButtonById(id, updates) {
  const index = CustomButtonsState.customButtons.findIndex(btn => btn.id === id);
  if (index >= 0) {
    return updateCustomButton(index, updates);
  }
  console.error("❌ [CUSTOM_BUTTONS] カスタムボタンが見つかりません:", id);
  return false;
}

// カスタムボタンの削除（インデックスベース）
export function removeCustomButton(index) {
  if (index >= 0 && index < CustomButtonsState.customButtons.length) {
    const removed = CustomButtonsState.customButtons.splice(index, 1)[0];
    
    // 残りのボタンのorderプロパティを再調整
    CustomButtonsState.customButtons.forEach((button, newIndex) => {
      if (button.order === undefined || button.order > removed.order) {
        button.order = newIndex + 1;
      }
    });
    
    console.log("✅ [CUSTOM_BUTTONS] カスタムボタンを削除:", removed);
    return true;
  }
  return false;
}

// カスタムボタンの削除（IDベース）
export function removeCustomButtonById(id) {
  const index = CustomButtonsState.customButtons.findIndex(btn => btn.id === id);
  if (index >= 0) {
    return removeCustomButton(index);
  }
  console.error("❌ [CUSTOM_BUTTONS] カスタムボタンが見つかりません:", id);
  return false;
}

// カスタムボタンの並び替え
export function reorderCustomButtons(fromIndex, toIndex) {
  if (fromIndex >= 0 && fromIndex < CustomButtonsState.customButtons.length &&
      toIndex >= 0 && toIndex < CustomButtonsState.customButtons.length) {
    const [moved] = CustomButtonsState.customButtons.splice(fromIndex, 1);
    CustomButtonsState.customButtons.splice(toIndex, 0, moved);
    
    // orderプロパティを更新（既存のorderプロパティを保持しつつ、新しい順序に合わせて調整）
    CustomButtonsState.customButtons.forEach((button, index) => {
      if (button.order === undefined) {
        button.order = index + 1;
      }
    });
    
    // orderプロパティでソートしてから、連続した数値に再設定
    CustomButtonsState.customButtons.sort((a, b) => (a.order || 0) - (b.order || 0));
    CustomButtonsState.customButtons.forEach((button, index) => {
      button.order = index + 1;
    });
    
    console.log("✅ [CUSTOM_BUTTONS] カスタムボタンを並び替え");
    return true;
  }
  return false;
}

// カスタムボタンのorderプロパティを初期化
export function initializeButtonOrders() {
  CustomButtonsState.customButtons.forEach((button, index) => {
    if (button.order === undefined) {
      button.order = index + 1;
    }
  });
  console.log("✅ [CUSTOM_BUTTONS] ボタンのorderプロパティを初期化");
}
