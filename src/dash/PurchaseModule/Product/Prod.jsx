import React, { useState, useEffect } from "react";
import "./prod.css";
import SearchIcon from "../../../image/search.svg";
import { FaBars, FaCaretLeft, FaCaretRight } from "react-icons/fa";
import { IoGrid } from "react-icons/io5";
import Newprod from "./Newprod";
import ProdListview from "./ProdListview";
import ProductDetails from "./ProductDetails";

export default function Prod() {
  const [showNewProd, setShowNewProd] = useState(false);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const savedProducts = localStorage.getItem("products");
    if (savedProducts) {
      const parsedProducts = JSON.parse(savedProducts);
      setProducts(parsedProducts);
      setFilteredProducts(parsedProducts);
    }
  }, []);
  useEffect(() => {
    setFilteredProducts(products);
    localStorage.setItem("products", JSON.stringify(products));
  }, [products]);

  const handleNewProduct = () => {
    setShowNewProd(true);
  };

  const handleCloseNewProd = () => {
    setShowNewProd(false);
  };

  const handleSaveAndSubmit = (formData) => {
    const updatedProducts = [...products, formData];
    setProducts(updatedProducts);
    setFilteredProducts(updatedProducts);
    localStorage.setItem("products", JSON.stringify(updatedProducts));
    setShowNewProd(false);
  };

  const toggleViewMode = (mode) => {
    setViewMode(mode);
  };

  const handleSearch = () => {
    if (searchQuery === "") {
      setFilteredProducts(products);
    } else {
      const lowercasedQuery = searchQuery.toLowerCase();
      const filtered = products.filter(
        (item) =>
          item.id.toLowerCase().includes(lowercasedQuery) ||
          item.name.toLowerCase().includes(lowercasedQuery) ||
          item.sp.toLowerCase().includes(lowercasedQuery) ||
          item.type.toLowerCase().includes(lowercasedQuery) ||
          item.category.toLowerCase().includes(lowercasedQuery)
      );
      setFilteredProducts(filtered);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [searchQuery, products]);

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  const handleCloseProductDetails = () => {
    setSelectedProduct(null);
  };

  const handleSaveProductDetails = (updatedProduct) => {
    const updatedProducts = products.map((product) =>
      product.id === updatedProduct.id ? updatedProduct : product
    );
    setProducts(updatedProducts);
    setFilteredProducts(updatedProducts);
    localStorage.setItem("products", JSON.stringify(updatedProducts));
    setSelectedProduct(updatedProduct);
  };

  return (
    <div className="pro" id="prod">
      <div className="pro1">
        <div className="pro2">
          <div className="pro3">
            <div className="pro3a">
              <button className="pro3abtn" onClick={handleNewProduct}>
                New Product
              </button>
              <div className="prosash">
                <label
                  htmlFor="searchInput"
                  className="pros1"
                  onClick={handleSearch}
                >
                  <img src={SearchIcon} alt="Search" className="pros2" />
                  <input
                    id="searchInput"
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pros3"
                  />
                </label>
              </div>
            </div>
            {!selectedProduct && (
              <div className="pro3b">
                <p className="pro3bpage">1-2 of 2</p>
                <div className="pro3bnav">
                  <FaCaretLeft className="lr" />
                  <div className="stroke"></div>
                  <FaCaretRight className="lr" />
                </div>
                <div className="pro3bview">
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
          <div className="pro4">
            {selectedProduct ? (
              <ProductDetails
                product={selectedProduct}
                onClose={handleCloseProductDetails}
                onSave={handleSaveProductDetails}
              />
            ) : viewMode === "grid" ? (
              filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="pro4gv"
                  onClick={() => handleProductClick(product)}
                >
                  <div className="promage">
                    <img
                      src={product.image || "default-image-url"}
                      alt={product.name}
                      className="cirmage"
                    />
                  </div>
                  <p className="proname">{product.name}</p>
                  <p className="promount">{product.sp}</p>
                  <p className="protype">{product.type}</p>
                  <p className="procat">{product.category}</p>
                </div>
              ))
            ) : (
              <ProdListview
                items={filteredProducts}
                onItemClick={handleProductClick}
              />
            )}
          </div>
        </div>
      </div>
      {showNewProd && (
        <div className="overlay">
          <Newprod
            onClose={handleCloseNewProd}
            onSaveAndSubmit={handleSaveAndSubmit}
          />
        </div>
      )}
    </div>
  );
}
