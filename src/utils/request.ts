import axios, { AxiosResponse } from "axios"

interface ResponseBasic<T = any> {
    code: number
    msg: string
    data: T
}

// 响应拦截器
axios.interceptors.response.use(
    (response) => {
        // 获取到原始数据
        const res = response.data

        // 文件流
        if (!response.headers["content-type"].includes("json")) {
            return Promise.resolve(res)
        }

        // 业务错误
        if (res.code !== 0) {
            return Promise.reject(res)
        }

        // 正常返回
        return Promise.resolve(res)
    },
    (error) => Promise.reject(error)
)

export default axios
