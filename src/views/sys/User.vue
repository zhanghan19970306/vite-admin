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

        <template #roles="{ record }">
            <a-tag v-for="role in record.roles" :color="role.color">{{ role.name }}</a-tag>
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

            <a @click="onDelete(record)">删除</a>
            <a-divider type="vertical" />

            <a-dropdown placement="bottomRight">
                <a class="ant-dropdown-link">更多</a>
                <template #overlay>
                    <a-menu @click="onCommand($event, record)">
                        <a-menu-item key="openGiveRole">赋予角色</a-menu-item>
                        <a-menu-item key="onResetPas">重置密码</a-menu-item>
                    </a-menu>
                </template>
            </a-dropdown>
        </template>
    </a-table>

    <a-modal v-model:visible="visible" :title="title" @ok="handleOk">
        <a-form :label-col="{ span: 7 }" :wrapper-col="{ span: 14 }">
            <a-form-item label="用户名称" v-bind="validateInfos.userName">
                <a-input v-model:value.trim="modelRef.userName" />
            </a-form-item>

            <a-form-item label="手机号码" v-bind="validateInfos.mobile">
                <a-input v-model:value.trim="modelRef.mobile" />
            </a-form-item>

            <a-form-item label="E-mail" v-bind="validateInfos.email">
                <a-input v-model:value.trim="modelRef.email" />
            </a-form-item>

            <a-form-item v-show="type === 'create'" label="用户密码" v-bind="validateInfos.password">
                <a-input v-model:value.trim="modelRef.password" />
            </a-form-item>

            <a-form-item v-show="type === 'create'" label="二次确认密码" v-bind="validateInfos.password2">
                <a-input v-model:value.trim="modelRef.password2" />
            </a-form-item>

            <a-form-item label="用户状态" v-bind="validateInfos.isEnable">
                <a-switch checked-children="启用" un-checked-children="禁用" v-model:checked="modelRef.isEnable" />
            </a-form-item>
        </a-form>
    </a-modal>

    <a-modal v-model:visible="visible2" title="赋予角色" @ok="handleOk2">
        <a-form :label-col="{ span: 7 }" :wrapper-col="{ span: 14 }">
            <a-form-item label="用户角色" v-bind="validateInfos2.roleIds">
                <a-select mode="multiple" placeholder="选择角色" v-model:value="modelRef2.roleIds">
                    <a-select-option v-for="item in roles" :key="item" :value="item.id">
                        {{ item.name }}
                    </a-select-option>
                </a-select>
            </a-form-item>
        </a-form>
    </a-modal>
</template>

<script setup lang="ts">
import { computed, createVNode, reactive, ref } from "vue"
import { useForm } from "@ant-design-vue/use"
import axios from "@/utils/request"
import { message, Modal } from "ant-design-vue"
import { ExclamationCircleOutlined, PlusOutlined, MinusCircleOutlined } from "@ant-design/icons-vue"

const formatRole = (roles: any) => roles.map((item: any) => item.name).toString()

const columns = ref([
    {
        title: "用户名称",
        dataIndex: "userName"
    },
    {
        title: "用户角色",
        dataIndex: "roles",
        slots: { customRender: "roles" }
    },
    {
        title: "登陆账号",
        dataIndex: "loginName"
    },
    {
        title: "E-mail",
        dataIndex: "email"
    },
    {
        title: "手机号",
        dataIndex: "mobile"
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

const dataSource = ref([])
const loading = ref(false)
const isSubmitIng = ref(false)

/**
 * 获取分页 数据列表
 */
const getTableData = async () => {
    try {
        loading.value = true

        const { data } = await axios.get<any, any>("/api/sys/user")

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
const title = computed(() => (type.value === "create" ? "新增用户" : "编辑用户"))
const modelRef = reactive({
    id: "",
    userName: "",
    email: "",
    mobile: "",
    password: "",
    password2: "",
    isEnable: true
})

const rulesRef = reactive({
    userName: [
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
        modelRef.userName = record.userName
        modelRef.email = record.email
        modelRef.mobile = record.mobile
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
            const result = await axios.post<any, any>("/api/sys/user", { ...modelRef })
            msg = result.msg
        } else {
            const result = await axios.patch<any, any>(`/api/sys/user/${modelRef.id}`, { ...modelRef })
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

const onDelete = async (record: any) => {
    try {
        Modal.confirm({
            title: "确定删除该用户?",
            icon: createVNode(ExclamationCircleOutlined),
            async onOk() {
                const { msg } = await axios.delete<any, any>(`/api/sys/user/${record.id}`)

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
 * 赋予角色
 */
const roles = ref([])
const getRoles = async () => {
    try {
        const { data } = await axios.get<any, any>("/api/sys/role")
        roles.value = data
    } catch (error) {
        console.log(error)
    }
}
getRoles()

const visible2 = ref(false)
const modelRef2 = reactive({
    id: "",
    roleIds: []
})
const rulesRef2 = reactive({
    roleIds: [
        {
            required: true,
            type: "array",
            min: 1,
            message: "请选择用户角色",
            target: "change"
        }
    ]
})
const { resetFields: resetFields2, validate: validate2, validateInfos: validateInfos2 } = useForm(modelRef2, rulesRef2)

const openGiveRole = (record: any) => {
    modelRef2.id = record.id

    modelRef2.roleIds = record.roles.length > 0 ? record.roles.map((item: any) => item.id) : []

    console.log(modelRef2.roleIds)

    visible2.value = true
}

const handleOk2 = async () => {
    try {
        const { data } = await axios.post<any, any>("/api/sys/user/giveRole", { ...modelRef2 })

        getTableData()

        visible2.value = false
    } catch (error) {
        console.log(error)
    }
}

const onResetPas = async ({ id }: any) => {
    try {
        const { data } = await axios.patch<any, any>(`/api/sys/user/resetPwd/${id}`)

        getTableData()
    } catch (error) {
        console.log(error)
    }
}

// 分发
const onCommand = ({ key }: any, record: any) => {
    if (key === "openGiveRole") openGiveRole(record)
    if (key === "onResetPas") onResetPas(record)
}
</script>
