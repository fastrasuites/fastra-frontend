import React, { useState, useEffect } from "react";
import "./company.css";
import SearchIcon from "../../../image/search.svg";
import { FaCaretLeft, FaCaretRight, FaBars } from "react-icons/fa";
import { IoGrid } from "react-icons/io5";
import NewCompany from "./NewCompanyForm";
import ListView from "./CompanyLview";
import { useLocation, useHistory } from "react-router-dom";

export default function Company() {
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState(companies);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewCompany, setShowNewCompany] = useState(false);
  const [viewMode, setViewMode] = useState("list");

  // Used by Popup from Dashboad----------------------------------
  const location = useLocation();
  const history = useHistory();

  useEffect(() => {
    if (location.state?.openForm) {
      setShowNewCompany(true);
    }
  }, [location.state]);
  // End ---------------------------------------------------------

  useEffect(() => {
    const storedCompanies = JSON.parse(localStorage.getItem("companies")) || [];
    setCompanies(storedCompanies);
  }, []);

  useEffect(() => {
    handleSearch();
  }, [searchQuery, companies]);

  const handleSearch = () => {
    if (searchQuery === "") {
      setFilteredCompanies(companies);
    } else {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filtered = companies.filter(
        (item) =>
          item.companyName.toLowerCase().includes(lowercasedQuery) ||
          item.email.toLowerCase().includes(lowercasedQuery) ||
          item.phoneNumber.toLowerCase().includes(lowercasedQuery)
      );
      setFilteredCompanies(filtered);
    }
  };

  const handleNewCompany = () => {
    setShowNewCompany(true);
  };

  const handleCloseNewCompany = () => {
    setShowNewCompany(false);
  };

  const handleSaveAndSubmit = (newCompany) => {
    const updatedCompanies = [...companies, newCompany];
    setCompanies(updatedCompanies);
    localStorage.setItem("companies", JSON.stringify(updatedCompanies));
    setShowNewCompany(false);
  };

  const toggleViewMode = (mode) => {
    setViewMode(mode);
  };

  return (
    <div className="Company-page" id="Company">
      {showNewCompany ? (
        <div className="overlay">
          <NewCompany
            onClose={handleCloseNewCompany}
            onSaveAndSubmit={handleSaveAndSubmit}
            fromStepModal={location.state?.openForm}
          />
        </div>
      ) : (
        <div className="Company1">
          <div className="Company2">
            <div className="Company3">
              <div className="Company3a">
                <button className="Company3abtn" onClick={handleNewCompany}>
                  New Company
                </button>
                <div className="Companysash">
                  <label
                    htmlFor="searchInput"
                    className="Companys1"
                    onClick={handleSearch}
                  >
                    <img src={SearchIcon} alt="Search" className="Companys2" />
                    <input
                      id="searchInput"
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="Companys3"
                    />
                  </label>
                </div>
              </div>
              <div className="Company3b">
                <p className="Company3bpage">
                  1-{filteredCompanies.length} of {filteredCompanies.length}
                </p>
                <div className="Company3bnav">
                  <FaCaretLeft className="lr" />
                  <div className="stroke"></div>
                  <FaCaretRight className="lr" />
                </div>
                <div className="Company3bview">
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

            <div className={`Company4 ${viewMode}`}>
              {viewMode === "grid" ? (
                filteredCompanies.map((company, index) => (
                  <div className="Company4gv" key={index}>
                    <div className="Companymage">
                      <img
                        src={company.image || "default-image-url"}
                        alt={company.companyName}
                        className="cirmage"
                      />
                    </div>
                    <div className="Companydetails">
                      <p className="Companyname">{company.companyName}</p>
                      <p className="Companymail">{company.email}</p>
                      <p className="Companynum">{company.phoneNumber}</p>
                    </div>
                  </div>
                ))
              ) : (
                <ListView companies={filteredCompanies} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
