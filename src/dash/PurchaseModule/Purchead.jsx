import React, { useState } from "react";
import { FaBars, FaTimes, FaBell } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";
import "./Purchead.css";
import admin from "../../image/admin.svg";
import { NavLink } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import ProfileMenuDropdown from "../../components/ProfileMenuDropdown";

export default function Purchead() {
  const [notifications, setNotifications] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [showVendorDropdown, setShowVendorDropdown] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const handleLinkClick = () => {
    setShowMenu(false);
    setShowVendorDropdown(false);
    setShowProductDropdown(false);
  };

  const toggleVendorDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowVendorDropdown(!showVendorDropdown);
  };

  const toggleProductDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowProductDropdown(!showProductDropdown);
  };

  return (
    <div className="purhead">
      <ul className="purwrap">
        <li className="purhom" onClick={toggleMenu}>
          {showMenu ? (
            <FaTimes className="purnav" />
          ) : (
            <FaBars className="purnav" />
          )}
          <p>Purchase</p>
        </li>
        <li className="purlst">
          <div className="purlist">
            <NavLink
              exact
              to="/purchase"
              className="purst"
              activeClassName="active"
              onClick={handleLinkClick}
            >
              Purchase Requests
            </NavLink>
            <NavLink
              exact
              to="/rfq"
              className="purst"
              activeClassName="active"
              onClick={handleLinkClick}
            >
              RFQs
            </NavLink>
            <NavLink
              exact
              to="/pod"
              className="purst"
              activeClassName="active"
              onClick={handleLinkClick}
            >
              Purchase Orders
            </NavLink>
            <div
              className="prodrop"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <NavLink
                exact
                to="/vend"
                className="purst"
                activeClassName="active"
                onClick={handleLinkClick}
              >
                Vendor
              </NavLink>
              <IoIosArrowDown
                className="ardan"
                onClick={toggleVendorDropdown}
              />
              {showVendorDropdown && (
                <div className="prolst">
                  <NavLink
                    to="/varcat"
                    className="dropdownlink"
                    onClick={handleLinkClick}
                  >
                    Vendor Category
                  </NavLink>
                </div>
              )}
            </div>
            <div
              className="prodrop"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <NavLink
                exact
                to="/prod"
                className="purst"
                activeClassName="active"
                onClick={handleLinkClick}
              >
                Product
              </NavLink>
              <IoIosArrowDown
                className="ardan"
                onClick={toggleProductDropdown}
              />
              {showProductDropdown && (
                <div className="prolst">
                  <NavLink
                    to="/procat"
                    className="dropdownlink"
                    onClick={handleLinkClick}
                  >
                    Product Category
                  </NavLink>
                </div>
              )}
            </div>
          </div>
        </li>
        <li className="puralert">
          <div className="purbell-icon-container">
            <FaBell className="purbell-icon" />
            {notifications > 0 && (
              <span className="purnotification-count">{notifications}</span>
            )}
          </div>
        </li>
        {/* PROFILE MENU DROPDOWN */}
        <ProfileMenuDropdown />
        {/* <li className="puradmin">
          <img src={admin} alt="admin" className="puradminimg" />
          <div className="puradminname">
            <p className="purad">Administrator</p>
          </div>
        </li> */}
      </ul>
      {showMenu && <Sidebar />}
    </div>
  );
}
