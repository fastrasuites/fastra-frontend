// Ensure Fuse.js is installed in your project:
// npm install fuse.js

import React, { useEffect, useMemo, useState, useRef } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { FaBars, FaCaretLeft, FaCaretRight } from "react-icons/fa6";
import { IoGrid } from "react-icons/io5";
import { Button } from "@mui/material";
import { Search } from "lucide-react";
import Fuse from "fuse.js";
import PurchaseRequestGrid from "../PurchaseRequestGrid";
import ListView from "../Listview";
import { extractRFQID, formatDate } from "../../../../helper/helper";
import { useTenant } from "../../../../context/TenantContext";

// Debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const getStatusColor = (status = "") => {
  switch (status.trim().toLowerCase()) {
    case "approved":
      return "#2ba24c";
    case "pending":
      return "#f0b501";
    case "rejected":
      return "#e43e2b";
    case "converted":
      return "#3B7CED";
    default:
      return "#3B7CED";
  }
};

const PurchaseRequestStatus = () => {
  const itemsPerPage = 10;
  const [quotations, setQuotations] = useState([]);
  const [viewMode, setViewMode] = useState("list");
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const fuseRef = useRef(null);

  const debouncedQuery = useDebounce(searchInput, 300);
  const { state } = useLocation();
  const { status: selectedStatus, purchaseRequestData = [] } = state || {};
  const history = useHistory();
  const {tenantData} = useTenant();
  const {tenant_schema_name} = tenantData; 
  // Initialize Fuse.js with better search configuration
  useEffect(() => {
    if (selectedStatus) {
      const filtered = purchaseRequestData.filter(
        (item) => item.status === selectedStatus
      );
      setQuotations(filtered);
      
      // Enhanced Fuse.js configuration
      fuseRef.current = new Fuse(filtered, {
        keys: [
          { name: 'purpose', weight: 0.3 },
          { name: 'vendor.company_name', weight: 0.25 },
          { name: 'items.product.product_name', weight: 0.2 },
          { name: 'status', weight: 0.15 },
          { name: 'requester', weight: 0.1 },
          { 
            name: 'date_created', 
            getter: i => formatDate(i.date_created), 
            weight: 0.1 
          },
          { 
            name: 'url', 
            getter: i => extractRFQID(i.url), 
            weight: 0.1 
          }
        ],
        threshold: 0.2, // Stricter threshold for better accuracy
        includeMatches: true, // Include match information
        findAllMatches: true, // Find all matches in a string
        ignoreLocation: true, // Search in all string locations
        useExtendedSearch: true,
        minMatchCharLength: 2, // Minimum characters to start matching
      });
      setCurrentPage(1);
    }
  }, [selectedStatus, purchaseRequestData]);

  // Enhanced search handler
  const searchedQuotations = useMemo(() => {
    if (!debouncedQuery.trim() || !fuseRef.current) return quotations;
    
    try {
      // Advanced search pattern handling
      const cleanQuery = debouncedQuery.trim().replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
      const pattern = cleanQuery.includes(' ')
        ? `="${cleanQuery}"` // Exact phrase match
        : `'${cleanQuery}`; // Prefix match

      const results = fuseRef.current.search(pattern);
      return results.map(r => ({ ...r.item, matches: r.matches }));
    } catch (error) {
      console.error("Search error:", error);
      return quotations;
    }
  }, [debouncedQuery, quotations]);

  // Pagination with page validation
  const pageCount = Math.max(1, Math.ceil(searchedQuotations.length / itemsPerPage));
  const paginatedQuotations = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return searchedQuotations.slice(start, start + itemsPerPage);
  }, [searchedQuotations, currentPage]);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedQuery]);

  const startIdx = searchedQuotations.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endIdx = Math.min(currentPage * itemsPerPage, searchedQuotations.length);

  const handlePrev = () => setCurrentPage(p => Math.max(p - 1, 1));
  const handleNext = () => setCurrentPage(p => Math.min(p + 1, pageCount));

  const handleSelectedRequest = (item) => {
  console.log(tenant_schema_name)
    history.push(`/${tenant_schema_name}/purchase/purchase-request/${item?.id}`);
  };

  return (
    <div className="rfqStatus">
      <div className="rfqStatusCancel">
        <Button
          variant="outlined"
          className="cancel"
          onClick={() => window.history.back()}
        >
          Close
        </Button>
      </div>

      <div className="rfqHeader">
        <div className="rfqHeaderContent">
          <h2 className="rfqHeaderTitle">{selectedStatus}</h2>
          <div className="rfqsash">
            <Search style={{ color: "#C6CCD2" }} className="rfqsearch-icon" />
            <input
              id="searchInput"
              type="search"
              placeholder="Search by ID, vendor, product, status, or date..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="searchInput"
              aria-label="Search purchase requests"
            />
          </div>
        </div>

        <div className="r3b">
          <p className="r3bpage">
            {startIdx}-{endIdx} of {searchedQuotations.length}
          </p>
          <div className="r3bnav">
            <FaCaretLeft
              className="lr"
              onClick={handlePrev}
              style={{ 
                cursor: currentPage > 1 ? 'pointer' : 'not-allowed', 
                opacity: currentPage > 1 ? 1 : 0.5 
              }}
              aria-label="Previous page"
            />
            <div className="stroke" />
            <FaCaretRight
              className="lr"
              onClick={handleNext}
              style={{ 
                cursor: currentPage < pageCount ? 'pointer' : 'not-allowed', 
                opacity: currentPage < pageCount ? 1 : 0.5 
              }}
              aria-label="Next page"
            />
          </div>
          <div className="r3bview">
            <IoGrid
              className={`toggle ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
            />
            <div className="stroke" />
            <FaBars
              className={`toggle ${viewMode === "list" ? "active" : ""}`}
              onClick={() => setViewMode("list")}
              aria-label="List view"
            />
          </div>
        </div>
      </div>

      {viewMode === "grid" ? (
        <PurchaseRequestGrid
          quotations={paginatedQuotations}
          formatDate={formatDate}
          statusColor={getStatusColor}
          searchMatches={paginatedQuotations.matches}
        />
      ) : (
        <div className="rfqStatusList">
          <ListView
            items={paginatedQuotations}
            getStatusColor={getStatusColor}
            searchTerm={debouncedQuery}
            matches={paginatedQuotations.matches} 
            onCardClick={handleSelectedRequest}
          />
        </div>
      )}
    </div>
  );
};

export default PurchaseRequestStatus;