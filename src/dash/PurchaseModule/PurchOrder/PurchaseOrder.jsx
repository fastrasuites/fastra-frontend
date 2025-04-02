import React, { useState, useEffect, useCallback } from "react";
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
import PurchaseHeader from "../PurchaseHeader";
import POForm from "./POForm/POForm";
import { usePurchaseOrder } from "../../../context/PurchaseOrderContext.";
import { extractRFQID } from "../../../helper/helper";

export default function PurchaseOrder() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [items, setItems] = useState([]); // Removed localStorage initialization
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [filteredItems, setFilteredItems] = useState(items);
  const [purchaseOrderData, setPurchaseOrderData] = useState([]);
  const [initialFormData, setInitialFormData] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);

  const location = useLocation();
  const locationFormData = location.state?.formData;

  const { getPurchaseOrderList, purchaseOrderList } = usePurchaseOrder();
  // Load data from localStorage on mount
  useEffect(() => {
    const savedPurchaseOrder = localStorage.getItem("purchaseOrderData");
    if (savedPurchaseOrder) {
      setPurchaseOrderData(JSON.parse(savedPurchaseOrder));
    }
  }, []);

  // Fetch RFQ list and update state and localStorage
  useEffect(() => {
    getPurchaseOrderList().then((data) => {
      if (data.success) {
        setPurchaseOrderData(data.data);
        localStorage.setItem("PurchaseOrderData", JSON.stringify(data.data));
      }
    });
  }, [getPurchaseOrderList]);

  useEffect(() => {
    setFilteredItems(items);
    // Removed localStorage setItem call
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
    return date.toLocaleString();
  };

  const getStatusCount = (status) => {
    return items.filter((item) => item.status === status).length;
  };

  // Filter quotations on the fly based on the search query
  const filteredPurchaseOrder = purchaseOrderData.filter((item) => {
    if (!searchQuery) return true;
    const lowercasedQuery = searchQuery.toLowerCase();

    const expiryDate = formatDate(item.expiry_date).toLowerCase();
    const status = item?.status?.toLowerCase() || "";
    const currencyName = item?.currency?.company_name?.toLowerCase() || "";
    const purchaseOrderID = extractRFQID(item?.url).toLowerCase() || "";
    const vendor =
      typeof item.vendor === "string" ? item.vendor.toLowerCase() : "";
    return (
      expiryDate.includes(lowercasedQuery) ||
      status.includes(lowercasedQuery) ||
      currencyName.includes(lowercasedQuery) ||
      purchaseOrderID.includes(lowercasedQuery) ||
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

  // status-field rfq-rejected
  const groupedByStatus = purchaseOrderData.reduce((acc, quotation) => {
    const { status, url } = quotation;
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(url);
    return acc;
  }, {});

  console.log(groupedByStatus);

  const handleRfqStatusClick = (urlList, status) => {
    setSelectedStatus([urlList, status]);
  };

  return (
    <div className="purchase-order" id="purchase">
      {/* Header */}
      <PurchaseHeader />
      <div className="purchase-order-heading">
        <div className="purchase-order-content">
          <p style={{ fontSize: "17px" }}>Purchase Order</p>
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
                    <POForm
                      open={isFormVisible}
                      onCancel={handleFormClose}
                      purchaseOrder={{}}
                      formUse={"New RFQ"}
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
                  items={filteredPurchaseOrder}
                  onCardClick={handleCardClick}
                  getStatusColor={getStatusColor}
                  // onDeleteSelected={handleDeleteSelected}
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
