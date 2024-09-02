import React, { useState } from "react";
import { FaBars, FaTimes, FaBell } from "react-icons/fa";
import SearchIcon from "../image/search.svg";
import "./Contact.css";
import admin from "../image/admin.svg";
import ConCard from "./ConCard";
import { Link } from "react-router-dom";

export default function Contact() {
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState(0);
  const [showMenu, setShowMenu] = useState(false);


  const handleSearch = () => {
    // You can perform search operations here based on the search query
    // For example, you can filter a list of items based on the search query
  };
  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };
  return (
    <div id="contact" className="con">
      <div className="conhead">
        <ul className="conwrap">
          <li className="conhom" onClick={toggleMenu}>
            {showMenu ? (
              <FaTimes className="conav" />
            ) : (
              <FaBars className="conav" />
            )}
            <p>Contact</p>
          </li>
          <li className="consash">
            <div className="consashtag">
              <label
                htmlFor="searchInput"
                className="consarch"
                onClick={handleSearch}
              >
                <img src={SearchIcon} alt="Search" className="consashnav" />
                <input
                  id="searchInput"
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="consashput"
                />
              </label>
            </div>
          </li>
          <li className="conlert">
            <div className="conbell-icon-container">
              <FaBell className="conbell-icon" />
              {notifications > 0 && (
                <span className="conotification-count">{notifications}</span>
              )}
            </div>
          </li>
          <li className="condmin">
            <img src={admin} alt="admin" className="condminimg" />
            <div className="codminname">
              <p className="cond1">Administrator</p>
              <p className="cond2">info@companyname.com</p>
            </div>
          </li>
        </ul>
      </div>
      <div className={`navli ${showMenu ? "active" : ""}`}>
        <Link
          to="/dashboard"
          className="navig"
          onClick={() => setShowMenu(false)}
        >
          Home
        </Link>
        <Link
          to="/contact"
          className="navig"
          onClick={() => setShowMenu(false)}
        >
          Contact
        </Link>
        <Link
          to="/settings"
          className="navig"
          onClick={() => setShowMenu(false)}
        >
          Setting
        </Link>
      </div>
      <div className="conbody">
        <div className="conbod"></div>
        <div className="concard">
          <ConCard />
        </div>
      </div>
    </div>
  );
}
