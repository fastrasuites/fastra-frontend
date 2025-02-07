import axios from "axios";
import { useTenant } from "../context/TenantContext";

const createTenantAwareClient = (tenant, access_token) => {
  const client = axios.create({
    baseURL: `https://${tenant}.fastrasuiteapi.com.ng`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access_token}`,
    },
  });

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        const { refresh_token } = useTenant().tenantData;
        const response = await axios.post(
          `https://fastrasuiteapi.com.ng/refresh-token/`,
          { refresh_token }
        );
        const newAccessToken = response.data.access_token;
        localStorage.setItem("access_token", newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return client(originalRequest);
      }
      return Promise.reject(error);
    }
  );

  return client;
};

export const getTenantClient = (tenant, access_token) => {
  return createTenantAwareClient(tenant, access_token);
};
