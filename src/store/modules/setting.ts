export interface SettingStateType {
    projectName: string
}

const state: SettingStateType = {
    projectName: "vue3-env"
}

const mutations = {
    changeName(state: SettingStateType, payload: SettingStateType): void {
        state.projectName = payload.projectName
    }
}

const actions = {}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}
