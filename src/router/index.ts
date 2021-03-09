import { createRouter, createWebHistory } from "vue-router"

const routes = [
    {
        path: "/login",
        name: "Login",
        meta: {
            layout: "empty"
        },
        component: () => import("@/views/Login.vue")
    },
    {
        path: "/",
        name: "Home",
        meta: {
            layout: "default"
        },
        component: () => import("@/views/Home.vue")
    },
    {
        path: "/sys/user",
        name: "SysUser",
        meta: {
            layout: "default"
        },
        component: () => import("@/views/sys/User.vue")
    },
    {
        path: "/sys/role",
        name: "SysRole",
        meta: {
            layout: "default"
        },
        component: () => import("@/views/sys/Role.vue")
    },
    {
        path: "/sys/perm",
        name: "SysPerm",
        meta: {
            layout: "default"
        },
        component: () => import("@/views/sys/Perm/index.vue")
    },
    {
        path: "/sys/menu",
        name: "SysMenu",
        meta: {
            layout: "default"
        },
        component: () => import("@/views/sys/Menu.vue")
    },
    {
        path: "/sys/conf",
        name: "SysConf",
        meta: {
            layout: "default"
        },
        component: () => import("@/views/sys/Conf/Index.vue")
    },
    {
        path: "/sys/dict",
        name: "SysDict",
        meta: {
            layout: "default"
        },
        component: () => import("@/views/sys/Dict/Index.vue")
    }
]

export default createRouter({
    history: createWebHistory(),
    routes
})
