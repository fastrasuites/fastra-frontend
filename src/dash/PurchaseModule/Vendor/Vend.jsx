import React, { useState, useEffect } from "react";
import "./vendor.css";
import SearchIcon from "../../../image/search.svg";
import VendorImage from "../../../image/vendor.svg";
import { FaBars, FaCaretLeft, FaCaretRight } from "react-icons/fa";
import { IoGrid } from "react-icons/io5";
import Listview from "./Listview";
import Newvendor from "./Newvendor";
import VendorDetails from "./VendorDetails";

export const getVendors = (items) => {
  return items.map((item) => ({
    id: item.id,
    vendorName: item.vendorName,
    email: item.email,
    phone: item.phone,
    address: item.address,
    category: item.category,
    image: item.image,
  }));
};

export const getCategories = (items) => {
  const categories = new Set(items.map((item) => item.category));
  return Array.from(categories);
};

export default function Vend() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [items, setItems] = useState(() => {
    return JSON.parse(localStorage.getItem("vendors")) || [];
  });
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [filteredItems, setFilteredItems] = useState(items);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const [vendors, setVendors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [vendorDropdownVisible, setVendorDropdownVisible] = useState(false);
  const [categoryDropdownVisible, setCategoryDropdownVisible] = useState(false);

  useEffect(() => {
    setFilteredItems(items);
    localStorage.setItem("vendors", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    const storedVendors = JSON.parse(localStorage.getItem("vendors")) || [];
    setVendors(storedVendors);
    setCategories(["IT Hardware Sales", "Printing & Branding"]);
  }, []);

  const handleSaveAndSubmit = (data) => {
    setFormData(data);
    setIsSubmitted(true);
    const newItem = {
      ...data,
      id: (items.length + 1).toString(),
      category: data.vendorCategory,
      image: data.image || VendorImage,
    };
    setItems([...items, newItem]);
    setIsFormVisible(false);
  };

  const handleFormDataChange = (data) => {
    setFormData(data);
  };

  const toggleViewMode = (mode) => {
    setViewMode(mode);
  };

  const handleNewVendor = () => {
    setIsFormVisible(true);
  };

  const handleFormClose = () => {
    setIsFormVisible(false);
    setIsSubmitted(false);
  };

  const handleSearch = () => {
    if (searchQuery === "") {
      setFilteredItems(items);
    } else {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filtered = items.filter(
        (item) =>
          item.id.toLowerCase().includes(lowercasedQuery) ||
          item.vendorName.toLowerCase().includes(lowercasedQuery) ||
          item.email.toLowerCase().includes(lowercasedQuery) ||
          item.phone.toLowerCase().includes(lowercasedQuery) ||
          item.address.toLowerCase().includes(lowercasedQuery) ||
          item.category.toLowerCase().includes(lowercasedQuery)
      );
      setFilteredItems(filtered);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [searchQuery, items]);

  const handleCardClick = (item) => {
    setSelectedItem(item);
  };

  const handleCloseVendorDetails = () => {
    setSelectedItem(null);
  };

  const handleSaveVendorDetails = (updatedVendor) => {
    const updatedItems = items.map((item) =>
      item.id === updatedVendor.id ? updatedVendor : item
    );
    setItems(updatedItems);
    setFilteredItems(updatedItems);
    localStorage.setItem("vendors", JSON.stringify(updatedItems));
    setSelectedItem(updatedVendor);
  };

  const handleVendorSelect = (vendor) => {
    setFormData({
      ...formData,
      vendorName: vendor.vendorName,
      email: vendor.email,
      phone: vendor.phone,
      address: vendor.address,
      vendorCategory: vendor.category,
    });
    setVendorDropdownVisible(false);
  };

  const handleCategorySelect = (category) => {
    setFormData({
      ...formData,
      vendorCategory: category,
    });
    setCategoryDropdownVisible(false);
  };

  return (
    <div className="vend" id="vend">
      <div className="prq1">
        <div className="prq2">
          <div className="prq3">
            <div className="p3a">
              <button className="p3abtn" onClick={handleNewVendor}>
                New Vendor
              </button>
              <div className="prqsash">
                <label
                  htmlFor="searchInput"
                  className="ps1"
                  onClick={handleSearch}
                >
                  <img src={SearchIcon} alt="Search" className="ps2" />
                  <input
                    id="searchInput"
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="ps3"
                  />
                </label>
              </div>
            </div>
            {!selectedItem && (
              <div className="p3b">
                <p className="p3bpage">1-2 of 2</p>
                <div className="p3bnav">
                  <FaCaretLeft className="lr" />
                  <div className="stroke"></div>
                  <FaCaretRight className="lr" />
                </div>
                <div className="p3bview">
                  <IoGrid
                    className={`grid ${viewMode === "grid" ? "active" : ""}`}
                    onClick={() => toggleViewMode("grid")}
                  />
                  <div className="stroke"></div>
                  <FaBars
                    className={`grid ${viewMode === "list" ? "active" : ""}`}
                    onClick={() => toggleViewMode("list")}
                  />
                </div>
              </div>
            )}
          </div>
          <div className="prq4">
            {selectedItem ? (
              <VendorDetails
                vendor={selectedItem}
                onClose={handleCloseVendorDetails}
                onSave={handleSaveVendorDetails}
              />
            ) : viewMode === "grid" ? (
              filteredItems.map((item) => (
                <div
                  className="vr4gv"
                  key={item.id}
                  onClick={() => handleCardClick(item)}
                >
                  <div className="vendor-image">
                    <img
                      src={item.image}
                      alt="Vendor"
                      className="circular-image"
                    />
                  </div>
                  <p className="vendor-name">{item.vendorName}</p>
                  <p className="vendor-email">{item.email}</p>
                  <p className="vendor-phone">{item.phone}</p>
                  <p className="vendor-address">{item.address}</p>
                  <p className="vendor-category">{item.category}</p>
                </div>
              ))
            ) : (
              <Listview items={filteredItems} onItemClick={handleCardClick} />
            )}
          </div>
        </div>
      </div>
      {isFormVisible && (
        <div className="overlay">
          <Newvendor
            onClose={handleFormClose}
            onSaveAndSubmit={handleSaveAndSubmit}
          />
        </div>
      )}
    </div>
  );
}
