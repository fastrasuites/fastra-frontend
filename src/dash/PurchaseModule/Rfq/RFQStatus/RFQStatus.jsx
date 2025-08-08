import React, { useCallback, useEffect, useMemo, useState } from "react";
import "../RfqStatus.css";
import { FaBars, FaCaretLeft, FaCaretRight } from "react-icons/fa6";
import { IoGrid } from "react-icons/io5";
import RfqGrid from "../RfqGrid";
import RListView from "../RListView";
import { Button, CircularProgress, Typography } from "@mui/material";
import { Search } from "lucide-react";
import { useLocation, useHistory } from "react-router-dom";
import { formatDate } from "../../../../helper/helper";
import { useTenant } from "../../../../context/TenantContext";
import Swal from "sweetalert2";

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
  const history = useHistory();
  const { status: selectedStatus, quotationsData } = location.state || {};
  const [quotations, setQuotations] = useState([]);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState("list");
  const [searchQuery, setSearchQuery] = useState("");
  const { tenantData } = useTenant();
  const tenant_schema_name = tenantData?.tenant_schema_name;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const itemsPerPage = 10;

  const handleClick = (id) => {
    history.push(
      `/${tenant_schema_name}/purchase/request-for-quotations/${id}`
    );
  };

  useEffect(() => {
    const loadQuotations = async () => {
      setLoading(true);
      try {
        if (!quotationsData || !selectedStatus || selectedStatus.length === 0) {
          throw new Error("Request failed with status code 403");
        }

        const filtered = quotationsData.filter(
          (item) => item.status === selectedStatus
        );
        setQuotations(filtered);

        if (filtered.length === 0 && searchQuery) {
          Swal.fire({
            icon: "info",
            title: "No results found",
            text: "Try a different search term.",
          });
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadQuotations();
  }, [selectedStatus, quotationsData, searchQuery]);

  const isForbidden = error?.message === "Request failed with status code 403";

  const filteredQuotations = quotations.filter((item) => {
    if (!searchQuery) return true;
    const lowercasedQuery = searchQuery.toLowerCase().trim();

    const totalPrice = item?.total_price?.toString().toLowerCase() || "";
    const createdDate = formatDate(item.date_created).toLowerCase();
    const updatedDate = formatDate(item.date_updated).toLowerCase();
    const status = item?.status?.toLowerCase() || "";
    const currencyName =
      item?.currency_details?.currency_name?.toLowerCase() || "";
    const purchaseID = item?.id?.toLowerCase() || "";
    const vendor = item.vendor_details?.company_name?.toLowerCase() || "";
    const itemSearch =
      item.items?.some(
        (i) =>
          i.description?.toLowerCase().includes(lowercasedQuery) ||
          i.product_details?.product_name
            ?.toLowerCase()
            .includes(lowercasedQuery)
      ) || false;
    const purpose = item.purpose?.toLowerCase() || "";

    return (
      totalPrice.includes(lowercasedQuery) ||
      createdDate.includes(lowercasedQuery) ||
      updatedDate.includes(lowercasedQuery) ||
      status.includes(lowercasedQuery) ||
      currencyName.includes(lowercasedQuery) ||
      purchaseID.includes(lowercasedQuery) ||
      vendor.includes(lowercasedQuery) ||
      purpose.includes(lowercasedQuery) ||
      itemSearch
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

  if (isForbidden) {
    return (
      <div
        style={{
          display: "flex",
          height: "80vh",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          flexDirection: "column",
          padding: "2rem",
        }}
      >
        <Typography variant="h4" color="error" fontWeight="bold">
          You do not have permission to view this page.
        </Typography>
      </div>
    );
  }

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
            <div className="stroke" />
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
            <div className="stroke" />
            <FaBars
              className={`toggle ${viewMode === "list" ? "active" : ""}`}
              onClick={() => toggleViewMode("list")}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <CircularProgress />
        </div>
      ) : viewMode === "grid" ? (
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
