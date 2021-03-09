<template>
    <a-table
        :columns="columns"
        :row-key="(record) => record.id"
        :data-source="dataSource"
        :loading="loading"
        :pagination="false"
    >
        <template #title>
            <a-button type="dashed" block @click="openAddDialog"
                ><template #icon> <PlusOutlined /></template>新增</a-button
            >
        </template>

        <template #isEnable="{ record }">
            <a-badge
                :status="record.isEnable ? 'processing' : 'default'"
                :text="record.isEnable ? '启用中' : '禁用中'"
            />
        </template>

        <template #operation="{ record }">
            <a @click="openEditDialog(record)">修改</a>
            <a-divider type="vertical" />

            <a @click="onStatus(record)">{{ record.isEnable ? "禁用" : "启用" }}</a>
            <a-divider type="vertical" />

            <a @click="onDelete(record)">删除</a>
        </template>
    </a-table>

    <AddConf ref="AddConfRef" @finish="getTableData" />
    <EditConf ref="EditConfRef" @finish="getTableData" />
</template>

<script lang="ts" setup>
import { ref, defineComponent } from "vue"
import axios from "@/utils/request"
import { message, Modal } from "ant-design-vue"
import { PlusOutlined } from "@ant-design/icons-vue"

import AddConf from "./Add.vue"
import EditConf from "./Edit.vue"

const columns = ref([
    {
        title: "参数名",
        dataIndex: "key"
    },
    {
        title: "参数值",
        dataIndex: "value"
    },
    {
        title: "参数描述",
        dataIndex: "description"
    },
    {
        title: "状态",
        dataIndex: "isEnable",
        slots: { customRender: "isEnable" }
    },
    {
        title: "操作",
        dataIndex: "operation",
        slots: { customRender: "operation" },
        width: 160,
        fixed: "right"
    }
])

const loading = ref(false)
const dataSource = ref<any>([])
const getTableData = async () => {
    try {
        loading.value = true

        const { data } = await axios.get("/api/sys/conf")

        dataSource.value = data
    } catch (error) {
        console.log(error)
    } finally {
        loading.value = false
    }
}
// 获取第一次数据
getTableData()

const AddConfRef = ref<any>(null)
const openAddDialog = () => AddConfRef.value?.open?.()

const EditConfRef = ref<any>(null)
const openEditDialog = (record: any) => EditConfRef.value?.open?.(record)

// 删除角色
const onDelete = async ({ id }: any) => {
    try {
        Modal.confirm({
            title: "确定删除该参数?",
            async onOk() {
                const { msg } = await axios.delete<any, any>(`/api/sys/conf/${id}`)

                // 成功反馈
                message.success(msg)

                // 刷新数据
                getTableData()
            }
        })
    } catch (error) {
        console.log(error)
    }
}

// 启用/禁用 角色
const onStatus = async (record: any) => {
    try {
        Modal.confirm({
            title: `确定${record.isEnable ? "禁用" : "启用"}该角色?`,
            async onOk() {
                const { msg } = await axios.patch<any, any>(`/api/sys/conf/status`, {
                    id: record.id,
                    isEnable: !record.isEnable
                })

                // 成功反馈
                message.success(msg)

                // 刷新数据
                getTableData()
            }
        })
    } catch (error) {
        console.log(error)
    }
}

// export default defineComponent({
//     components: {
//         AddConf,
//         EditConf,
//         PlusOutlined
//     },
//     setup() {
//         const columns = ref([
//             {
//                 title: "参数名",
//                 dataIndex: "key"
//             },
//             {
//                 title: "参数值",
//                 dataIndex: "value"
//             },
//             {
//                 title: "参数描述",
//                 dataIndex: "description"
//             },
//             {
//                 title: "状态",
//                 dataIndex: "isEnable",
//                 slots: { customRender: "isEnable" }
//             },
//             {
//                 title: "操作",
//                 dataIndex: "operation",
//                 slots: { customRender: "operation" },
//                 width: 160,
//                 fixed: "right"
//             }
//         ])

//         const loading = ref(false)
//         const dataSource = ref<any>([])
//         const getTableData = async () => {
//             try {
//                 loading.value = true

//                 const { data } = await axios.get("/api/sys/conf")

//                 dataSource.value = data
//             } catch (error) {
//                 console.log(error)
//             } finally {
//                 loading.value = false
//             }
//         }
//         // 获取第一次数据
//         getTableData()

//         const AddConfRef = ref<any>(null)
//         const openAddDialog = () => AddConfRef.value?.open?.()

//         const EditConfRef = ref<any>(null)
//         const openEditDialog = (record: any) => EditConfRef.value?.open?.(record)

//         // 删除角色
//         const onDelete = async ({ id }: any) => {
//             try {
//                 Modal.confirm({
//                     title: "确定删除该参数?",
//                     async onOk() {
//                         const { msg } = await axios.delete<any, any>(`/api/sys/conf/${id}`)

//                         // 成功反馈
//                         message.success(msg)

//                         // 刷新数据
//                         getTableData()
//                     }
//                 })
//             } catch (error) {
//                 console.log(error)
//             }
//         }

//         // 启用/禁用 角色
//         const onStatus = async (record: any) => {
//             try {
//                 Modal.confirm({
//                     title: `确定${record.isEnable ? "禁用" : "启用"}该角色?`,
//                     async onOk() {
//                         const { msg } = await axios.patch<any, any>(`/api/sys/conf/status`, {
//                             id: record.id,
//                             isEnable: !record.isEnable
//                         })

//                         // 成功反馈
//                         message.success(msg)

//                         // 刷新数据
//                         getTableData()
//                     }
//                 })
//             } catch (error) {
//                 console.log(error)
//             }
//         }

//         return {
//             columns,
//             loading,
//             dataSource,
//             getTableData,

//             AddConfRef,
//             openAddDialog,

//             EditConfRef,
//             openEditDialog,

//             onDelete,
//             onStatus
//         }
//     }
// })
</script>
