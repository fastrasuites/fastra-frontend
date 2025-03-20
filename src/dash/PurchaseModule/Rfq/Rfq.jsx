import React, { useState, useEffect } from "react";
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
import { formatDate } from "../../../helper/helper";
import { quotations } from "../../../data/quotations";
import RfqForm from "./RfqForm/RfqForm";
import { Box, TextField } from "@mui/material";
import { Search, SearchCheck } from "lucide-react";
import { usePurchase } from "../../../context/PurchaseContext";
import { useRFQ } from "../../../context/RequestForQuotation";

export default function Rfq() {
  const [searchQuery, setSearchQuery] = useState("");
  const [quotationsData, setQuotationsData] = useState([]);
  const [viewMode, setViewMode] = useState("list");
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);

  const {
    fetchPurchaseRequests,
    purchaseRequests,
    setPurchaseRequests,
    setError,
  } = usePurchase();

  const { getRFQList, error, rfqList, isLoading } = useRFQ();

  useEffect(() => {
    fetchPurchaseRequests();
    getRFQList().then((data) => {
      if (data.success) {
        const normalizedRFQ = rfqList.map((item) => {
          // const segments = item.items.request_for_quotation
          //   .split("/")
          //   .filter(Boolean);
          // const rfqID = segments[segments.length - 1];
          // return { url: item.url, rfqID };

          return item.items.request_for_quotation
        });
        console.log(normalizedRFQ)
        setQuotationsData(rfqList);
      }
    });
  }, []);

  // console.log(rfqList)

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

  // Filter quotations on the fly based on the search query
  const filteredQuotations = quotationsData.filter((item) => {
    if (!searchQuery) return true;
    const lowercasedQuery = searchQuery.toLowerCase();
    return (
      item.rfq_total_price.toLowerCase().includes(lowercasedQuery) ||
      formatDate(item.expiry_date).includes(lowercasedQuery) ||
      item.status.toLowerCase().includes(lowercasedQuery) ||
      item.currency.toLowerCase().includes(lowercasedQuery) ||
      item.vendor.toLowerCase().includes(lowercasedQuery) ||
      item.vendor_category.toLowerCase().includes(lowercasedQuery)
    );
  });
  const handleSaveAndSubmit = (data) => {
    console.log("Saving new item:", data);
    const updatedData = [...quotationsData, data];
    setQuotationsData(updatedData);
    setIsFormVisible(false);
  };

  const handleUpdateRFQ = (data) => {
    // This function should update the form data if needed
  };

  const getStatusColor = (status) => {
    switch (`${status[0].toUpperCase()}${status.slice(1)}`) {
      case "Approved":
        return "#2ba24c";
      case "Pending":
        return "#f0b501";
      case "Cancelled":
        return "#e43e2b";
      default:
        return "#3B7CED";
    }
  };

  const statuses = [
    { key: "draft", label: "Draft", img: draft },
    { key: "approved", label: "Approved", img: approved },
    { key: "pending", label: "Pending", img: pending },
    { key: "cancelled", label: "Rejected", img: rejected },
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
              <button
                className="r3abtn"
                onClick={handleNewRfq}
                style={{ fontSize: "17px" }}
              >
                New RFQ
              </button>
              <div className="rfqsash">
                <Search
                  style={{ color: "#C6CCD2" }}
                  className="rfqsearch-icon"
                />
                <input
                  id="searchInput"
                  type="search"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
              <Rapr formData={selectedItem} onUpdateRfq={handleUpdateRFQ} />
            </div>
          ) : selectedStatus ? (
            <div className="overlay">
              <RfqStatus
                selectedStatus={selectedStatus}
                getStatusColor={getStatusColor}
                statusColor={getStatusColor}
                formatDate={formatDate}
              />
            </div>
          ) : viewMode === "grid" ? (
            <div className="rfq4">
              {filteredQuotations.map((item) => (
                <div
                  className="rfq4gv"
                  key={item.id}
                  onClick={() => handleCardClick(item)}
                >
                  <p className="cardid">{item.purchase_request}</p>
                  <p className="cardate">{formatDate(item.expiry_date)}</p>
                  <p className="vendname">{item.vendor}</p>
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
              {/* <RListView
                items={filteredQuotations}
                onCardClick={handleCardClick}
                getStatusColor={getStatusColor}
              /> */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
