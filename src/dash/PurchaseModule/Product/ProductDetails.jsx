import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Typography,
  Avatar,
  Stack,
  Skeleton,
  Button,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useParams } from "react-router-dom";
import { usePurchase } from "../../../context/PurchaseContext";

const ProductDetails = () => {
  const { fetchSingleProduct, singleProducts } = usePurchase();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        await fetchSingleProduct(id);
      } catch (err) {
        console.error(err);
        setError("Unable to load product.");
      }
      setIsLoading(false);
    })();
  }, [fetchSingleProduct, id]);

  if (isLoading) {
    return (
      <Box
        p={4}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <Skeleton variant="circular" width={64} height={64} />
        <Typography variant="h6" sx={{ ml: 2, color: "text.secondary" }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4} sx={{ textAlign: "center" }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  if (!singleProducts) {
    return (
      <Box p={4} sx={{ textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary">
          No product found.
        </Typography>
      </Box>
    );
  }

  const product = singleProducts;

  return (
    <Box p={4} pr={10} sx={{ minHeight: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
        <Typography variant="h4" sx={{ color: "#1976d2", fontWeight: 600 }}>
          Product Details
        </Typography>
        {/* Action Buttons */}
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button variant="outlined" onClick={() => window.history.back()}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              // Add your edit handler here
              console.log("Edit button clicked");
            }}
          >
            Edit
          </Button>
        </Stack>
      </Box>

      <Box
        sx={{
          p: 3,
          bgcolor: "#fff",
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, color: "#1976d2" }}>
          Basic Information
        </Typography>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={4}
          sx={{ mb: 4 }}
        >
          <Box flex={1}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Product Name
            </Typography>
            <Typography variant="body1" color="text.primary">
              {product.product_name || "-"}
            </Typography>
          </Box>

          <Box flex={1}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Unit of Measure
            </Typography>
            <Typography variant="body1" color="text.primary">
              {product.unit_of_measure_details.unit_name || "-"}
            </Typography>
          </Box>

          <Box flex={1}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Category
            </Typography>
            <Typography variant="body1" color="text.primary">
              {product.product_category || "-"}
            </Typography>
          </Box>

          <Box flex={1}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" color="text.primary">
              {product.product_description || "-"}
            </Typography>
          </Box>

          <Box sx={{ textAlign: "center", width: 120 }}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Image
            </Typography>
            {product.image ? (
              <Avatar
                variant="rounded"
                src={product.image}
                alt={product.product_name}
                sx={{ width: 96, height: 96, mx: "auto" }}
              />
            ) : (
              <Skeleton variant="rectangular" width={96} height={96} />
            )}
          </Box>
        </Stack>

        <Typography variant="h6" sx={{ mb: 2, color: "#1976d2" }}>
          Pricing
        </Typography>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={4}
          sx={{ mb: 4 }}
        >
          <Box flex={1}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Selling Price
            </Typography>
            <Typography variant="body1" color="text.primary">
              {product.sp != null ? `₦${product.sp}` : "-"}
            </Typography>
          </Box>

          <Box flex={1}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Cost Price
            </Typography>
            <Typography variant="body1" color="text.primary">
              {product.cp != null ? `₦${product.cp}` : "-"}
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

ProductDetails.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default React.memo(ProductDetails);
