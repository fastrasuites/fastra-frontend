import React, { useState, useEffect } from "react";
import { usePurchase } from "../../../context/PurchaseContext";
import { useTenant } from "../../../context/TenantContext";
import {
  Box,
  Button,
  Grid,
  IconButton,
  InputBase,
  Typography,
} from "@mui/material";

import { FaThList } from "react-icons/fa";
import { IoGrid } from "react-icons/io5";

import SearchIcon from "../../../image/search.svg";
import ProdListview from "./ProdListview";
import { Link } from "react-router-dom";

export default function Prod() {
  const tenant = useTenant().tenantData.tenant_schema_name;
  const { products } = usePurchase();

  const [filteredProducts, setFilteredProducts] = useState(products);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("list");

  useEffect(() => {
    setFilteredProducts(products);
  }, [products]);

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

  return (
    <Box p={4}>
      {/* Top Control Bar */}
      <Grid container spacing={2} alignItems="center" mb={4}>
        <Grid item>
          <Link to={"product/new"}>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#3B7CED",
                color: "white",
                textTransform: "capitalize",
              }}
            >
              New Product
            </Button>
          </Link>
        </Grid>

        <Grid item>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              border: "1px solid #ccc",
              borderRadius: "4px",
              paddingLeft: "10px",
              height: "40px",
            }}
          >
            <img src={SearchIcon} alt="Search" style={{ height: "20px" }} />
            <InputBase
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              sx={{ ml: 1, height: "100%", padding: "0 8px" }}
            />
          </Box>
        </Grid>

        <Grid item>
          <IconButton onClick={() => setViewMode("grid")}>
            <IoGrid
              style={{
                color: viewMode === "grid" ? "#3B7CED" : "#A9B3BC",
              }}
            />
          </IconButton>
          <IconButton onClick={() => setViewMode("list")}>
            <FaThList
              style={{
                color: viewMode === "list" ? "#3B7CED" : "#A9B3BC",
              }}
            />
          </IconButton>
        </Grid>
      </Grid>

      {/* Product Grid or List */}
      {viewMode === "grid" ? (
        <Grid container spacing={2}>
          {filteredProducts.map((product) => (
            <Grid item key={product.id} xs={12} sm={6} md={4}>
              <Box
                sx={{
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  padding: 2,
                  cursor: "pointer",
                  textAlign: "center",
                  bgcolor: "#fafafa",
                }}
              >
                <img
                  src={product.image || "default-image-url"}
                  alt={product.name}
                  style={{ width: "100%", height: 150, objectFit: "cover" }}
                />
                <Typography variant="h6" mt={2}>
                  {product.product_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {product.category}
                </Typography>
                <Typography variant="caption">
                  Qty: {product.availableProductQty}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      ) : (
        <ProdListview items={filteredProducts} onItemClick={() => {}} />
      )}
    </Box>
  );
}
