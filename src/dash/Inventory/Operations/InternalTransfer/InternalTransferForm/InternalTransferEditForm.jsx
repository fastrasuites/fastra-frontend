import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { useInternalTransfer } from "../../../../../context/Inventory/InternalTransferContext";
import { useCustomLocation } from "../../../../../context/Inventory/LocationContext";
import Swal from "sweetalert2";
import InternalTransferFormBasicInputs from "./InternalTransferFormBasicInputs";
import CommonForm from "../componentInternalTransfer/CommonForm/CommonForm";
import { formatDate } from "../../../../../helper/helper";
import {
  Grid,
  Typography,
  CircularProgress,
  Box,
  Divider,
} from "@mui/material";
import { useTenant } from "../../../../../context/TenantContext";

// Default form data structure
const defaultFormData = {
  id: "",
  status: "draft",
  dateCreated: "",
  sourceLocation: null,
  destinationLocation: null,
  items: [],
  tenant_schema_name: "",
};

const InternalTransferEditForm = () => {
  const { id } = useParams();
  const history = useHistory();
  const { singleTransfer, getInternalTransfer, updateInternalTransfer } =
    useInternalTransfer();
  const {
    locationProducts,
    allUserLocations,
    locationsForOtherUser,
    getLocationsForOtherUser,
    getAllUserLocations,
    getLocationProducts,
    isLoading: locationsLoading,
  } = useCustomLocation();
  const [formData, setFormData] = useState(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { tenantData } = useTenant();
  const tenant_schema_name = tenantData?.tenant_schema_name;

  // Fetch transfer data and locations
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch locations first
        await Promise.all([getLocationsForOtherUser(), getAllUserLocations()]);

        // Then fetch transfer data
        if (id) {
          await getInternalTransfer(id);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, getInternalTransfer, getLocationsForOtherUser, getAllUserLocations]);

  // Prefill form data when both singleTransfer and locations are available
  useEffect(() => {
    if (
      singleTransfer &&
      allUserLocations.length > 0 &&
      locationsForOtherUser.length > 0 &&
      formData.id === ""
    ) {
      const normalizeLocation = (apiLocation, options) => {
        if (!apiLocation) return null;
        // Find matching location by ID in the options
        return (
          options.find((opt) => String(opt.id) === String(apiLocation.id)) ||
          null
        );
      };

      const normalizedSourceLocation = normalizeLocation(
        singleTransfer.source_location_details,
        locationsForOtherUser
      );

      const normalizedDestinationLocation = normalizeLocation(
        singleTransfer.destination_location_details,
        allUserLocations
      );

      setFormData({
        id: singleTransfer.id || "",
        status: singleTransfer.status || "draft",
        dateCreated: formatDate(singleTransfer.date_created) || "",
        sourceLocation: normalizedSourceLocation,
        destinationLocation: normalizedDestinationLocation,
        items:
          singleTransfer.internal_transfer_items?.map((item) => ({
            product: {
              product_id: item.product_details?.id,
              product_name: item.product_details?.product_name,
              product_unit_of_measure:
                item.product_details?.unit_of_measure_details?.unit_symbol ||
                "",
            },
            quantity_requested: item.quantity_requested || "",
            unit_of_measure:
              item.product_details?.unit_of_measure_details?.unit_symbol || "",
          })) || [],
        tenant_schema_name: singleTransfer.tenant_schema_name || "",
      });

      // Fetch products for the source location after setting form data
      if (normalizedSourceLocation?.id) {
        getLocationProducts(normalizedSourceLocation.id);
      }
    }
  }, [
    singleTransfer,
    formData.id,
    locationsForOtherUser,
    allUserLocations,
    getLocationProducts,
  ]);

  // Row configuration for the dynamic table
  const rowConfig = [
    {
      label: "Product Name",
      field: "product",
      type: "autocomplete",
      options: locationProducts,
      getOptionLabel: (option) => option?.product_name || "",
      isOptionEqualToValue: (option, value) =>
        option.product_id === (value?.product_id || ""),
    },
    {
      label: "Quantity",
      field: "quantity_requested",
      type: "number",
      transform: (value) => (value ? Number(value).toLocaleString() : ""),
      render: (value) => (value ? Number(value).toLocaleString() : ""),
    },
    {
      label: "Unit of Measure",
      field: "unit_of_measure",
      type: "text",
      disabled: true,
      transform: (value) => value || "",
    },
  ];

  // Validate form data
  const validateFormData = (data) => {
    const errors = [];
    if (!data.sourceLocation?.id || !data.destinationLocation?.id) {
      errors.push(
        "Source and destination locations are required. You need to enable multilocation"
      );
    }
    if (data.sourceLocation?.id === data.destinationLocation?.id) {
      errors.push(
        "Source and destination locations cannot be the same. You need to enable multilocation"
      );
    }
    if (data.items.length === 0) {
      errors.push("At least one item is required");
    }
    data.items.forEach((item, index) => {
      if (!item.product?.product_id) {
        errors.push(`Item ${index + 1}: Product is required`);
      }
      if (!item.quantity_requested || Number(item.quantity_requested) <= 0) {
        errors.push(`Item ${index + 1}: Valid quantity is required`);
      }
    });
    return errors;
  };

  // Handle save (update as draft)
  const handleSubmit = async (filledFormData) => {
    setIsSubmitting(true);
    try {
      const errors = validateFormData(filledFormData);
      if (errors.length > 0) {
        throw new Error(errors.join("; "));
      }

      const payload = {
        source_location: filledFormData.sourceLocation?.id,
        destination_location: filledFormData.destinationLocation?.id,
        status: filledFormData.status || "draft",
        internal_transfer_items: filledFormData.items.map((item) => ({
          product: item.product?.product_id,
          quantity_requested: String(item.quantity_requested),
        })),
      };

      await updateInternalTransfer(id, payload);
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Internal transfer updated successfully!",
      });
      history.push(
        `/${tenant_schema_name}/inventory/operations/internal-transfer/${id}`
      );
    } catch (error) {
      const apiError = error?.error;

      if (Array.isArray(apiError)) {
        // Build table rows dynamically
        const rows = apiError
          .map((item) => {
            const [product, message] = Object.entries(item).find(
              ([key]) => key !== "Quantity left in location"
            );
            const quantity = item["Quantity left in location"];

            return `
               <tr>
                 <td style="padding:6px; border:1px solid #ddd;">${product}</td>
                 <td style="padding:6px; border:1px solid #ddd; color:#b91c1c;">${message}</td>
                 <td style="padding:6px; border:1px solid #ddd; text-align:center;">${quantity}</td>
               </tr>
             `;
          })
          .join("");

        Swal.fire({
          icon: "error",
          title: "Insufficient Stock",
          html: `
             <table style="width:100%; border-collapse:collapse; margin-top:10px; font-size:14px;">
               <thead>
                 <tr style="background:#f3f4f6;">
                   <th style="padding:8px; border:1px solid #ddd;">Product</th>
                   <th style="padding:8px; border:1px solid #ddd;">Message</th>
                   <th style="padding:8px; border:1px solid #ddd;">Qty Left</th>
                 </tr>
               </thead>
               <tbody>
                 ${rows}
               </tbody>
             </table>
             <p>Please adjust Qty or restock product</p>
           `,
          confirmButtonText: "Okay",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Something went wrong",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle send for approval
  const handleSendForApproval = async () => {
    setIsSubmitting(true);
    try {
      const errors = validateFormData(formData);
      if (errors.length > 0) {
        throw new Error(errors.join("; "));
      }

      const payload = {
        source_location: formData.sourceLocation?.id,
        destination_location: formData.destinationLocation?.id,
        status: "awaiting_approval",
        internal_transfer_items: formData.items.map((item) => ({
          product: item.product?.product_id,
          quantity_requested: String(item.quantity_requested),
        })),
      };

      await updateInternalTransfer(id, payload);
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Internal transfer sent for approval!",
      });
      history.push(
        `/${tenant_schema_name}/inventory/operations/internal-transfer/${id}`
      );
    } catch (error) {
      const apiError = error?.error;

      if (Array.isArray(apiError)) {
        // Build table rows dynamically
        const rows = apiError
          .map((item) => {
            const [product, message] = Object.entries(item).find(
              ([key]) => key !== "Quantity left in location"
            );
            const quantity = item["Quantity left in location"];

            return `
               <tr>
                 <td style="padding:6px; border:1px solid #ddd;">${product}</td>
                 <td style="padding:6px; border:1px solid #ddd; color:#b91c1c;">${message}</td>
                 <td style="padding:6px; border:1px solid #ddd; text-align:center;">${quantity}</td>
               </tr>
             `;
          })
          .join("");

        Swal.fire({
          icon: "error",
          title: "Insufficient Stock",
          html: `
             <table style="width:100%; border-collapse:collapse; margin-top:10px; font-size:14px;">
               <thead>
                 <tr style="background:#f3f4f6;">
                   <th style="padding:8px; border:1px solid #ddd;">Product</th>
                   <th style="padding:8px; border:1px solid #ddd;">Message</th>
                   <th style="padding:8px; border:1px solid #ddd;">Qty Left</th>
                 </tr>
               </thead>
               <tbody>
                 ${rows}
               </tbody>
             </table>
             <p>Please adjust Qty or restock product</p>
           `,
          confirmButtonText: "Okay",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Something went wrong",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update InternalTransferFormBasicInputs to include read-only id and status
  const EditFormBasicInputs = ({ formData, handleInputChange }) => {
    // Status color mapping
    const getStatusColor = (status) => {
      const s = String(status).toLowerCase();
      if (s === "done") return "#158048";
      if (s === "draft") return "#2899B2";
      if (s === "released") return "#8B21DF";
      if (s === "cancelled") return "#B13022";
      if (s === "awaiting_approval") return "#BE8706";
      return "#9e9e9e";
    };

    // Normalize status display
    const getStatusDisplay = (status) => {
      const s = String(status).toLowerCase();
      if (s === "awaiting_approval") return "Awaiting Approval";
      return s.charAt(0).toUpperCase() + s.slice(1);
    };

    return (
      <Box>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <div className="formLabelAndValue">
              <label>Status</label>
              <Typography
                // variant="body1"
                color={getStatusColor(formData.status)}
              >
                {getStatusDisplay(formData.status)}
              </Typography>
            </div>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <div className="formLabelAndValue">
              <label>ID</label>
              <Typography variant="body1">{formData.id}</Typography>
            </div>
          </Grid>
        </Grid>
        <Divider sx={{ marginBlock: "18px" }} />
        <InternalTransferFormBasicInputs
          formData={formData}
          handleInputChange={handleInputChange}
          isEdit={true} // Pass isEdit prop as true for edit mode
        />
      </Box>
    );
  };

  // Show loading state while data is being fetched
  if (isLoading || locationsLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <CommonForm
      basicInformationTitle="Product Information"
      basicInformationInputs={EditFormBasicInputs}
      formTitle="Edit Transfer Order"
      formData={formData}
      setFormData={setFormData}
      rowConfig={rowConfig}
      isEdit={true}
      onSubmit={handleSubmit}
      submitBtnText={isSubmitting ? "Updating..." : "Update"}
      onSendForApproval={formData.status.toLowerCase() === "draft"}
      sendForApprovalBtnText={isSubmitting ? "Sending..." : "Send for Approval"}
      handleSendForApproval={handleSendForApproval}
      showSaveButton={!isSubmitting}
      primaryButtonVariant="outlined"
    />
  );
};

export default InternalTransferEditForm;
