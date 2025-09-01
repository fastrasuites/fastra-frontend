import React, { useState } from "react";
import { useCustomLocation } from "../../../../../context/Inventory/LocationContext";
import { useInternalTransfer } from "../../../../../context/Inventory/InternalTransferContext";
import Swal from "sweetalert2";
import InternalTransferFormBasicInputs from "./InternalTransferFormBasicInputs";
import CommonForm from "../componentInternalTransfer/CommonForm/CommonForm";
import { formatDate } from "../../../../../helper/helper";
import "./InternalTransferForm.css";

// Default form data structure
const defaultFormData = {
  id: "",
  status: "draft",
  dateCreated: formatDate(Date.now()),
  sourceLocation: null,
  destinationLocation: null,
  items: [],
};

const InternalTransferForm = () => {
  const [formData, setFormData] = useState(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { locationProducts } = useCustomLocation();
  const { createInternalTransfer } = useInternalTransfer();

  // Row configuration for the dynamic table
  const rowConfig = [
    {
      label: "Product Name",
      field: "product",
      type: "autocomplete",
      options: locationProducts,
      getOptionLabel: (option) => option?.product_name || "",
      isOptionEqualToValue: (option, value) =>
        option.product_id === value?.product_id,
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

  // Callback to process the final filled form data
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

      const response = await createInternalTransfer(payload);
      setFormData(defaultFormData); // Reset form after successful submission
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Internal transfer created successfully!",
      });
    } catch (error) {
      let errorMessage = error.message || "Failed to create transfer";
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

      const response = await createInternalTransfer(payload);
      setFormData(defaultFormData); // Reset form after successful submission
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Internal transfer sent for approval!",
      });
    } catch (error) {
      let errorMessage = "Failed to send for approval";
      if (error?.error?.non_field_errors) {
        if (
          error?.error?.non_field_errors.includes(
            "Insufficient stock for the product in the source location."
          )
        ) {
          // Find items with insufficient stock
          const insufficientItems = formData.items
            .map((item) => {
              const productInLocation = locationProducts.find(
                (p) => p.product_id === item.product?.product_id
              );
              if (
                productInLocation &&
                Number(item.quantity_requested) >
                  Number(productInLocation.quantity)
              ) {
                return `${item.product.product_name} (Available: ${productInLocation.quantity} Unit(s))`;
              }
              return null;
            })
            .filter(Boolean);

          errorMessage =
            insufficientItems.length > 0
              ? `Insufficient stock for: ${insufficientItems.join(
                  ", "
                )}. Please adjust the quantity requested or restock and try again.`
              : "Insufficient stock for one or more products. Please adjust the quantity requested or restock and try again.";
        } else {
          errorMessage = error?.error?.non_field_errors.join("; ");
        }
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

  return (
    <CommonForm
      basicInformationTitle="Product Information"
      basicInformationInputs={InternalTransferFormBasicInputs}
      formTitle="New Transfer Order"
      formData={formData}
      setFormData={setFormData}
      rowConfig={rowConfig}
      isEdit={false}
      onSubmit={handleSubmit}
      submitBtnText={isSubmitting ? "Saving..." : "Save"}
      onSendForApproval={true}
      sendForApprovalBtnText={isSubmitting ? "Sending..." : "Send for Approval"}
      handleSendForApproval={handleSendForApproval}
      showSaveButton={!isSubmitting}
      primaryButtonVariant="outlined"
    />
  );
};

export default InternalTransferForm;
