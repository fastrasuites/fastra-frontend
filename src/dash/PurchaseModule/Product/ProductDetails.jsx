import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Box, Typography, Skeleton, Grid, Button } from "@mui/material";
import { Link, useParams } from "react-router-dom";
import { usePurchase } from "../../../context/PurchaseContext";
import { formatDate } from "../../../helper/helper";
import "./ProductDetails.css";
import { useTenant } from "../../../context/TenantContext";
import Can from "../../../components/Access/Can";
import { transformProductCategory } from "../../../helper/helper";

const ProductDetails = () => {
  const { fetchSingleProduct, singleProducts } = usePurchase();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { tenantData } = useTenant();

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
    <Box id="prodetails" p={4}>
      <Can app="purchase" module="product" action="create">
        <Link to={`/${tenantData?.tenant_schema_name}/purchase/product/new`}>
          <Button variant="contained" mb={1} disableElevation>
            New Product
          </Button>
        </Link>
      </Can>
      <Box
        className="prodet1"
        bgcolor={"white"}
        border={"1px solid #E2E6E9"}
        p={4}
        borderRadius={4}
        marginTop={2}
      >
        <Box className="prodet2">
          <Typography>Basic Information</Typography>
          <Box className="prodet2a">
            <Link to={`/${tenantData?.tenant_schema_name}/purchase/product`}>
              <Button
                type="button"
                className="prodet2but"
                // onClick={() => window.history.back()}
              >
                Close
              </Button>
            </Link>

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
        {/* product details */}

        <Box className="prodet3">
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography variant="subtitle2" gutterBottom>
                Product Name
              </Typography>

              <Typography className="prodet3b">
                {product.product_name}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography variant="subtitle2" gutterBottom>
                Product Description
              </Typography>

              <Typography className="prodet3b">
                {product.product_description}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography variant="subtitle2" gutterBottom>
                Unit of Measure
              </Typography>

              <Typography className="prodet3b">
                {product.unit_of_measure_details?.unit_category} (
                {product.unit_of_measure_details?.unit_symbol})
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Typography variant="subtitle2" gutterBottom>
                Category
              </Typography>

              <Typography className="prodet3b">
                {transformProductCategory(product.product_category)}
              </Typography>
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
                Quantity Purchased
              </Typography>
              <Typography className="prodet3b">
                {product.total_quantity_purchased}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

ProductDetails.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default React.memo(ProductDetails);
