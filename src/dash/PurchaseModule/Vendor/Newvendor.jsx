import React, { useState, useEffect } from "react";
import { FaCaretLeft, FaCaretRight } from "react-icons/fa";
import autosave from "../../../image/autosave.svg";
import "./Newvendor.css";
import vendorLogo from "../../../image/vendor-logo.svg";
import { Grid, TextField, Box, Divider, Typography } from "@mui/material";
import PurchaseHeader from "../PurchaseHeader";
import { useTenant } from "../../../context/TenantContext";

export default function Newvendor({ onClose, onSaveAndSubmit }) {
  const { tenantData } = useTenant();
  const { tenant_schema_name, access_token } = tenantData || {};

  // const generateNewID = () => {
  //   const lastID = localStorage.getItem("lastGeneratedID");
  //   let newID = "PR00001";

  //   if (lastID) {
  //     const idNumber = parseInt(lastID.slice(2), 10) + 1;
  //     newID = "PR" + idNumber.toString().padStart(5, "0");
  //   }

  //   localStorage.setItem("lastGeneratedID", newID);
  //   return newID;
  // };

  const [formState, setFormState] = useState({
    vendor_name: "",
    email: "",
    phone_number: "",
    address: "",
    image: "",
    // vendorCategory: "",
    // id: generateNewID(),
    // requester: "Firstname Lastname",
    // department: "Sales",
    // status: "Pending",
    // date: new Date(),
  });

  const [showForm] = useState(true);

  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     setFormState((prevState) => ({
  //       ...prevState,
  //       date: new Date(),
  //     }));
  //   }, 1000);

  //   return () => clearInterval(timer);
  // }, []);

  useEffect(() => {
    setFormState((prevState) => ({
      ...prevState,
      company_name: tenant_schema_name,
    }));
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormState((prev) => ({
        ...prev,
        image: file,
      }));
    }
  };

  // Start here ---------------------------------------
  // ---- handling the create vendor within this component still error: "request entity too large"
  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   const formData = new FormData();
  //   formData.append("vendor_name", formState.vendor_name);
  //   formData.append("email", formState.email);
  //   formData.append("phone_number", formState.phone_number);
  //   formData.append("address", formState.address);
  //   if (formState.image) {
  //     formData.append("image", formState.image);
  //   }

  //   const endPoint = "/purchase/vendors/";
  //   try {
  //     const response = await fetch(
  //       `https://${tenant_schema_name}.fastrasuiteapi.com.ng${endPoint}`,
  //       {
  //         method: "POST",
  //         body: formData,
  //         headers: {
  //           Authorization: `Bearer ${access_token}`,
  //         },
  //       }
  //     );

  //     if (!response.ok) {
  //       throw new Error("Failed to create vendor");
  //     }

  //     const result = await response.json();
  //     setFormState((prev) => ({
  //       ...prev,
  //       image_url: result.vendor.image_url, // Store the URL received from backend
  //     }));

  //     // onSaveAndSubmit();
  //     onClose();
  //   } catch (error) {
  //     console.error("Error submitting vendor:", error);
  //   }
  // };
  // End here ------------------------------------------

  const handleSubmit = (e) => {
    e.preventDefault();

    // const formDataWithStringDate = {
    //   ...formState,
    //   date: formState.date.toString(),
    // };

    // Save the vendor details to local storage
    // const savedVendors = JSON.parse(localStorage.getItem("vendors")) || [];
    // savedVendors.push(formDataWithStringDate);
    // localStorage.setItem("vendors", JSON.stringify(savedVendors));

    const formData = new FormData();
    formData.append("vendor_name", formState.vendor_name);
    formData.append("email", formState.email);
    formData.append("address", formState.address);
    formData.append("phone_number", formState.phone_number);
    if (formState.image) {
      formData.append("image", formState.image);
    }

    onSaveAndSubmit(formData);
    onClose();
  };

  // const handleImageUpload = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       setFormState((prev) => ({
  //         ...prev,
  //         image: reader.result,
  //       }));
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };

  return (
    <div className="nvr-contain">
      <PurchaseHeader />
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
                      {formState.image ? (
                        <img
                          src={formState.image}
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
