import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import "./Setting.css";
import Apk from "../App/Apk";
import Sethead from "./Sethead";
import User from "./user/User";
import Company from "./company/Company";

const Settings = () => {
  return (
    <Router>
      <div className="settings-page" id="settings">
        <Sethead />
        <Switch>
          <Route path="/apk" component={Apk} />
          <Route path="/company" component={Company} />
          <Route path="/user" component={User} />
        </Switch>
      </div>
    </Router>
  );
};

export default Settings;
