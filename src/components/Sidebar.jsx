import React, { useEffect, useRef } from "react";
import { useTenant } from "../context/TenantContext";
import { Link } from "react-router-dom";
import "./sidebar.css";
import arrowLeft from "../image/sidebar/arrow-left.svg";
import home from "../image/sidebar/home.svg";
import accounts from "../image/sidebar/accounts.svg";
import purchase from "../image/sidebar/purchase.svg";
// import sales from "../image/sidebar/sales.svg";
import inventory from "../image/sidebar/inventory.svg";
// import hr from "../image/sidebar/hr.svg";
// import logistics from "../image/sidebar/logistics.svg";
// import contacts from "../image/sidebar/contacts.svg";
// import apps from "../image/sidebar/apps.svg";
import settings from "../image/sidebar/settings.svg";
import {
  extractPermissions,
  getPermissionsByApp,
} from "../helper/extractPermissions";

const Sidebar = ({ sidebarOpen, handleCloseSidebar }) => {
  const { tenantData } = useTenant();

  const tenant_schema_name = tenantData?.tenant_schema_name;

  const permissionsMap = extractPermissions(tenantData?.user_accesses || []);

  // Example:
  const purchasePermissions =
    Object.keys(getPermissionsByApp("purchase", permissionsMap)).length > 0;
  const inventoryPermissions =
    Object.keys(getPermissionsByApp("inventory", permissionsMap)).length > 0;
  const settingsPermissions =
    Object.keys(getPermissionsByApp("settings", permissionsMap)).length > 0;
  const invoicingPermissions =
    Object.keys(getPermissionsByApp("invoicing", permissionsMap)).length > 0;

  // Ref and click-outside handler
  const sidebarRef = useRef(null);

  useEffect(() => {
    if (!sidebarOpen) return;

    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        handleCloseSidebar();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarOpen, handleCloseSidebar]);

  return (
    <>
      {/* Overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={handleCloseSidebar} />
      )}
      <div ref={sidebarRef} className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-menu">
          <span className="sidebar-item" onClick={handleCloseSidebar}>
            <img src={arrowLeft} alt="Close Sidebar" className="sidebar-icon" />
          </span>

          <Link
            to={`/${tenant_schema_name}/dashboard`}
            className="sidebar-item"
            onClick={() => {
              handleCloseSidebar();
            }}
          >
            <img src={home} alt="Home" className="sidebar-icon" />
            <span>Home</span>
          </Link>

          {/* <Link
          to={`/${tenant_schema_name}/accounts`}
          className="sidebar-item"
          onClick={() => {
            handleCloseSidebar();
            handleReload();
          }}
        >
          <img src={accounts} alt="Accounts" className="sidebar-icon" />
          <span>Accounts</span>
        </Link> */}

          {purchasePermissions && (
            <Link
              to={`/${tenant_schema_name}/purchase`}
              className="sidebar-item"
              onClick={handleCloseSidebar}
            >
              <img src={purchase} alt="Purchase" className="sidebar-icon" />
              <span>Purchase</span>
            </Link>
          )}

          {/* <Link
          to={`/${tenant_schema_name}/sales`}
          className="sidebar-item"
          onClick={() => {
            handleCloseSidebar();
            handleReload();
          }}
        >
          <img src={sales} alt="Sales" className="sidebar-icon" />
          <span>Sales</span>
        </Link> */}

          {inventoryPermissions && (
            <Link
              to={`/${tenant_schema_name}/inventory/operations`}
              className="sidebar-item"
              onClick={handleCloseSidebar}
            >
              <img src={inventory} alt="Inventory" className="sidebar-icon" />
              <span>Inventory</span>
            </Link>
          )}

          {/* Invoicing: It's setup is still in progress */}
          {/* I still need to update the Link "to" path */}
          {invoicingPermissions && (
            <Link
              to={`/${tenant_schema_name}/invoicing/`}
              className="sidebar-item"
              onClick={handleCloseSidebar}
            >
              <img src={accounts} alt="Invoicing" className="sidebar-icon" />
              <span>Invoicing</span>
            </Link>
          )}

          {/* <Link
          to={`/${tenant_schema_name}/hr`}
          className="sidebar-item"
          onClick={() => {
            handleCloseSidebar();
            handleReload();
          }}
        >
          <img src={hr} alt="HR" className="sidebar-icon" />
          <span>HR</span>
        </Link> */}

          {/* <Link
          to={`/${tenant_schema_name}/logistics`}
          className="sidebar-item"
          onClick={() => {
            handleCloseSidebar();
            handleReload();
          }}
        >
          <img src={logistics} alt="Logistics" className="sidebar-icon" />
          <span>Logistics</span>
        </Link> */}

          {/* <Link
          to={`/${tenant_schema_name}/contacts`}
          className="sidebar-item"
          onClick={() => {
            handleCloseSidebar();
            handleReload();
          }}
        >
          <img src={contacts} alt="Contacts" className="sidebar-icon" />
          <span>Contacts</span>
        </Link> */}

          <hr style={{ border: "solid 2px #0d3c8c", marginBottom: "8px" }} />

          {/* <Link
          to={`/${tenant_schema_name}/apps`}
          className="sidebar-item"
          onClick={() => {
            handleCloseSidebar();
            handleReload();
          }}
        >
          <img src={apps} alt="Apps" className="sidebar-icon" />
          <span>Apps</span>
        </Link> */}

          {settingsPermissions && (
            <Link
              to={`/${tenant_schema_name}/settings`}
              className="sidebar-item"
              onClick={handleCloseSidebar}
            >
              <img src={settings} alt="Settings" className="sidebar-icon" />
              <span>Settings</span>
            </Link>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
