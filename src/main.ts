import { createApp } from "vue"
// TypeScript error? Run VSCode command
// TypeScript: Select TypeScript version - > Use Workspace Version
import App from "./App.vue"

import router from "./router"
import store, { key } from "./store"

/**
 * UI库
 */
import antdv from "ant-design-vue"
import "ant-design-vue/dist/antd.css"

createApp(App).use(router).use(store, key).use(antdv).mount("#app")
