import axios from 'axios';
import { ElMessage } from 'element-plus';
import router from '../router';

const request = axios.create({
    baseURL: 'http://localhost:3000',
    timeout: 5000,
    withCredentials: true,
});

// 请求拦截器
request.interceptors.request.use(
    (config) => {
        // 从 localStorage 获取 token
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 响应拦截器
request.interceptors.response.use(
    (response) => {
        // 如果响应是文件流，直接返回
        if (response.config.responseType === 'blob') {
            return response;
        }
        // 正常响应直接返回数据
        return response.data;
    },
    (error) => {
        if (error.response) {
            const { status, data } = error.response;
            switch (status) {
                case 401:
                    // 清除 token 并跳转到登录页
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    // 如果不是登录页面，才跳转
                    if (router.currentRoute.value.path !== '/login') {
                        router.push({
                            path: '/login',
                            query: { redirect: router.currentRoute.value.fullPath }
                        });
                    }
                    break;
                case 403:
                    ElMessage.error('没有权限访问该资源');
                    break;
                case 404:
                    ElMessage.error('请求的资源不存在');
                    break;
                case 500:
                    ElMessage.error('服务器内部错误');
                    break;
                default:
                    ElMessage.error(data.message || '未知错误');
            }
        } else if (error.request) {
            ElMessage.error('网络错误，请检查您的网络连接');
        } else {
            ElMessage.error('请求配置错误');
        }
        return Promise.reject(error);
    }
);

export default request; 