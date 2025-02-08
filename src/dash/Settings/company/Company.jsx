import React, { useState, useEffect } from "react";
import { BsCaretLeftFill } from "react-icons/bs";
import { BsCaretRightFill } from "react-icons/bs";
import { FaBars } from "react-icons/fa";
import { IoGrid } from "react-icons/io5";
import NewCompany from "./NewCompanyForm";
import ListView from "./CompanyLview";
import { CiSearch } from "react-icons/ci";
import { useLocation } from "react-router-dom";

export default function Company() {
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState(companies);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewCompany, setShowNewCompany] = useState(false);
  const [viewMode, setViewMode] = useState("list");

  // openForm prop is from dashboard modal
  const location = useLocation();
  useEffect(() => {
    if (location.state?.openForm) {
      setShowNewCompany(true);
    }
  }, [location.openForm]);
  // End openForm from dashboard modal

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
    <div className="container-body">
      <div className="content-page" id="Company">
        {showNewCompany ? (
          <div className="overlay">
            <NewCompany
              onClose={handleCloseNewCompany}
              onSaveAndSubmit={handleSaveAndSubmit}
              fromStepModal={location.state?.openForm}
            />
          </div>
        ) : (
          <div className="content-body">
            <div className="content-details">
              <div className="content-header">
                <div className="header-activity-1">
                  <button className="btn" onClick={handleNewCompany}>
                    New Company
                  </button>
                  <div className="search-box">
                    <CiSearch className="icon" onClick={handleSearch} />
                    <input
                      type="text"
                      value={searchQuery}
                      placeholder="Search ..."
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />

                    {/* <label
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
                  </label> */}
                  </div>
                </div>

                <div className="header-activity-2">
                  <p className="pagination">
                    1-{filteredCompanies.length} of {filteredCompanies.length}
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
                      {" "}
                      <IoGrid
                        className={`icon ${
                          viewMode === "grid" ? "active" : ""
                        }`}
                        onClick={() => toggleViewMode("grid")}
                      />
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
     </div>
  );
}
