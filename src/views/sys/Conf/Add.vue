<template>
    <a-modal v-model:visible="visible" title="新增参数" @ok="handleOk">
        <a-form :label-col="{ span: 7 }" :wrapper-col="{ span: 14 }">
            <a-form-item label="参数名" v-bind="validateInfos.key">
                <a-input v-model:value.trim="modelRef.key" />
            </a-form-item>

            <a-form-item label="参数值" v-bind="validateInfos.value">
                <a-input v-model:value.trim="modelRef.value" />
            </a-form-item>

            <a-form-item label="参数描述" v-bind="validateInfos.description">
                <a-textarea v-model:value.trim="modelRef.description" />
            </a-form-item>

            <a-form-item label="状态" v-bind="validateInfos.isEnable">
                <a-switch checked-children="启用" un-checked-children="禁用" v-model:checked="modelRef.isEnable" />
            </a-form-item>
        </a-form>
    </a-modal>
</template>

<script langt="ts">
import { ref, reactive, useContext, defineComponent } from "vue"
import { useForm } from "@ant-design-vue/use"
import axios from "@/utils/request.ts"
import { message } from "ant-design-vue"

export default defineComponent({
    setup() {
        const { emit } = useContext()

        const isSubmitIng = ref(false)

        const visible = ref(false)
        const open = () => (visible.value = true)

        const modelRef = reactive({
            key: "",
            value: "",
            description: "",
            isEnable: true
        })

        const rulesRef = reactive({
            key: [
                {
                    required: true,
                    message: "请填写参数名",
                    target: "blur"
                }
            ],
            value: [
                {
                    required: true,
                    message: "请填写参数值",
                    target: "blur"
                }
            ]
        })

        const { resetFields, validate, validateInfos } = useForm(modelRef, rulesRef)

        const handleOk = async () => {
            try {
                isSubmitIng.value = true

                await validate()

                const { msg } = await axios.post("/api/sys/conf", { ...modelRef })

                // 成功反馈
                message.success(msg)

                emit("finish")

                visible.value = false
            } catch (error) {
                console.log(error)
            } finally {
                isSubmitIng.value = false
            }
        }

        return {
            visible,
            open,
            modelRef,
            validateInfos,
            handleOk
        }
    }
})
</script>
