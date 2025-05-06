import React from "react";
import { Route, Redirect, useParams } from "react-router-dom";
import { useTenant } from "./context/TenantContext";

const ProtectedRoute = ({ component: Component, ...rest }) => {
  const { tenantData } = useTenant();
  const { tenant } = useParams();

  return (
    <Route
      {...rest}
      render={(props) => {
        if (!tenantData) return <Redirect to="/login" />;
        if (tenant !== tenantData.tenant_schema_name) {
          return (
            <Redirect to={`/${tenantData.tenant_schema_name}/dashboard`} />
          );
        }
        return <Component {...props} />;
      }}
    />
  );
};

export default ProtectedRoute;
