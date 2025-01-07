import React, { useState, useEffect } from "react";
import "./Purchreq.css";
import SearchIcon from "../../../image/search.svg";
import { FaBars, FaCaretLeft, FaCaretRight } from "react-icons/fa";
import { IoGrid } from "react-icons/io5";
import ListView from "./Listview";
import Newpr from "./Newpr";
import Papr from "./Papr";
import CRfq from "./CRfq";
import PurchaseModuleWizard from "../../../components/PurchaseModuleWizard";
import { useLocation } from "react-router-dom";
import draft from "../../../../src/image/icons/draft (1).png";
import approved from "../../../../src/image/icons/approved.png";
import rejected from "../../../../src/image/icons/rejected.png";
import pending from "../../../../src/image/icons/pending.png";
import PurchaseHeader from "../PurchaseHeader";
import { usePurchase } from "../../../context/PurchaseContext";

export default function Purchreq() {
  const [searchQuery, setSearchQuery] = useState("");
  const [draftCount, setDraftCount] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [viewMode, setViewMode] = useState("list");
  const [items, setItems] = useState(() => {
    const storedItems =
      JSON.parse(localStorage.getItem("purchaseRequests")) || [];
    return storedItems;
  });
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [filteredItems, setFilteredItems] = useState(items);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  // Used by Purchase Module wizard ===========================
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const location = useLocation();
  // -------------------------------------
  // const { error, Purchreq } = usePurchase;

  // console.log(Purchreq);
  // -----------------------------

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
  const handleSaveAndSubmit = (data) => {
    const newData = { ...data, status: "Pending" }; // Set status to Pending
    setFormData(newData);
    setIsSubmitted(true);
    const updatedItems = [...items, newData];
    setItems(updatedItems);
    localStorage.setItem("purchaseRequests", JSON.stringify(updatedItems));
    setIsFormVisible(false);
    setSelectedItem(newData); // Immediately select the new item
  };

  const handleFormDataChange = (data) => {
    setFormData(data);
  };

  const toggleViewMode = (mode) => {
    setViewMode(mode);
  };

  const handleNewPurchaseRequest = () => {
    setIsFormVisible(true);
  };

  const handleFormClose = () => {
    setIsFormVisible(false);
    setIsSubmitted(false);
    setSelectedItem(null);
  };

  const handleUpdateStatus = (id, status) => {
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, status } : item
    );
    setItems(updatedItems);
    localStorage.setItem("purchaseRequests", JSON.stringify(updatedItems));
    setIsSubmitted(false);
    setIsFormVisible(false);
    setSelectedItem(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "#2ba24c";
      case "Pending":
        return "#f0b501";
      case "Rejected":
        return "#e43e2b";
      case "Draft":
        return "#3b7ded";
      default:
        return "#7a8a98";
    }
  };

  const updateCounts = (items) => {
    const draftCount = items.filter((item) => item.status === "Draft").length;
    const approvedCount = items.filter(
      (item) => item.status === "Approved"
    ).length;
    const pendingCount = items.filter(
      (item) => item.status === "Pending"
    ).length;
    const rejectedCount = items.filter(
      (item) => item.status === "Rejected"
    ).length;
    setDraftCount(draftCount);
    setApprovedCount(approvedCount);
    setPendingCount(pendingCount);
    setRejectedCount(rejectedCount);
  };

  useEffect(() => {
    updateCounts(items);
    setFilteredItems(items);
  }, [items]);

  const handleSearch = () => {
    if (searchQuery === "") {
      setFilteredItems(items);
    } else {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filtered = items.filter(
        (item) =>
          item.id.toLowerCase().includes(lowercasedQuery) ||
          item.productName.toLowerCase().includes(lowercasedQuery) ||
          item.qty.toLowerCase().includes(lowercasedQuery) ||
          item.amount.toLowerCase().includes(lowercasedQuery) ||
          item.requester.toLowerCase().includes(lowercasedQuery) ||
          item.date.includes(lowercasedQuery) ||
          item.status.toLowerCase().includes(lowercasedQuery)
      );
      setFilteredItems(filtered);
    }
  };

  const handleCardClick = (item) => {
    setSelectedItem(item);
    setSelectedRequest(item); // Update selected request
    setIsFormVisible(false);
  };

  return (
    <div className="purchase-request" id="purchase">
      <PurchaseHeader />
      <div className="purchase-request-heading">
        <div className="purchase-request-content">
          <p style={{ fontSize: "17px" }}>Purchase Requests</p>
          <div className="purchase-request-status">
            <div className="status-field purchase-draft">
              <img src={draft} alt="draft" className="status-img" />
              <p
                className={`purchase-list-count ${
                  draftCount === 0 ? "zero" : ""
                }`}
              >
                {draftCount}
              </p>
              <p className="status-desc">Purchase Request</p>
              <p style={{ fontSize: "20px" }}>Draft</p>
            </div>
            <div className="status-field purchase-approved">
              <img src={approved} alt="approved" className="status-img" />
              <p
                className={`purchase-list-count ${
                  approvedCount === 0 ? "zero" : ""
                }`}
              >
                {approvedCount}
              </p>
              <p className="status-desc">Purchase Request</p>
              <p style={{ fontSize: "20px" }}>Approved</p>
            </div>
            <div className="status-field purchase-pending">
              <img src={pending} alt="pending" className="status-img" />
              <p
                className={`purchase-list-count ${
                  pendingCount === 0 ? "zero" : ""
                }`}
              >
                {pendingCount}
              </p>
              <p className="status-desc">Purchase Request</p>
              <p style={{ fontSize: "20px" }}>Pending</p>
            </div>
            <div className="status-field purchase-rejected">
              <img src={rejected} alt="rejected" className="status-img" />
              <p
                className={`purchase-list-count ${
                  rejectedCount === 0 ? "zero" : ""
                }`}
              >
                {rejectedCount}
              </p>
              <p className="status-desc">Purchase Request</p>
              <p style={{ fontSize: "20px" }}>Rejected</p>
            </div>
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
                  onClick={handleSearch}
                >
                  <img src={SearchIcon} alt="Search" className="search-icon" />
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
                  className={`toggle ${viewMode === "grid" ? "active" : ""}`}
                  onClick={() => toggleViewMode("grid")}
                />
                <div className="stroke"></div>&nbsp; &nbsp;
                <FaBars
                  className={`toggle ${viewMode === "list" ? "active" : ""}`}
                  onClick={() => toggleViewMode("list")}
                />
              </div>
            </div>
          </div>

          {isFormVisible ? (
            <div className="overlay">
              <Newpr
                onSaveAndSubmit={handleSaveAndSubmit}
                onFormDataChange={handleFormDataChange}
                onClose={handleFormClose}
              />
            </div>
          ) : selectedItem ? (
            selectedItem.status === "Approved" ? (
              <div className="overlay">
                <CRfq
                  formData={selectedItem}
                  onUpdateStatus={handleUpdateStatus}
                />
              </div>
            ) : (
              <div className="overlay">
                <Papr
                  formData={selectedItem}
                  onUpdateStatus={handleUpdateStatus}
                />
              </div>
            )
          ) : viewMode === "grid" ? (
            <div className="prq4">
              {filteredItems.map((item) => (
                <div
                  className={`prq4gv ${
                    item.status === "Approved" ||
                    (item === selectedItem && isSubmitted)
                      ? "clickable"
                      : "not-clickable"
                  }`}
                  key={item.id}
                  onClick={() => handleCardClick(item)}
                >
                  <p className="cardid">{item.id}</p>
                  <p className="cardnum">{item.amount}</p>
                  <p className="refname">{item.requester}</p>
                  <p className="sales">{item.department}</p>
                  <p
                    className="status"
                    style={{ color: getStatusColor(item.status) }}
                  >
                    <strong
                      style={{
                        fontSize: "20px",
                        color: getStatusColor(item.status),
                      }}
                    >
                      &#x2022;
                    </strong>{" "}
                    {item.status}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <ListView items={filteredItems} onItemClick={handleCardClick} />
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
