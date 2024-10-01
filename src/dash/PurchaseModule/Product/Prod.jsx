import React, { useState, useEffect } from "react";
import "./prod.css";
import SearchIcon from "../../../image/search.svg";
import {
  FaCaretLeft,
  FaCaretRight,
  FaChevronRight,
  FaFilter,
  FaThList,
} from "react-icons/fa";
import { IoGrid } from "react-icons/io5";
import Newprod from "./Newprod";
import ProdListview from "./ProdListview";
import ProductDetails from "./ProductDetails";
import { useLocation } from "react-router-dom";
import CloudDownload from "../../../image/cloud-download.svg";
import ExcelFile from "../../../ExcelFile.xlsx";
import {
  Grid,
  IconButton,
  Drawer,
  Box,
  InputBase,
  Button,
} from "@mui/material";

export default function Prod() {
  const [showNewProd, setShowNewProd] = useState(false);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openLeft, setOpenLeft] = useState(false);
  const [openRight, setOpenRight] = useState(false);
  const location = useLocation();

  const toggleLeftDrawer = (open) => () => setOpenLeft(open);
  const toggleRightDrawer = (open) => () => setOpenRight(open);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (location.state?.openForm) {
        setShowNewProd(true);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [location.state?.openForm]);

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
          {/* New responsive secondary header for product */}
          <Grid
            container
            spacing={2}
            alignItems="center"
            sx={{ height: "40px", marginBottom: "32px" }}
          >
            {/* Icon for Left Drawer */}
            <IconButton
              onClick={toggleLeftDrawer(true)}
              sx={{ display: { xs: "block", md: "none" }, color: "#3B7CED" }}
            >
              <FaChevronRight /> {/* Updated icon for left drawer */}
            </IconButton>

            {/* Left side - Hidden on small, shown on large */}
            <Grid
              item
              xs={12}
              md={6}
              sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}
            >
              <Button
                onClick={() => setShowNewProd(true)}
                variant="contained"
                sx={{
                  height: "100%",
                  backgroundColor: "#3B7CED",
                  color: "white",
                  textTransform: "capitalize",
                }}
              >
                New Product
              </Button>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  ml: 4,
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  paddingLeft: "10px",
                }}
              >
                <img src={SearchIcon} alt="Search" style={{ height: "20px" }} />
                <InputBase
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search"
                  sx={{
                    ml: 1,
                    height: "100%",

                    padding: "0 8px",
                  }}
                />
              </Box>

              <a
                href={ExcelFile}
                download={ExcelFile}
                style={{ marginLeft: "24px" }}
              >
                <IconButton>
                  <img
                    src={CloudDownload}
                    alt="Download Excel"
                    style={{ height: "32px" }}
                  />
                </IconButton>
              </a>
            </Grid>

            {/* Icon for Right Drawer */}
            <IconButton
              onClick={toggleRightDrawer(true)}
              sx={{
                display: { xs: "block", md: "none" },
                color: "#3B7CED",
                marginLeft: "auto",
              }}
            >
              <FaFilter /> {/* Updated icon for right drawer */}
            </IconButton>

            {/* Right side - Hidden on small, shown on large */}
            <Grid
              item
              xs={12}
              md={6}
              sx={{
                display: { xs: "none", md: "flex" },
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <p style={{ margin: 0 }}>1-2 of 2</p>
                <Box sx={{ display: "flex", ml: 2 }}>
                  <IconButton
                    sx={{
                      backgroundColor: "white",
                      border: "1px solid #A9B3BC",
                      borderRadius: "4px 0 0 4px",
                    }}
                  >
                    <FaCaretLeft style={{ color: "#A9B3BC" }} />
                  </IconButton>

                  <IconButton
                    sx={{
                      backgroundColor: "white",
                      border: "1px solid #A9B3BC",
                      borderRadius: "0 4px 4px 0",
                    }}
                  >
                    <FaCaretRight style={{ color: "#A9B3BC" }} />
                  </IconButton>
                </Box>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  ml: 2,
                }}
              >
                <IconButton
                  onClick={() => setViewMode("grid")}
                  sx={{
                    backgroundColor: "white",
                    border: "1px solid #A9B3BC",
                    borderRadius: "4px 0 0 4px",
                  }}
                >
                  <IoGrid
                    style={{
                      color: viewMode === "grid" ? "#3B7CED" : "#A9B3BC",
                    }}
                  />
                </IconButton>

                <IconButton
                  onClick={() => setViewMode("list")}
                  sx={{
                    backgroundColor: "white",
                    border: "1px solid #A9B3BC",
                    borderRadius: "0 4px 4px 0",
                  }}
                >
                  <FaThList
                    style={{
                      color: viewMode === "list" ? "#3B7CED" : "#A9B3BC",
                    }}
                  />
                </IconButton>
              </Box>
            </Grid>

            {/* Drawer for Left side on small screens */}
            <Drawer
              anchor="left"
              open={openLeft}
              onClose={toggleLeftDrawer(false)}
            >
              <Box sx={{ p: 2, width: 250 }}>
                {/* Same content as the left side on large screens */}
                <Button
                  onClick={() => setShowNewProd(true)}
                  variant="contained"
                  fullWidth
                  sx={{
                    backgroundColor: "#3B7CED",
                    color: "white",
                    textTransform: "capitalize",
                  }}
                >
                  New Product
                </Button>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mt: 2,
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                  }}
                >
                  <img
                    src={SearchIcon}
                    alt="Search"
                    style={{
                      height: "20px",
                      paddingLeft: "8px",
                    }}
                  />
                  <InputBase
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search"
                    sx={{
                      ml: 1,
                      height: "100%",
                      padding: "0 8px",
                    }}
                  />
                </Box>

                <a
                  href={ExcelFile}
                  download={ExcelFile}
                  style={{ marginTop: "10px", display: "block" }}
                >
                  <IconButton>
                    <img
                      src={CloudDownload}
                      alt="Download Excel"
                      style={{ height: "20px" }}
                    />
                  </IconButton>
                </a>
              </Box>
            </Drawer>

            {/* Drawer for Right side on small screens */}
            <Drawer
              anchor="right"
              open={openRight}
              onClose={toggleRightDrawer(false)}
            >
              <Box sx={{ p: 2, width: 250 }}>
                {/* Same content as the right side on large screens */}
                <p>1-2 of 2</p>
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                  <IconButton
                    sx={{
                      backgroundColor: "white",
                      border: "1px solid #A9B3BC",
                      borderRadius: "4px 0 0 4px",
                    }}
                  >
                    <FaCaretLeft style={{ color: "#A9B3BC" }} />
                  </IconButton>

                  <IconButton
                    sx={{
                      backgroundColor: "white",
                      border: "1px solid #A9B3BC",
                      borderRadius: "0 4px 4px 0",
                    }}
                  >
                    <FaCaretRight style={{ color: "#A9B3BC" }} />
                  </IconButton>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                  <IconButton
                    onClick={() => setViewMode("grid")}
                    sx={{
                      backgroundColor: "white",
                      border: "1px solid #A9B3BC",
                      borderRadius: "4px 0 0 4px",
                    }}
                  >
                    <IoGrid
                      style={{
                        color: viewMode === "grid" ? "#3B7CED" : "#A9B3BC",
                      }}
                    />
                  </IconButton>

                  <IconButton
                    onClick={() => setViewMode("list")}
                    sx={{
                      backgroundColor: "white",
                      border: "1px solid #A9B3BC",
                      borderRadius: "0 4px 4px 0",
                    }}
                  >
                    <FaThList
                      style={{
                        color: viewMode === "list" ? "#3B7CED" : "#A9B3BC",
                      }}
                    />
                  </IconButton>
                </Box>
              </Box>
            </Drawer>
          </Grid>

          {/* RENDER PRODUCT DETAILS OR GRIDVIEW OR LISTVIEW CONDITIONALLY*/}
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
                  <p className="promount">Category</p>
                  <p className="protype">{product.category}</p>
                  <p className="procat">QTY {product.availableProductQty}</p>
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

      {/* RENDER NEW PRODUCT FORM CONDITIONALLY */}
      {showNewProd && (
        <div className="overlay">
          <Newprod
            onClose={handleCloseNewProd}
            onSaveAndSubmit={handleSaveAndSubmit}
            fromPurchaseModuleWizard={location.state?.openForm}
          />
        </div>
      )}
    </div>
  );
}
