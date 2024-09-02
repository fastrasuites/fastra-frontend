import React, { useState, useEffect } from "react";
import "./user.css";
import "../shared/sharedStyle/sharedStyle.css";
import { BsCaretLeftFill } from "react-icons/bs";
import { BsCaretRightFill } from "react-icons/bs";
import { CiSearch } from "react-icons/ci";
import { FaBars } from "react-icons/fa";
import { IoGrid } from "react-icons/io5";
import NewUser from "./NewUser";
import UserListView from "./UserListView"; // Import UserListView
import { useLocation } from "react-router-dom";

export default function User() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState(users);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewUser, setShowNewUser] = useState(false);
  const [viewMode, setViewMode] = useState("list"); // Set default view mode to "list"

  // openForm prop is from working for dashboard modal
  const location = useLocation();
  useEffect(() => {
    if (location.state?.openForm) {
      setShowNewUser(true);
    }
  }, [location.openForm]);

  useEffect(() => {
    const storedUsers = JSON.parse(localStorage.getItem("users")) || [];
    setUsers(storedUsers);
  }, []);

  useEffect(() => {
    handleSearch();
  }, [searchQuery, users]);

  const handleSearch = () => {
    if (searchQuery === "") {
      setFilteredUsers(users);
    } else {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filtered = users.filter(
        (item) =>
          item.name.toLowerCase().includes(lowercasedQuery) ||
          item.mail.toLowerCase().includes(lowercasedQuery) ||
          item.number.toLowerCase().includes(lowercasedQuery) ||
          item.role.toLowerCase().includes(lowercasedQuery)
      );
      setFilteredUsers(filtered);
    }
  };

  const handleNewUser = () => {
    setShowNewUser(true);
  };

  const handleCloseNewUser = () => {
    setShowNewUser(false);
  };

  const handleSaveAndSubmit = (newUser) => {
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem("users", JSON.stringify(updatedUsers));
  };

  const toggleViewMode = (mode) => {
    setViewMode(mode);
  };

 
    return (
    <div className="content-page" id="user">
      {showNewUser ? (
        <div className="overlay">
          <NewUser
            onClose={handleCloseNewUser}
            onSaveAndSubmit={handleSaveAndSubmit}
            fromStepModal={location.state?.openForm}
          />
        </div>
      ) : (
        <div className="content-body">
          <div className="content-details">
            <div className="content-header">
              <div className="header-activity-1">
                <button className="btn" onClick={handleNewUser}>
                  New User
                </button>
                <div className="search-box">
                <CiSearch className="icon" onClick={handleSearch} />
                <input type="text" placeholder="Search ..." onChange={(e) => setSearchQuery(e.target.value)}  />
                  {/* <label
                    htmlFor="searchInput"
                    className="users1"
                    onClick={handleSearch}
                  >
                    <img src={SearchIcon} alt="Search" className="users2" />
                    <input
                      id="searchInput"
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="users3"
                    />
                  </label> */}
                </div>
              </div>
              <div className="header-activity-2">
                <p className="pagination">1-2 of {filteredUsers.length}</p>
                <div className="pagination-btn">
                <button><BsCaretLeftFill className="icon" /></button>
                <button><BsCaretRightFill className="icon" /></button>
                </div>
                <div className="view-toggle">
                 <button><IoGrid
                    className={`icon ${viewMode === "grid" ? "active" : ""}`}
                    onClick={() => toggleViewMode("grid")}
                  /> </button>
                 <button> <FaBars
                    className={`icon ${viewMode === "list" ? "active" : ""}`}
                    onClick={() => toggleViewMode("list")}
                  /></button>
                </div>
              </div>
            </div>

            <div className="user4">
              {viewMode === "grid" ? (
                filteredUsers.map((user, index) => (
                  <div className="user4gv" key={index}>
                    <div className="usermage">
                      <img
                        src={user.image || "default-image-url"}
                        alt={user.name}
                        className="cirmage"
                      />
                    </div>
                    <p className="username">{user.name}</p>
                    <p className="userole">{user.role}</p>
                    <p className="usermail">{user.mail}</p>
                    <p className="usernum">{user.number}</p>
                  </div>
                ))
              ) : (
                <UserListView users={filteredUsers} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
