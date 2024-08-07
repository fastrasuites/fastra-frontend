import axios from "axios";

const BASE_URL = "https://fastrav1-production.up.railway.app";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// In api.js

export const registerTenant = async (data) => {
  try {
    const response = await api.post("/register/", data);
    console.log("Registration API response:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Registration API error:",
      error.response ? error.response.data : error
    );
    throw error.response ? error.response.data : error;
  }
};
export const verifyEmail = async (token) => {
  try {
    const response = await api.get(`/email-verify/?token=${token}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};
export const login = async (username, password) => {
  try {
    const response = await api.post("/login/", { username, password });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data;
    } else {
      throw error;
    }
  }
};



export const requestPasswordReset = async (email) => {
  try {
    const response = await api.post("/request-password-reset/", { email });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export default api;
