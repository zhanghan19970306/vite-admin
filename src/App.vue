<template>
    <a-config-provider :autoInsertSpaceInButton="false" :locale="zhCN">
        <component :is="layoutComp" />
    </a-config-provider>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router"
import { computed } from "vue"
import zhCN from "ant-design-vue/es/locale/zh_CN"

/**
 * 布局组件
 * */
import LayoutLoading from "./layout/Loading.vue"
import LayoutDefault from "./layout/default.vue"
import LayoutEmpty from "./layout/empty.vue"

const router = useRouter()
const layoutComp = computed(() => {
    if (router.currentRoute.value.meta.layout === "default") {
        return LayoutDefault
    }
    if (router.currentRoute.value.meta.layout === "empty") {
        return LayoutEmpty
    }
    return LayoutLoading
})
</script>
