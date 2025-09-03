import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { useInternalTransfer } from "../../../../../context/Inventory/InternalTransferContext";
import { useCustomLocation } from "../../../../../context/Inventory/LocationContext";
import Swal from "sweetalert2";
import InternalTransferFormBasicInputs from "./InternalTransferFormBasicInputs";
import CommonForm from "../componentInternalTransfer/CommonForm/CommonForm";
import { formatDate } from "../../../../../helper/helper";
import { Grid, Typography } from "@mui/material";

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
  const { locationProducts } = useCustomLocation();
  const [formData, setFormData] = useState(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch transfer data
  useEffect(() => {
    if (id) {
      getInternalTransfer(id);
    }
  }, [id, getInternalTransfer]);

  // Prefill form data only when singleTransfer is available and formData is default
  useEffect(() => {
    if (singleTransfer && formData.id === "") {
      setFormData({
        id: singleTransfer.id || "",
        status: singleTransfer.status || "draft",
        dateCreated: formatDate(singleTransfer.date_created) || "",
        sourceLocation: singleTransfer.source_location_details || null,
        destinationLocation:
          singleTransfer.destination_location_details || null,
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
    }
  }, [singleTransfer, formData.id]);

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
      errors.push("Source and destination locations are required");
    }
    if (data.sourceLocation?.id === data.destinationLocation?.id) {
      errors.push("Source and destination locations cannot be the same");
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
        `/${filledFormData.tenant_schema_name}/inventory/operations/internal-transfer/${id}`
      );
    } catch (error) {
      let errorMessage = error.message || "Failed to update transfer";
      if (error.response?.data?.non_field_errors) {
        errorMessage = error.response.data.non_field_errors.includes(
          "Insufficient stock for the product in the source location."
        )
          ? "Insufficient stock for one or more products. Please adjust the quantity requested or restock and try again."
          : error.response.data.non_field_errors.join("; ");
      }
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
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
        `/${formData.tenant_schema_name}/inventory/operations/internal-transfer/${id}`
      );
    } catch (error) {
      let errorMessage = "Failed to send for approval";
      if (error.response?.data?.non_field_errors) {
        errorMessage = error.response.data.non_field_errors.includes(
          "Insufficient stock for the product in the source location."
        )
          ? "Insufficient stock for one or more products. Please adjust the quantity requested or restock and try again."
          : error.response.data.non_field_errors.join("; ");
      }
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update InternalTransferFormBasicInputs to include read-only id and status
  const EditFormBasicInputs = ({ formData, handleInputChange }) => {
    return (
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <div className="formLabelAndValue">
            <label>ID</label>
            <Typography variant="body1">{formData.id}</Typography>
          </div>
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <div className="formLabelAndValue">
            <label>Status</label>
            <Typography variant="body1" color={getStatusColor(formData.status)}>
              {getStatusDisplay(formData.status)}
            </Typography>
          </div>
        </Grid>
        <InternalTransferFormBasicInputs
          formData={formData}
          handleInputChange={handleInputChange}
        />
      </Grid>
    );
  };

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
