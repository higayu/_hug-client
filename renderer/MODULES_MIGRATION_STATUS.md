# Modules移行状況

## ✅ 削除完了
- `modules/config/const.js` - ✅ 削除完了（React側の`src/utils/constants.js`に移行済み）
- `modules/ui/settingsEditor.js` - ✅ 削除完了（React側の`SettingsModal.jsx`に統合済み）
- `modules/data/attendanceTable.js` - ✅ 削除完了（React側の`src/utils/attendanceTable.js`に移行済み）
- `modules/data/webviewState.js` - ✅ 削除完了（React側の`src/utils/webviewState.js`に移行済み）
- `modules/ui/toast/README.md` - ✅ 削除完了（ドキュメントのみ）
- `modules/ui/toast/toast.js` - ✅ 削除完了（React側のToastContextに統合済み、window経由でアクセス可能）
- `modules/data/staff_facility.js` - ✅ 削除完了（React側の`useSettingsModalLogic.js`に統合済み）
- `modules/ui/buttonVisibility.js` - ✅ 削除完了（機能が空のため不要）
- `modules/actions/reloadSettings.js` - ✅ 削除完了（React側の`src/utils/reloadSettings.js`に移行済み）
- `modules/config/ini.js` - ✅ 削除完了（React側の`src/contexts/IniStateContext.jsx`に移行済み）
- `modules/config/customButtons.js` - ✅ 削除完了（React側の`src/contexts/CustomButtonsContext.jsx`に移行済み）
- `modules/config/config.js` - ✅ 削除完了（React側の`src/contexts/AppStateContext.jsx`に移行済み、window.AppState経由でアクセス可能）
- `modules/data/childrenList.js` - ✅ 削除完了（React側の`src/hooks/useChildrenList.js`と`src/components/SidebarContent.jsx`に移行済み）
- `modules/ui/tabs.js` - ✅ 削除完了（React側の`src/hooks/useTabs.js`と`src/components/Tabs.jsx`に移行済み）
- `modules/update/updateManager.js` - ✅ 削除完了（React側の`src/utils/updateManager.js`に移行済み）
- `modules/update/updateUI.js` - ✅ 削除完了（React側の`src/hooks/useUpdateUI.js`に移行済み）
- `modules/update/updateTabHandler.js` - ✅ 削除完了（React側の`src/components/settings/tabs/UpdateTab.jsx`に移行済み）
- `modules/actions/hugActions.js` - ✅ 削除完了（React側の`src/utils/buttonVisibility.js`に移行済み）
- `modules/actions/customButtons.js` - ✅ 削除完了（React側の`src/components/CustomButtonsPanel.jsx`と`src/hooks/useCustomButtonManager.js`に移行済み）

## 🔄 統合・簡略化済み
- （なし）

## ✅ 移行完了（React側に移行済み）
- `src/utils/attendanceTable.js` - 出勤データテーブル取得機能
- `src/utils/webviewState.js` - WebView状態管理
- `src/hooks/useTabs.js` - タブ管理（すべてのタブ機能を含む）
- `src/utils/updateManager.js` - アップデート管理（updateManager.jsから移行）
- `src/utils/reloadSettings.js` - 設定ファイルの再読み込み（config.jsonとini.json）
- `src/utils/buttonVisibility.js` - ボタンの表示/非表示制御（hugActions.jsから移行）
- `src/components/CustomButtonsPanel.jsx` - カスタムボタンの表示とクリック処理（customButtons.js (actions)から移行）
- `src/components/SidebarContent.jsx` - 子どもリストの表示と操作（childrenList.jsから移行）
- `src/components/Tabs.jsx` - タブコンポーネント（tabs.jsから移行）
- `src/components/settings/tabs/UpdateTab.jsx` - アップデートタブコンポーネント（updateTabHandler.jsから移行）
- `src/hooks/useChildrenList.js` - 子どもリスト管理のフック（childrenList.jsから移行）
- `src/hooks/useUpdateUI.js` - アップデートUI管理のフック（updateUI.jsから移行）
- `src/hooks/useTabs.js` - タブ管理のフック（tabs.jsから移行）
- `src/hooks/useCustomButtonManager.js` - カスタムボタンマネージャーのフック（customButtons.js (actions)から移行）
- `src/hooks/useHugActions.js` - 各種ボタンのイベントハンドラー（initHugActionsから移行）
- `src/contexts/AppStateContext.jsx` - アプリケーション状態管理（config.jsから移行、window.AppState経由でアクセス可能）
- `src/contexts/IniStateContext.jsx` - ini.jsonの状態管理（ini.jsから移行）
- `src/contexts/CustomButtonsContext.jsx` - カスタムボタンの状態管理（customButtons.js (config)から移行）

## 📋 まだ使用中のmodules

### config/
- （削除済み）

### actions/
- （削除済み）

### data/
- （削除済み）

### ui/
- （削除済み）

### update/
- （削除済み）

## 📝 削除計画

1. ✅ `modules/config/const.js` - 削除完了
2. ✅ `modules/ui/settingsEditor.js` - 削除完了
3. ✅ `modules/data/attendanceTable.js` - 削除完了
4. ✅ `modules/data/webviewState.js` - 削除完了
5. ✅ `modules/ui/toast/toast.js` - 削除完了
6. ✅ `modules/ui/toast/README.md` - 削除完了
7. ✅ `modules/data/staff_facility.js` - 削除完了
8. ✅ `modules/ui/buttonVisibility.js` - 削除完了（機能が空のため）
9. ✅ `modules/actions/reloadSettings.js` - 削除完了（React側に移行済み）
10. ✅ `modules/config/ini.js` - 削除完了（React側に移行済み）
11. ✅ `modules/config/customButtons.js` - 削除完了（React側に移行済み）
12. ✅ `modules/actions/hugActions.js` - 削除完了（React側に移行済み）
13. ✅ `modules/actions/customButtons.js` - 削除完了（React側に移行済み）
14. ✅ `modules/config/config.js` - 削除完了（React側に移行済み）
15. ✅ `modules/data/childrenList.js` - 削除完了（React側に移行済み）
16. ✅ `modules/ui/tabs.js` - 削除完了（React側に移行済み）
17. ✅ `modules/update/updateManager.js` - 削除完了（React側に移行済み）
18. ✅ `modules/update/updateUI.js` - 削除完了（React側に移行済み）
19. ✅ `modules/update/updateTabHandler.js` - 削除完了（React側に移行済み）
20. ⏳ 残りのmodulesファイル - 段階的にReactに移行予定
