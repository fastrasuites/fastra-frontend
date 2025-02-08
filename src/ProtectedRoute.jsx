import React from "react";
import { Route, Redirect } from "react-router-dom";
import { useTenant } from "./context/TenantContext";

const ProtectedRoute = ({ component: Component, ...rest }) => {
  const { tenantData } = useTenant();
  const tenant_company_name = tenantData?.tenant_company_name;

  return (
    <Route
      {...rest}
      render={(props) =>
        tenant_company_name ? (
          <Component {...props} />
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );
};

export default ProtectedRoute;
