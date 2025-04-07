import React, { useState, useEffect } from "react";
import { FaCaretLeft, FaCaretRight } from "react-icons/fa";
import Select from "react-select";
import autosave from "../../../image/autosave.svg";
import productLogo from "../../../image/product-logo.svg";
import "./Newprod.css";
import { useHistory } from "react-router-dom";
import { Grid, TextField } from "@mui/material";
import styled from "styled-components";
import PurchaseHeader from "../PurchaseHeader";
import { getTenantClient } from "../../../services/apiService";
import { useTenant } from "../../../context/TenantContext";
// import Select from "react-select";

export default function Newprod({
  onClose,
  onSaveAndSubmit,
  fromPurchaseModuleWizard,
}) {
  const history = useHistory();
  const [formState, setFormState] = useState({
    // id: generateNewID(),
    name: "",
    unt: "",
    type: "",
    category: "",
    // sp: "",
    // cp: "",
    image: null, // New state for image
    productDesc: "",
    availableProductQty: "",
    totalQtyPurchased: "",
  });

  const [showForm] = useState(true);
  const [error, setError] = useState(null);
  const { tenantData } = useTenant();
  const { tenant_schema_name, access_token } = tenantData || {};
  const client = getTenantClient(tenant_schema_name, access_token);

  const handleChange = (e) => {
    const { name, value, productDesc, availableProductQty, totalQtyPurchased } =
      e.target;

    setFormState((prev) => ({
      ...prev,
      [name]: value,
      [productDesc]: value,
      [availableProductQty]: value,
      [totalQtyPurchased]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFormState((prev) => ({
        ...prev,
        image: imageUrl,
      }));
    }
  };

  const formatCurrency = (value) => {
    if (!value) return "";
    return `₦${value}`;
  };

  const handleSaveAndSubmit = (formData) => {
    try {
      onSaveAndSubmit(formData);
    } catch (e) {
      if (e.name === "QuotaExceededError") {
        setError("Failed to save product. Storage limit exceeded.");
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formState);
    const formData = new FormData();
    formData.append("product_name", formState.name);
    formData.append("unit_of_measure", formState.unt);
    // formData.append("type", formState.type);
    formData.append("product_category", formState.category);
    // formData.append("sp", formState.sp);
    // formData.append("cp", formState.cp);
    formData.append("product_description", formState.productDesc);
    formData.append(
      "available_product_quantity",
      formState.availableProductQty
    );
    formData.append("total_quantity_Purchased", formState.totalQtyPurchased);
    handleSaveAndSubmit(formData);
    onClose();

    // detect if true a user came from PurchaseModuleWizard, then navigate back for the next step:2
    if (fromPurchaseModuleWizard) {
      history.push({
        pathname: `/${tenant_schema_name}/purchase`,
        state: { step: 2 },
      });
    }
  };

  // Load saved units from localStorage
  const [selectedUnit, setSelectedUnit] = useState(null); // Changed variable name for clarity
  const [savedUnits, setSavedUnits] = useState([]);

  useEffect(() => {
    async function fetchData() {
      let units;
      try {
        const response = await client.get(`/purchase/unit-of-measure/`);
        console.log(response.data);
        units = response.data;
      } catch (err) {
        console.error("Error fetching unit-measure:", err);
      }

      if (units?.length === 0) {
        console.warn("No units found in database.");
      }
      setSavedUnits(units);
    }

    fetchData();
  }, [tenantData]); // Only run this effect once, on component mount

  const handleUnitChange = (newUnit) => {
    // Simplified the event parameter

    setSelectedUnit(newUnit);
    setFormState((prev) => ({
      ...prev,
      unt: newUnit ? newUnit.url : "", // Assuming you want to update the unit in form state
    }));

    // Log the selected unit
    if (newUnit) {
      console.log("Selected unit:", newUnit);
    }
  };

  const categoryOptions = [
    { value: "consumable", label: "Consumable" },
    { value: "stockable", label: "Stockable" },
    { value: "service Product", label: "Service Product" },
  ];

  const customStyles = {
    control: (provided) => ({
      ...provided,
      // width: "95%",
      marginTop: "0.1rem",
      cursor: "pointer",
      outline: "none",
      border: "2px solid #e2e6e9",
      borderRadius: "4px",
      padding: "5px",
      marginBottom: "1rem",
    }),
    menu: (provided) => ({
      ...provided,
      // width: "95%",
    }),
    menuList: (provided) => ({
      ...provided,
      // width: "95%",
    }),
    option: (provided) => ({
      ...provided,
      cursor: "pointer",
    }),
  };

  return (
    <div className="newp-contain ">
      {/* <PurchaseHeader /> */}
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
          {/* form for create/add new products starts here */}
          <div className="newp3">
            <form className="newpform" onSubmit={handleSubmit}>
              <div className="newp3a">
                <p style={{ fontSize: "20px" }}>Basic Information</p>
                <button
                  type="button"
                  className="newp3but"
                  onClick={onClose}
                  style={{ marginTop: "1rem" }}
                >
                  Cancel
                </button>
              </div>

              {/* Upload product logo */}
              <div className="newuser3ba" style={{ marginBlock: "24px" }}>
                <div
                  className="image-upload"
                  onClick={() => document.getElementById("imageInput").click()}
                >
                  <input
                    type="file"
                    accept=".png, .jpg, .jpeg"
                    onChange={handleImageChange}
                    id="imageInput"
                    name="image"
                    style={{ display: "none" }}
                  />
                  {formState.image ? (
                    <img
                      src={formState.image}
                      alt="Preview"
                      className="image-preview"
                    />
                  ) : (
                    <div className="image-upload-text">
                      <img src={productLogo} alt="Upload" />
                      {/* <span style={{ fontSize: "10px" }}>Click to upload</span> */}
                    </div>
                  )}
                </div>
              </div>

              <Grid container spacing={3}>
                {" "}
                {/* spacing adds equidistant gaps */}
                <Grid item xs={12} sm={6} md={4}>
                  {" "}
                  {/* Full width on xs, 2 cols on sm, 3 cols on md */}
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
                      (option) => option.value === formState.category
                    )}
                    onChange={(selectedOption) =>
                      setFormState((prev) => ({
                        ...prev,
                        category: selectedOption ? selectedOption.value : "",
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
                    options={savedUnits} // Populate options from localStorage
                    getOptionLabel={(option) =>
                      `${option.unit_name} - ${option.unit_category}`
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Currency"
                        className="newpod3cb"
                      />
                    )}
                  />
                </Grid>
              </Grid>
              <hr
                style={{ border: "1.2px solid #E2E6E9", marginTop: "32px" }}
              />

              {/* Tobe deleted later */}

              <Button type="submit">Create Product</Button>

              {error && <p className="error-message">{error}</p>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

const Button = styled.button`
  padding: 8px 24px 8px 24px;
  border-radius: 4px;
  opacity: 0px;
  background: #3b7ced;
  border: solid 1px #3b7ced;
  display: inline-flex;
  width: max-content;
  cursor: pointer;
  margin-top: 32px;

  font-size: 16px;
  font-weight: 400;
  // line-height: 19.41px;
  // text-align: center;
  color: #ffffff;
`;
