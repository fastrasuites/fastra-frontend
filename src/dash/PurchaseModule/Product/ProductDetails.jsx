import React, { useState } from "react";
import "./ProductDetails.css";
import { formatDate } from "../../../helper/helper";
import { Box, Grid, Typography, TextField } from "@mui/material";

export default function ProductDetails({ product, onClose, onSave }) {
  const [editMode, setEditMode] = useState(false);
  const [formState, setFormState] = useState({ ...product });
  console.log("checking value of products prop", product);

  if (!product) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    onSave(formState);
    setEditMode(false);
  };
  console.log("product details formState", formState);
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
                disabled
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
                  name="name"
                  value={formState.name}
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
                  name="product description"
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
                  fullWidth
                  variant="outlined"
                  name="unit of measure"
                  value={formState.unt}
                  onChange={handleChange}
                  size="small"
                />
              ) : (
                <Typography className="prodet3b">
                  {product.unit_of_measure_details.unit_symbol}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography variant="subtitle2" gutterBottom>
                Category
              </Typography>
              {editMode ? (
                <TextField
                  fullWidth
                  variant="outlined"
                  name="category"
                  value={formState.category}
                  onChange={handleChange}
                  size="small"
                />
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
