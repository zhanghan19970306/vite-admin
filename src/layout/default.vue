<template>
    <a-layout :style="{ height: '100vh' }">
        <a-layout-header> </a-layout-header>
        <a-layout>
            <a-layout-sider width="200" style="background: #fff">
                <a-menu @click="handleClick">
                    <a-menu-item key="/sys/user">用户管理</a-menu-item>
                    <a-menu-item key="/sys/role">角色管理</a-menu-item>
                    <a-menu-item key="/sys/perm">权限管理</a-menu-item>
                    <a-menu-item key="/sys/menu">菜单管理</a-menu-item>
                    <a-menu-item key="/sys/conf">参数配置</a-menu-item>
                    <a-menu-item key="/sys/dict">数据字典</a-menu-item>
                    <a-menu-item key="/sys/white">白名单管理</a-menu-item>
                    <a-menu-item key="/sys/white">敏感词管理</a-menu-item>
                </a-menu>
            </a-layout-sider>
            <a-layout style="padding: 0 24px 24px">
                <a-breadcrumb style="margin: 16px 0">
                    <a-breadcrumb-item>一级菜单</a-breadcrumb-item>
                    <a-breadcrumb-item>二级菜单</a-breadcrumb-item>
                    <a-breadcrumb-item>三级菜单</a-breadcrumb-item>
                </a-breadcrumb>
                <a-layout-content :style="{ background: '#fff', padding: '24px', margin: 0 }">
                    <router-view />
                </a-layout-content>
            </a-layout>
        </a-layout>
    </a-layout>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router"

const router = useRouter()
const handleClick = ({ key }: any) => router.push(key)
</script>
