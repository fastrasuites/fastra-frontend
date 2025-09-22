import React, { useState, useEffect, useRef, useCallback } from "react";
import { useCustomLocation } from "../../../../../context/Inventory/LocationContext";
import { useInternalTransfer } from "../../../../../context/Inventory/InternalTransferContext";
import Swal from "sweetalert2";
import InternalTransferFormBasicInputs from "./InternalTransferFormBasicInputs";
import CommonForm from "../componentInternalTransfer/CommonForm/CommonForm";
import { formatDate } from "../../../../../helper/helper";
import { useHistory } from "react-router-dom";
import { useTenant } from "../../../../../context/TenantContext";

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
  const {
    locationProducts,
    getLocationsForOtherUser,
    getAllUserLocations,
    getLocationProducts,
  } = useCustomLocation();
  const { createInternalTransfer } = useInternalTransfer();
  const { tenantData } = useTenant();
  const tenant_schema_name = tenantData?.tenant_schema_name;

  const history = useHistory();

  // Use refs to track API call status and prevent infinite loops
  const locationsFetched = useRef(false);
  const allLocationsFetched = useRef(false);
  const sourceLocationRef = useRef(null);
  const isMounted = useRef(true);

  // Fetch locations only once on component mount
  useEffect(() => {
    isMounted.current = true;

    const fetchLocations = async () => {
      try {
        if (!locationsFetched.current) {
          await getLocationsForOtherUser();
          if (isMounted.current) locationsFetched.current = true;
        }

        if (!allLocationsFetched.current) {
          await getAllUserLocations();
          if (isMounted.current) allLocationsFetched.current = true;
        }
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    };

    fetchLocations();

    return () => {
      isMounted.current = false;
    };
  }, []); // Empty dependency array to run only once

  // Handle input changes with useCallback to prevent unnecessary re-renders
  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Fetch location products when source location changes
  useEffect(() => {
    const currentId = formData.sourceLocation?.id;

    // Only fetch if we have a valid id and it's different from the last one
    if (currentId && currentId !== sourceLocationRef.current) {
      getLocationProducts(currentId).then(() => {
        if (isMounted.current) {
          sourceLocationRef.current = currentId;
          if (formData.items.length > 0) {
            setFormData((prev) => ({ ...prev, items: [] }));
          }
        }
      });
    }
  }, [formData.sourceLocation?.id, formData.items.length, getLocationProducts]);

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
  const validateFormData = useCallback((data) => {
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
  }, []);

  // Callback to process the final filled form data
  const handleSubmit = useCallback(
    async (filledFormData) => {
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
        if (response.success) {
          await Swal.fire({
            title: "Success!",
            text: "Transfer order created successfully",
            icon: "success",
            confirmButtonText: "View tranfer order",
            showCancelButton: true,
            cancelButtonText: "Create Another",
          }).then((result) => {
            if (result.isConfirmed) {
              const transferId = response.data?.id;
              history.push(
                `/${tenant_schema_name}/inventory/operations/internal-transfer/${transferId}`
              );
            } else if (result.dismiss === Swal.DismissReason.cancel) {
              // Reset form for new entry
              setFormData(defaultFormData);
              sourceLocationRef.current = null;
            }
          });
        }
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
    },
    [validateFormData, createInternalTransfer, history, tenant_schema_name]
  );

  const handleSendForApproval = useCallback(async () => {
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
      if (response.success) {
        await Swal.fire({
          title: "Success!",
          text: "Transfer order sent. Awaiting approval.",
          icon: "success",
          confirmButtonText: "View tranfer order",
          showCancelButton: true,
          cancelButtonText: "Create Another",
        }).then((result) => {
          if (result.isConfirmed) {
            const transferId = response.data?.id;
            history.push(
              `/${tenant_schema_name}/inventory/operations/internal-transfer/${transferId}`
            );
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            // Reset form for new entry
            setFormData(defaultFormData);
            sourceLocationRef.current = null;
          }
        });
      }
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
  }, [
    formData,
    validateFormData,
    createInternalTransfer,
    history,
    tenant_schema_name,
  ]);

  // Create a wrapper component for the basic inputs in create mode
  const CreateFormBasicInputs = useCallback(
    ({ formData, handleInputChange }) => (
      <InternalTransferFormBasicInputs
        formData={formData}
        handleInputChange={handleInputChange}
        isEdit={false}
      />
    ),
    []
  );

  return (
    <CommonForm
      basicInformationTitle="Product Information"
      basicInformationInputs={CreateFormBasicInputs}
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
