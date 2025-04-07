import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import "./Setting.css";
import Apk from "../App/Apk";
import Sethead from "./Sethead";
import User from "./user/User";
import Company from "./company/Company";
import AccessGroups from "./accessgroups/AccessGroups";
import { useTenant } from "../../context/TenantContext";

const Settings = () => {
  const tenant_schema_name = useTenant().tenantData?.tenant_schema_name;
  return (
    <Router>
      <div className="settings-page" id="settings">
        <Sethead />
        <Switch>
          <Route path={`/${tenant_schema_name}/apk`} component={Apk} />
          <Route path={`/${tenant_schema_name}/company`} component={Company} />
          <Route path={`/${tenant_schema_name}/user`} component={User} />
          <Route
            path={`/${tenant_schema_name}/accessgroups`}
            component={AccessGroups}
          />
        </Switch>
      </div>
    </Router>
  );
};
export default Settings;
