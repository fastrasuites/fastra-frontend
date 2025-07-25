import React, { useState, useEffect } from "react";
import Select from "react-select";
import autosave from "../../../image/autosave.svg";
import "./Newprod.css";
import { useHistory, useLocation } from "react-router-dom";
import { Grid, TextField, Button } from "@mui/material";
import styled from "styled-components";
import { getTenantClient } from "../../../services/apiService";
import { useTenant } from "../../../context/TenantContext";
import Swal from "sweetalert2";
import { usePurchase } from "../../../context/PurchaseContext";

const WIZARD_STORAGE_KEY = "purchaseWizardState";

export default function Newprod() {
  const history = useHistory();
  const [formState, setFormState] = useState({
    name: "",
    unt: "",
    type: "",
    category: "",
    productDesc: "",
    availableProductQty: 0,
    totalQtyPurchased: 0,
  });
  const [showForm] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { tenantData } = useTenant();
  const { tenant_schema_name, access_token } = tenantData || {};
  const client = getTenantClient(tenant_schema_name, access_token);

  const [savedUnits, setSavedUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const { createProduct } = usePurchase();
  const location = useLocation();

  const fromPurchaseModuleWizard = location.state?.openForm;

  console.log("fromPurchaseModuleWizard: ", fromPurchaseModuleWizard);

  // Fetch saved units
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await client.get(`/purchase/unit-of-measure/`);
        const units = response.data || [];
        setSavedUnits(units);
      } catch (err) {
        console.error("Error fetching unit-measure:", err);
      }
    }
    fetchData();
  }, [tenantData]);

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
    if (newUnit) console.log("Selected unit:", newUnit);
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

    const extractID = (url) => {
      if (!url) {
        console.warn("extractRFQID: url is undefined");
        return ""; // or handle the case appropriately
      }
      const segments = url.split("/").filter(Boolean);
      return segments[segments.length - 1];
    };
    try {
      const payload = new FormData();
      payload.append("product_name", formState.name);
      payload.append("unit_of_measure", extractID(formState.unt));
      payload.append("product_category", formState.category);
      payload.append("product_description", formState.productDesc);
      payload.append(
        "available_product_quantity",
        formState.availableProductQty
      );
      payload.append("total_quantity_Purchased", formState.totalQtyPurchased);

      // for (const [key, value] of payload.entries()) {
      // }
      setError(null);

      const response = await createProduct(payload);
      console.log("Full response:", response);

      const id = response?.data?.id;
      if (!id) {
        console.warn("Product ID not returned:", response?.data);
        throw new Error("Product creation failed: No ID returned.");
      }

      Swal.fire({
        icon: "success",
        title: "Product Created",
        text: "Your new product has been saved successfully.",
      });

      if (fromPurchaseModuleWizard) {
        const wizardState =
          JSON.parse(localStorage.getItem(WIZARD_STORAGE_KEY)) || {};
        const updatedState = { ...wizardState, currentStep: 3, hidden: false };

        localStorage.setItem(WIZARD_STORAGE_KEY, JSON.stringify(updatedState));

        history.push(`/${tenant_schema_name}/purchase/purchase-request`);
        return;
      }

      history.push(`/${tenant_schema_name}/purchase/product/${id}`);
    } catch (err) {
      console.error("Submission error:", err);
      Swal.fire({
        icon: "error",
        title: "Save Failed",
        text: err.message || "An unexpected error occurred while saving.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions = [
    { value: "consumable", label: "Consumable" },
    { value: "stockable", label: "Stockable" },
    { value: "service-product", label: "Service Product" },
  ];

  const customStyles = {
    control: (provided) => ({
      ...provided,
      marginTop: "0.1rem",
      cursor: "pointer",
      outline: "none",
      border: "2px solid #e2e6e9",
      borderRadius: "4px",
      padding: "5px",
      marginBottom: "1rem",
    }),
    menu: (provided) => ({ ...provided }),
    menuList: (provided) => ({ ...provided }),
    option: (provided) => ({
      ...provided,
      cursor: "pointer",
    }),
  };

  return (
    <div className="newp-contain ">
      <div id="newprod" className={`newp ${showForm ? "fade-in" : "fade-out"}`}>
        <div className="newp1">
          <div className="newp2">
            <div className="newp2a">
              <p className="newphed">New Product</p>
              <div className="newpauto">
                <p>Autosaved</p>
                <img src={autosave} alt="Autosaved" />
              </div>
            </div>
          </div>
          <div className="newp3">
            <form className="newpform" onSubmit={handleSubmit}>
              <div className="newp3a">
                <p style={{ fontSize: "20px" }}>Basic Information</p>

                <Button
                  variant="text"
                  // color="secondary"
                  onClick={() => window.history.back()}
                  sx={{ mt: 2 }}
                >
                  Close
                </Button>
              </div>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <div style={{ marginBottom: "8px" }}>
                    <label>Product Name</label>
                  </div>
                  <TextField
                    fullWidth
                    type="text"
                    name="name"
                    placeholder="Meat Burger"
                    value={formState.name}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <div style={{ marginBottom: "8px" }}>
                    <label>Product Description</label>
                  </div>
                  <TextField
                    fullWidth
                    type="text"
                    name="productDesc"
                    placeholder="White"
                    value={formState.productDesc}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <div style={{ marginBottom: "8px" }}>
                    <label>Available Product Quantity</label>
                  </div>
                  <TextField
                    fullWidth
                    type="number"
                    name="availableProductQty"
                    placeholder="0"
                    value={formState.availableProductQty}
                    onChange={handleChange}
                    disabled
                    variant="standard"
                    InputProps={{
                      disableUnderline: true,
                      sx: {
                        backgroundColor: "transparent",
                        color: "text.primary",
                        cursor: "default",
                      },
                    }}
                    sx={{
                      p: 1,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <div style={{ marginBottom: "8px" }}>
                    <label>Total Quantity Purchased</label>
                  </div>
                  <TextField
                    fullWidth
                    type="number"
                    name="totalQtyPurchased"
                    placeholder="0"
                    value={formState.totalQtyPurchased}
                    onChange={handleChange}
                    disabled
                    variant="standard"
                    InputProps={{
                      disableUnderline: true,
                      sx: {
                        backgroundColor: "transparent",
                        color: "text.primary",
                        cursor: "default",
                      },
                    }}
                    sx={{
                      p: 1,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <div style={{ marginBottom: "8px" }}>
                    <label>Category</label>
                  </div>
                  <Select
                    placeholder="Select Product Category"
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
                  <div style={{ marginBottom: "8px" }}>
                    <label>Unit of Measure</label>
                  </div>
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
                style={{ border: "1.2px solid #E2E6E9", marginBlock: "32px" }}
              />

              <Button
                variant="contained"
                sx={{ display: "inline", alignSelf: "flex-start" }}
                type="submit"
                disabled={isSubmitting}
              >
                Create Product
              </Button>

              {error && <p className="error-message">{error}</p>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
