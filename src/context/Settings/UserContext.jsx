import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from "react";
import { useTenant } from "../TenantContext";
import { getTenantClient } from "../../services/apiService";

// Create context
const UserContext = createContext(null);

// Validation utilities
const validateUserData = (data) => {
  const errors = {};
  if (!data.name) {
    errors.name = "Name is required";
  }
  if (!data.email) {
    errors.email = "Email is required";
  }
  if (!data.role) {
    errors.role = "Role is required";
  }
  if (!data.phone_number) {
    errors.phone_number = "Phone number is required";
  }
  return errors;
};

const validateChangePasswordData = (data) => {
  const errors = {};
  if (data.new_password !== data.confirm_password) {
    errors.confirm_password = "Passwords do not match";
  }
  if (!data.old_password) {
    errors.old_password = "Old password is required";
  }
  if (!data.new_password) {
    errors.new_password = "New password is required";
  }
  return errors;
};

export const UserProvider = ({ children }) => {
  const { tenantData } = useTenant();
  const [userList, setUserList] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [singleUser, setSingleUser] = useState(null);
  const [accessGroups, setAccessGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { tenant_schema_name, access_token, refresh_token } = tenantData || {};
  const client = useMemo(() => {
    if (!tenant_schema_name || !access_token || !refresh_token) return null;
    return getTenantClient(tenant_schema_name, access_token, refresh_token);
  }, [tenant_schema_name, access_token, refresh_token]);

  const getUserList = useCallback(
    async (search = "") => {
      if (!client) {
        setError("API client not initialized.");
        return;
      }
      setIsLoading(true);
      try {
        const query = search ? `?search=${encodeURIComponent(search)}` : "";
        const { data: rawData } = await client.get(
          `/users/tenant-users/${query}`
        );
        setUserList(rawData);
        setError(null);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load users");
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  const getUserListForForm = useCallback(async () => {
    if (!client) {
      setError("API client not initialized.");
      return;
    }
    setIsLoading(true);
    try {
      const { data: rawData } = await client.get(
        `/users/tenant-users/?form=true`
      );
      setUserList(rawData);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load users");
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  const getGroups = useCallback(async () => {
    if (!client) {
      setError("API client not initialized.");
      return;
    }
    setIsLoading(true);
    try {
      const { data: rawData } = await client.get(`/users/groups/`);
      setUserGroups(rawData);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load users");
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  const getSingleUser = useCallback(
    async (id) => {
      if (!client) {
        const msg = "API client not initialized.";
        setError(msg);
        return Promise.reject(new Error(msg));
      }
      setIsLoading(true);
      try {
        const { data } = await client.get(`/users/tenant-users/${id}/`);
        setSingleUser(data);
        setError(null);
        return { success: true, data };
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load user");
        return Promise.reject(err);
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );
  const createUser = useCallback(
    async (formData) => {
      if (!client) {
        throw new Error("API client not initialized.");
      }

      setIsLoading(true);
      try {
        // Don't set Content-Type header - the browser will set it automatically
        // with the proper multipart/form-data boundary
        const { data } = await client.post(`/users/tenant-users/`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          transformRequest: [(data /*, headers*/) => data],
        });

        setUserList((prev) => [...prev, data]);
        setError(null);
        return { success: true, data };
      } catch (err) {
        console.error("User creation error:", err);
        let errorMessage = "Failed to create user";

        if (err.response) {
          // Handle server validation errors
          if (err.response.data) {
            errorMessage = Object.entries(err.response.data)
              .map(([key, value]) => `${key}: ${value}`)
              .join("\n");
          } else {
            errorMessage =
              err.response.statusText || `HTTP error ${err.response.status}`;
          }
        } else if (err.request) {
          errorMessage = "No response from server";
        } else {
          errorMessage = err.message;
        }

        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  const updateUser = useCallback(
    async (id, userData) => {
      if (!client) {
        throw new Error("API client not initialized.");
      }
      const errors = validateUserData(userData);
      if (Object.keys(errors).length > 0) {
        throw { validation: errors };
      }
      setIsLoading(true);
      try {
        const { data } = await client.put(
          `/users/tenant-users/${id}/`,
          userData
        );
        setUserList((prev) => prev.map((usr) => (usr.id === id ? data : usr)));
        setError(null);
        return { success: true, data };
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to update user");
        return { success: false, error: err.message };
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  const patchUser = useCallback(
    async (id, userData) => {
      if (!client) {
        throw new Error("API client not initialized.");
      }
      setIsLoading(true);
      try {
        const { data } = await client.patch(
          `/users/tenant-users/edit/${id}/`,
          userData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            transformRequest: [(data /*, headers*/) => data],
          }
        );
        setUserList((prev) => prev.map((usr) => (usr.id === id ? data : usr)));
        setError(null);
        return { success: true, data };
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to patch user");
        return { success: false, error: err.message };
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  const changePassword = useCallback(
    async (passwordData) => {
      if (!client) {
        throw new Error("API client not initialized.");
      }
      const errors = validateChangePasswordData(passwordData);
      if (Object.keys(errors).length > 0) {
        throw { validation: errors };
      }
      setIsLoading(true);
      try {
        const { data } = await client.post(
          `/users/tenant-users/change-password`,
          passwordData
        );
        setError(null);
        return { success: true, data };
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to change password");
        return { success: false, error: err.message };
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  const resetPassword = useCallback(
    async (email) => {
      if (!client) {
        throw new Error("API client not initialized.");
      }
      setIsLoading(true);
      try {
        const { data } = await client.post(
          `/users/tenant-users/reset-password`,
          { email }
        );
        setError(null);
        return { success: true, data };
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to reset password");
        return { success: false, error: err.message };
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  const getAccessGroups = useCallback(async () => {
    if (!client) {
      setError("API client not initialized.");
      return;
    }
    setIsLoading(true);
    try {
      const { data } = await client.get(
        `/users/access-group-rights/access-groups/`
      );
      setAccessGroups(data);
      setError(null);
      return { success: true, data };
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load access groups");
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, [client]);
  const contextValue = useMemo(
    () => ({
      userList,
      userGroups,
      singleUser,
      accessGroups,
      isLoading,
      error,
      getUserList,
      getUserListForForm,
      getSingleUser,
      createUser,
      updateUser,
      patchUser,
      changePassword,
      resetPassword,
      getAccessGroups,
      getGroups,
    }),
    [
      userList,
      userGroups,
      singleUser,
      accessGroups,
      isLoading,
      error,
      getUserList,
      getUserListForForm,
      getSingleUser,
      createUser,
      updateUser,
      patchUser,
      changePassword,
      resetPassword,
      getAccessGroups,
      getGroups,
    ]
  );

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
