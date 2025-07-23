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
  Grid,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Link, useParams } from "react-router-dom";
import { usePurchase } from "../../../context/PurchaseContext";
import { formatDate } from "../../../helper/helper";
import "./ProductDetails.css";
import { useTenant } from "../../../context/TenantContext";
import Can from "../../../components/Access/Can";

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
            <Button
              type="button"
              className="prodet2but"
              onClick={() => window.history.back()}
            >
              Cancel
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
                {product.product_category}
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

// import React, { useState, useEffect } from "react";
// import "./ProductDetails.css";
// import { formatDate } from "../../../helper/helper";
// import {
//   Box,
//   Grid,
//   Typography,
//   TextField,
//   MenuItem,
//   CircularProgress,
// } from "@mui/material";
// import { useTenant } from "../../../context/TenantContext";
// import { getTenantClient } from "../../../services/apiService";
// import Swal from "sweetalert2";
// import { usePurchase } from "../../../context/PurchaseContext";

// export default function ProductDetails({ product, onClose, onSave }) {
//   const initialState = {
//     id: product.id || "",
//     product_name: product.product_name || "",
//     product_description: product.product_description || "",
//     unit_of_measure_symbol:
//       product.unit_of_measure_details?.unit_symbol ||
//       product.unit_of_measure_details?.unit_name ||
//       "",
//     unit_of_measure: product.unit_of_measure_details?.url || "",
//     category: product.product_category || "",
//     available_product_quantity: product.available_product_quantity || 0,
//     total_quantity_purchased: product.total_quantity_purchased || 0,
//   };
//   const { updateProduct } = usePurchase();
//   const [editMode, setEditMode] = useState(false);
//   const [savedUnits, setSavedUnits] = useState([]);
//   const [formState, setFormState] = useState(initialState);
//   const [isLoading, setIsLoading] = useState(false);
//   const { tenant_schema_name, access_token } = useTenant().tenantData || {};
//   const client = getTenantClient(tenant_schema_name, access_token);
//   const id = useParams();

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await client.get(/purchase/unit-of-measure/);
//         const units = response.data;
//         setSavedUnits(units);
//       } catch (err) {
//       }
//     };
//     fetchData();
//   }, []);

//   const categoryOptions = [
//     { value: "consumable", label: "Consumable" },
//     { value: "stockable", label: "Stockable" },
//     { value: "service-product", label: "Service Product" },
//   ];

//   if (!product) return null;

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormState((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   if (isLoading) {
//     return (
//       <Box
//         display="flex"
//         justifyContent="center"
//         alignItems="center"
//         height="100vh"
//       >
//         <CircularProgress />
//       </Box>
//     );
//   }

//   const handleSave = async (event) => {
//     try {
//       event.preventDefault();
//       setIsLoading(true);
//       const result = await updateProduct(formState.id, formState);
//       setIsLoading(false);

//       if (result?.success && result.data) {
//         Swal.fire({
//           icon: "success",
//           title: "Product Updated",
//           text: "The product details updated successfully.",
//         });

//         // ✅ Use returned data to update formState
//         const updated = result.data;
//         setFormState({
//           id: updated.id,
//           product_name: updated.product_name || "",
//           product_description: updated.product_description || "",
//           unit_of_measure_symbol:
//             updated.unit_of_measure_details?.unit_symbol ||
//             updated.unit_of_measure_details?.unit_name ||
//             "",
//           unit_of_measure: updated.unit_of_measure_details?.url || "",
//           category: updated.product_category || "",
//           available_product_quantity: updated.available_product_quantity || 0,
//           total_quantity_purchased: updated.total_quantity_purchased || 0,
//         });
//         // setEditMode(false);
//         onClose();
//       }
//     } catch (err) {
//       Swal.fire({
//         icon: "error",
//         title: "Update Failed",
//         text:
//           err?.message || "There was an error updating the product details.",
//       });
//       setIsLoading(false);
//     }
//   };

//   return (
//     <Box id="prodetails" className="prodet">
//       <form className="prodet1">
//         <Box className="prodet2">
//           <Typography>Basic Information</Typography>
//           <Box className="prodet2a">
//             <button type="button" className="prodet2but" onClick={onClose}>
//               Cancel
//             </button>
//             {editMode ? (
//               <button type="button" className="prodet2btn" onClick={handleSave}>
//                 Save
//               </button>
//             ) : (
//               <button
//                 type="button"
//                 className="prodet2btn"
//                 onClick={() => setEditMode(true)}
//               >
//                 Edit
//               </button>
//             )}
//           </Box>
//         </Box>
//         {/* product details */}

//         <Box className="prodet3">
//           <Grid container spacing={3}>
//             <Grid item xs={12} sm={6} md={4} lg={3}>
//               <Typography variant="subtitle2" gutterBottom>
//                 Product Name
//               </Typography>
//               {editMode ? (
//                 <TextField
//                   fullWidth
//                   variant="outlined"
//                   name="product_name"
//                   value={formState.product_name}
//                   onChange={handleChange}
//                   size="small"
//                 />
//               ) : (
//                 <Typography className="prodet3b">
//                   {product.product_name}
//                 </Typography>
//               )}
//             </Grid>

//             <Grid item xs={12} sm={6} md={4} lg={3}>
//               <Typography variant="subtitle2" gutterBottom>
//                 Product Description
//               </Typography>
//               {editMode ? (
//                 <TextField
//                   fullWidth
//                   variant="outlined"
//                   name="product_description"
//                   value={formState.product_description}
//                   onChange={handleChange}
//                   size="small"
//                 />
//               ) : (
//                 <Typography className="prodet3b">
//                   {product.product_description}
//                 </Typography>
//               )}
//             </Grid>

//             <Grid item xs={12} sm={6} md={4} lg={3}>
//               <Typography variant="subtitle2" gutterBottom>
//                 Unit of Measure
//               </Typography>
//               {editMode ? (
//                 <TextField
//                   select
//                   fullWidth
//                   variant="outlined"
//                   name="unit_of_measure_symbol"
//                   value={formState.unit_of_measure_symbol}
//                   onChange={handleChange}
//                   size="small"
//                 >
//                   {savedUnits.map((option) => (
//                     <MenuItem key={option.unit_name} value={option.unit_symbol}>
//                       {option.unit_name} - {option.unit_category}
//                     </MenuItem>
//                   ))}
//                 </TextField>
//               ) : (
//                 <Typography className="prodet3b">
//                   {product.unit_of_measure_details?.unit_symbol}
//                 </Typography>
//               )}
//             </Grid>

//             <Grid item xs={12} sm={6} md={4} lg={3}>
//               <Typography variant="subtitle2" gutterBottom>
//                 Category
//               </Typography>
//               {editMode ? (
//                 <TextField
//                   select
//                   fullWidth
//                   variant="outlined"
//                   name="category"
//                   value={formState.category}
//                   onChange={handleChange}
//                   size="small"
//                 >
//                   {categoryOptions.map((option) => (
//                     <MenuItem key={option.value} value={option.value}>
//                       {option.label}
//                     </MenuItem>
//                   ))}
//                 </TextField>
//               ) : (
//                 <Typography className="prodet3b">
//                   {product.product_category}
//                 </Typography>
//               )}
//             </Grid>

//             <Grid item xs={12} sm={6} md={4} lg={3}>
//               <Typography variant="subtitle2" gutterBottom>
//                 Date Created
//               </Typography>
//               <Typography className="prodet3b">
//                 {formatDate(product.created_on)}
//               </Typography>
//             </Grid>

//             <Grid item xs={12} sm={6} md={4} lg={3}>
//               <Typography variant="subtitle2" gutterBottom>
//                 Product Quantity
//               </Typography>
//               <Typography className="prodet3b">
//                 {product.available_product_quantity}
//               </Typography>
//             </Grid>

//             <Grid item xs={12} sm={6} md={4} lg={3}>
//               <Typography variant="subtitle2" gutterBottom>
//                 Product Purchased
//               </Typography>
//               <Typography className="prodet3b">
//                 {product.total_quantity_purchased}
//               </Typography>
//             </Grid>
//           </Grid>
//         </Box>
//       </form>
//     </Box>
//   );
// }
