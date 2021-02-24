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

        <template #operation="{ record }">
            <a @click="openDialog(record)">修改</a>
            <a-divider type="vertical" />

            <a @click="onDelete(record)">删除</a>
        </template>
    </a-table>

    <a-modal v-model:visible="visible" :title="title" @ok="handleOk">
        <a-form :label-col="{ span: 7 }" :wrapper-col="{ span: 14 }">
            <a-form-item label="权限名称" v-bind="validateInfos.name">
                <a-input v-model:value.trim="modelRef.name" />
            </a-form-item>
            <a-form-item label="权限标识" v-bind="validateInfos.code">
                <a-input v-model:value.trim="modelRef.code" />
            </a-form-item>

            <a-divider dashed>子级权限</a-divider>
            <a-form-item v-for="(item, index) in modelRef.children" :key="index" :wrapper-col="{ span: 20, offset: 2 }">
                <a-row :gutter="8">
                    <a-col :span="10">
                        <a-input v-model:value.trim="item.name" placeholder="权限名称" />
                    </a-col>
                    <a-col :span="10">
                        <!-- :addon-before="modelRef.code + '.'" -->
                        <a-input v-model:value.trim="item.code" placeholder="权限标识" />
                    </a-col>
                    <a-col :span="4">
                        <a-button @click="onRemoveChildrenPrem(index)"> <MinusCircleOutlined /></a-button>
                    </a-col>
                </a-row>
            </a-form-item>

            <a-form-item :wrapperCol="{ span: 20, offset: 2 }">
                <a-space>
                    <a-button
                        type="dashed"
                        :disabled="modelRef.name === '' || modelRef.code === ''"
                        @click="onAddChildrenPrem"
                    >
                        <template #icon>
                            <PlusOutlined />
                        </template>
                        新增子级权限
                    </a-button>

                    <a-button
                        type="dashed"
                        :disabled="modelRef.name === '' || modelRef.code === ''"
                        @click="onAddChildrenPremBase"
                    >
                        <template #icon>
                            <PlusOutlined />
                        </template>
                        新增CURD权限
                    </a-button>
                </a-space>
            </a-form-item>
            <!-- <a-form-item label="权限描述" v-bind="validateInfos.description">
                <a-textarea v-model:value="modelRef.description" />
            </a-form-item> -->
            <!-- <a-form-item label="状态" v-bind="validateInfos.isEnable">
                <a-switch checked-children="启用" un-checked-children="禁用" v-model:checked="modelRef.isEnable" />
            </a-form-item> -->
        </a-form>
    </a-modal>
</template>

<script setup lang="ts">
import { computed, createVNode, reactive, ref } from "vue"
import { useForm } from "@ant-design-vue/use"
import axios from "@/utils/request"
import { message, Modal } from "ant-design-vue"
import { ExclamationCircleOutlined, PlusOutlined, MinusCircleOutlined } from "@ant-design/icons-vue"

const columns = ref([
    {
        title: "权限名",
        dataIndex: "name"
    },
    {
        title: "权限标识",
        dataIndex: "code"
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

/**
 * 获取分页 数据列表
 */
const getTableData = async () => {
    try {
        loading.value = true

        const { data } = await axios.get<any, any>("/api/sys/permission/tree")

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
 * 新增 或 编辑
 */
const isSubmitIng = ref(false)
const dataSource = ref([])
const visible = ref(false)
const type = ref("create")
const title = computed(() => (type.value === "create" ? "新增权限" : "编辑权限"))
const modelRef = reactive<any>({
    id: "",
    name: "",
    code: "",
    children: []
})
const rulesRef = reactive({
    name: [
        {
            required: true,
            message: "请填写权限名",
            target: "blur"
        }
    ],
    code: [
        {
            required: true,
            message: "请填写权限标识",
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
        modelRef.code = record.code
        modelRef.children = [...record.children]
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
            const result = await axios.post<any, any>("/api/sys/permission", { ...modelRef })
            msg = result.msg
        } else {
            const result = await axios.put<any, any>(`/api/sys/permission`, { ...modelRef })
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
            title: "确定删除该条权限?",
            icon: createVNode(ExclamationCircleOutlined),
            async onOk() {
                const { msg } = await axios.delete<any, any>(`/api/sys/permission/${record.id}`)

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
 * 添加子级权限条目
 */
const onAddChildrenPrem = () => {
    modelRef.children.push({
        id: "",
        name: "",
        code: `${modelRef.code}.`,
        children: []
    })
}

/**
 * 添加CURD权限条目
 */
const onAddChildrenPremBase = () => {
    modelRef.children.push(
        {
            id: "",
            name: "新增",
            code: `${modelRef.code}.create`,
            children: []
        },
        {
            id: "",
            name: "修改",
            code: `${modelRef.code}.update`,
            children: []
        },
        {
            id: "",
            name: "查询",
            code: `${modelRef.code}.retrieve`,
            children: []
        },
        {
            id: "",
            name: "删除",
            code: `${modelRef.code}.delete`,
            children: []
        }
    )
}

/**
 * 移除一项子级权限条目
 */
const onRemoveChildrenPrem = (index: number) => modelRef.children.splice(index, 1)
</script>
