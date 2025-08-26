import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import autosave from "../../../image/autosave.svg";
import vendorLogo from "../../../image/vendor-logo.svg";
import "./Newvendor.css";
import {
  Grid,
  TextField,
  Box,
  Divider,
  Typography,
  Button,
} from "@mui/material";
import { usePurchase } from "../../../context/PurchaseContext";
import { useTenant } from "../../../context/TenantContext";
import Swal from "sweetalert2";

export default function EditVendor() {
  const history = useHistory();
  const { id } = useParams();
  const tenantSchema = useTenant().tenantData?.tenant_schema_name;
  const { fetchSingleVendors, updateVendor } = usePurchase();

  const [formState, setFormState] = useState({
    vendor_name: "",
    email: "",
    phone_number: "",
    address: "",
    imageFile: null,
    imagePreview: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadVendor() {
      try {
        const vendor = await fetchSingleVendors(id);
        setFormState({
          vendor_name: vendor.company_name,
          email: vendor.email,
          phone_number: vendor.phone_number,
          address: vendor.address,
          imageFile: null,
          imagePreview: vendor.profile_picture
            ? `data:image/png;base64,${vendor.profile_picture}`
            : "",
        });
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Load Failed",
          text: "Could not fetch vendor data.",
        });
      }
    }
    loadVendor();
  }, [id, fetchSingleVendors]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      return Swal.fire({
        icon: "error",
        title: "Invalid file type",
        text: "Please upload JPEG or PNG.",
      });
    }
    if (file.size > 1 * 1024 * 1024) {
      return Swal.fire({
        icon: "error",
        title: "File too large",
        text: "Max size is 1 MB.",
      });
    }

    setFormState((prev) => ({
      ...prev,
      imageFile: file,
      imagePreview: URL.createObjectURL(file),
    }));
  };

  const handleCancel = () => {
    history.goBack();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formState.vendor_name.trim()) {
      return Swal.fire({
        icon: "warning",
        title: "Missing Name",
        text: "Vendor name is required.",
      });
    }

    setIsSubmitting(true);
    const payload = new FormData();
    payload.append("company_name", formState.vendor_name);
    payload.append("email", formState.email);
    payload.append("address", formState.address);
    payload.append("phone_number", formState.phone_number);
    if (formState.imageFile) {
      payload.append("profile_picture_image", formState.imageFile);
    }

    try {
      await updateVendor(id, payload);
      Swal.fire({
        icon: "success",
        title: "Vendor Updated",
        text: "Vendor details updated successfully.",
        timer: 1500,
        showConfirmButton: false,
      });
      history.goBack();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: err.message || "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="nvr-contain">
      <div id="nvr" className="nvr fade-in">
        <div className="nvr1">
          <div className="nvr2">
            <Box className="nvr2a" mb={6}>
              <Typography variant="h5" className="nvrhed">
                Edit Vendor
              </Typography>
              <Box className="nvrauto" display="flex" alignItems="center">
                <Typography>Autosaved</Typography>
                <img src={autosave} alt="Autosaved" />
              </Box>
            </Box>
          </div>

          <div className="nvr3">
            <form className="nvrform" onSubmit={handleSubmit}>
              <Box
                className="nvr3a"
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography variant="h6">Basic Information</Typography>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </Box>

              <Grid container spacing={3} mt={1}>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography gutterBottom>Vendor Name</Typography>
                  <TextField
                    name="vendor_name"
                    fullWidth
                    placeholder="Cee Que Enterprise"
                    value={formState.vendor_name}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 4 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Box
                    onClick={() =>
                      document.getElementById("imageInput").click()
                    }
                    sx={{
                      width: 98,
                      height: 98,
                      borderRadius: 1,
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      id="imageInput"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: "none" }}
                      disabled={isSubmitting}
                    />
                    {formState.imagePreview ? (
                      <img
                        src={formState.imagePreview}
                        alt="Preview"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <img src={vendorLogo} alt="Upload" />
                    )}
                  </Box>
                  <Typography variant="caption">Max size: 1 MB</Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 4 }} />

              <Typography variant="h6" gutterBottom>
                Contact Information
              </Typography>
              <Grid container spacing={3}>
                {["email", "phone_number", "address"].map((name) => (
                  <Grid key={name} item xs={12} sm={6} md={4}>
                    <Typography gutterBottom>
                      {name === "email"
                        ? "Email Address"
                        : name === "phone_number"
                        ? "Phone Number"
                        : "Address"}
                    </Typography>
                    <TextField
                      name={name}
                      fullWidth
                      type={name === "email" ? "email" : "text"}
                      placeholder={`Enter ${
                        name === "email"
                          ? "Email Address"
                          : name === "phone_number"
                          ? "Phone Number"
                          : "Address"
                      }`}
                      value={formState[name]}
                      onChange={handleChange}
                      disabled={isSubmitting}
                    />
                  </Grid>
                ))}
              </Grid>

              <Box mt={4}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  sx={{ px: 4 }}
                >
                  {isSubmitting ? "Updating…" : "Update Vendor"}
                </Button>
              </Box>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
