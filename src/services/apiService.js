import axios from "axios";

const createTenantAwareClient = (tenant, access_token, refresh_token) => {
  const client = axios.create({
    baseURL: `https://${tenant}.fastrasuiteapi.com.ng`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access_token}`,
    },
  });

  // Add a Request Interceptor to always use fresh token
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Only handle 401 errors and prevent infinite loops
      if (error.response?.status === 401) {
        if (window.location.pathname === "/login") return Promise.reject(error);

        if (!originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Refresh token request
            const response = await axios.post(
              `https://${tenant}.fastrasuiteapi.com.ng/company/token/refresh/`,
              // "https://fastrasuiteapi.com.ng/company/token/refresh/",
              { refresh: refresh_token }
            );

            const newAccessToken = response.data.access;

            // Update tokens in storage
            localStorage.setItem("access_token", newAccessToken);

            // Update the current request headers
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            // Update client instance for future requests
            // client.defaults.headers.Authorization = `Bearer ${newAccessToken}`;
            client.defaults.headers.common[
              "Authorization"
            ] = `Bearer ${newAccessToken}`;

            return client(originalRequest);
          } catch (refreshError) {
            console.error("Refresh token failed:", refreshError);
            localStorage.removeItem("access_token");
            window.location.href = "/login";
            return Promise.reject(refreshError);
          }
        }
      }
      return Promise.reject(error);
    }
  );

  return client;
};

export const getTenantClient = (tenant, access_token, refresh_token) => {
  return createTenantAwareClient(tenant, access_token, refresh_token);
};
