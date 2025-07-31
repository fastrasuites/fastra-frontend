import React, { useState, useEffect, useMemo, useCallback } from "react";
import DashboardHeader from "../../dash/DashboardHeader/DashboardHeader";
import { useTenant } from "../../context/TenantContext";
import { getTenantClient } from "../../services/apiService";
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;
import Swal from "sweetalert2";
import { useHistory } from "react-router-dom";
import { Box, IconButton } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const Change = () => {
  const [state, setState] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const history = useHistory();
  const { tenantData } = useTenant();
  const { tenant_schema_name, access_token, refresh_token } = tenantData || {};

  const client = useMemo(() => {
    return tenant_schema_name && access_token && refresh_token
      ? getTenantClient(tenant_schema_name, access_token, refresh_token)
      : null;
  }, [tenant_schema_name, access_token, refresh_token]);

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const toggleVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handlePasswordChange = useCallback(async () => {
    if (state.new_password !== state.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    if (!PWD_REGEX.test(state.new_password)) {
      setError(
        "Password is too weak. It must include uppercase, lowercase, number, special character, and be 8-24 characters."
      );
      return;
    }

    setError("");
    try {
      const payload = {
        old_password: state.old_password,
        new_password: state.new_password,
      };

      const response = await client.post(
        "company/change-admin-password/",
        payload
      );
      if (response.status === 200) {
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: response.data.detail,
          timer: 2000,
          showConfirmButton: false,
        });
        history.push(`/${tenant_schema_name}/dashboard`);
      }

      setState({
        old_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error ||
          "Failed to change password. Please try again."
      );
      await Swal.fire({
        icon: "error",
        title: "Update Failed",
        text:
          err.response?.data?.error ||
          "Failed to change password. Please try again",
      });
    }
  }, [
    client,
    state.old_password,
    state.new_password,
    state.confirm_password,
    history,
    tenant_schema_name,
  ]);

  useEffect(() => {
    if (
      state.confirm_password.length > 0 &&
      state.new_password !== state.confirm_password
    ) {
      setError("Passwords do not match.");
    } else {
      setError("");
    }
  }, [state.new_password, state.confirm_password]);

  const renderPasswordInput = (name, label, showKey) => (
    <div style={{ position: "relative", marginBottom: "20px" }}>
      <input
        type={showPassword[showKey] ? "text" : "password"}
        className="form-input"
        name={name}
        placeholder={label}
        value={state[name]}
        onChange={handleChange}
        onFocus={(e) => (e.target.style.borderColor = "#007bff")}
        onBlur={(e) => (e.target.style.borderColor = "")}
      />
      <IconButton
        onClick={() => toggleVisibility(showKey)}
        style={{
          position: "absolute",
          top: "50%",
          right: "10px",
          transform: "translateY(-50%)",
        }}
        size="small"
      >
        {showPassword[showKey] ? <VisibilityOff /> : <Visibility />}
      </IconButton>
    </div>
  );

  return (
    <div id="dashboard" className="dash">
      <DashboardHeader title="Home" menuItems={[]} />
      <div className="dashbody">
        <div className="forget-password-container">
          <Box
            p={"40px"}
            bgcolor={"white"}
            boxShadow={"0px 2px 20px 1px rgba(0,0,0,0.22)"}
            borderRadius={"16px"}
            minWidth={"488px"}
          >
            <div className="forget-password-form">
              <h2 className="form-title">Change Password</h2>

              {renderPasswordInput("old_password", "Old password", "old")}
              {renderPasswordInput("new_password", "New password", "new")}
              {renderPasswordInput(
                "confirm_password",
                "Confirm new password",
                "confirm"
              )}

              <button className="submit-button" onClick={handlePasswordChange}>
                Change Password
              </button>

              {error && <p className="error-message">{error}</p>}
            </div>
          </Box>
        </div>
      </div>
    </div>
  );
};

export default Change;
