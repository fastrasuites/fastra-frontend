import React, { useState, useEffect } from "react";
import "./user.css";
import SearchIcon from "../../../image/search.svg";
import { FaCaretLeft, FaCaretRight, FaBars } from "react-icons/fa";
import { IoGrid } from "react-icons/io5";
import NewUser from "./NewUser";
import UserListView from "./UserListView"; // Import UserListView

export default function User() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState(users);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewUser, setShowNewUser] = useState(false);
  const [viewMode, setViewMode] = useState("list"); // Set default view mode to "list"

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
    <div className="user-page" id="user">
      {showNewUser ? (
        <div className="overlay">
          <NewUser onClose={handleCloseNewUser} onSaveAndSubmit={handleSaveAndSubmit} />
        </div>
      ) : (
        <div className="user1">
          <div className="user2">
            <div className="user3">
              <div className="user3a">
                <button className="user3abtn" onClick={handleNewUser}>
                  New User
                </button>
                <div className="usersash">
                  <label
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
                  </label>
                </div>
              </div>
              <div className="user3b">
                <p className="user3bpage">1-2 of {filteredUsers.length}</p>
                <div className="user3bnav">
                  <FaCaretLeft className="lr" />
                  <div className="stroke"></div>
                  <FaCaretRight className="lr" />
                </div>
                <div className="user3bview">
                  <IoGrid
                    className={`grid ${viewMode === "grid" ? "active" : ""}`}
                    onClick={() => toggleViewMode("grid")}
                  />
                  <div className="stroke"></div>
                  <FaBars
                    className={`grid ${viewMode === "list" ? "active" : ""}`}
                    onClick={() => toggleViewMode("list")}
                  />
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
