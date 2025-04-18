import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";
import "./Rfq.css";
import { FaBars, FaCaretLeft, FaCaretRight } from "react-icons/fa";
import { IoGrid } from "react-icons/io5";
import RListView from "./RListView";
import PurchaseHeader from "../PurchaseHeader";
import draft from "../../../../src/image/icons/draft (1).png";
import approved from "../../../../src/image/icons/approved.png";
import rejected from "../../../../src/image/icons/rejected.png";
import pending from "../../../../src/image/icons/pending.png";
import RfqStatus from "./RfqStatus";
import { extractRFQID, formatDate } from "../../../helper/helper";
import RfqForm from "./RfqForm/RfqForm";
import { Button } from "@mui/material";
import { Search } from "lucide-react";
import { usePurchase } from "../../../context/PurchaseContext";
import { useRFQ } from "../../../context/RequestForQuotation";
import RfqStatusModal from "./RfqStatusModal";
import { toast } from "react-toastify";

export default function Rfq() {
  const [searchQuery, setSearchQuery] = useState("");
  const [quotationsData, setQuotationsData] = useState([]);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState("list");
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [refresh, setRefresh] = useState(false);

  const itemsPerPage = 10;

  const { fetchApprovedPurchaseRequests, purchaseRequests } = usePurchase();
  const { getRFQList, deleteRFQ } = useRFQ();
  const location = useLocation();
  const locationFormData = location.state?.formData;

  // Load data from localStorage on mount
  useEffect(() => {
    const savedQuotations = localStorage.getItem("quotationsData");
    if (savedQuotations && savedQuotations !== "undefined") {
      try {
        setQuotationsData(JSON.parse(savedQuotations));
      } catch (error) {
        console.error("Error parsing quotationsData from localStorage", error);
      }
    }
  }, []);

  // Fetch RFQs and update state/localStorage
  const fetchRequestForQuotations = useCallback(async () => {
    try {
      const { success, data } = await getRFQList();
      if (success) {
        setQuotationsData(data);
        localStorage.setItem("quotationsData", JSON.stringify(data));
      }
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error("Failed to load purchase orders.");
    }
  }, [getRFQList]);

  // Initial data fetch
  useEffect(() => {
    fetchApprovedPurchaseRequests();
    const toastId = "rfqPromise";
    // Only trigger the toast if it's not already active.
    if (!toast.isActive(toastId)) {
      toast.promise(fetchRequestForQuotations(), {
        pending: "Loading request for quotations...",
        success: "Request for quotations loaded successfully",
        error: "Failed to load request for quotations.",
      }, { toastId });
    }
  }, [getRFQList, refresh]);

  // Reset page when search query changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  // Normalize purchase request data
  const normalizedPRs = useMemo(
    () =>
      purchaseRequests.map((item) => {
        const segments = item.url.split("/").filter(Boolean);
        const prID = segments[segments.length - 1];
        return { url: item.url, prID };
      }),
    [purchaseRequests]
  );

  // Open form if location contains formData
  useEffect(() => {
    if (locationFormData) {
      setIsFormVisible(true);
    }
  }, [locationFormData]);

  // Filter quotations based on search query
  const filteredQuotations = useMemo(() => {
    return quotationsData.filter((item) => {
      if (!searchQuery) return true;
      const lowercasedQuery = searchQuery.toLowerCase();
      const price = item?.rfq_total_price?.toString().toLowerCase() || "";
      const expiryDate = formatDate(item.expiry_date).toLowerCase();
      const status = item?.status?.toLowerCase() || "";
      const currencyName = item?.currency?.company_name?.toLowerCase() || "";
      const purchaseID = extractRFQID(item.purchase_request)?.toLowerCase() || "";
      const vendor =
        typeof item.vendor === "string" ? item.vendor.toLowerCase() : "";
      const vendorCategory = item.vendor_category?.toLowerCase() || "";
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
  }, [quotationsData, searchQuery]);

  const totalPages = Math.ceil(filteredQuotations.length / itemsPerPage);
  const paginatedRequestsForQuotations = useMemo(() => {
    return filteredQuotations.slice(
      (page - 1) * itemsPerPage,
      page * itemsPerPage
    );
  }, [page, itemsPerPage, filteredQuotations]);

  // Group RFQs by status for status panel
  const groupedByStatus = useMemo(() => {
    return quotationsData.reduce((acc, quotation) => {
      const { status, url } = quotation;
      acc[status] = acc[status] ? [...acc[status], url] : [url];
      return acc;
    }, {});
  }, [quotationsData]);

  // Handlers
  const handleRfqStatusClick = (urlList, status) => {
    setSelectedStatus([urlList, status]);
  };

  const handleCardClick = (item) => {
    setSelectedItem(item);
  };

  const toggleViewMode = (mode) => {
    setViewMode(mode);
  };

  const handleNewRfq = () => {
    setIsFormVisible(true);
  };

  const handleFormClose = () => {
    setIsFormVisible(false);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
  };

  const handleCancel = () => {
    setSelectedItem(null);
  };

  const handleStatusCancel = () => {
    setSelectedStatus(null);
  };

  const handlePageChange = useCallback(
    (newPage) => {
      if (newPage > 0 && newPage <= totalPages) {
        setPage(newPage);
      }
    },
    [totalPages]
  );

  const handleDeleteSelected = useCallback(
    async (selectedIds) => {
      try {
        await Promise.all(selectedIds.map((id) => deleteRFQ(extractRFQID(id))));
        const refreshedData = await getRFQList();
        if (refreshedData.success) {
          setQuotationsData(refreshedData.data);
          localStorage.setItem(
            "quotationsData",
            JSON.stringify(refreshedData.data)
          );
        }
      } catch (err) {
        console.error("Error deleting selected RFQs:", err);
      }
    },
    [deleteRFQ, getRFQList]
  );

  const getStatusColor = (status) => {
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

  const statuses = [
    { key: "draft", label: "Draft", img: draft },
    { key: "approved", label: "Approved", img: approved },
    { key: "pending", label: "Pending", img: pending },
    { key: "rejected", label: "Rejected", img: rejected },
  ];

  const triggerRefresh = useCallback(() => {
    setRefresh((prev) => !prev);
  }, []);

  return (
    <div className="rfq" id="rfq">
      <PurchaseHeader />
      <div className="rfq1">
        <div className="rfq2">
          <p style={{ fontSize: "17px" }}>RFQs</p>
          <div className="rfq-status">
            {statuses.map(({ key, label, img }) => {
              const count = groupedByStatus[key]?.length || 0;
              return (
                <div
                  className={`status-field rfq-${key}`}
                  key={key}
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    handleRfqStatusClick(groupedByStatus[key], key)
                  }
                >
                  <img src={img} alt={label.toLowerCase()} className="status-img" />
                  <p className={`plnum ${count === 0 ? "zero" : ""}`}>{count}</p>
                  <p style={{ lineHeight: "1rem" }} className="status-desc">
                    Request for Quote
                  </p>
                  <p style={{ fontSize: "20px" }}>{label}</p>
                </div>
              );
            })}
          </div>
          <div className="rfq3">
            <div className="r3a">
              <Button
                disableElevation
                variant="contained"
                sx={{ width: "auto", whiteSpace: "nowrap" }}
                onClick={handleNewRfq}
              >
                New RFQ
              </Button>
              <div className="rfqsash">
                <Search
                  style={{ color: "#C6CCD2" }}
                  className="rfqsearch-icon"
                />
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

          {isFormVisible ? (
            <div className="overlay">
              <RfqForm
                open={isFormVisible}
                onCancel={handleFormClose}
                quotation={{}}
                formUse={"New RFQ"}
                prID={normalizedPRs}
                triggerRefresh={triggerRefresh}
              />
            </div>
          ) : selectedItem ? (
            <div className="overlay">
              <RfqStatusModal
                item={selectedItem}
                formatDate={formatDate}
                statusColor={getStatusColor}
                onEdit={handleEdit}
                onCancel={handleCancel}
                triggerRefresh={triggerRefresh}

              />
            </div>
          ) : selectedStatus ? (
            <div className="overlay">
              <RfqStatus
                selectedStatus={selectedStatus}
                getStatusColor={getStatusColor}
                statusColor={getStatusColor}
                formatDate={formatDate}
                onCancel={handleStatusCancel}
                quotationsData={quotationsData}
                triggerRefresh={triggerRefresh}
              />
            </div>
          ) : viewMode === "grid" ? (
            <div className="rfqStatusCards" style={{ marginTop: "20px" }}>
              {paginatedRequestsForQuotations.map((item) => (
                <div
                  className="rfqStatusCard"
                  key={item.id}
                  onClick={() => handleCardClick(item)}
                >
                  <p className="cardid">{extractRFQID(item?.url)}</p>
                  <p className="cardate">{formatDate(item.expiry_date)}</p>
                  <p className="vendname">{item?.vendor?.company_name}</p>
                  <p
                    className="status"
                    style={{ color: getStatusColor(item.status) }}
                  >
                    {item.status}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rfq5">
              <RListView
                items={paginatedRequestsForQuotations}
                onCardClick={handleCardClick}
                getStatusColor={getStatusColor}
                onDeleteSelected={handleDeleteSelected}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
