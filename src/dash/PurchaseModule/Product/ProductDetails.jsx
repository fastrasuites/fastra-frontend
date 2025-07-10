import React, { useState, useEffect } from "react";
import "./ProductDetails.css";
import { formatDate } from "../../../helper/helper";
import {
  Box,
  Grid,
  Typography,
  TextField,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { useTenant } from "../../../context/TenantContext";
import { getTenantClient } from "../../../services/apiService";
import Swal from "sweetalert2";
import { usePurchase } from "../../../context/PurchaseContext";

export default function ProductDetails({ product, onClose, onSave }) {
  const initialState = {
    id: product.id || "",
    product_name: product.product_name || "",
    product_description: product.product_description || "",
    unit_of_measure_symbol:
      product.unit_of_measure_details?.unit_symbol ||
      product.unit_of_measure_details?.unit_name ||
      "",
    unit_of_measure: product.unit_of_measure_details?.url || "",
    category: product.product_category || "",
    available_product_quantity: product.available_product_quantity || 0,
    total_quantity_purchased: product.total_quantity_purchased || 0,
  };
  const { updateProduct } = usePurchase();
  const [editMode, setEditMode] = useState(false);
  const [savedUnits, setSavedUnits] = useState([]);
  const [formState, setFormState] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const { tenant_schema_name, access_token } = useTenant().tenantData || {};
  const client = getTenantClient(tenant_schema_name, access_token);
  console.log("checking value of products prop", product);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await client.get(`/purchase/unit-of-measure/`);
        const units = response.data;
        setSavedUnits(units);
      } catch (err) {
        console.log(err.message);
      }
    };
    fetchData();
  }, []);

  console.log("saved units", savedUnits);

  const categoryOptions = [
    { value: "consumable", label: "Consumable" },
    { value: "stockable", label: "Stockable" },
    { value: "service-product", label: "Service Product" },
  ];

  if (!product) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  const handleSave = async (event) => {
    try {
      event.preventDefault();
      setIsLoading(true);
      const result = await updateProduct(formState.id, formState);
      console.log("result from updateProduct", result);
      setIsLoading(false);

      if (result?.success && result.data) {
        Swal.fire({
          icon: "success",
          title: "Product Updated",
          text: "The product details updated successfully.",
        });

        // ✅ Use returned data to update formState
        const updated = result.data;
        console.log("updated product", updated);
        setFormState({
          id: updated.id,
          product_name: updated.product_name || "",
          product_description: updated.product_description || "",
          unit_of_measure_symbol:
            updated.unit_of_measure_details?.unit_symbol ||
            updated.unit_of_measure_details?.unit_name ||
            "",
          unit_of_measure: updated.unit_of_measure_details?.url || "",
          category: updated.product_category || "",
          available_product_quantity: updated.available_product_quantity || 0,
          total_quantity_purchased: updated.total_quantity_purchased || 0,
        });
        // setEditMode(false);
        onClose();
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text:
          err?.message || "There was an error updating the product details.",
      });
      setIsLoading(false);
    }
  };

  return (
    <Box id="prodetails" className="prodet">
      <form className="prodet1">
        <Box className="prodet2">
          <Typography>Basic Information</Typography>
          <Box className="prodet2a">
            <button type="button" className="prodet2but" onClick={onClose}>
              Cancel
            </button>
            {editMode ? (
              <button type="button" className="prodet2btn" onClick={handleSave}>
                Save
              </button>
            ) : (
              <button
                type="button"
                className="prodet2btn"
                onClick={() => setEditMode(true)}
              >
                Edit
              </button>
            )}
          </Box>
        </Box>
        {/* product details */}

        <Box className="prodet3">
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography variant="subtitle2" gutterBottom>
                Product Name
              </Typography>
              {editMode ? (
                <TextField
                  fullWidth
                  variant="outlined"
                  name="product_name"
                  value={formState.product_name}
                  onChange={handleChange}
                  size="small"
                />
              ) : (
                <Typography className="prodet3b">
                  {product.product_name}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography variant="subtitle2" gutterBottom>
                Product Description
              </Typography>
              {editMode ? (
                <TextField
                  fullWidth
                  variant="outlined"
                  name="product_description"
                  value={formState.product_description}
                  onChange={handleChange}
                  size="small"
                />
              ) : (
                <Typography className="prodet3b">
                  {product.product_description}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography variant="subtitle2" gutterBottom>
                Unit of Measure
              </Typography>
              {editMode ? (
                <TextField
                  select
                  fullWidth
                  variant="outlined"
                  name="unit_of_measure_symbol"
                  value={formState.unit_of_measure_symbol}
                  onChange={handleChange}
                  size="small"
                >
                  {savedUnits.map((option) => (
                    <MenuItem key={option.unit_name} value={option.unit_symbol}>
                      {option.unit_name} - {option.unit_category}
                    </MenuItem>
                  ))}
                </TextField>
              ) : (
                <Typography className="prodet3b">
                  {product.unit_of_measure_details?.unit_symbol}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography variant="subtitle2" gutterBottom>
                Category
              </Typography>
              {editMode ? (
                <TextField
                  select
                  fullWidth
                  variant="outlined"
                  name="category"
                  value={formState.category}
                  onChange={handleChange}
                  size="small"
                >
                  {categoryOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              ) : (
                <Typography className="prodet3b">
                  {product.product_category}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography variant="subtitle2" gutterBottom>
                Date Created
              </Typography>
              <Typography className="prodet3b">
                {formatDate(product.created_on)}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography variant="subtitle2" gutterBottom>
                Product Quantity
              </Typography>
              <Typography className="prodet3b">
                {product.available_product_quantity}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography variant="subtitle2" gutterBottom>
                Product Purchased
              </Typography>
              <Typography className="prodet3b">
                {product.total_quantity_purchased}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </form>
    </Box>
  );
}
