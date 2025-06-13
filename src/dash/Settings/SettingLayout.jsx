// SettingsLayout.js
import React from "react";
import { Switch, Route, useRouteMatch, Redirect } from "react-router-dom";

import SetHead from "./settingsHeader/Sethead";
import Apk from "../App/Apk";
import Company from "./company/Company";
import User from "./user/User";
import CreateUser from "./user/UserForms/CreateUser";
import AccessGroups from "./accessgroups/AccessGroups";

const SettingsLayout = () => {
  const { path } = useRouteMatch();

  return (
    <div className="settings-page" id="settings">
      <SetHead />

      <Switch>
        {/* Redirect /settings → /settings/apk */}
        <Redirect exact from={path} to={`${path}/apk`} />

        {/* Settings sections */}
        <Route exact path={`${path}/apk`} component={Apk} />
        <Route exact path={`${path}/company`} component={Company} />

        {/* User sub–routes */}
        <Route exact path={`${path}/user`} component={User} />
        <Route exact path={`${path}/user/new`} component={CreateUser} />

        {/* Access-groups */}
        <Route exact path={`${path}/accessgroups`} component={AccessGroups} />

        {/* Fallback for any unhandled /settings/* URL */}
        <Redirect to={`${path}/apk`} />
      </Switch>
    </div>
  );
};

export default SettingsLayout;
