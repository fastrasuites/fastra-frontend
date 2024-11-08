import React from "react";
import { Link } from "react-router-dom";
import "./NotFound.css"; 
import notFoundImg from "./404.png";

const NotFound = () => {
  return (
    <div className="not-found-container">
      <img src={notFoundImg} alt="notfound" className="notFoundImg" />
      <h1>Page Not Found</h1>
      <p>We're sorry the page you requested could not be found. <br /> Please go back to homepage</p>
      <Link to="/" >
       <button className="home-link"> Go Home</button>
      </Link>
    </div>
  );
};

export default NotFound;
