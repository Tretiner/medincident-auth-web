import axios from "axios";
import { getZitadelAccessToken } from "./access-token";
import { env } from "@/config/env";

export const zitadelApi = axios.create({
    baseURL: env.ZITADEL_API_URL,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
});

zitadelApi.interceptors.request.use(
    async (config) => {
        console.log(config.url)
        const token = await getZitadelAccessToken();
        config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);