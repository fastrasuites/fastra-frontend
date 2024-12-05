// src/api/authService.js
import axios from "axios";

const BASE_URL = "fastrasuiteapi.com.ng";

export const login = async (tenantName, email, password) => {
  const url = `https://${tenantName}.${BASE_URL}/company/login`;
  const response = await axios.post(url, { email, password });
  return response.data;
};

export const refreshAccessToken = async (tenantName, refreshToken) => {
  const url = `https://${tenantName}.${BASE_URL}/company/token/refresh/`;
  const response = await axios.post(url, { refresh: refreshToken });
  return response.data.access;
};
