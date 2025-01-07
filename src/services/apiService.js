import axios from "axios";

// Create an Axios instance configured for tenant-aware API calls
const createTenantAwareClient = (tenant, access_token) => {
  return axios.create({
    baseURL: `https://${tenant}.fastrasuiteapi.com.ng`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access_token}`, // Add the Authorization header
    },
  });
};

// Export the function to get the client
export const getTenantClient = (tenant, access_token) => {
  return createTenantAwareClient(tenant, access_token);
};
