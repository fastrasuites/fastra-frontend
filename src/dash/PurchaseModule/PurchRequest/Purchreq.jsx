import React, { useState, useEffect } from "react";
import "./Purchreq.css";
import { FaBars, FaCaretLeft, FaCaretRight } from "react-icons/fa";
import { IoGrid } from "react-icons/io5";
import ListView from "./Listview";
import PurchaseModuleWizard from "../../../components/PurchaseModuleWizard";
import { Link, useHistory } from "react-router-dom";
import draft from "../../../../src/image/icons/draft (1).png";
import approved from "../../../../src/image/icons/approved.png";
import rejected from "../../../../src/image/icons/rejected.png";
import pending from "../../../../src/image/icons/pending.png";
import { usePurchase } from "../../../context/PurchaseContext";
import { extractRFQID, formatDate } from "../../../helper/helper";
import "../../Inventory/secondaryBar/SecondaryBar.css";
import { Box, Button } from "@mui/material";
import { Search } from "lucide-react";
import Swal from "sweetalert2";
import Can from "../../../components/Access/Can";
import { useTenant } from "../../../context/TenantContext";
import PurchaseRequestGrid from "./PurchaseRequestGrid";

const WIZARD_STORAGE_KEY = "purchaseWizardState";

export default function Purchreq() {
  const [purchaseRequestData, setPurchaseRequestData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [loading, setLoading] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  // const { tenantData } = useTenant();
  // console.log(tenantData);

  const { fetchSinglePurchaseRequest, fetchPurchaseRequests, error } =
    usePurchase();
  const history = useHistory();

  const [wizardState, setWizardState] = useState(() => {
    const saved = localStorage.getItem(WIZARD_STORAGE_KEY);
    return saved
      ? JSON.parse(saved)
      : {
          hidden: false,
          currentStep: 1,
          skipped: false,
          completed: false,
        };
  });

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === WIZARD_STORAGE_KEY && e.newValue) {
        setWizardState(JSON.parse(e.newValue));
      }
    };

    localStorage.setItem(WIZARD_STORAGE_KEY, JSON.stringify(wizardState));
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [wizardState]);

  const handleCloseModal = (action) => {
    if (action === "skip") {
      setWizardState({
        hidden: true,
        currentStep: 1,
        skipped: true,
        completed: false,
      });
    } else if (action === "complete") {
      setWizardState({
        hidden: true,
        currentStep: 1,
        skipped: false,
        completed: true,
      });
    } else {
      setWizardState((prev) => ({ ...prev, hidden: true }));
    }
  };

  useEffect(() => {
    const debounce = setTimeout(async () => {
      setLoading(true);
      const result = await fetchPurchaseRequests(searchQuery);
      setLoading(false);

      if (result.success) {
        setPurchaseRequestData(result.data);
      }

      if (searchQuery && (!result || result.data.length === 0)) {
        Swal.fire({
          icon: "info",
          title: "No results found",
          text: "Try a different search term.",
        });
      }
    }, 500);

    return () => clearTimeout(debounce);
  }, [fetchPurchaseRequests, searchQuery]);

  const toggleViewMode = (mode) => {
    setViewMode(mode);
  };

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

              <Box className="secondary-bar" aria-label="Secondary navigation">
                <div className="secondary-bar__left">
                  <Can app="purchase" module="purchaserequest" action="create">
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
                  </Can>

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
                      aria-label="List view"
                      onClick={() => toggleViewMode("list")}
                    >
                      <FaBars aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </Box>
            </div>
          )}

          {viewMode === "grid" ? (
            <PurchaseRequestGrid
              quotations={purchaseRequestData}
              handleCardClick={handleSelectedRequest}
              formatDate={formatDate}
              statusColor={getStatusColor}
            />
          ) : (
            <ListView
              items={purchaseRequestData}
              onCardClick={handleSelectedRequest}
              getStatusColor={getStatusColor}
              loading={loading}
              error={error}
            />
          )}
        </div>
      </div>
      <PurchaseModuleWizard
        open={!wizardState.hidden}
        onClose={(action) => handleCloseModal(action)}
        step={wizardState.currentStep}
      />
    </Box>
  );
}
