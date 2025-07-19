import React, { useEffect, useState } from "react";
import Select from "react-select";
import { useParams, useHistory } from "react-router-dom";
import { Grid, TextField, CircularProgress, Box, Button } from "@mui/material";
import { useTenant } from "../../../context/TenantContext";
import { usePurchase } from "../../../context/PurchaseContext";
import { getTenantClient } from "../../../services/apiService";
import Swal from "sweetalert2";
import "./Newprod.css";

export default function EditProduct() {
  const { id } = useParams();
  const history = useHistory();
  const { tenantData } = useTenant();
  const { tenant_schema_name, access_token } = tenantData || {};
  const { updateProduct } = usePurchase();
  const client = getTenantClient(tenant_schema_name, access_token);

  const [loading, setLoading] = useState(true);
  const [savedUnits, setSavedUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState({
    name: "",
    unt: "",
    type: "",
    category: "",
    productDesc: "",
    availableProductQty: 0,
    totalQtyPurchased: 0,
  });

  const categoryOptions = [
    { value: "consumable", label: "Consumable" },
    { value: "stockable", label: "Stockable" },
    { value: "service-product", label: "Service Product" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, unitsRes] = await Promise.all([
          client.get(`/purchase/products/${id}/`),
          client.get(`/purchase/unit-of-measure/`),
        ]);

        const product = productRes.data;
        setSavedUnits(unitsRes.data || []);

        setFormState({
          name: product.product_name,
          unt: product.unit_of_measure_details?.url || "",
          category: product.product_category,
          productDesc: product.product_description,
          availableProductQty: product.available_product_quantity,
          totalQtyPurchased: product.total_quantity_purchased,
        });

        const matchedUnit = unitsRes.data.find(
          (u) => u.url === product.unit_of_measure_details?.url
        );
        setSelectedUnit(matchedUnit || null);
      } catch (err) {
        console.error("Failed to load product:", err);
        setError("Failed to load product data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleUnitChange = (newUnit) => {
    setSelectedUnit(newUnit);
    setFormState((prev) => ({ ...prev, unt: newUnit ? newUnit.url : "" }));
  };

  const extractID = (url) => {
    const parts = url.split("/").filter(Boolean);
    return parts[parts.length - 1];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formState.name || !formState.category || !formState.unt) {
      Swal.fire({
        icon: "warning",
        title: "Missing Information",
        text: "Please fill in Product Name, Category, and Unit of Measure.",
      });
      setIsSubmitting(false);
      return;
    }

    const updatedData = {
      product_name: formState.name,
      product_description: formState.productDesc,
      product_category: formState.category,
      available_product_quantity: formState.availableProductQty,
      total_quantity_purchased: formState.totalQtyPurchased,
      unit_of_measure: extractID(formState.unt),
    };

    try {
      const result = await updateProduct(id, updatedData);

      if (result?.success) {
        Swal.fire({
          icon: "success",
          title: "Product Updated",
          text: "Product details have been updated successfully.",
        });
        history.push(
          `/${tenant_schema_name}/purchase/product/${result?.data?.id}`
        );
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "Could not update product. Try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const customStyles = {
    control: (provided) => ({
      ...provided,
      marginTop: "0.1rem",
      border: "2px solid #e2e6e9",
      borderRadius: "4px",
      padding: "5px",
      marginBottom: "1rem",
    }),
    option: (provided) => ({ ...provided, cursor: "pointer" }),
  };

  if (loading) return <CircularProgress />;
  if (error) return <p>{error}</p>;

  return (
    <div className="newp-contain">
      <div className="newp fade-in">
        <div className="newp1">
          <div className="newp2">
            <Box
              display={"flex"}
              justifyContent={"space-between"}
              flex={1}
              py={4}
            >
              <p className="newphed">Edit Product</p>
              <Button variate="outlined" onClick={() => window.history.back()}>
                Close
              </Button>
            </Box>
          </div>

          <div className="newp3">
            <form className="newpform" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <label>Product Name</label>
                  <TextField
                    fullWidth
                    type="text"
                    name="name"
                    value={formState.name}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <label>Product Description</label>
                  <TextField
                    fullWidth
                    type="text"
                    name="productDesc"
                    value={formState.productDesc}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <label>Available Product Quantity</label>
                  <TextField
                    fullWidth
                    type="number"
                    name="availableProductQty"
                    value={formState.availableProductQty}
                    disabled
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <label>Total Quantity Purchased</label>
                  <TextField
                    fullWidth
                    type="number"
                    name="totalQtyPurchased"
                    value={formState.totalQtyPurchased}
                    disabled
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <label>Category</label>
                  <Select
                    placeholder="Select Category"
                    options={categoryOptions}
                    name="category"
                    styles={customStyles}
                    value={categoryOptions.find(
                      (opt) => opt.value === formState.category
                    )}
                    onChange={(opt) =>
                      setFormState((prev) => ({
                        ...prev,
                        category: opt ? opt.value : "",
                      }))
                    }
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <label>Unit of Measure</label>
                  <Select
                    value={selectedUnit}
                    onChange={handleUnitChange}
                    options={savedUnits}
                    getOptionLabel={(opt) =>
                      `${opt.unit_name} - ${opt.unit_category}`
                    }
                    styles={customStyles}
                  />
                </Grid>
              </Grid>

              <hr
                style={{ border: "1.2px solid #E2E6E9", marginTop: "32px" }}
              />
              <Box display={"flex"} mt={2}>
                <Button
                  variant="contained"
                  disableElevation
                  type="submit"
                  disabled={isSubmitting}
                >
                  Update Product
                </Button>
              </Box>
              {error && <p className="error-message">{error}</p>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
