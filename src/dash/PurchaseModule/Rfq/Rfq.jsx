import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import "./Rfq.css";
import SearchIcon from "../../../image/search.svg";
import { FaBars, FaCaretLeft, FaCaretRight } from "react-icons/fa";
import { IoGrid } from "react-icons/io5";
import RListView from "./RListView";
import Rform from "./Rform";
import Rapr from "./Rapr";
import { getVendors, getCategories } from "../Vendor/Vend";
import draft from '../../../../src/image/icons/draft (1).png';
import approved from '../../../../src/image/icons/approved.png';
import rejected from '../../../../src/image/icons/rejected.png';
import pending from '../../../../src/image/icons/pending.png';
import PurchaseHeader from "../PurchaseHeader";

export default function Rfq() {
  const [searchQuery, setSearchQuery] = useState("");
  const [vendorSelectedCount, setVendorSelectedCount] = useState(0);
  const [awaitingVendorSelectionCount, setAwaitingVendorSelectionCount] =
    useState(0);
  const [cancelledCount, setCancelledCount] = useState(0);
  const [viewMode, setViewMode] = useState("list");
  const [items, setItems] = useState(() => {
    const storedItems = JSON.parse(localStorage.getItem("rfqs")) || [];
    // console.log("Initial items:", storedItems);
    return storedItems;
  });
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [filteredItems, setFilteredItems] = useState(items);
  const [selectedItem, setSelectedItem] = useState(null);
  const [initialFormData, setInitialFormData] = useState(null);
  const [, forceUpdate] = useState();

  const location = useLocation();
  const locationFormData = location.state?.formData;

  const updateCounts = useCallback((currentItems) => {
    // console.log("Updating counts with items:", currentItems);
    const vendorSelected = currentItems.filter(
      (item) => item.status === "Vendor selected"
    ).length;
    const awaitingVendorSelection = currentItems.filter(
      (item) => item.status === "Awaiting vendor selection"
    ).length;
    const cancelled = currentItems.filter(
      (item) => item.status === "Cancelled"
    ).length;

    // console.log("New counts:", {
    //   vendorSelected,
    //   awaitingVendorSelection,
    //   cancelled,
    // });

    setVendorSelectedCount(vendorSelected);
    setAwaitingVendorSelectionCount(awaitingVendorSelection);
    setCancelledCount(cancelled);
    setFilteredItems(currentItems);

    // Force a re-render
    forceUpdate({});
  }, []);

  useEffect(() => {
    // console.log("Items changed, updating counts");
    updateCounts(items);
  }, [items, updateCounts]);

  useEffect(() => {
    if (locationFormData) {
      setInitialFormData(locationFormData);
      setIsFormVisible(true);
    }
  }, [locationFormData]);

  const handleSaveAndSubmit = (data) => {
    console.log("Saving new item:", data);
    const updatedItems = [...items, data];
    setItems(updatedItems);
    localStorage.setItem("rfqs", JSON.stringify(updatedItems));
    setIsFormVisible(false);
    updateCounts(updatedItems);
  };


    const handleFormDataChange = (data) => {
      // This function should update the form data if needed
    };


  const handleUpdateStatus = (id, status) => {
    console.log("Updating status:", id, status);
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, status: status } : item
    );
    setItems(updatedItems);
    localStorage.setItem("rfqs", JSON.stringify(updatedItems));
    setSelectedItem(null);
    updateCounts(updatedItems);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Vendor selected":
        return "#2ba24c";
      case "Awaiting vendor selection":
        return "#f0b501";
      case "Cancelled":
        return "#e43e2b";
      default:
        return "#7a8a98";
    }
  };

  const handleSearch = () => {
    if (searchQuery === "") {
      setFilteredItems(items);
    } else {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filtered = items.filter(
        (item) =>
          item.vendorName.toLowerCase().includes(lowercasedQuery) ||
          item.date.includes(lowercasedQuery) ||
          item.status.toLowerCase().includes(lowercasedQuery)
      );
      setFilteredItems(filtered);
    }
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="rfq" id="rfq">
      <PurchaseHeader />
      <div className="rfq1">
        <div className="rfq2">
          <p style={{ fontSize: "17px"}}>RFQs</p>
          <div className="rfq-status">
          <div className="status-field rfq-draft">
            <img src={draft} alt="approved" className="status-img" />
              <p className={`plnum ${vendorSelectedCount === 0 ? "zero" : ""}`}>
                {vendorSelectedCount}
              </p>
              <p style={{ lineHeight: "1rem" }} className="status-desc" >Request for Quote</p>
              <p style={{ fontSize: "20px"}}>Draft</p>
            </div>
            <div className="status-field rfq-approved">
            <img src={approved} alt="approved" className="status-img" />
              <p className={`plnum ${vendorSelectedCount === 0 ? "zero" : ""}`}>
                {vendorSelectedCount}
              </p>
              <p style={{ lineHeight: "1rem" }} className="status-desc">Request for Quote</p>
              <p style={{ fontSize: "20px"}}>Approved</p>
            </div>
            <div className="status-field rfq-pending">
            <img src={pending} alt="pending" className="status-img" />
              <p
                className={`plnum ${
                  awaitingVendorSelectionCount === 0 ? "zero" : ""
                }`}
              >
                {awaitingVendorSelectionCount}
              </p>
              <p style={{ lineHeight: "1rem" }} className="status-desc">Request for Quote</p>
              <p style={{ fontSize: "20px"}}>Pending</p>
            </div>
            <div className="status-field rfq-rejected">
            <img src={rejected} alt="approved" className="status-img" />
              <p className={`plnum ${cancelledCount === 0 ? "zero" : ""}`}>
                {cancelledCount}
              </p>
              <p style={{ lineHeight: "1rem" }} className="status-desc">Request for Quote</p>
              <p style={{ fontSize: "20px"}}>Rejected</p>
            </div>
          </div>
          <div className="rfq3">
            <div className="r3a">
              <button className="r3abtn" onClick={handleNewRfq} style={{ fontSize: "17px"}}>
                New RFQ
              </button>
              <div className="rfqsash">
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
              <Rform
                onSaveAndSubmit={handleSaveAndSubmit}
                onFormDataChange={handleFormDataChange}
                onClose={handleFormClose}
                initialData={initialFormData}
              />
            </div>
          ) : selectedItem ? (
            <div className="overlay">
              <Rapr
                formData={selectedItem}
                onUpdateStatus={handleUpdateStatus}
              />
            </div>
          ) : viewMode === "grid" ? (
            <div className="rfq4">
              {filteredItems.map((item) => (
                <div
                  className="rfq4gv"
                  key={item.id}
                  onClick={() => handleCardClick(item)}
                >
                  <p className="cardid">{item.id}</p>
                  <p className="vendname">{item.vendor}</p>
                  <p className="cardate">{formatDate(item.date)}</p>
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
                items={filteredItems}
                onCardClick={handleCardClick} // Pass handleCardClick to RListView
                updateStatus={handleUpdateStatus}
                statusColors={getStatusColor}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
