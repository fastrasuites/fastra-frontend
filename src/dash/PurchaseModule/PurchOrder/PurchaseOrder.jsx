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
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentFormData, setCurrentFormData] = useState(null);
  const [initialFormData, setInitialFormData] = useState(null); // Added state for initial form data
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
    setFilteredItems(items);
  }, [items]);

  useEffect(() => {
    handleSearch();
  }, [searchQuery]);

  const handleSaveAndSubmit = (data) => {
    const updatedItems = [...items, data];
    setItems(updatedItems);
    localStorage.setItem("purchaseOrders", JSON.stringify(updatedItems));
    setIsFormVisible(false);
  };

  const handleFormClose = () => {
    setIsFormVisible(false);
    setIsSubmitted(false);
    setInitialFormData(null); // Reset initial form data when closing the form
  };

  const toggleViewMode = (mode) => {
    setViewMode(mode);
  };

  const handleNewPurchaseOrder = () => {
    setIsFormVisible(true);
  };

  const handleUpdateStatus = (id, status) => {
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, status: status } : item
    );
    setItems(updatedItems);
    localStorage.setItem("purchaseOrders", JSON.stringify(updatedItems));
    setIsSubmitted(false);
    setIsFormVisible(false);
    setSelectedItem(null);
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
          item.status.toLowerCase().includes(lowercasedQuery)
      );
      setFilteredItems(filtered);
    }
  };

  const handleCardClick = (item) => {
    setSelectedItem(item);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Order Approved":
        return "#2ba24c";
      case "Awaiting Goods":
        return "#f0b501";
      case "Deselected":
      case "Cancelled":
        return "#e43e2b";
      default:
        return "#7a8a98";
    }
  };

  return (
    <div className="purchaseOrder">
      <div className="purchaseOrder1">
        <div className="purchaseOrder2">
          <div className="purchaseOrder3">
            <div className="r3a">
              <button className="r3abtn" onClick={handleNewPurchaseOrder}>
                New Purchase Order
              </button>
              <div className="purchaseOrdersash">
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
            <div className="r3b">
              <p className="r3bpage">
                1-{filteredItems.length} of {items.length}
              </p>
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
              <POrderform
                onSaveAndSubmit={handleSaveAndSubmit}
                onClose={handleFormClose}
                initialData={initialFormData} // Pass initial form data to child component
              />
            </div>
          ) : selectedItem ? (
            <div className="overlay">
              <Orapr
                formData={selectedItem}
                onUpdateStatus={handleUpdateStatus}
                onClose={() => setSelectedItem(null)} // Add onClose prop to Orapr
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
                  <div className="vendname">
                    {item.status === "Pending" ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "blue",
                        }}
                      >
                        <span style={{ color: "blue" }}>Select Vendor</span>
                        <IconButton style={{ color: "blue" }}>
                          <ArrowDropDownIcon />
                        </IconButton>
                      </div>
                    ) : (
                      item.vendor
                    )}
                  </div>
                  <p className="cardname">{item.productName}</p>
                  <p className="cardate">{formatDate(item.date)}</p>
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
            <Orderlistview style={{width: "100%"}}
              items={filteredItems}
              onCardClick={handleCardClick}
            />
          )}
        </div>
      </div>
    </div>
  );
}
