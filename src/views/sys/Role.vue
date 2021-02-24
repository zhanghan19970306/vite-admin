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

        <template #name="{ record }">
            <a-tag :color="record.color">{{ record.name }}</a-tag>
        </template>

        <template #isEnable="{ record }">
            <a-badge
                :status="record.isEnable ? 'processing' : 'default'"
                :text="record.isEnable ? '启用中' : '禁用中'"
            />
        </template>

        <template #operation="{ record }">
            <a @click="openDialog(record)">修改</a>
            <a-divider type="vertical" />

            <a @click="onStatus(record)">{{ record.isEnable ? "禁用" : "启用" }}</a>
            <a-divider type="vertical" />

            <!-- <a>禁用</a>
            <a-divider type="vertical" /> -->

            <a-dropdown placement="bottomRight">
                <a class="ant-dropdown-link">更多</a>
                <template #overlay>
                    <a-menu @click="onCommand($event, record)">
                        <a-menu-item key="openRelationMenu">分配菜单</a-menu-item>
                        <a-menu-item key="openRelationPrem">分配权限</a-menu-item>
                        <a-menu-divider />

                        <a-menu-item key="3">关联用户</a-menu-item>
                        <a-menu-item key="onDelete">删除角色</a-menu-item>
                    </a-menu>
                </template>
            </a-dropdown>
        </template>
    </a-table>

    <a-modal v-model:visible="visible" :title="title" @ok="handleOk">
        <a-form :label-col="{ span: 7 }" :wrapper-col="{ span: 14 }">
            <a-form-item label="角色名" v-bind="validateInfos.name">
                <a-input v-model:value.trim="modelRef.name" />
            </a-form-item>
            <a-form-item label="角色Code" v-bind="validateInfos.code">
                <a-input v-model:value.trim="modelRef.code" />
            </a-form-item>
            <a-form-item label="标签颜色">
                <a-input v-model:value.trim="modelRef.color" />
            </a-form-item>
            <a-form-item label="角色描述" v-bind="validateInfos.description">
                <a-textarea v-model:value.trim="modelRef.description" />
            </a-form-item>
            <a-form-item label="状态" v-bind="validateInfos.isEnable">
                <a-switch checked-children="启用" un-checked-children="禁用" v-model:checked="modelRef.isEnable" />
            </a-form-item>
        </a-form>
    </a-modal>

    <a-drawer title="分配权限" width="400" placement="right" v-model:visible="visiblePrem">
        <a-tree
            v-model:checkedKeys="checkedKeys"
            checkable
            :tree-data="premTreeData"
            :replaceFields="{ title: 'name', key: 'id' }"
        />

        <div
            :style="{
                position: 'absolute',
                bottom: 0,
                width: '100%',
                borderTop: '1px solid #e8e8e8',
                padding: '10px 16px',
                textAlign: 'right',
                left: 0,
                background: '#fff',
                borderRadius: '0 0 4px 4px'
            }"
        >
            <a-button type="primary" @click="onRelationPrem">提交</a-button>
        </div>
    </a-drawer>

    <a-drawer title="分配菜单" width="400" placement="right" v-model:visible="visibleMenu">
        <a-tree
            v-model:checkedKeys="checkedMenuKeys"
            checkable
            :tree-data="menuTreeData"
            :replaceFields="{ title: 'name', key: 'id' }"
        />

        <div
            :style="{
                position: 'absolute',
                bottom: 0,
                width: '100%',
                borderTop: '1px solid #e8e8e8',
                padding: '10px 16px',
                textAlign: 'right',
                left: 0,
                background: '#fff',
                borderRadius: '0 0 4px 4px'
            }"
        >
            <a-button type="primary" @click="onRelationMenu">提交</a-button>
        </div>
    </a-drawer>
</template>

<script setup lang="ts">
import dayjs from "dayjs"
import axios from "@/utils/request.ts"
import { computed, createVNode, reactive, ref, watch } from "vue"
import { useForm } from "@ant-design-vue/use"
import { message, Modal } from "ant-design-vue"
import { PlusOutlined, ExclamationCircleOutlined } from "@ant-design/icons-vue"

const columns = [
    {
        title: "角色名称",
        dataIndex: "name",
        slots: { customRender: "name" }
    },
    {
        title: "角色Code",
        dataIndex: "code"
    },
    {
        title: "角色描述",
        dataIndex: "description",
        width: 320
    },
    {
        title: "角色状态",
        dataIndex: "isEnable",
        slots: { customRender: "isEnable" }
    },
    // {
    //     title: "创建时间",
    //     dataIndex: "createdTime",
    //     width: "20%"
    // },
    // {
    //     title: "操作人",
    //     dataIndex: "opBy",
    //     slots: { customRender: "opBy" }
    // },
    {
        title: "操作",
        dataIndex: "operation",
        slots: { customRender: "operation" },
        width: 160,
        fixed: "right"
    }
]

const loading = ref(false)
const dataSource = ref<any>([])

/**
 * 获取分页 数据列表
 */
const getTableData = async () => {
    try {
        loading.value = true

        const { data } = await axios.get<any, any>("/api/sys/role")

        data.forEach((item: any) => (item.createdTime = dayjs(item.createdTime).format("YYYY-MM-DD HH:mm")))

        dataSource.value = data
    } catch (error) {
        console.log(error)
    } finally {
        loading.value = false
    }
}
// 获取第一次数据
getTableData()

/**
 * 新增
 */
const visible = ref(false)
const type = ref("create")
const title = computed(() => (type.value === "create" ? "新增角色" : "编辑角色"))

const modelRef = reactive({
    id: "",
    name: "",
    code: "",
    description: "",
    isEnable: true,
    color: ""
})
const rulesRef = reactive({
    name: [
        {
            required: true,
            message: "请填写角色名",
            target: "blur"
        }
    ],
    code: [
        {
            required: true,
            message: "请填写角色Code",
            target: "blur"
        }
    ]
})

const { resetFields, validate, validateInfos } = useForm(modelRef, rulesRef)
const isSubmitIng = ref(false)

const openDialog = (record: any) => {
    if (record) {
        type.value = "update"
        modelRef.id = record.id
        modelRef.name = record.name
        modelRef.code = record.code
        modelRef.description = record.description
        modelRef.isEnable = record.isEnable
        modelRef.color = record.color
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
            const result = await axios.post<any, any>("/api/sys/role", { ...modelRef })
            msg = result.msg
        } else {
            const result = await axios.put<any, any>(`/api/sys/role`, { ...modelRef })
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

// 删除角色
const onDelete = async (id: string) => {
    try {
        Modal.confirm({
            title: "确定删除该角色?",
            icon: createVNode(ExclamationCircleOutlined),
            content: createVNode("div", { style: "color:red;" }, "删除角色后 会导致该角色的用户异常"),
            async onOk() {
                const { msg } = await axios.delete<any, any>(`/api/sys/role/${id}`)

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
            icon: createVNode(ExclamationCircleOutlined),
            content: createVNode(
                "div",
                { style: "color:red;" },
                record.isEnable ? "禁用角色后 会导致该角色的用户异常" : ""
            ),
            async onOk() {
                const { msg } = await axios.patch<any, any>(`/api/sys/role/status`, {
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

/**
 * 分配角色权限
 */
const premTreeData = ref([])
const menuTreeData = ref([])

const getPermissionAll = async () => {
    try {
        const { data: treeData } = await axios.get<any, any>("/api/sys/permission/tree")

        premTreeData.value = treeData
    } catch (error) {
        console.log(error)
    }
}
getPermissionAll()

const getMenuAll = async () => {
    try {
        const { data: treeData } = await axios.get<any, any>("/api/sys/menu/tree")

        menuTreeData.value = treeData
    } catch (error) {
        console.log(error)
    }
}
getMenuAll()

const currentId = ref("")

const visiblePrem = ref(false)
const checkedKeys = ref<string[]>([])
const openRelationPrem = async (record: any) => {
    try {
        currentId.value = record.id

        visiblePrem.value = true

        const { data } = await axios.get(`/api/sys/role/permissions/${record.id}`)

        checkedKeys.value = data.map((item: any) => item.id)
    } catch (error) {
        console.log(error)
    }
}
const onRelationPrem = async () => {
    try {
        const { msg } = await axios.post<any, any>("/api/sys/role/permissions/relation", {
            id: currentId.value,
            permissions: checkedKeys.value
        })

        message.success(msg)

        visiblePrem.value = false
    } catch (error) {
        console.log(error)
    }
}

const visibleMenu = ref(false)
const checkedMenuKeys = ref<string[]>([])
const openRelationMenu = async (record: any) => {
    try {
        currentId.value = record.id

        visibleMenu.value = true

        const { data } = await axios.get(`/api/sys/role/menus/${record.id}`)

        checkedMenuKeys.value = data.map((item: any) => item.id)
    } catch (error) {
        console.log(error)
    }
}
const onRelationMenu = async () => {
    try {
        const { msg } = await axios.post<any, any>("/api/sys/role/menus/relation", {
            id: currentId.value,
            menus: checkedMenuKeys.value
        })

        message.success(msg)

        visibleMenu.value = false
    } catch (error) {
        console.log(error)
    }
}

// 分发
const onCommand = ({ key }: any, record: any) => {
    if (key === "onDelete") onDelete(record.id)

    if (key === "onStatus") onDelete(record)

    if (key === "openRelationPrem") openRelationPrem(record)

    if (key === "openRelationMenu") openRelationMenu(record)
}
</script>
