import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { FaCaretLeft, FaCaretRight } from "react-icons/fa";
import autosave from "../../../image/autosave.svg";
import "./Newvendor.css";
import vendorLogo from "../../../image/vendor-logo.svg";
import { Grid, TextField, Box, Divider, Typography } from "@mui/material";
import { usePurchase } from "../../../context/PurchaseContext";
import { useTenant } from "../../../context/TenantContext";
import Swal from "sweetalert2";

const WIZARD_STORAGE_KEY = "purchaseWizardState";

export default function Newvendor({
  onClose,
  fromPurchaseModuleWizard,
  onSaveAndSubmit,
}) {
  const history = useHistory();
  const tenant_schema_name = useTenant().tenantData?.tenant_schema_name;
  const { createVendor } = usePurchase();
  const [showForm] = useState(true);

  const [formState, setFormState] = useState({
    vendor_name: "",
    email: "",
    phone_number: "",
    address: "",
    imageFile: null,
    imagePreview: "",
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0] || null;
    if (file) {
      const validTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!validTypes.includes(file.type)) {
        Swal.fire({
          icon: "error",
          title: "Invalid file type",
          text: "Please upload JPEG or PNG.",
        });
        return;
      }
      if (file.size > 1 * 1024 * 1024) {
        Swal.fire({
          icon: "error",
          title: "File too large",
          text: "Max size is 1MB.",
        });
        setFormState((prev) => ({
          ...prev,
          imageFile: null,
          imagePreview: "",
        }));
        return;
      }
      setFormState((prev) => ({
        ...prev,
        imageFile: file,
        imagePreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formState.vendor_name) {
      Swal.fire({
        icon: "warning",
        title: "Missing Name",
        text: "Vendor name is required.",
      });
      return;
    }
    const data = new FormData();
    data.append("company_name", formState.vendor_name);
    data.append("email", formState.email);
    data.append("address", formState.address);
    data.append("phone_number", formState.phone_number);
    if (formState.imageFile instanceof File) {
      data.append("profile_picture_image", formState.imageFile);
    }

    createVendor(data);
    onSaveAndSubmit?.(data);
    onClose();

    if (fromPurchaseModuleWizard) {
      const saved = JSON.parse(
        localStorage.getItem(WIZARD_STORAGE_KEY) || "{}"
      );
      saved.currentStep = 4;
      saved.hidden = false;
      localStorage.setItem(WIZARD_STORAGE_KEY, JSON.stringify(saved));
      history.push(`/${tenant_schema_name}/purchase`);
    }
  };

  return (
    <div className="nvr-contain">
      <div id="nvr" className={`nvr ${showForm ? "fade-in" : "fade-out"}`}>
        <div className="nvr1">
          <div className="nvr2">
            <div className="nvr2a">
              <p className="nvrhed">New Vendor</p>
              <div className="nvrauto">
                <p>Autosaved</p>
                <img src={autosave} alt="Autosaved" />
              </div>
            </div>
            <div className="nvr2b">
              <p>1 - 6 of 6</p>
              <div className="nvrbnav">
                <FaCaretLeft className="nr" />
                <div className="sep"></div>
                <FaCaretRight className="nr" />
              </div>
            </div>
          </div>
          <div className="nvr3">
            <form className="nvrform" onSubmit={handleSubmit}>
              <div className="nvr3a">
                <p style={{ fontSize: "20px" }}>Basic Information</p>
                <button
                  type="button"
                  className="nvr3but"
                  onClick={onClose}
                  style={{ marginTop: "1rem" }}
                >
                  Cancel
                </button>
              </div>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography gutterBottom>Vendor Name</Typography>
                  <TextField
                    fullWidth
                    name="vendor_name"
                    placeholder="Cee Que Enterprise"
                    value={formState.vendor_name}
                    onChange={handleChange}
                  />
                </Grid>
              </Grid>

              <Divider
                sx={{
                  marginY: "32px",
                  borderColor: "#E2E6E9",
                  borderWidth: "1.2px",
                }}
              />

              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Box
                    onClick={() =>
                      document.getElementById("imageInput").click()
                    }
                    sx={{
                      width: "98px",
                      height: "98px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      borderRadius: "8px",
                      overflow: "hidden",
                    }}
                  >
                    <input
                      id="imageInput"
                      type="file"
                      accept="image/png, image/jpg, image/jpeg"
                      onChange={handleImageUpload}
                      style={{ display: "none" }}
                    />
                    {formState.imagePreview ? (
                      <img
                        src={formState.imagePreview}
                        alt="Preview"
                        style={{
                          width: "98px",
                          height: "98px",
                          objectFit: "cover",
                          borderRadius: "50%",
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <img src={vendorLogo} alt="Upload" />
                      </Box>
                    )}
                  </Box>
                  <Typography>Maximum: 1Mb</Typography>
                </Grid>
              </Grid>

              <Divider
                sx={{
                  marginY: "32px",
                  borderColor: "#E2E6E9",
                  borderWidth: "1.2px",
                }}
              />

              <div className="nvr3a">
                <p style={{ fontSize: "20px", marginBottom: "16px" }}>
                  Contact Information
                </p>
              </div>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography gutterBottom>Email Address</Typography>
                  <TextField
                    name="email"
                    fullWidth
                    type="email"
                    placeholder="Enter Vendor Email"
                    value={formState.email}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography gutterBottom>Phone number</Typography>
                  <TextField
                    name="phone_number"
                    fullWidth
                    type="text"
                    placeholder="Enter a valid phone number"
                    value={formState.phone_number}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography gutterBottom>Address</Typography>
                  <TextField
                    name="address"
                    fullWidth
                    type="text"
                    placeholder="Enter Address"
                    value={formState.address}
                    onChange={handleChange}
                  />
                </Grid>
              </Grid>

              <div
                className="nvr3e"
                style={{ marginTop: "32px", justifyContent: "flex-start" }}
              >
                <button
                  type="submit"
                  className="nvr3btn"
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    float: "left",
                  }}
                >
                  Add Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
