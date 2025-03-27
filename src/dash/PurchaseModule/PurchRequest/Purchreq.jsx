// Purchreq.jsx
import React, { useState, useEffect } from "react";
import "./Purchreq.css";
import SearchIcon from "../../../image/search.svg";
import { FaBars, FaCaretLeft, FaCaretRight } from "react-icons/fa";
import { IoGrid } from "react-icons/io5";
import ListView from "./Listview";
import PurchaseModuleWizard from "../../../components/PurchaseModuleWizard";
import { useLocation } from "react-router-dom";
import draft from "../../../../src/image/icons/draft (1).png";
import approved from "../../../../src/image/icons/approved.png";
import rejected from "../../../../src/image/icons/rejected.png";
import pending from "../../../../src/image/icons/pending.png";
import PurchaseHeader from "../PurchaseHeader";
import { usePurchase } from "../../../context/PurchaseContext";
import { extractRFQID, formatDate } from "../../../helper/helper";
import PurchaseRequestModule from "./PurchaseRequestModule";
import PurchaseRequestStatus from "./PurchaseRequestStatus";
import PRForm from "./PRForm/PRForm";

export default function Purchreq() {
  const [purchaseRequestData, setPurchaseRequestData] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [selectedStatus, setSelectedStatus] = useState(null);

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const location = useLocation();
  const { fetchSinglePurchaseRequest, fetchPurchaseRequests } = usePurchase();

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
        setIsModalOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  // End ===================================

  const toggleViewMode = (mode) => {
    setViewMode(mode);
  };

  const handleNewPurchaseRequest = () => {
    // console.log("i am here");
    setIsFormVisible(true);
  };

  const handleFormClose = () => {
    setIsFormVisible(false);
    setIsSubmitted(false);
    setSelectedItem(null);
  };

  // Filter quotations on the fly based on the search query
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
    setSelectedItem(item);
  };

  // const handleCardClick = (item) => {
  //   console.log("within handleCardClick ", item);
  //   setSelectedItem(item);
  //   setSelectedRequest(item); // Update selected request
  //   setIsFormVisible(false);
  // };

  const handleCardClick = async (item) => {
    console.log(item);
    // store the return response in a variable
    const result = await fetchSinglePurchaseRequest(item);
    setSelectedItem({ result });
    // check the status of the response
    console.log(result.status);
    console.log(selectedItem);
    if (item.status === "draft") {
      setEditMode(true);
      setIsFormVisible(true);
    } else {
      setSelectedItem(item);
      setIsFormVisible(false);
    }
  };

  const handleRfqStatusClick = (urlList, status) => {
    setSelectedStatus([urlList, status]);
  };

  const handleCancel = () => {
    setSelectedItem(null);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
  };

  const handleStatusCancel = () => {
    setSelectedStatus(null);
  };

  return (
    <div className="purchase-request" id="purchase">
      <PurchaseHeader />
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

              <div className="purchase-nav">
                <div className="purchase-content">
                  <button
                    className="purchase-contentbtn"
                    onClick={handleNewPurchaseRequest}
                    style={{ fontSize: "17px" }}
                  >
                    New Purchase Request
                  </button>
                  <div className="prqsash">
                    <label
                      htmlFor="searchInput"
                      className="search-box"
                      // onClick={handleSearch}
                    >
                      <img
                        src={SearchIcon}
                        alt="Search"
                        className="search-icon"
                      />
                      <input
                        id="searchInput"
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                      />
                    </label>
                  </div>
                </div>
                <div className="pagination">
                  <p className="purchase-pagination">1-2 of 2</p>
                  <div className="purchase-pagination-nav">
                    <FaCaretLeft className="lr" />
                    <div className="stroke"></div>
                    <FaCaretRight className="lr" />
                  </div>
                  <div className="p3bview">
                    <IoGrid
                      className={`toggle ${
                        viewMode === "grid" ? "active" : ""
                      }`}
                      onClick={() => toggleViewMode("grid")}
                    />
                    <div className="stroke"></div>&nbsp; &nbsp;
                    <FaBars
                      className={`toggle ${
                        viewMode === "list" ? "active" : ""
                      }`}
                      onClick={() => toggleViewMode("list")}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {isFormVisible ? (
            <div className="overlay1">
              {/* <Newpr
                onSaveAndSubmit={handleSaveAndSubmit}
                onClose={() => {
                  setIsFormVisible(false);
                  setEditMode(false);
                  setCurrentPR(null);
                }}
                existingRequest={editMode ? currentPR : null}
              /> */}

              <PRForm
                onCancel={handleFormClose}
                quotation={{}}
                formUse={"New RFQ"}
              />
            </div>
          ) : selectedItem ? (
            <div className="overlay1">
              <PurchaseRequestModule
                item={selectedItem}
                formatDate={formatDate}
                statusColor={getStatusColor}
                onEdit={handleEdit}
                onCancel={handleCancel}
              />
            </div>
          ) : viewMode === "grid" ? (
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

          {selectedStatus && (
            <div className="overlay">
              <PurchaseRequestStatus
                selectedStatus={selectedStatus}
                getStatusColor={getStatusColor}
                statusColor={getStatusColor}
                formatDate={formatDate}
                onCancel={handleStatusCancel}
                quotationsData={purchaseRequestData}
              />
            </div>
          )}
        </div>
      </div>

      {/* controls the 'Purchase Module Wizard' following user clicking the Purchase card from the Home page */}
      <PurchaseModuleWizard
        open={isModalOpen}
        onClose={handleCloseModal}
        step={currentStep}
      />
    </div>
  );
}
