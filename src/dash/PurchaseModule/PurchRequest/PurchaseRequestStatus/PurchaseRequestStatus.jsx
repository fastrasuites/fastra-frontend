import React, { useEffect, useMemo, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { FaBars, FaCaretLeft, FaCaretRight } from "react-icons/fa6";
import { IoGrid } from "react-icons/io5";
import { Button } from "@mui/material";
import { Search } from "lucide-react";
import PurchaseRequestGrid from "../PurchaseRequestGrid";
import ListView from "../Listview";
import { formatDate } from "../../../../helper/helper";
import { useTenant } from "../../../../context/TenantContext";
import { usePurchase } from "../../../../context/PurchaseContext";
import Swal from "sweetalert2";

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
  const { fetchPurchaseRequests } = usePurchase();

  const debouncedQuery = useDebounce(searchInput, 300);
  const { state } = useLocation();
  const { status: selectedStatus = [] } = state || {};
  const history = useHistory();
  const { tenantData } = useTenant();
  const [loading, setLoading] = useState(false);

  const { tenant_schema_name } = tenantData;

  useEffect(() => {
    const debounce = setTimeout(async () => {
      setLoading(true);
      const result = await fetchPurchaseRequests(selectedStatus);
      setLoading(false);

      if (result.success) {
        setQuotations(result.data);
      }

      if (searchInput && (!result || result.data.length === 0)) {
        Swal.fire({
          icon: "info",
          title: "No results found",
          text: "Try a different search term.",
        });
      }
    }, 500);

    return () => clearTimeout(debounce);
  }, [fetchPurchaseRequests, searchInput]);

  // Pagination with page validation
  const pageCount = Math.max(1, Math.ceil(quotations.length / itemsPerPage));
  const paginatedQuotations = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return quotations.slice(start, start + itemsPerPage);
  }, [quotations, currentPage]);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedQuery]);

  const startIdx =
    quotations.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endIdx = Math.min(currentPage * itemsPerPage, quotations.length);

  const handlePrev = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const handleNext = () => setCurrentPage((p) => Math.min(p + 1, pageCount));

  const handleSelectedRequest = (item) => {
    history.push(
      `/${tenant_schema_name}/purchase/purchase-request/${item?.id}`
    );
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
              onChange={(e) => setSearchInput(e.target.value)}
              className="searchInput"
              aria-label="Search purchase requests"
            />
          </div>
        </div>

        <div className="r3b">
          <p className="r3bpage">
            {startIdx}-{endIdx} of {quotations.length}
          </p>
          <div className="r3bnav">
            <FaCaretLeft
              className="lr"
              onClick={handlePrev}
              style={{
                cursor: currentPage > 1 ? "pointer" : "not-allowed",
                opacity: currentPage > 1 ? 1 : 0.5,
              }}
              aria-label="Previous page"
            />
            <div className="stroke" />
            <FaCaretRight
              className="lr"
              onClick={handleNext}
              style={{
                cursor: currentPage < pageCount ? "pointer" : "not-allowed",
                opacity: currentPage < pageCount ? 1 : 0.5,
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
