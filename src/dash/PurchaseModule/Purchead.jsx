import React, { useState } from "react";
import { FaBars, FaBell } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";
import "./Purchead.css";
import admin from "../../image/admin.svg";
import { NavLink } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import ProfileMenuDropdown from "../../components/ProfileMenuDropdown";
import { Center } from "@chakra-ui/react";

export default function Purchead() {
  const [notifications, setNotifications] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // const [showMenu, setShowMenu] = useState(false);
  const [showVendorDropdown, setShowVendorDropdown] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  // const toggleMenu = () => {
  //   setShowMenu(!showMenu);
  // };

  const handleLinkClick = () => {
    setSidebarOpen(false);
    setShowVendorDropdown(false);
    setShowProductDropdown(false);
  };
  const handleOpenSidebar = () => {
    console.log("clicked to open sidebar from settings header");
    setSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    console.log("clicked to close sidebar");
    setSidebarOpen(false);
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
        <li className="purhom">
          <FaBars
            className="purnav"
            onClick={handleOpenSidebar}
            style={{ cursor: "pointer" }}
          />

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
                onClick={toggleVendorDropdown}
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                Vendor
                <IoIosArrowDown className="ardan" />
              </NavLink>
              {showVendorDropdown && (
                <div className="prolst">
                  <NavLink
                    to="#"
                    className="dropdownlink"
                    onClick={handleLinkClick}
                  >
                    Vendors Bills
                  </NavLink>
                  <NavLink
                    to="/vend"
                    className="dropdownlink"
                    onClick={handleLinkClick}
                  >
                    Vendors
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
                onClick={toggleProductDropdown}
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                Products
                <IoIosArrowDown className="ardan" />
              </NavLink>
              {showProductDropdown && (
                <div className="prolst">
                  <NavLink
                    to="#"
                    className="dropdownlink"
                    onClick={handleLinkClick}
                  >
                    Incoming Products
                  </NavLink>
                  <NavLink
                    to="/prod"
                    className="dropdownlink"
                    onClick={handleLinkClick}
                  >
                    Products
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
      <Sidebar
        sidebarOpen={sidebarOpen}
        handleCloseSidebar={handleCloseSidebar}
      />
    </div>
  );
}

// import React, { useState } from "react";
// import { FaBars, FaBell } from "react-icons/fa";
// import { IoIosArrowDown } from "react-icons/io";
// import "./Purchead.css";
// import { NavLink, useLocation } from "react-router-dom";
// import Sidebar from "../../components/Sidebar";
// import ProfileMenuDropdown from "../../components/ProfileMenuDropdown";

// export default function Purchead() {
//   const [notifications, setNotifications] = useState(0);
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [showVendorDropdown, setShowVendorDropdown] = useState(false);
//   const [showProductDropdown, setShowProductDropdown] = useState(false);

//   const location = useLocation(); // Get the current path

//   const handleLinkClick = () => {
//     setSidebarOpen(false);
//     setShowVendorDropdown(false);
//     setShowProductDropdown(false);
//   };

//   const handleOpenSidebar = () => {
//     setSidebarOpen(true);
//   };

//   const handleCloseSidebar = () => {
//     setSidebarOpen(false);
//   };

//   const toggleVendorDropdown = (e) => {
//     e.preventDefault();
//     setShowVendorDropdown(!showVendorDropdown);
//   };

//   const toggleProductDropdown = (e) => {
//     e.preventDefault();
//     setShowProductDropdown(!showProductDropdown);
//   };

//   // Helper function to check if a path includes a base URL or its children
//   const isActive = (basePath, subPaths = []) => {
//     const currentPath = location.pathname;
//     return (
//       currentPath.startsWith(basePath) ||
//       subPaths.some((path) => currentPath.startsWith(path))
//     );
//   };

//   return (
//     <div className="purhead">
//       <ul className="purwrap">
//         <li className="purhom">
//           <FaBars
//             className="purnav"
//             onClick={handleOpenSidebar}
//             style={{ cursor: "pointer" }}
//           />
//           <p>Purchase</p>
//         </li>
//         <li className="purlst">
//           <div className="purlist">
//             <NavLink
//               exact
//               to="/purchase"
//               className="purst"
//               activeClassName="active"
//               onClick={handleLinkClick}
//             >
//               Purchase Requests
//             </NavLink>
//             <NavLink
//               exact
//               to="/rfq"
//               className="purst"
//               activeClassName="active"
//               onClick={handleLinkClick}
//             >
//               RFQs
//             </NavLink>
//             <NavLink
//               exact
//               to="/pod"
//               className="purst"
//               activeClassName="active"
//               onClick={handleLinkClick}
//             >
//               Purchase Orders
//             </NavLink>

//             {/* Vendor Dropdown */}
//             <div className="prodrop">
//               <NavLink
//                 exact
//                 to="/vend"
//                 className={`purst ${
//                   isActive("/vend", ["/varcat"]) ? "active" : ""
//                 }`}
//                 onClick={handleLinkClick}
//               >
//                 Vendor
//               </NavLink>
//               <IoIosArrowDown
//                 className="ardan"
//                 onClick={toggleVendorDropdown}
//               />
//               {showVendorDropdown && (
//                 <div className="prolst">
//                   <NavLink
//                     to="/varcat"
//                     className="dropdownlink"
//                     onClick={handleLinkClick}
//                   >
//                     Vendor Category
//                   </NavLink>
//                 </div>
//               )}
//             </div>

//             {/* Product Dropdown */}
//             <div className="prodrop">
//               <NavLink
//                 exact
//                 to="/prod"
//                 className={`purst ${
//                   isActive("/prod", ["/prod/incoming"]) ? "active" : ""
//                 }`}
//                 onClick={toggleProductDropdown}
//                 // onClick={toggleProductDropdown}
//               >
//                 Products
//                 <IoIosArrowDown
//                 // className="ardan"
//                 />
//               </NavLink>
//               {showProductDropdown && (
//                 <div className="prolst">
//                   <NavLink
//                     to="/prod/incoming"
//                     className="dropdownlink"
//                     onClick={handleLinkClick}
//                   >
//                     Incoming Products
//                   </NavLink>
//                   <NavLink
//                     to="/prod"
//                     className="dropdownlink"
//                     onClick={handleLinkClick}
//                   >
//                     Products
//                   </NavLink>
//                 </div>
//               )}
//             </div>
//           </div>
//         </li>
//         <li className="puralert">
//           <div className="purbell-icon-container">
//             <FaBell className="purbell-icon" />
//             {notifications > 0 && (
//               <span className="purnotification-count">{notifications}</span>
//             )}
//           </div>
//         </li>
//         <ProfileMenuDropdown />
//       </ul>
//       <Sidebar
//         sidebarOpen={sidebarOpen}
//         handleCloseSidebar={handleCloseSidebar}
//       />
//     </div>
//   );
// }
