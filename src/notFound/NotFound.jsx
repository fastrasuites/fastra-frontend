import React from "react";
import { Link } from "react-router-dom";
import "./NotFound.css";
import notFoundImg from "./404.png";
import Navbar404 from "./404Header";
import { useTenant } from "../context/TenantContext";

const NotFound = () => {
  const { tenantData } = useTenant();
  const tenant_schema_name = tenantData?.tenant_schema_name;
  return (
    <div className="navbar404">
      <Navbar404 />
      <div className="not-found-container">
        <img src={notFoundImg} alt="notfound" className="notFoundImg" />
        <h1>Page Not Found</h1>
        <p>
          We're sorry the page you requested could not be found. <br /> Please
          go back to homepage
        </p>
        <Link to={`/${tenant_schema_name}/dashboard`}>
          <button className="home-link"> Go Home</button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
