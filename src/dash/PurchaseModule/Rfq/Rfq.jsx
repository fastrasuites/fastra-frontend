import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import "./Rfq.css";
import SearchIcon from "../../../image/search.svg";
import { FaBars, FaCaretLeft, FaCaretRight } from "react-icons/fa";
import { IoGrid } from "react-icons/io5";
import RListView from "./RListView";
import Rform from "./Rform";
import Rapr from "./Rapr";
import PurchaseHeader from "../PurchaseHeader";
import draft from "../../../../src/image/icons/draft (1).png";
import approved from "../../../../src/image/icons/approved.png";
import rejected from "../../../../src/image/icons/rejected.png";
import pending from "../../../../src/image/icons/pending.png";
import RfqStatus from "./RfqStatus";
import { extractRFQID, formatDate } from "../../../helper/helper";
import RfqForm from "./RfqForm/RfqForm";
import { Box, Button, TextField } from "@mui/material";
import { Search, SearchCheck } from "lucide-react";
import { usePurchase } from "../../../context/PurchaseContext";
import { useRFQ } from "../../../context/RequestForQuotation";
import RfqStatusModal from "./RfqStatusModal";

export default function Rfq() {
  const [searchQuery, setSearchQuery] = useState("");
  const [quotationsData, setQuotationsData] = useState([]);
  const [viewMode, setViewMode] = useState("list");
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  // const []

  const { fetchApprovedPurchaseRequests, purchaseRequests } = usePurchase();
  const { getRFQList, rfqList, deleteRFQ } = useRFQ();

  // Load data from localStorage on mount
  useEffect(() => {
    const savedQuotations = localStorage.getItem("quotationsData");
    if (savedQuotations) {
      setQuotationsData(JSON.parse(savedQuotations));
    }
  }, []);

  useEffect(() => {
    fetchApprovedPurchaseRequests();
  }, []);

  // Fetch RFQ list and update state and localStorage
  useEffect(() => {
    getRFQList().then((data) => {
      if (data.success) {
        setQuotationsData(data.data);
        localStorage.setItem("quotationsData", JSON.stringify(data.data));
      }
    });
  }, [getRFQList, rfqList]);

  const normalizedPRs = purchaseRequests.map((item) => {
    const segments = item.url.split("/").filter(Boolean);
    const prID = segments[segments.length - 1];
    return { url: item.url, prID };
  });

  const location = useLocation();
  const locationFormData = location.state?.formData;

  useEffect(() => {
    if (locationFormData) {
      setIsFormVisible(true);
    }
  }, [locationFormData]);

  // console.log(quotationsData);

  // Filter quotations on the fly based on the search query
  const filteredQuotations = quotationsData.filter((item) => {
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

    // onDeleteSelected: iterates over selected IDs and deletes them.
    const handleDeleteSelected = useCallback(
      async (selectedIds) => {
        try {
          // Delete each selected RFQ in parallel.
          await Promise.all(selectedIds.map((id) => deleteRFQ(extractRFQID(id)))).then((data) => {
            console.log("Deleted RFQs:", data);
            // Update the list of RFQs after deletion.
            getRFQList().then((data) => {
              if (data.success) {
                setQuotationsData(data.data);
                localStorage.setItem("quotationsData", JSON.stringify(data.data));
              }
            });
          });
        } catch (err) {
          console.error("Error deleting selected RFQs:", err);
        }
      },
      [deleteRFQ, getRFQList]
    );
  



  const getStatusColor = (status) => {
    switch (`${status[0].toUpperCase()}${status.slice(1)}`) {
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

  // status-field rfq-rejected
  const groupedByStatus = quotationsData.reduce((acc, quotation) => {
    const { status, url } = quotation;
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(url);
    return acc;
  }, {});

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
                  <img
                    src={img}
                    alt={label.toLowerCase()}
                    className="status-img"
                  />
                  <p className={`plnum ${count === 0 ? "zero" : ""}`}>
                    {count}
                  </p>
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
              <p className="r3bpage">1-2 of 2</p>
              <div className="r3bnav">
                <FaCaretLeft className="lr" />
                <div className="stroke"></div>
                <FaCaretRight className="lr" />
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
                // onSave={handleEditSave}
              />
            </div>
          ) : selectedItem ? (
            <div className="overlay">
              <RfqStatusModal
                // formData={selectedItem}
                // onUpdateRfq={handleUpdateRFQ}
                // selectedStatus
                item={selectedItem}
                formatDate={formatDate}
                statusColor={getStatusColor}
                onEdit={handleEdit}
                onCancel={handleCancel}
                // onNewRfq={handleNewRfq}
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
              />
            </div>
          ) : viewMode === "grid" ? (
            <div className="rfqStatusCards" style={{ marginTop: "20px" }}>
              {filteredQuotations.map((item) => (
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
                    style={{
                      color: getStatusColor(item.status),
                    }}
                  >
                    {item.status}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rfq5">
              <RListView
                items={filteredQuotations}
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
