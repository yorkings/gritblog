// api.ts (clean version)
import axios from "axios";
import { AuthStore } from "./AuthStore";

export const Api = axios.create({
  baseURL: import.meta.env.VITE_SPRING_API_URL,
  timeout: 5000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
  config: any;
}> = [];

const processQueue = (error: any, tokenRefreshed: boolean) => {
  failedQueue.forEach(({ resolve, reject, config }) => {
    if (tokenRefreshed) {
      resolve(Api(config));
    } else {
      reject(error);
    }
  });
  failedQueue = [];
};

Api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    if (originalRequest.url === "/auth/refresh") {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject, config: originalRequest });
      });
    }

    isRefreshing = true;

    try {
      const refreshed = await AuthStore.getState().refreshToken();
      isRefreshing = false;

      if (refreshed) {
        processQueue(null, true);
        return Api(originalRequest);
      } else {
        processQueue(error, false);
        return Promise.reject(error);
      }
    } catch (refreshError) {
      isRefreshing = false;
      processQueue(refreshError, false);

      AuthStore.getState().logout();
      window.location.href = "/login";

      return Promise.reject(refreshError);
    }
  }
);
