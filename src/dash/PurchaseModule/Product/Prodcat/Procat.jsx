import React, { useState, useEffect } from "react";
import SearchIcon from "../../../../image/search.svg";
import { FaBars, FaCaretLeft, FaCaretRight } from "react-icons/fa";
import { IoGrid } from "react-icons/io5";
import Listview from "./Plistview";
import Newpc from "./Newpc";
import Proc from "../ProductDetails";
import EditProduct from "./Pedit";

export default function Procat() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [items, setItems] = useState([
    {
      id: "1",
      category: "Food",
      description: "This is the product description",
    },
    {
      id: "2",
      category: "Bevarage",
      description: "This is the product description",
    },
    // Add more dummy data as needed
  ]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [filteredItems, setFilteredItems] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleSaveAndSubmit = (data) => {
    setFormData(data);
    setIsSubmitted(true);
    setItems([...items, data]);
    setIsFormVisible(false);
    localStorage.setItem("productData", JSON.stringify([...items, data]));
  };

  const handleFormDataChange = (data) => {
    setFormData(data);
  };

  const toggleViewMode = (mode) => {
    setViewMode(mode);
  };

  const handleNewProduct = () => {
    setIsFormVisible(true);
  };

  const handleFormClose = () => {
    setIsFormVisible(false);
    setIsSubmitted(false);
    setSelectedItem(null); // Ensure this hides the edit form
  };

  useEffect(() => {
    const productData = localStorage.getItem("productData");
    if (productData) {
      setItems(JSON.parse(productData));
    }
  }, []);

  useEffect(() => {
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
          item.category.toLowerCase().includes(lowercasedQuery) ||
          item.description.toLowerCase().includes(lowercasedQuery)
      );
      setFilteredItems(filtered);
    }
  };

  const handleCardClick = (item) => {
    setSelectedItem(item); // Set the selected item when card is clicked
  };

  const handleSaveEdit = (updatedData) => {
    const updatedItems = items.map((item) =>
      item.id === updatedData.id ? updatedData : item
    );
    setItems(updatedItems);
    setSelectedItem(null);
    localStorage.setItem("productData", JSON.stringify(updatedItems));
  };

  return (
    <div className="prq" id="procat">
      <div className="prq1">
        <div className="prq2">
          <div className="prq3">
            {!selectedItem && (
              <div className="p3a">
                <button className="p3abtn" onClick={handleNewProduct}>
                  New Product Category
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
            )}
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
          {isFormVisible ? (
            <div className="overlay">
              {!isSubmitted ? (
                <Newpc
                  onSaveAndSubmit={handleSaveAndSubmit}
                  onFormDataChange={handleFormDataChange}
                  onClose={handleFormClose}
                />
              ) : (
                <Proc formData={formData} />
              )}
            </div>
          ) : selectedItem ? (
            <EditProduct
              initialData={selectedItem} // Pass the selected item data
              onClose={handleFormClose} // Pass onClose function
              onSave={handleSaveEdit} // Handle saving the updated data
            />
          ) : viewMode === "grid" ? (
            <div className="prq4">
              {filteredItems.map((item) => (
                <div
                  className="prq4gv"
                  key={item.id}
                  onClick={() => handleCardClick(item)}
                >
                  <p className="product-category">{item.category}</p>
                  <p className="product-description">{item.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <Listview items={filteredItems} onItemClick={handleCardClick} />
          )}
        </div>
      </div>
    </div>
  );
}
