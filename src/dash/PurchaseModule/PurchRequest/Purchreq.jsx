// Purchreq.jsx
import React, { useState, useEffect } from "react";
import "./Purchreq.css";
import { FaBars, FaCaretLeft, FaCaretRight } from "react-icons/fa";
import { IoGrid } from "react-icons/io5";
import ListView from "./Listview";
import PurchaseModuleWizard from "../../../components/PurchaseModuleWizard";
import { Link, useHistory, useLocation } from "react-router-dom";
import draft from "../../../../src/image/icons/draft (1).png";
import approved from "../../../../src/image/icons/approved.png";
import rejected from "../../../../src/image/icons/rejected.png";
import pending from "../../../../src/image/icons/pending.png";
import { usePurchase } from "../../../context/PurchaseContext";
import { extractRFQID, formatDate } from "../../../helper/helper";
// import SecondaryBar.css
import "../../Inventory/secondaryBar/SecondaryBar.css";
import { Box, Button } from "@mui/material";
import { Search } from "lucide-react";

export default function Purchreq() {
  const [purchaseRequestData, setPurchaseRequestData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("list");
  // const [selectedStatus, setSelectedStatus] = useState(null);

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const location = useLocation();
  const { fetchSinglePurchaseRequest, fetchPurchaseRequests } = usePurchase();

  const history = useHistory();

  useEffect(() => {
    const savedPR = localStorage.getItem("purchaseRequestData");
    if (savedPR) {
      setPurchaseRequestData(JSON.parse(savedPR));
    }
  }, []);
  useEffect(() => {
    fetchPurchaseRequests().then((data) => {
      if (data.success) {
        setPurchaseRequestData(data.data);
        localStorage.setItem("purchaseRequestData", JSON.stringify(data.data));
      }
    });
  }, [fetchPurchaseRequests]);

  useEffect(() => {
    if (location.state?.step) {
      setCurrentStep(location.state.step);
      setIsModalOpen(true);
    } else {
      const timer = setTimeout(() => {
        const isWizardHidden = localStorage.getItem("hideWizard");
        if (isWizardHidden === "true") {
          setIsModalOpen(false);
        } else {
          setIsModalOpen(true);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    localStorage.setItem("hideWizard", "true");
  };

  const toggleViewMode = (mode) => {
    setViewMode(mode);
  };

  const filteredPurchaseRequest = purchaseRequestData.filter((item) => {
    if (!searchQuery) return true;
    const lowercasedQuery = searchQuery.toLowerCase();

    const price = item?.total_price?.toString().toLowerCase() || "";
    const status = item?.status?.toLowerCase() || "";
    const currencyName = item?.currency?.company_name?.toLowerCase() || "";
    const purchaseID = item.id?.toLowerCase() || "";
    const vendor =
      typeof item.vendor === "string" ? item.vendor.toLowerCase() : "";
    return (
      price.includes(lowercasedQuery) ||
      status.includes(lowercasedQuery) ||
      currencyName.includes(lowercasedQuery) ||
      purchaseID.includes(lowercasedQuery) ||
      vendor.includes(lowercasedQuery)
    );
  });

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

  const groupedByStatus = purchaseRequestData.reduce((acc, quotation) => {
    const { status, url } = quotation;
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(url);
    return acc;
  }, {});

  const handleSelectedRequest = (item) => {
    history.push(`purchase-request/${item?.id}`);
  };

  const handleCardClick = async (item) => {
    const result = await fetchSinglePurchaseRequest(item.id);
    setSelectedItem({ result });
    if (item.status === "draft") {
      setIsFormVisible(true);
    } else {
      setSelectedItem(item);
      setIsFormVisible(false);
    }
  };

  const handleRfqStatusClick = (urlList, status) => {
    history.push({
      pathname: `purchase-request/status/${status}`,
      state: { urlList, status, purchaseRequestData },
    });
  };

  return (
    <Box className="purchase-request" id="purchase" mr={"20px"}>
      <div className="purchase-request-heading">
        <div className="purchase-request-content">
          {!isFormVisible && !selectedItem && (
            <div className="purchase-request-first">
              <p style={{ fontSize: "17px" }}>Purchase Requests</p>
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
                        Purchase Requests
                      </p>
                      <p style={{ fontSize: "20px" }}>{label}</p>
                    </div>
                  );
                })}
              </div>

              <nav className="secondary-bar" aria-label="Secondary navigation">
                {/* Left side */}
                <div className="secondary-bar__left">
                  <Link to={`purchase-request/new`}>
                    <Button
                      variant="contained"
                      disableElevation
                      className="secondary-bar__button"
                      aria-label="Create new purchase request"
                    >
                      New Purchase Request
                    </Button>
                  </Link>
                  <div className="secondary-bar__search">
                    <label htmlFor="searchInput" className="visually-hidden">
                      Search Purchase requests
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
                      Search through purchase request listings
                    </span>
                  </div>
                </div>

                {/* Right side */}
                <div className="secondary-bar__right">
                  <div
                    className="secondary-bar__pagination"
                    role="navigation"
                    aria-label="Pagination"
                  >
                    <p className="secondary-bar__pagination-text">
                      <span className="visually-hidden">Current page:</span>
                      1-2 of 2
                    </p>
                    <div className="secondary-bar__pagination-controls">
                      <button
                        type="button"
                        className="secondary-bar__icon-button"
                        aria-label="Previous page"
                      >
                        <FaCaretLeft aria-hidden="true" />
                      </button>
                      <div
                        className="secondary-bar__divider"
                        aria-hidden="true"
                      ></div>
                      <button
                        type="button"
                        className="secondary-bar__icon-button"
                        aria-label="Next page"
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
                      onClick={() => toggleViewMode("grid")}
                    >
                      <IoGrid aria-hidden="true" />
                    </button>
                    <div
                      className="secondary-bar__divider"
                      aria-hidden="true"
                    />

                    <button
                      type="button"
                      className={`secondary-bar__icon-button ${
                        viewMode === "list" ? "active-view" : ""
                      }`}
                      aria-label="Grid view"
                      onClick={() => toggleViewMode("list")}
                    >
                      <FaBars aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </nav>
            </div>
          )}

          {viewMode === "grid" ? (
            <div className="rfqStatusCards">
              {filteredPurchaseRequest.map((item) => {
                return (
                  <div
                    className="rfqStatusCard"
                    key={item?.id}
                    onClick={() => handleCardClick(item)}
                  >
                    <p className="cardid">{extractRFQID(item?.url)}</p>
                    <p className="cardate">{formatDate(item.date_created)}</p>
                    <p className="vendname">{item?.vendor?.company_name}</p>
                    <p className="cardid">{item?.purpose}</p>
                    <p
                      className="status"
                      style={{
                        color: getStatusColor(item.status),
                      }}
                    >
                      {item.status}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <ListView
              items={filteredPurchaseRequest}
              onCardClick={handleSelectedRequest}
              getStatusColor={getStatusColor}
            />
          )}
        </div>
      </div>
      <PurchaseModuleWizard
        open={isModalOpen}
        onClose={handleCloseModal}
        step={currentStep}
      />
    </Box>
  );
}
