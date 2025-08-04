import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Typography,
  Skeleton,
  Grid,
  Button,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import { Link, useParams, useHistory } from "react-router-dom";
import { usePurchase } from "../../../context/PurchaseContext";
import { formatDate } from "../../../helper/helper";
import "./ProductDetails.css";
import { useTenant } from "../../../context/TenantContext";
import Can from "../../../components/Access/Can";
import { transformProductCategory } from "../../../helper/helper";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import Swal from "sweetalert2";

const ProductDetails = () => {
  const { fetchSingleProduct, singleProducts } = usePurchase();
  const { id } = useParams();
  const history = useHistory();
  const { tenantData } = useTenant();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [navigation, setNavigation] = useState({
    nextId: null,
    prevId: null,
    loading: false,
  });

  // Enhanced error handling
  const showError = useCallback((msg) => {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: msg,
      timer: 3000,
    });
  }, []);

  // Load product data with error handling
  const loadProduct = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchSingleProduct(id);
      if (!res) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Product data is not available for this ID",
        });
        return;
      }
      loadAdjacentIds(id);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load product.");
      showError(err.message || "Unable to load product.");
    } finally {
      setIsLoading(false);
    }
  }, [fetchSingleProduct, id, showError]);

  // Load adjacent product IDs (simple numeric IDs)
  const loadAdjacentIds = useCallback((currentId) => {
    try {
      setNavigation((prev) => ({ ...prev, loading: true }));

      const currentNum = parseInt(currentId, 10);
      if (isNaN(currentNum)) return;

      setNavigation({
        nextId: currentNum + 1,
        prevId: currentNum > 1 ? currentNum - 1 : null,
        loading: false,
      });
    } catch (error) {
      console.error("Navigation error:", error);
      setNavigation((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  // Handle navigation
  const handleNavigate = useCallback(
    (newId) => {
      if (!newId || navigation.loading) return;
      history.push(
        `/${tenantData?.tenant_schema_name}/purchase/product/${newId}`
      );
    },
    [history, navigation.loading, tenantData]
  );

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id, loadProduct]);

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
        <CircularProgress size={64} />
        <Typography variant="h6" sx={{ ml: 2, color: "text.secondary" }}>
          Loading product details...
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
        <Button
          variant="outlined"
          sx={{ mt: 2 }}
          onClick={() =>
            history.push(`/${tenantData?.tenant_schema_name}/purchase/product`)
          }
        >
          Back to Products
        </Button>
      </Box>
    );
  }

  if (!singleProducts) {
    return (
      <Box p={4} sx={{ textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary">
          No product found.
        </Typography>
        <Button
          variant="outlined"
          sx={{ mt: 2 }}
          onClick={() =>
            history.push(`/${tenantData?.tenant_schema_name}/purchase/product`)
          }
        >
          Back to Products
        </Button>
      </Box>
    );
  }

  const product = singleProducts;

  return (
    <Box id="prodetails" p={4}>
      <Can app="purchase" module="product" action="create">
        <Link to={`/${tenantData?.tenant_schema_name}/purchase/product/new`}>
          <Button variant="contained" mb={1} disableElevation>
            New Product
          </Button>
        </Link>
      </Can>

      {/* Navigation controls */}
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Box
          display="flex"
          alignItems="center"
          gap={1}
          bgcolor="white"
          border="1px solid #E2E6E9"
          borderRadius={1}
          py={0.5}
          px={1}
        >
          <Tooltip title="Previous Product">
            <span>
              <IconButton
                onClick={() => handleNavigate(navigation.prevId)}
                disabled={!navigation.prevId || navigation.loading}
                size="small"
              >
                {navigation.loading ? (
                  <CircularProgress size={20} />
                ) : (
                  <ArrowBackIosIcon fontSize="small" />
                )}
              </IconButton>
            </span>
          </Tooltip>

          <Box
            sx={{
              width: "2px",
              bgcolor: "#E2E6E9",
              alignSelf: "stretch",
              borderRadius: "1px",
            }}
          />

          <Tooltip title="Next Product">
            <span>
              <IconButton
                onClick={() => handleNavigate(navigation.nextId)}
                disabled={!navigation.nextId || navigation.loading}
                size="small"
              >
                {navigation.loading ? (
                  <CircularProgress size={20} />
                ) : (
                  <ArrowForwardIosIcon fontSize="small" />
                )}
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>

      <Box
        className="prodet1"
        bgcolor={"white"}
        border={"1px solid #E2E6E9"}
        p={4}
        borderRadius={4}
        marginTop={2}
      >
        <Box className="prodet2">
          <Typography variant="h6">Basic Information</Typography>
          <Box className="prodet2a">
            <Button
              type="button"
              className="prodet2but"
              onClick={() =>
                history.push(
                  `/${tenantData?.tenant_schema_name}/purchase/product`
                )
              }
            >
              Close
            </Button>

            <Can app="purchase" module="product" action="edit">
              <Link
                to={`/${tenantData?.tenant_schema_name}/purchase/product/edit/${product?.id}`}
              >
                <Button type="button" variant="contained" disableElevation>
                  Edit
                </Button>
              </Link>
            </Can>
          </Box>
        </Box>

        {/* Product details */}
        <Box className="prodet3">
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography variant="subtitle2" gutterBottom>
                Product Name
              </Typography>
              <Typography className="prodet3b">
                {product.product_name || "N/A"}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography variant="subtitle2" gutterBottom>
                Product Description
              </Typography>
              <Typography className="prodet3b">
                {product.product_description || "N/A"}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography variant="subtitle2" gutterBottom>
                Unit of Measure
              </Typography>
              <Typography className="prodet3b">
                {product.unit_of_measure_details?.unit_category
                  ? `${product.unit_of_measure_details.unit_category} (${
                      product.unit_of_measure_details.unit_symbol || ""
                    })`
                  : "N/A"}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography variant="subtitle2" gutterBottom>
                Category
              </Typography>
              <Typography className="prodet3b">
                {product.product_category
                  ? transformProductCategory(product.product_category)
                  : "N/A"}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography variant="subtitle2" gutterBottom>
                Date Created
              </Typography>
              <Typography className="prodet3b">
                {product.created_on ? formatDate(product.created_on) : "N/A"}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography variant="subtitle2" gutterBottom>
                Available Quantity
              </Typography>
              <Typography className="prodet3b">
                {product.available_product_quantity ?? "N/A"}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography variant="subtitle2" gutterBottom>
                Quantity Purchased
              </Typography>
              <Typography className="prodet3b">
                {product.total_quantity_purchased ?? "N/A"}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

ProductDetails.propTypes = {
  onClose: PropTypes.func,
};

ProductDetails.defaultProps = {
  onClose: () => {},
};

export default React.memo(ProductDetails);
