import { InjectionKey } from "vue"
import { createStore, Store } from "vuex"

import setting, { SettingStateType } from "./modules/setting"

// 手动声明 state 类型
export interface StateType {
    setting: SettingStateType
}

export const key: InjectionKey<Store<StateType>> = Symbol()

export default createStore({
    state: {},
    mutations: {},
    actions: {},
    modules: {
        setting
    }
})
