import React, { useState, useEffect } from "react";
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
    imageFile: null, // Store actual file
    imagePreview: "", // Store image URL for preview
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    console.log(file);
    if (file) {
      // Check if the file is an image
      const validImageTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!validImageTypes.includes(file.type)) {
        Swal.fire({
          icon: "error",
          title: "Invalid file type",
          text: "Please upload a valid image (JPEG, PNG).",
        });
        return;
      }
      if (file.size > 1 * 1024 * 1024) {
        Swal.fire({
          icon: "error",
          title: "File size exceeds 1MB",
          text: "Please upload a smaller image.",
        });
        setFormState((prev) => ({
          ...prev,
          imageFile: null, // Reset file
          imagePreview: "", // Reset preview
        }));
        return;
      }

      setFormState((prev) => ({
        ...prev,
        imageFile: file, // Store file
        imagePreview: URL.createObjectURL(file), // Store preview
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("company_name", formState.vendor_name);
    formData.append("email", formState.email);
    formData.append("address", formState.address);
    formData.append("phone_number", formState.phone_number);

    // Ensure imageFile is a File before appending
    if (formState.imageFile instanceof File) {
      formData.append("profile_picture", formState.imageFile);
    }

    createVendor(formData);
    onClose();

    // detect if true a user came from PurchaseModuleWizard, then navigate back for the next step:4
    // if (fromPurchaseModuleWizard) {
    //   // history.push({
    //   //   pathname: `/${tenant_schema_name}/purchase`,
    //   //   state: { step: 4, preservedWizard: true },
    //   // });

    //   history.push(`/${tenant_schema_name}/purchase`, {
    //     step: 4,
    //     preservedWizard: true,
    //   });
    // }

    if (fromPurchaseModuleWizard) {
      const wizardState = JSON.parse(
        localStorage.getItem(WIZARD_STORAGE_KEY) || "{}"
      );
      const updatedState = {
        ...wizardState,
        currentStep: 4,
        hidden: false,
      };
      localStorage.setItem(WIZARD_STORAGE_KEY, JSON.stringify(updatedState));
      history.push(`/${tenant_schema_name}/purchase`);
    }
  };

  return (
    <div className="nvr-contain">
      {/* <PurchaseHeader /> */}
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

              {/* BAsic information */}
              <Box>
                {/* Vendor Name Section */}
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="body1" gutterBottom>
                      Vendor Name
                    </Typography>
                    <TextField
                      fullWidth
                      variant="outlined"
                      placeholder="Cee Que Enterprise"
                      value={formState.vendor_name}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          vendor_name: e.target.value,
                        }))
                      }
                    />
                  </Grid>
                </Grid>

                {/* Divider */}
                <Divider
                  sx={{
                    marginY: "32px",
                    borderColor: "#E2E6E9",
                    borderWidth: "1.2px",
                  }}
                />

                {/* Image Upload Section */}
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
                        type="file"
                        accept=".png, .jpg, .jpeg"
                        onChange={handleImageUpload}
                        id="imageInput"
                        name="image"
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
                    <Typography>Maximum: 1Mb </Typography>
                  </Grid>
                </Grid>

                {/* Divider */}
                <Divider
                  sx={{
                    marginY: "32px",
                    borderColor: "#E2E6E9",
                    borderWidth: "1.2px",
                  }}
                />
              </Box>

              {/* Contact information */}
              <div className="nvr3a">
                <p style={{ fontSize: "20px", marginBottom: "16px" }}>
                  Contact Information
                </p>
              </div>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography gutterBottom>Email Address</Typography>
                  <TextField
                    fullWidth
                    type="email"
                    name="email"
                    placeholder="Enter Vendor Email"
                    // className="nvr3cb"
                    value={formState.email}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography gutterBottom>Phone number</Typography>
                  <TextField
                    fullWidth
                    type="text"
                    name="phone"
                    placeholder="Enter a valid phone number"
                    // className="nvr3cb"
                    value={formState.phone_number}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        phone_number: e.target.value,
                      }))
                    }
                  />
                </Grid>
              </Grid>
              <Grid container spacing={3} mt={1}>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography gutterBottom>Address</Typography>
                  <TextField
                    fullWidth
                    type="text"
                    name="address"
                    placeholder="Enter Address"
                    value={formState.address}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
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
