import { useEffect, useRef } from 'react'
// initTabs は React側の useTabs() フックに移行済み
import { updateButtonVisibility } from '@/utils/app/buttonVisibility.js'
// initChildrenList は React側の useDataBase() フックに移行済み
import { useHugActions } from './useHugActions.js'
import { loadAllReload } from '@/utils/config/reloadSettings.js'
// updateUI は React側の useUpdateUI() フックに移行済み
import { useUpdateUI } from './useUpdateUI.js'
import { useCustomButtonManager } from './useCustomButtonManager.js'
// buttonVisibilityManager は削除されました（機能が空のため）
import { getActiveWebview } from '@/utils/webview/webviewState.js'
import { useToast } from '@/components/common/ToastContext.jsx'

function toBooleanFlag(value, defaultValue = true) {
  let result = defaultValue

  if (value === true || value === 'true') {
    result = true
  } else if (value === false || value === 'false') {
    result = false
  }

  console.log('🔎 [useAppInitialization] toBooleanFlag:', {
    value,
    valueType: typeof value,
    defaultValue,
    result,
  })

  return result
}

function normalizeDatabaseType(value) {
  if (typeof value === 'string') {
    return value.toLowerCase()
  }

  if (value && typeof value === 'object') {
    const dbType =
      value.type ||
      value.databaseType ||
      value.dbType ||
      value.DATABASE_TYPE ||
      'sqlite'

    return String(dbType).toLowerCase()
  }

  return 'sqlite'
}

async function getCurrentDatabaseType() {
  console.log('🔍 [useAppInitialization] DATABASE_TYPE 判定開始')

  try {
    if (typeof window.electronAPI?.getDatabaseType === 'function') {
      const result = await window.electronAPI.getDatabaseType()
      const normalized = normalizeDatabaseType(result)

      console.log('✅ [useAppInitialization] DATABASE_TYPE from electronAPI:', {
        raw: result,
        normalized,
      })

      return normalized
    }

    console.warn(
      '⚠️ [useAppInitialization] electronAPI.getDatabaseType がありません。IniState/AppState を参照します'
    )
  } catch (error) {
    console.warn(
      '⚠️ [useAppInitialization] electronAPI.getDatabaseType 取得エラー。IniState/AppState を参照します:',
      error
    )
  }

  const iniDatabaseType = window.IniState?.apiSettings?.databaseType

  if (iniDatabaseType !== undefined && iniDatabaseType !== null) {
    const normalized = normalizeDatabaseType(iniDatabaseType)

    console.log('✅ [useAppInitialization] DATABASE_TYPE from IniState:', {
      raw: iniDatabaseType,
      normalized,
    })

    return normalized
  }

  const appStateDatabaseType =
    window.AppState?.DATABASE_TYPE ||
    window.AppState?.databaseType ||
    window.AppState?.dbType

  if (appStateDatabaseType !== undefined && appStateDatabaseType !== null) {
    const normalized = normalizeDatabaseType(appStateDatabaseType)

    console.log('✅ [useAppInitialization] DATABASE_TYPE from AppState:', {
      raw: appStateDatabaseType,
      normalized,
    })

    return normalized
  }

  console.warn(
    '⚠️ [useAppInitialization] DATABASE_TYPE を取得できないため sqlite 扱いにします'
  )

  return 'sqlite'
}

function logCloseSnapshot(label) {
  console.log(`🧭 [useAppInitialization] ${label}`, {
    IniStateExists: !!window.IniState,
    AppStateExists: !!window.AppState,

    rawIniDatabaseType:
      window.IniState?.apiSettings?.databaseType,

    rawAppStateDatabaseType:
      window.AppState?.DATABASE_TYPE ||
      window.AppState?.databaseType ||
      window.AppState?.dbType,

    rawIniAutoSynchronization:
      window.IniState?.apiSettings?.autoSynchronization,

    rawIniAutoSwitching:
      window.IniState?.apiSettings?.autoSwitching,

    rawConfirmOnClose:
      window.IniState?.appSettings?.ui?.confirmOnClose,

    hasGetDatabaseType:
      typeof window.electronAPI?.getDatabaseType === 'function',

    hasSyncDatabaseStateToSqlite:
      typeof window.electronAPI?.syncDatabaseStateToSqlite === 'function',

    hasConfirmCloseRequest:
      typeof window.electronAPI?.onConfirmCloseRequest === 'function',

    hasSendConfirmCloseResponse:
      typeof window.electronAPI?.sendConfirmCloseResponse === 'function',

    hasAppStateAutoSyncFunction:
      typeof window.AppState?.isAutoSynchronizationEnabled === 'function',

    appStateAutoSyncValue:
      typeof window.AppState?.isAutoSynchronizationEnabled === 'function'
        ? window.AppState.isAutoSynchronizationEnabled()
        : undefined,
  })
}

function getAutoSynchronizationEnabled() {
  try {
    console.log('🔍 [useAppInitialization] autoSynchronization 判定開始')

    logCloseSnapshot('autoSynchronization 判定前 snapshot')

    const iniValue = window.IniState?.apiSettings?.autoSynchronization

    console.log('🔍 [useAppInitialization] IniState autoSynchronization raw:', {
      iniValue,
      type: typeof iniValue,
    })

    // ini.json の値を最優先する
    if (iniValue !== undefined && iniValue !== null) {
      const result = toBooleanFlag(iniValue, true)

      console.log('✅ [useAppInitialization] autoSynchronization from IniState:', {
        raw: iniValue,
        result,
      })

      return result
    }

    // IniState がまだない場合だけ AppState を見る
    if (typeof window.AppState?.isAutoSynchronizationEnabled === 'function') {
      const appStateResult = window.AppState.isAutoSynchronizationEnabled()
      const result = toBooleanFlag(appStateResult, true)

      console.log('✅ [useAppInitialization] autoSynchronization from AppState:', {
        raw: appStateResult,
        result,
      })

      return result
    }

    console.warn(
      '⚠️ [useAppInitialization] autoSynchronization が取得できないため true 扱いにします'
    )

    return true
  } catch (error) {
    console.warn(
      '⚠️ [useAppInitialization] autoSynchronization 判定に失敗。安全側で true 扱いにします:',
      error
    )

    return true
  }
}

function getConfirmOnCloseEnabled() {
  const rawValue = window.IniState?.appSettings?.ui?.confirmOnClose
  const result = toBooleanFlag(rawValue, true)

  console.log('🔍 [useAppInitialization] confirmOnClose 判定:', {
    rawValue,
    rawValueType: typeof rawValue,
    result,
  })

  return result
}

function getCloseConfirmMessage({ autoSynchronization, syncResult, databaseType }) {
  console.log('📝 [useAppInitialization] getCloseConfirmMessage START:', {
    autoSynchronization,
    databaseType,
    syncResult,
  })

  if (!autoSynchronization) {
    const message = 'アプリを終了しますか？'

    console.log('📝 [useAppInitialization] confirm message selected:', {
      reason: 'autoSynchronization=false',
      message,
    })

    return message
  }

  if (databaseType === 'sqlite') {
    const message = 'アプリを終了しますか？'

    console.log('📝 [useAppInitialization] confirm message selected:', {
      reason: 'DATABASE_TYPE=sqlite のため自動同期なし',
      message,
    })

    return message
  }

  if (syncResult?.success === false) {
    const message = [
      'MariaDBからSQLiteへの自動同期に失敗しました。',
      'このままアプリを終了しますか？',
    ].join('\n')

    console.log('📝 [useAppInitialization] confirm message selected:', {
      reason: 'sync failed',
      message,
    })

    return message
  }

  if (syncResult?.skipped) {
    const message = 'アプリを終了しますか？'

    console.log('📝 [useAppInitialization] confirm message selected:', {
      reason: syncResult?.reason || 'sync skipped',
      message,
    })

    return message
  }

  const message = [
    'MariaDBのデータをSQLiteに自動同期しました。',
    'アプリを終了しますか？',
  ].join('\n')

  console.log('📝 [useAppInitialization] confirm message selected:', {
    reason: 'sync success',
    message,
  })

  return message
}

async function runAutoSynchronizationBeforeConfirm(
  showErrorToastRef,
  autoSynchronization,
  databaseType
) {
  console.log('🚀 [useAppInitialization] runAutoSynchronizationBeforeConfirm START')

  console.log('🔍 [useAppInitialization] 同期前フラグ確認:', {
    autoSynchronization,
    databaseType,
    rawIniDatabaseType:
      window.IniState?.apiSettings?.databaseType,
    rawIniAutoSynchronization:
      window.IniState?.apiSettings?.autoSynchronization,
  })

  if (!autoSynchronization) {
    console.log(
      '⏭ [useAppInitialization] autoSynchronization=false のため同期をスキップします'
    )

    return {
      success: true,
      skipped: true,
      reason: 'autoSynchronization is false',
      databaseType,
    }
  }

  if (databaseType === 'sqlite') {
    console.log(
      '⏭ [useAppInitialization] DATABASE_TYPE=sqlite のため終了時自動同期を実行しません'
    )

    return {
      success: true,
      skipped: true,
      reason: 'DATABASE_TYPE is sqlite',
      databaseType,
    }
  }

  if (databaseType !== 'mariadb') {
    console.log(
      '⏭ [useAppInitialization] DATABASE_TYPE が mariadb ではないため終了時自動同期を実行しません',
      {
        databaseType,
      }
    )

    return {
      success: true,
      skipped: true,
      reason: 'DATABASE_TYPE is not mariadb',
      databaseType,
    }
  }

  if (typeof window.electronAPI?.syncDatabaseStateToSqlite !== 'function') {
    console.error(
      '❌ [useAppInitialization] syncDatabaseStateToSqlite が preload に公開されていません'
    )

    return {
      success: false,
      skipped: false,
      reason: 'syncDatabaseStateToSqlite is not exposed',
      databaseType,
    }
  }

  try {
    console.log(
      '🔄 [useAppInitialization] DATABASE_TYPE=mariadb のため window.confirm 前に MariaDB → SQLite 自動同期を実行します'
    )

    console.time('⏱ [useAppInitialization] SQLite auto sync time')

    const result = await window.electronAPI.syncDatabaseStateToSqlite()

    console.timeEnd('⏱ [useAppInitialization] SQLite auto sync time')

    console.log('✅ [useAppInitialization] SQLite 自動同期 raw result:', result)

    const normalizedResult = {
      success: result?.success !== false,
      skipped: false,
      databaseType,
      result,
      error: result?.success === false ? result?.error : null,
    }

    console.log(
      '✅ [useAppInitialization] SQLite 自動同期 normalized result:',
      normalizedResult
    )

    return normalizedResult
  } catch (error) {
    console.timeEnd('⏱ [useAppInitialization] SQLite auto sync time')

    console.error('❌ [useAppInitialization] SQLite 自動同期エラー:', error)

    if (showErrorToastRef?.current) {
      showErrorToastRef.current(
        '自動同期に失敗しました。終了確認は続行します。'
      )
    }

    return {
      success: false,
      skipped: false,
      databaseType,
      error: error?.message || String(error),
    }
  } finally {
    console.log('🏁 [useAppInitialization] runAutoSynchronizationBeforeConfirm END')
  }
}

export function useAppInitialization() {
  const { showErrorToast } = useToast()
  const { addUpdateButtons } = useUpdateUI()
  const { init: initCustomButtons } = useCustomButtonManager()
  const showErrorToastRef = useRef(showErrorToast)
  const initializedRef = useRef(false)

  // hugActionsの機能をReact hooksに移行
  useHugActions()

  // showErrorToastの参照を更新
  useEffect(() => {
    showErrorToastRef.current = showErrorToast
  }, [showErrorToast])

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    let removeConfirmCloseListener = null

    const initializeApp = async () => {
      console.log('🚀 React App 初期化開始')

      // ===== 1️⃣ 設定読み込み =====
      console.log('🔄 [useAppInitialization] loadAllReload START')

      const ok = await loadAllReload()

      console.log('🔄 [useAppInitialization] loadAllReload DONE:', {
        ok,
        IniState: window.IniState,
        AppState: window.AppState,
      })

      logCloseSnapshot('loadAllReload 後 snapshot')

      if (!ok) {
        showErrorToastRef.current('❌ config.json の読み込みに失敗しました')
        return
      }

      // ===== 5️⃣ 設定エディター初期化 =====
      // 少し遅延させて確実に初期化
      setTimeout(async () => {
        console.log('🔄 設定エディターを初期化中...')

        // 設定が正しく読み込まれているか確認
        console.log('🔍 [MAIN] IniState確認:', window.IniState)
        console.log('🔍 [MAIN] AppState確認:', window.AppState)

        logCloseSnapshot('設定エディター初期化時 snapshot')

        // customButtonsはcustomButtons.jsonに統一されたため、IniStateからの参照は削除

        // settingsEditorはReactコンポーネント（SettingsModal）に統合されました
        // window.settingsEditor = initSettingsEditor()
      }, 200)

      // ===== 6️⃣ ボタンの表示を更新（少し遅延させて確実に実行） =====
      setTimeout(() => {
        updateButtonVisibility()
      }, 100)

      // ===== 退出確認（メインからの要求に応答） =====
      if (typeof window.electronAPI?.onConfirmCloseRequest === 'function') {
        removeConfirmCloseListener = window.electronAPI.onConfirmCloseRequest(
          async () => {
            console.log('🚪 [useAppInitialization] onConfirmCloseRequest RECEIVED')

            try {
              logCloseSnapshot('onConfirmCloseRequest 開始時 snapshot')

              const autoSynchronization = getAutoSynchronizationEnabled()
              const databaseType = await getCurrentDatabaseType()

              console.log(
                '🚪 [useAppInitialization] 終了確認前 条件判定:',
                {
                  autoSynchronization,
                  databaseType,
                  rawIniAutoSynchronization:
                    window.IniState?.apiSettings?.autoSynchronization,
                  rawIniDatabaseType:
                    window.IniState?.apiSettings?.databaseType,
                }
              )

              // window.confirm 実行前に以下の条件を確認する
              // - autoSynchronization=true
              // - DATABASE_TYPE=mariadb
              // 上記を満たす場合のみ MariaDB → SQLite 同期を実行する
              const syncResult = await runAutoSynchronizationBeforeConfirm(
                showErrorToastRef,
                autoSynchronization,
                databaseType
              )

              console.log(
                '🚪 [useAppInitialization] 終了確認前 syncResult:',
                syncResult
              )

              const confirmOnCloseEnabled = getConfirmOnCloseEnabled()

              console.log('🚪 [useAppInitialization] confirmOnCloseEnabled:', {
                confirmOnCloseEnabled,
                rawConfirmOnClose:
                  window.IniState?.appSettings?.ui?.confirmOnClose,
              })

              let shouldClose = true

              if (confirmOnCloseEnabled) {
                const confirmMessage = getCloseConfirmMessage({
                  autoSynchronization,
                  databaseType,
                  syncResult,
                })

                console.log(
                  '🚪 [useAppInitialization] 実際に window.confirm に渡す文字列:',
                  confirmMessage
                )

                shouldClose = window.confirm(confirmMessage)

                console.log('🚪 [useAppInitialization] window.confirm result:', {
                  shouldClose,
                })
              } else {
                console.log(
                  '🚪 [useAppInitialization] confirmOnClose=false のため window.confirm を表示せず終了します'
                )
              }

              console.log(
                '🚪 [useAppInitialization] sendConfirmCloseResponse:',
                {
                  shouldClose,
                }
              )

              window.electronAPI.sendConfirmCloseResponse(shouldClose)
            } catch (err) {
              console.error('❌ 終了確認処理エラー:', err)
              // 失敗時は安全側（閉じない）
              window.electronAPI.sendConfirmCloseResponse(false)
            }
          }
        )
      } else {
        console.error(
          '❌ [useAppInitialization] onConfirmCloseRequest が preload に公開されていません'
        )
      }

      console.log('🎉 初期化完了:', window.AppState)

      // 🔄 アップデートUI機能を初期化
      // updateUI は React側の useUpdateUI() フックに移行済み（自動初期化）
      const isDebugMode = window.electronAPI.isDebugMode()

      // デバッグモードの場合、追加のUIボタンを表示
      if (isDebugMode) {
        console.log('🔧 デバッグモード: 追加UIボタンを表示します')
        addUpdateButtons()
      }

      // ===== 9️⃣ カスタムボタンマネージャー初期化 =====
      console.log('🔧 カスタムボタンマネージャーを初期化中...')
      await initCustomButtons()

      // ===== 🔟 ボタン表示制御マネージャー初期化 =====
      // buttonVisibilityManager は削除されました（機能が空のため）

      // ===== ⓫ アクティブURLのUI反映（設定モーダルのみ） =====
      function setModalUrlText(urlText) {
        const input = document.getElementById('current-webview-url')
        if (input) input.value = urlText || ''
      }

      function refreshUrlUI() {
        const vw = getActiveWebview()
        const url = vw && typeof vw.getURL === 'function' ? vw.getURL() : ''
        setModalUrlText(url)
      }

      // 初期反映
      refreshUrlUI()

      // アクティブwebview変更時に更新
      document.addEventListener('active-webview-changed', (e) => {
        const url = e?.detail?.url || ''
        setModalUrlText(url)
      })

      // webviewのナビゲーションイベントで更新
      function attachWebviewUrlListeners(vw) {
        if (!vw) return

        const handler = () => {
          const url = typeof vw.getURL === 'function' ? vw.getURL() : ''
          setModalUrlText(url)
        }

        vw.addEventListener('did-navigate', handler)
        vw.addEventListener('did-navigate-in-page', handler)
        vw.addEventListener('did-redirect-navigation', handler)
      }

      // 既存のhugviewにリスナー
      const hugview = document.getElementById('hugview')
      if (hugview) {
        attachWebviewUrlListeners(hugview)
      }

      // 追加されるwebviewにも自動でリスナーを付与
      const contentEl = document.getElementById('content')
      if (contentEl) {
        const mo = new MutationObserver((mutations) => {
          for (const m of mutations) {
            m.addedNodes.forEach((node) => {
              if (node && node.tagName === 'WEBVIEW') {
                attachWebviewUrlListeners(node)
              }
            })
          }
        })

        mo.observe(contentEl, { childList: true })
      }

      // 設定保存などによりIniStateが更新された場合の反映
      document.addEventListener('app-settings-updated', () => {
        console.log('🔄 [useAppInitialization] app-settings-updated received')
        logCloseSnapshot('app-settings-updated snapshot')
        refreshUrlUI()
      })
    }

    initializeApp()

    return () => {
      if (typeof removeConfirmCloseListener === 'function') {
        console.log(
          '🧹 [useAppInitialization] confirm close listener cleanup'
        )
        removeConfirmCloseListener()
      }
    }
  }, [])
}