// SettingsLayout.js
import React from "react";
import { Switch, Route, useRouteMatch, Redirect } from "react-router-dom";

import SetHead from "./settingsHeader/Sethead";
import Apk from "../App/Apk";
import Company from "./company/Company";
import User from "./user/User";
import CreateUser from "./user/UserForms/CreateUser";
import AccessGroups from "./accessgroups/AccessGroups";

import ViewAccessGroup from "./accessgroups/ViewAccessGroup";
import EditAccessGroup from "./accessgroups/EditAccessGroup";
import CreateAccessGroup from "./accessgroups/CreateAccessGroup";
import UserInfo from "./user/UserInfo/UserInfo";
import NewCompany from "./company/CompanyForm/NewCompanyForm";

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
        <Route exact path={`${path}/company/new`} component={NewCompany} />

        {/* User sub–routes */}
        <Route exact path={`${path}/user`} component={User} />
        <Route exact path={`${path}/user/new`} component={CreateUser} />
        <Route exact path={`${path}/user/:id`} component={UserInfo} />

        {/* Access-groups */}
        <Route exact path={`${path}/accessgroups`} component={AccessGroups} />
        <Route
          exact
          path={`${path}/accessgroups/new`}
          component={CreateAccessGroup}
        />
        <Route
          exact
          path={`${path}/accessgroups/:id`}
          component={ViewAccessGroup}
        />
        <Route
          exact
          path={`${path}/accessgroups/:id/edit`}
          component={EditAccessGroup}
        />

        {/* Fallback for any unhandled /settings/* URL */}
        <Redirect to={`${path}/apk`} />
      </Switch>
    </div>
  );
};

export default SettingsLayout;
