<template>
    <a-table
        :columns="columns"
        :row-key="(record) => record.id"
        :data-source="dataSource"
        :loading="loading"
        :pagination="false"
    >
        <template #title>
            <a-button type="dashed" block @click="openDialog()"
                ><template #icon> <PlusOutlined /></template>新增</a-button
            >
        </template>

        <template #isEnable="{ record }">
            <a-badge
                :status="record.isEnable ? 'processing' : 'default'"
                :text="record.isEnable ? '启用中' : '禁用中'"
            />
        </template>

        <template #isShow="{ record }">
            <a-tag :color="record.isShow ? 'blue' : ''">{{ record.isShow ? "显示" : "隐藏" }}</a-tag>
        </template>

        <template #operation="{ record }">
            <a @click="openDialog(record)">修改</a>
            <a-divider type="vertical" />

            <a @click="onStatus(record)">{{ record.isEnable ? "禁用" : "启用" }}</a>
            <a-divider type="vertical" />

            <a @click="onDelete(record)">删除</a>
        </template>
    </a-table>

    <a-modal v-model:visible="visible" :title="title" @ok="handleOk">
        <a-form :label-col="{ span: 7 }" :wrapper-col="{ span: 14 }">
            <a-form-item v-show="type === 'create'" label="父级菜单" v-bind="validateInfos.pid">
                <a-tree-select
                    :replaceFields="{
                        title: 'name',
                        key: 'id',
                        value: 'id'
                    }"
                    v-model:value="modelRef.pid"
                    :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                    :tree-data="dataSource"
                    placeholder="请选择父级菜单"
                />
            </a-form-item>
            <a-form-item label="菜单名称" v-bind="validateInfos.name">
                <a-input v-model:value.trim="modelRef.name" />
            </a-form-item>
            <a-form-item label="菜单图标" v-bind="validateInfos.icon">
                <a-input v-model:value.trim="modelRef.icon" />
            </a-form-item>
            <a-form-item label="URL" v-bind="validateInfos.url">
                <a-input v-model:value.trim="modelRef.url" />
            </a-form-item>
            <a-form-item label="菜单状态" v-bind="validateInfos.isEnable">
                <a-switch checked-children="启用" un-checked-children="禁用" v-model:checked="modelRef.isEnable" />
            </a-form-item>
        </a-form>
    </a-modal>
</template>

<script setup lang="ts">
import { computed, createVNode, reactive, ref, watch } from "vue"
import { useForm } from "@ant-design-vue/use"
import axios from "@/utils/request"
import { message, Modal } from "ant-design-vue"
import { ExclamationCircleOutlined, PlusOutlined, MinusCircleOutlined } from "@ant-design/icons-vue"

const loading = ref(false)
const isSubmitIng = ref(false)
const dataSource = ref([])
const columns = ref([
    {
        title: "菜单名称",
        dataIndex: "name"
    },
    {
        title: "URL",
        dataIndex: "url"
    },
    {
        title: "菜单图标",
        dataIndex: "icon"
    },
    {
        title: "菜单状态",
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

/**
 * 获取分页 数据列表
 */
const getTableData = async () => {
    try {
        loading.value = true

        const { data } = await axios.get<any, any>("/api/sys/menu/tree")

        dataSource.value = data
    } catch (error) {
        console.log(error)
    } finally {
        loading.value = false
    }
}
// 获取第一次数据
getTableData()

const visible = ref(false)
const type = ref("create")
const title = computed(() => (type.value === "create" ? "新增菜单" : "编辑菜单"))
const modelRef = reactive<any>({
    pid: "",
    id: "",
    name: "",
    url: "",
    icon: "",
    isEnable: true
})
const rulesRef = reactive({
    name: [
        {
            required: true,
            message: "请填写菜单名称",
            target: "blur"
        }
    ]
})
const { resetFields, validate, validateInfos } = useForm(modelRef, rulesRef)

const openDialog = (record: any) => {
    if (record) {
        type.value = "update"
        modelRef.id = record.id
        modelRef.name = record.name
        modelRef.url = record.url
        modelRef.icon = record.icon
        modelRef.isEnable = record.isEnable
    } else {
        type.value = "create"
        resetFields()
    }
    visible.value = true
}

const handleOk = async () => {
    try {
        isSubmitIng.value = true

        await validate()

        let msg = ""

        if (type.value === "create") {
            const result = await axios.post<any, any>("/api/sys/menu", { ...modelRef })
            msg = result.msg
        } else {
            const result = await axios.put<any, any>(`/api/sys/menu`, { ...modelRef })
            msg = result.msg
        }

        // 成功反馈
        message.success(msg)

        // 刷新数据
        getTableData()

        visible.value = false
    } catch (error) {
        console.log(error)
    } finally {
        isSubmitIng.value = false
    }
}

// 启用/禁用 菜单
const onStatus = async (record: any) => {
    try {
        Modal.confirm({
            title: `确定${record.isEnable ? "禁用" : "启用"}该菜单?`,
            icon: createVNode(ExclamationCircleOutlined),
            async onOk() {
                const { msg } = await axios.patch<any, any>(`/api/sys/menu/status`, {
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

const onDelete = async (record: any) => {
    try {
        Modal.confirm({
            title: "确定删除该条菜单?",
            icon: createVNode(ExclamationCircleOutlined),
            async onOk() {
                const { msg } = await axios.delete<any, any>(`/api/sys/menu/${record.id}`)

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
</script>
