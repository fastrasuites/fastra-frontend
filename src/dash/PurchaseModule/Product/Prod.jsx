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
import { Link, useHistory } from "react-router-dom";
import Can from "../../../components/Access/Can";

export default function Prod() {
  const { products, fetchProducts } = usePurchase();
  const { tenantData } = useTenant();
  const history = useHistory();

  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handler = setTimeout(async () => {
      setLoading(true);
      await fetchProducts(searchQuery);
      setLoading(false);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [fetchProducts, searchQuery]);

  return (
    <Box p={4}>
      {/* Top Control Bar */}
      <Box
        display={"flex"}
        alignItems="center"
        mb={4}
        justifyContent={"space-between"}
      >
        <Box display={"flex"} gap={4}>
          <Can app="purchase" module="product" action="create">
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
          </Can>
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
        </Box>

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
      </Box>

      {/* Product Grid or List */}
      {viewMode === "grid" ? (
        <Grid container spacing={2}>
          {products.map((product) => (
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
                onClick={() =>
                  history.push(
                    `/${tenantData?.tenant_schema_name}/purchase/product/${product?.id}`
                  )
                }
              >
                <Typography variant="h6" mt={2}>
                  {product.product_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {product.category}
                </Typography>
                <Typography variant="caption">
                  {product?.unit_of_measure_details.unit_category}
                </Typography>
                <Typography>{product?.product_category}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {product.category}
                </Typography>
                <Typography variant="caption">
                  Qty: {product?.available_product_quantity}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      ) : (
        <ProdListview items={products} loading={loading} />
      )}
    </Box>
  );
}
