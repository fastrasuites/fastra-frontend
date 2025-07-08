import React, { useState } from "react";
import { useTenant } from "../context/TenantContext";
import { Dialog, DialogContent } from "@mui/material";
import { Link } from "react-router-dom";
import admin from "../image/admin.svg";
import settingIcon from "../image/settings-01.svg";
import userIcon from "../image/user-circle.svg";
import usergroupIcon from "../image/user-group.svg";
import logoutIcon from "../image/logout-03.svg";

import "./profileMenuDropdown.css";

const UserCard = ({ handleClickOpen, user }) => {
  return (
    <div>
      <button onClick={handleClickOpen} className="icon-and-profile">
        <img
          alt="User Avatar"
          src={admin}
          className="avatar"
          title={`Administrator\ninfo@companyname.com`}
        />
        <span className="profile" id="profile">
          <p>{user.username}</p>
          <small>{user.email}</small>
        </span>
      </button>
    </div>
  );
};

const ProfileConfigs = ({ url, icon, desc, handleClose }) => {
  return (
    <Link to={url} className="link-to-config" onClick={handleClose}>
      <img src={icon} alt="icon" style={{ minWidth: "24px" }} />
      <span>{desc} </span>
    </Link>
  );
};

const ProfileMenuDropdown = () => {
  const { tenantData, logout } = useTenant();
  const tenant_schema_name = tenantData?.tenant_schema_name;
  const user = tenantData?.user;
  const [open, setOpen] = useState(false);

  // Profile menu list for configurations
  const configs = [
    {
      url: `/${tenant_schema_name}/company`,
      desc: "Company Profile",
      icon: userIcon,
    },
    { url: `/${tenant_schema_name}/changePassword`, desc: "Change Password", icon: settingIcon },
    { url: `/${tenant_schema_name}/user`, desc: "Users", icon: usergroupIcon },
  ];

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handlelogout = () => {
    logout(); // from useTenant
    setOpen(false);
    console.log("logged out user");
  };

  return (
    <div className="">
      <UserCard handleClickOpen={handleClickOpen} user={user} />

      <Dialog
        className="profile-dialog"
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            borderRadius: 12,
            border: "solid 2px #E2E6E9",
            padding: 0,
            minWidth: 240,
            right: "1%",
            top: "55px",
            position: "absolute",
          },
        }}
      >
        <DialogContent>
          <UserCard user={user} />
          <ul className="config-wrapper">
            {configs.map((item) => (
              <ProfileConfigs
                key={item.desc}
                desc={item.desc}
                icon={item.icon}
                url={item.url}
                handleClose={handleClose}
              />
            ))}
          </ul>
          <hr
            style={{
              height: "2px",
              backgroundColor: "#F1F2F4",
              border: "none",
              marginBlock: "8px",
            }}
          />
          <ProfileConfigs
            desc="Logout"
            url="/login"
            icon={logoutIcon}
            handleClose={handlelogout}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileMenuDropdown;
