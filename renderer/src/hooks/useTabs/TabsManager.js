// renderer/src/hooks/useTabs/TabsManager.js
// タブ周りの操作をクラスにまとめ、依存を一箇所に集約する

import { TabsCommon } from './common/index.js'
import { addNormalTabAction } from './actions/normal.js'
import { addPersonalRecordTabAction3 } from './actions/personalRecord.js'
import { addProfessionalSupportListAction } from './actions/professionalList.js'
import { addProfessionalSupportNewAction } from './actions/professionalNew.js'
import { addWebManagerAction } from './actions/WebManager.js'

/**
 * TabsManager
 * - フックからはこのクラス経由でタブ操作を呼び出す
 * - 最新の appState / iniState を getter で取得するため、参照の陳腐化を防ぐ
 */
export class TabsManager {
  constructor({ getAppState, getIniState, common } = {}) {
    this.getAppState = getAppState
    this.getIniState = getIniState
    this.common = common || new TabsCommon()
  }

  get appState() {
    return this.getAppState ? this.getAppState() : undefined
  }

  get iniState() {
    return this.getIniState ? this.getIniState() : undefined
  }

  addNormalTab = () => {
    if (!this.appState) return
    addNormalTabAction(this.appState)
  }

  addPersonalRecordTab = () => {
    if (!this.appState) return
    addPersonalRecordTabAction3(this.appState)
  }

  addProfessionalSupportListTab = () => {
    if (!this.appState) return
    addProfessionalSupportListAction(this.appState)
  }

  addProfessionalSupportNewTab = () => {
    if (!this.appState) return
    addProfessionalSupportNewAction(this.appState)
  }

  addWebManagerTab = () => {
    if (!this.appState) return
    addWebManagerAction(this.appState, this.iniState)
  }

  activateTab = (targetId) => this.common.activateTab(targetId)

  closeTab = (targetId) => this.common.closeTab(targetId)

  clearActiveWebviewCache = () => this.common.clearActiveWebviewCache()
}
