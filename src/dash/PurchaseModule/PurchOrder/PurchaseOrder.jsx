import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import SearchIcon from "../../../image/search.svg";
import { FaBars, FaCaretLeft, FaCaretRight } from "react-icons/fa";
import { IoGrid } from "react-icons/io5";
import Orderlistview from "./Orderlistview";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import IconButton from "@mui/material/IconButton";
import POrderform from "./POrderform";
import Orapr from "./Orapr";
import draft from "../../../../src/image/icons/draft (1).png";
import approved from "../../../../src/image/icons/approved.png";
import rejected from "../../../../src/image/icons/rejected.png";
import pending from "../../../../src/image/icons/pending.png";
import "./PurchaseOrder.css";

export default function PurchaseOrder() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [items, setItems] = useState(() => {
    const savedItems = localStorage.getItem("purchaseOrders");
    return savedItems ? JSON.parse(savedItems) : [];
  });
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [filteredItems, setFilteredItems] = useState(items);
  const [initialFormData, setInitialFormData] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const location = useLocation();
  const locationFormData = location.state?.formData;

  useEffect(() => {
    setFilteredItems(items);
    localStorage.setItem("purchaseOrders", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (locationFormData) {
      setInitialFormData(locationFormData);
      setIsFormVisible(true);
    }
  }, [locationFormData]);

  useEffect(() => {
    handleSearch();
  }, [searchQuery]);

  const handleSaveAndSubmit = (data) => {
    const updatedItems = [...items, data];
    setItems(updatedItems);
    setIsFormVisible(false);
  };

  const handleFormClose = () => {
    setIsFormVisible(false);
    setInitialFormData(null);
  };

  const toggleViewMode = (mode) => {
    setViewMode(mode);
  };

  const handleNewPurchaseOrder = () => {
    setIsFormVisible(true);
  };

  const handleCardClick = (item) => {
    setSelectedItem(item);
  };

  const handleSearch = () => {
    if (searchQuery === "") {
      setFilteredItems(items);
    } else {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filtered = items.filter(
        (item) =>
          item.productName.toLowerCase().includes(lowercasedQuery) ||
          item.date.includes(lowercasedQuery) ||
          item.status.toLowerCase().includes(lowercasedQuery) ||
          item.id.toLowerCase().includes(lowercasedQuery) ||
          item.vendor.toLowerCase().includes(lowercasedQuery)
      );
      setFilteredItems(filtered);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString(); // Formats date nicely
  };

  const getStatusCount = (status) => {
    return items.filter((item) => item.status === status).length;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "#2ba24c";
      case "Pending":
        return "#f0b501";
      case "Rejected":
      case "Cancelled":
        return "#e43e2b";
      case "Draft":
        return "#3b7ded";
      default:
        return "#7a8a98";
    }
  };

  return (
    <div className="purchase-order" id="purchase">
      <div className="purchase-order-heading">
        <div className="purchase-order-content">
          <p style={{ fontSize: "17px" }}>Purchase Order</p>
          <div className="purchase-order-status">
            {/* Status fields for draft, approved, pending, rejected */}
            <div className="status-field purchase-draft">
              <img src={draft} alt="draft" className="status-img" />
              <p
                className={`purchase-list-count ${
                  getStatusCount("Draft") === 0 ? "zero" : ""
                }`}
              >
                {getStatusCount("Draft")}
              </p>
              <p className="status-desc">Purchase Order</p>
              <p style={{ fontSize: "20px" }}>Draft</p>
            </div>
            <div className="status-field purchase-approved">
              <img src={approved} alt="approved" className="status-img" />
              <p
                className={`purchase-list-count ${
                  getStatusCount("Approved") === 0 ? "zero" : ""
                }`}
              >
                {getStatusCount("Approved")}
              </p>
              <p className="status-desc">Purchase Order</p>
              <p style={{ fontSize: "20px" }}>Approved</p>
            </div>
            <div className="status-field purchase-pending">
              <img src={pending} alt="pending" className="status-img" />
              <p
                className={`purchase-list-count ${
                  getStatusCount("Pending") === 0 ? "zero" : ""
                }`}
              >
                {getStatusCount("Pending")}
              </p>
              <p className="status-desc">Purchase Order</p>
              <p style={{ fontSize: "20px" }}>Pending</p>
            </div>
            <div className="status-field purchase-rejected">
              <img src={rejected} alt="rejected" className="status-img" />
              <p
                className={`purchase-list-count ${
                  getStatusCount("Rejected") === 0 ? "zero" : ""
                }`}
              >
                {getStatusCount("Rejected")}
              </p>
              <p className="status-desc">Purchase Order</p>
              <p style={{ fontSize: "20px" }}>Rejected</p>
            </div>
          </div>

          <div className="purchaseOrder">
            <div className="purchaseOrder1">
              <div className="purchaseOrder2">
                <div className="purchaseOrder3">
                  <div className="r3a">
                    <button
                      className="r3abtn"
                      onClick={handleNewPurchaseOrder}
                      style={{ fontSize: "17px" }}
                    >
                      New Purchase Order
                    </button>
                    <div className="purchaseOrdersash">
                      <label htmlFor="searchInput" className="search-box">
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
                  <div className="r3b">
                    <p className="r3bpage">
                      {filteredItems.length} of {items.length}
                    </p>
                    <div className="r3bnav">
                      <FaCaretLeft className="lr" />
                      <div className="stroke"></div>
                      <FaCaretRight className="lr" />
                    </div>
                    <div className="r3bview">
                      <IoGrid
                        className={`toggle ${
                          viewMode === "grid" ? "active" : ""
                        }`}
                        onClick={() => toggleViewMode("grid")}
                      />
                      <div className="stroke"></div>
                      <FaBars
                        className={`toggle ${
                          viewMode === "list" ? "active" : ""
                        }`}
                        onClick={() => toggleViewMode("list")}
                      />
                    </div>
                  </div>
                </div>
                {isFormVisible ? (
                  <div className="overlay">
                    <POrderform
                      onSaveAndSubmit={handleSaveAndSubmit}
                      onClose={handleFormClose}
                      initialData={initialFormData}
                    />
                  </div>
                ) : selectedItem ? (
                  <div className="overlay">
                    <Orapr
                      formData={selectedItem}
                      onClose={() => setSelectedItem(null)}
                    />
                  </div>
                ) : viewMode === "grid" ? (
                  <div className="purchaseOrder4">
                    {filteredItems.map((item) => (
                      <div
                        className="purchaseOrder4gv"
                        key={item.id}
                        onClick={() => handleCardClick(item)}
                      >
                        <p className="cardid">{item.id}</p>
                        {/* <div className="vendname">
                          {item.status === "Pending" ? (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "blue",
                              }}
                            >
                              <span style={{ color: "blue" }}>
                                Select Vendor
                              </span>
                              <IconButton style={{ color: "blue" }}>
                                <ArrowDropDownIcon />
                              </IconButton>
                            </div>
                          ) : (
                            <p>{item.vendor}</p>
                          )}
                        </div> */}
                        <p className="vendname">{item.vendor}</p>
                        <p>{formatDate(item.date)}</p>
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
                  <Orderlistview
                    items={filteredItems}
                    onItemClick={handleCardClick}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
