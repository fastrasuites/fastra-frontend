import React, { useCallback, useEffect, useMemo, useState } from "react";
import "../RfqStatus.css";
import { FaBars, FaCaretLeft, FaCaretRight } from "react-icons/fa6";
import { IoGrid } from "react-icons/io5";
import RfqGrid from "../RfqGrid";
import RListView from "../RListView";
import { Button } from "@mui/material";
import { Search } from "lucide-react";
import { useLocation } from "react-router-dom";
import { extractRFQID, formatDate } from "../../../../helper/helper";
import { useTenant } from "../../../../context/TenantContext";

const statusColor = (status) => {
  const formattedStatus = `${status[0].toUpperCase()}${status.slice(1)}`;
  switch (formattedStatus) {
    case "Approved":
      return "#2ba24c";
    case "Pending":
      return "#f0b501";
    case "Rejected":
      return "#e43e2b";
    default:
      return "#3B7CED";
  }
};
const RFQStatus = () => {
  const location = useLocation();
  const { status: selectedStatus, quotationsData } = location.state || {};
  console.log(location);
  const [quotations, setQuotations] = useState([]);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState("list");
  const [searchQuery, setSearchQuery] = useState("");
  const { tenantData } = useTenant();
  const tenant_schema_name = tenantData?.tenant_schema_name;

  const itemsPerPage = 10;

  const handleClick = (id) => {
    history.push(
      `/${tenant_schema_name}/purchase/request-for-quotations/${id}`
    );
  };

  useEffect(() => {
    if (selectedStatus[0] && selectedStatus[0].length) {
      setQuotations(() =>
        quotationsData.filter((item) => item.status === selectedStatus)
      );
    }
  }, [selectedStatus]);

  const filteredQuotations = quotations.filter((item) => {
    if (!searchQuery) return true;
    const lowercasedQuery = searchQuery.toLowerCase();

    const price = item?.rfq_total_price?.toString().toLowerCase() || "";
    const expiryDate = formatDate(item.expiry_date).toLowerCase();
    const status = item?.status?.toLowerCase() || "";
    const currencyName = item?.currency?.company_name?.toLowerCase() || "";
    const purchaseID = extractRFQID(item.purchase_request)?.toLowerCase() || "";
    const vendor =
      typeof item.vendor === "string" ? item.vendor.toLowerCase() : "";
    return (
      price.includes(lowercasedQuery) ||
      expiryDate.includes(lowercasedQuery) ||
      status.includes(lowercasedQuery) ||
      currencyName.includes(lowercasedQuery) ||
      purchaseID.includes(lowercasedQuery) ||
      vendor.includes(lowercasedQuery) ||
      vendorCategory.includes(lowercasedQuery)
    );
  });

  const totalPages = Math.ceil(filteredQuotations.length / itemsPerPage);

  const paginatedRequestsForQuotations = useMemo(() => {
    return filteredQuotations.slice(
      (page - 1) * itemsPerPage,
      page * itemsPerPage
    );
  }, [page, itemsPerPage, filteredQuotations]);

  const handlePageChange = useCallback(
    (newPage) => {
      if (newPage > 0 && newPage <= totalPages) {
        setPage(newPage);
      }
    },
    [totalPages]
  );

  const toggleViewMode = (mode) => {
    setViewMode(mode);
  };

  return (
    <div className="rfqStatus">
      <div className="rfqStatusCancel">
        <Button
          variant="outlined"
          className="cancel"
          onClick={() => window.history.back()}
        >
          Cancel
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
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="searchInput"
            />
          </div>
        </div>

        <div className="r3b">
          <p className="r3bpage" style={{ whiteSpace: "nowrap" }}>
            {page} of {totalPages}
          </p>
          <div className="r3bnav">
            <FaCaretLeft
              className="lr"
              onClick={() => handlePageChange(page - 1)}
            />
            <div className="stroke"></div>
            <FaCaretRight
              className="lr"
              onClick={() => handlePageChange(page + 1)}
            />
          </div>
          <div className="r3bview">
            <IoGrid
              className={`toggle ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => toggleViewMode("grid")}
            />
            <div className="stroke"></div>
            <FaBars
              className={`toggle ${viewMode === "list" ? "active" : ""}`}
              onClick={() => toggleViewMode("list")}
            />
          </div>
        </div>
      </div>
      {viewMode === "grid" ? (
        <RfqGrid
          quotations={paginatedRequestsForQuotations}
          handleClick={handleClick}
          formatDate={formatDate}
          statusColor={statusColor}
        />
      ) : (
        <div className="rfqStatusList">
          <RListView
            items={paginatedRequestsForQuotations}
            onCardClick={handleClick}
            getStatusColor={statusColor}
          />
        </div>
      )}
    </div>
  );
};

export default RFQStatus;
