import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@mui/material";
import { FaCaretLeft, FaCaretRight, FaBars } from "react-icons/fa";
import { IoGrid } from "react-icons/io5";
import { useTenant } from "../../../context/TenantContext";
import { Search } from "lucide-react";
import "./SecondaryBar.css";

const SecondaryBar = ({
  searchQuery,
  setSearchQuery,
  viewMode,
  onViewChange,
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}) => {
  const { tenantData } = useTenant();
  const tenantSchemaName = tenantData?.tenant_schema_name;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <nav className="secondary-bar" aria-label="Secondary navigation">
      {/* Left Section */}
      <div className="secondary-bar__left">
        <Link
          to={`/${tenantSchemaName}/inventory/operations/creat-incoming-product`}
          className="secondary-bar__link"
        >
          <Button
            variant="contained"
            disableElevation
            className="secondary-bar__button"
            aria-label="Create new incoming product"
          >
            New incoming product
          </Button>
        </Link>

        <div className="secondary-bar__search">
          <label htmlFor="searchInput" className="visually-hidden">
            Search products
          </label>
          <div className="search-icon-wrapper" aria-hidden="true">
            <Search />
          </div>
          <input
            id="searchInput"
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="secondary-bar__search-input"
            aria-describedby="searchInstructions"
          />
          <span id="searchInstructions" className="visually-hidden">
            Search through product listings
          </span>
        </div>
      </div>

      {/* Right Section */}
      <div className="secondary-bar__right">
        <div
          className="secondary-bar__pagination"
          role="navigation"
          aria-label="Pagination"
        >
          <p className="secondary-bar__pagination-text">
            <span className="visually-hidden">Current page:</span>
            {`${(currentPage - 1) * itemsPerPage + 1}-${Math.min(
              currentPage * itemsPerPage,
              totalItems
            )} of ${totalItems}`}
          </p>
          <div className="secondary-bar__pagination-controls">
            <button
              type="button"
              className="secondary-bar__icon-button"
              aria-label="Previous page"
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
            >
              <FaCaretLeft aria-hidden="true" />
            </button>
            <div className="secondary-bar__divider" aria-hidden="true" />
            <button
              type="button"
              className="secondary-bar__icon-button"
              aria-label="Next page"
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(currentPage + 1)}
            >
              <FaCaretRight aria-hidden="true" />
            </button>
          </div>
        </div>

        <div
          className="secondary-bar__view-toggle"
          role="group"
          aria-label="View options"
        >
          <button
            type="button"
            className={`secondary-bar__icon-button ${
              viewMode === "grid" ? "active-view" : ""
            }`}
            aria-label="Grid view"
            onClick={() => onViewChange("grid")}
          >
            <IoGrid aria-hidden="true" />
          </button>
          <div className="secondary-bar__divider" aria-hidden="true" />
          <button
            type="button"
            className={`secondary-bar__icon-button ${
              viewMode === "list" ? "active-view" : ""
            }`}
            aria-label="List view"
            onClick={() => onViewChange("list")}
          >
            <FaBars aria-hidden="true" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default SecondaryBar;
