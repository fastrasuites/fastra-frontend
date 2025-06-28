import React, { useState, useEffect } from "react";

import { BsCaretLeftFill } from "react-icons/bs";
import { BsCaretRightFill } from "react-icons/bs";
import { CiSearch } from "react-icons/ci";
import { FaBars } from "react-icons/fa";
import { IoGrid } from "react-icons/io5";
import { useLocation } from "react-router-dom";
import AccessListView from "./AccessListView";
import NewAccessGroup from "./NewAccessGroup";

export default function AccessGroups() {
  const [AccessGroups, setAccessGroups] = useState([]);
  const [filteredAccessGroups, setFilteredAccessGroups] =
    useState(AccessGroups);
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
    const storedAccessGroups =
      JSON.parse(localStorage.getItem("AccessGroups")) || [];
    setAccessGroups(storedAccessGroups);
  }, []);

  useEffect(() => {
    handleSearch();
  }, [searchQuery, AccessGroups]);

  const handleSearch = () => {
    if (searchQuery === "") {
      setFilteredAccessGroups(AccessGroups);
    } else {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filtered = AccessGroups.filter(
        (item) =>
          item.name.toLowerCase().includes(lowercasedQuery) ||
          item.mail.toLowerCase().includes(lowercasedQuery) ||
          item.number.toLowerCase().includes(lowercasedQuery) ||
          item.role.toLowerCase().includes(lowercasedQuery)
      );
      setFilteredAccessGroups(filtered);
    }
  };

  const handleNewUser = () => {
    setShowNewUser(true);
  };

  const handleCloseNewUser = () => {
    setShowNewUser(false);
  };

  const handleSaveAndSubmit = (newUser) => {
    const updatedAccessGroups = [...AccessGroups, newUser];
    setAccessGroups(updatedAccessGroups);
    localStorage.setItem("AccessGroups", JSON.stringify(updatedAccessGroups));
  };

  const toggleViewMode = (mode) => {
    setViewMode(mode);
  };

  return (
    <div className="container-body">
      <div className="content-page" id="user">
        {showNewUser ? (
          <div className="overlay">
            <NewAccessGroup
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
                  <button className="btn">Accessgroups</button>
                  <button
                    className="btn"
                    onClick={handleNewUser}
                    style={{ backgroundColor: "#f7f7f7", color: "#4393e4" }}
                  >
                    Create
                  </button>
                  <div className="search-box">
                    <CiSearch className="icon" onClick={handleSearch} />
                    <input
                      type="text"
                      placeholder="Search ..."
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="header-activity-2">
                  <p className="pagination">
                    1-2 of {filteredAccessGroups.length}
                  </p>
                  <div className="pagination-btn">
                    <button>
                      <BsCaretLeftFill className="icon" />
                    </button>
                    <button>
                      <BsCaretRightFill className="icon" />
                    </button>
                  </div>
                  <div className="view-toggle">
                    <button>
                      <IoGrid
                        className={`icon ${
                          viewMode === "grid" ? "active" : ""
                        }`}
                        onClick={() => toggleViewMode("grid")}
                      />{" "}
                    </button>
                    <button>
                      {" "}
                      <FaBars
                        className={`icon ${
                          viewMode === "list" ? "active" : ""
                        }`}
                        onClick={() => toggleViewMode("list")}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="user4">
                {viewMode === "grid" ? (
                  filteredAccessGroups.map((user, index) => (
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
                      <p className="userapplication">{user.application}</p>
                      <p className="usermail">{user.mail}</p>
                      <p className="usernum">{user.number}</p>
                    </div>
                  ))
                ) : (
                  <AccessListView AccessGroups={filteredAccessGroups} />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
