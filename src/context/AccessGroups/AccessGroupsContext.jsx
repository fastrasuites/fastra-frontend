import React, {
  useState,
  createContext,
  useReducer,
  useContext,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import { useTenant } from "../TenantContext";
import { getTenantClient } from "../../services/apiService";
import { formatApiDate } from "../../helper/helper";
import Swal from "sweetalert2";
import CircularProgress from "@mui/material/CircularProgress";

const initialState = {
  accessGroups: [],
  applications: [],
  modules: {},
  accessRights: [],
  isLoading: false,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, isLoading: true, error: null };
    case "FETCH_APPLICATIONS_SUCCESS":
      return {
        ...state,
        applications: action.payload.applications,
        modules: action.payload.modules,
        accessRights: action.payload.accessRights,
      };
    case "FETCH_ACCESS_GROUPS_SUCCESS":
      return { ...state, accessGroups: action.payload, isLoading: false };
    case "CREATE_ACCESS_GROUP_SUCCESS":
      return {
        ...state,
        accessGroups: [...state.accessGroups, action.payload],
        isLoading: false,
      };
    case "UPDATE_ACCESS_GROUP_SUCCESS":
      return {
        ...state,
        accessGroups: state.accessGroups.map((group) =>
          group.access_code === action.payload.access_code
            ? action.payload
            : group
        ),
        isLoading: false,
      };
    case "OPERATION_FAILURE":
      return { ...state, isLoading: false, error: action.payload };
    default:
      return state;
  }
}

export const AccessGroupsContext = createContext();

export function AccessGroupsProvider({ children }) {
  const { tenantData } = useTenant();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isInitialized, setIsInitialized] = useState(false);

  const { tenant_schema_name, access_token, refresh_token } = tenantData || {};
  const client = useMemo(() => {
    if (!tenant_schema_name || !access_token || !refresh_token) return null;
    return getTenantClient(tenant_schema_name, access_token, refresh_token);
  }, [tenant_schema_name, access_token, refresh_token]);

  // Fetch applications and access rights
  const fetchApplications = useCallback(async () => {
    if (!client) return;

    try {
      dispatch({ type: "FETCH_START" });

      const response = await client.get(`/application/`, {
        baseURL: "https://fastrasuiteapi.com.ng",
      });

      const applications = response.data.applications.map(
        (app) => Object.keys(app)[0]
      );
      const modules = {};

      response.data.applications.forEach((app) => {
        const appName = Object.keys(app)[0];
        modules[appName] = app[appName];
      });

      dispatch({
        type: "FETCH_APPLICATIONS_SUCCESS",
        payload: {
          applications,
          modules,
          accessRights: response.data.access_rights,
        },
      });
      return {
        applications,
        modules,
        accessRights: response.data.access_rights,
      };
    } catch (error) {
      dispatch({ type: "OPERATION_FAILURE", payload: error.message });
      console.error("Error fetching applications:", error);
      throw error;
    }
  }, [client]);

  // Fetch access groups
  const fetchAccessGroups = useCallback(async () => {
    if (!client) return;

    try {
      dispatch({ type: "FETCH_START" });
      const response = await client.get(`/users/access-group-right/`);

      const groupsMap = {};
      response.data.forEach((item) => {
        if (!groupsMap[item.access_code]) {
          groupsMap[item.access_code] = {
            access_code: item.access_code,
            groupName: item.group_name,
            application: item.application.toUpperCase(),
            createdAt: formatApiDate(item.date_created),
            permissions: {},
          };
        }

        if (!groupsMap[item.access_code].permissions[item.application_module]) {
          groupsMap[item.access_code].permissions[item.application_module] = {};
        }
        const right = state.accessRights.find(
          (r) => r.id === item.access_right
        );
        if (right) {
          groupsMap[item.access_code].permissions[item.application_module][
            right.name
          ] = true;
        }
      });

      dispatch({
        type: "FETCH_ACCESS_GROUPS_SUCCESS",
        payload: Object.values(groupsMap),
      });
    } catch (error) {
      dispatch({ type: "OPERATION_FAILURE", payload: error.message });
      Swal.fire("Error", "Failed to fetch access groups", "error");
      throw error;
    }
  }, [client, state.accessRights]);

  // Initialize data
  useEffect(() => {
    const initialize = async () => {
      if (client && !isInitialized) {
        await fetchApplications();
        await fetchAccessGroups();
        setIsInitialized(true);
      }
    };
    initialize();
  }, [client, fetchApplications, fetchAccessGroups, isInitialized]);

  const createAccessGroup = async (newGroup) => {
    if (!client) return;

    try {
      dispatch({ type: "FETCH_START" });

      const payload = {
        application: newGroup.application.toLowerCase(),
        group_name: newGroup.groupName,
        access_rights: Object.entries(newGroup.permissions).map(
          ([module, rights]) => {
            const rightIds = Object.entries(rights)
              .filter(([_, hasAccess]) => hasAccess)
              .map(([rightName]) => {
                const right = state.accessRights.find(
                  (r) => r.name === rightName
                );
                return right ? right.id : null;
              })
              .filter((id) => id !== null);

            return {
              module,
              rights: rightIds,
            };
          }
        ),
      };

      const response = await client.post(`/users/access-group-right/`, payload);

      const access_code = response.data.access_code;

      const createdGroup = {
        access_code,
        groupName: response.data.group_name || newGroup.groupName,
        application: newGroup.application.toUpperCase(),
        createdAt: new Date().toLocaleString(),
        permissions: newGroup.permissions,
      };

      dispatch({
        type: "CREATE_ACCESS_GROUP_SUCCESS",
        payload: createdGroup,
      });

      return access_code;
    } catch (error) {
      dispatch({ type: "OPERATION_FAILURE", payload: error.message });
      Swal.fire("Error", "Failed to create access group", "error");
      throw error;
    }
  };

  const updateAccessGroup = async (access_code, updatedGroup) => {
    if (!client) return;

    try {
      dispatch({ type: "FETCH_START" });

      const payload = {
        application: updatedGroup.application.toLowerCase(),
        group_name: updatedGroup.groupName,
        access_rights: Object.entries(updatedGroup.permissions).map(
          ([module, rights]) => {
            const rightIds = Object.entries(rights)
              .filter(([_, hasAccess]) => hasAccess)
              .map(([rightName]) => {
                const right = state.accessRights.find(
                  (r) => r.name === rightName
                );
                return right ? right.id : null;
              })
              .filter((id) => id !== null);

            return {
              module,
              rights: rightIds,
            };
          }
        ),
      };

      await client.patch(`/users/access-group-right/${access_code}/`, payload);
      await fetchAccessGroups();
      return true;
    } catch (error) {
      dispatch({ type: "OPERATION_FAILURE", payload: error.message });
      Swal.fire("Error", "Failed to update access group", "error");
      throw error;
    }
  };

  return (
    <AccessGroupsContext.Provider
      value={{
        accessGroups: state.accessGroups,
        applications: state.applications,
        modules: state.modules,
        accessRights: state.accessRights,
        isLoading: state.isLoading,
        error: state.error,
        createAccessGroup,
        updateAccessGroup,
        fetchAccessGroups,
      }}
    >
      {state.isLoading && !isInitialized ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <CircularProgress />
        </div>
      ) : (
        children
      )}
    </AccessGroupsContext.Provider>
  );
}

export const useAccessGroups = () => {
  const context = useContext(AccessGroupsContext);
  if (!context) {
    throw new Error(
      "useAccessGroups must be used within an AccessGroupsProvider"
    );
  }
  return context;
};
