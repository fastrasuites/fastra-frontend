import React from "react";
import { Route, Redirect } from "react-router-dom";
import { useTenant } from "./context/TenantContext";

const ProtectedRoute = ({ component: Component, ...rest }) => {
  const { tenantData } = useTenant();
  const tenant_schema_name = tenantData?.tenant_schema_name;

  return (
    <Route
      {...rest}
      // path={`/${tenant_schema_name}${rest.path}`}
      render={(props) =>
        tenant_schema_name ? <Component {...props} /> : <Redirect to="/login" />
      }
    />
  );
};

export default ProtectedRoute;
