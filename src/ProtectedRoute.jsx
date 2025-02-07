import React from "react";
import { Route, Redirect } from "react-router-dom";
import { useTenant } from "./context/TenantContext";

const ProtectedRoute = ({ component: Component, ...rest }) => {
  const { tenantData } = useTenant();

  return (
    <Route
      {...rest}
      render={(props) =>
        tenantData ? <Component {...props} /> : <Redirect to="/login" />
      }
    />
  );
};

export default ProtectedRoute;
