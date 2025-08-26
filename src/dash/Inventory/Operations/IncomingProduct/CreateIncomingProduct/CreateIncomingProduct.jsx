import React, { useEffect, useState, useCallback } from "react";
import { Autocomplete, Box, TextField, Typography } from "@mui/material";
import CommonForm from "../../../../../components/CommonForm/CommonForm";
import { formatDate } from "../../../../../helper/helper";
import "./CreateIncomingProduct.css";
import { useTenant } from "../../../../../context/TenantContext";
import { useHistory } from "react-router-dom";
import { usePurchase } from "../../../../../context/PurchaseContext";
import { useIncomingProduct } from "../../../../../context/Inventory/IncomingProduct";
import { useCustomLocation } from "../../../../../context/Inventory/LocationContext";
import Swal from "sweetalert2";
import { usePurchaseOrder } from "../../../../../context/PurchaseOrderContext.";
import BackorderModal from "../../../../../components/ui/BackorderModal";

// Receipt types array
const receiptTypes = [
  { value: "vendor_receipt", label: "Vendor Receipt" },
  { value: "manufacturing_receipt", label: "Manufacturing Receipt" },
  { value: "internal_transfer", label: "Internal Transfer" },
  { value: "returns", label: "Returns" },
  { value: "scrap", label: "Scrap" },
];

const REQUIRED_ASTERISK = (
  <Typography component="span" color="#D32F2F" ml={0.5} fontSize="20px">
    *
  </Typography>
);

// Default formData
const defaultFormData = {
  receiptType: "",
  related_po: null,
  source_location: "",
  receiptDate: formatDate(Date.now()),
  suppliersName: null,
  suppliers: [],
  location: null,
  items: [],
  status: "draft",
  is_hidden: true,
};

const IncomingProductBasicInputs = ({
  formData,
  handleInputChange,
  setFormData,
}) => {
  const [selectedReceipt, setSelectedReceipt] = useState(
    receiptTypes.find((rt) => rt.value === formData.receiptType) || null
  );
  const [selectedSupplier, setSelectedSupplier] = useState(
    formData.suppliersName || null
  );
  const [selectedRelatedPO, setSelectedRelatedPO] = useState(
    formData.related_po || null
  );
  const [selectedLocation, setSelectedLocation] = useState(
    formData.location || null
  );

  const { activeLocationList, getActiveLocationList } = useCustomLocation();
  const { vendors, fetchVendorsForForm } = usePurchase();
  const { purchaseOrderList, getPurchaseOrderUnrelatedListForForm } =
    usePurchaseOrder();

  useEffect(() => {
    fetchVendorsForForm();
    getPurchaseOrderUnrelatedListForForm();
    getActiveLocationList();
  }, [
    fetchVendorsForForm,
    getPurchaseOrderUnrelatedListForForm,
    getActiveLocationList,
  ]);

  useEffect(() => {
    if (activeLocationList?.length === 1 && !formData.location) {
      handleInputChange("location", activeLocationList[0]);
    }
  }, [activeLocationList, formData.location, handleInputChange]);

  const handleReceiptChange = (e, newVal) => {
    setSelectedReceipt(newVal);
    handleInputChange("receiptType", newVal?.value || "");
  };

  const handleSupplierChange = (e, newVal) => {
    setSelectedSupplier(newVal);
    handleInputChange("suppliersName", newVal);
  };

  const handleRelatedPOChange = (e, newVal) => {
    setSelectedRelatedPO(newVal);
    handleInputChange("related_po", newVal);

    if (newVal) {
      const mappedItems = newVal.items.map((it) => ({
        product: it.product_details,
        available_product_quantity: it.qty,
        qty_received: it.quantity_received,
        unit_of_measure: {
          unit_category:
            it?.product_details?.unit_of_measure_details?.unit_name,
          unit_name: it?.product_details?.unit_of_measure_details?.unit_name,
        },
      }));
      setFormData((prev) => ({ ...prev, items: mappedItems }));
    } else {
      setFormData((prev) => ({ ...prev, items: [] }));
    }
  };

  const handleLocationChange = (e, newVal) => {
    setSelectedLocation(newVal);
    handleInputChange("location", newVal);
  };

  return (
    <>
      <div className="receiptTypeAndID">
        <div>
          <label className="required-label">
            Receipt Type {REQUIRED_ASTERISK}
          </label>
          <Autocomplete
            disablePortal
            options={receiptTypes}
            value={selectedReceipt}
            getOptionLabel={(opt) => opt.label}
            isOptionEqualToValue={(opt, val) => opt.value === val?.value}
            onChange={handleReceiptChange}
            sx={{ width: "100%", mb: 2 }}
            renderInput={(params) => (
              <TextField {...params} placeholder="Select receipt type" />
            )}
          />
        </div>
        <div className="formLabelAndValue">
          <label className="required-label">
            Source Location {REQUIRED_ASTERISK}
          </label>
          <p>Supplier Location</p>
        </div>
        <div className="formLabelAndValue">
          <label className="required-label">
            Receipt Date {REQUIRED_ASTERISK}
          </label>
          <p>{formData.receiptDate}</p>
        </div>
      </div>

      <Box display="flex" gap={5} flexDirection={{ xs: "column", md: "row" }}>
        <Box flex={1} mt={1}>
          <label style={{ marginBottom: 6, display: "block" }}>
            Purchase Order
          </label>
          <Autocomplete
            disablePortal
            options={purchaseOrderList || []}
            value={selectedRelatedPO}
            getOptionLabel={(opt) => opt.id || ""}
            isOptionEqualToValue={(opt, val) => opt.id === val?.id}
            onChange={handleRelatedPOChange}
            sx={{ width: "100%", mb: 2 }}
            renderInput={(params) => (
              <TextField {...params} placeholder="Purchase Order" />
            )}
          />
        </Box>
        <Box flex={1}>
          <label className="required-label">
            Name of Supplier {REQUIRED_ASTERISK}
          </label>
          <Autocomplete
            disablePortal
            options={vendors || []}
            value={selectedSupplier}
            getOptionLabel={(opt) => opt.company_name || ""}
            isOptionEqualToValue={(opt, val) => opt.id === val?.id}
            onChange={handleSupplierChange}
            sx={{ width: "100%", mb: 2 }}
            renderInput={(params) => (
              <TextField {...params} placeholder="Select supplier" required />
            )}
          />
        </Box>

        {activeLocationList?.length === 1 ? (
          <Box flex={1}>
            <label className="required-label">
              Destination Location {REQUIRED_ASTERISK}
            </label>
            <p>{activeLocationList[0]?.location_name || ""}</p>
          </Box>
        ) : (
          <Box flex={1}>
            <label className="required-label">
              Destination Location {REQUIRED_ASTERISK}
            </label>
            <Autocomplete
              disablePortal
              options={activeLocationList || []}
              value={selectedLocation}
              getOptionLabel={(opt) => opt.location_name || ""}
              isOptionEqualToValue={(opt, val) => opt.id === val?.id}
              onChange={handleLocationChange}
              sx={{ width: "100%", mb: 2 }}
              renderInput={(params) => (
                <TextField {...params} placeholder="Select location" />
              )}
            />
          </Box>
        )}
      </Box>
    </>
  );
};

const CreateIncomingProduct = () => {
  const { tenant_schema_name } = useTenant().tenantData || {};
  const history = useHistory();
  const [formData, setFormData] = useState(defaultFormData);
  const [openModal, setOpenModal] = useState(false);
  const {
    isLoading: incomingProductLoading,
    createIncomingProduct,
    createIncomingProductBackOrder,
  } = useIncomingProduct();
  const { products, fetchProductsForForm } = usePurchase();
  const { getLocationList } = useCustomLocation();

  useEffect(() => {
    fetchProductsForForm();
    getLocationList().then((res) => {
      const src = res.data.find((loc) => loc.location_code === "SUPP");
      if (src) {
        setFormData((prev) => ({ ...prev, source_location: src.id }));
      }
    });
  }, [fetchProductsForForm, getLocationList]);

  const transformProducts = (list) =>
    (list || []).map((prod) => ({
      ...prod,
      unit_of_measure: {
        url: prod.unit_of_measure,
        unit_category: prod?.unit_of_measure_details?.unit_name,
        unit_name: prod?.unit_of_measure_details?.unit_name,
      },
    }));

  const rowConfig = [
    {
      label: "Product Name",
      field: "product",
      type: "autocomplete",
      options: transformProducts(products),
      getOptionLabel: (opt) => opt.product_name,
    },
    {
      label: "Expected QTY",
      field: "available_product_quantity",
      type: "number",
      transform: (val) => val || "",
    },
    {
      label: "Unit of Measure",
      field: "unit_of_measure",
      type: "text",
      disabled: true,
      transform: (val) => val?.unit_category || "",
    },
    {
      label: "QTY Received",
      field: "qty_received",
      type: "number",
      required: true,
    },
  ];

  const navigateToDetail = useCallback(
    (id) => {
      setTimeout(
        () =>
          history.push(
            `/${tenant_schema_name}/inventory/operations/incoming-product/${id}`
          ),
        1000
      );
    },
    [history, tenant_schema_name]
  );

  const validateRequiredFields = useCallback((payload) => {
    if (!payload.receipt_type) return "Receipt Type is required.";
    if (!payload.source_location) return "Source location is required.";
    if (!payload.supplier) return "Name of supplier is required.";
    if (!payload.destination_location)
      return "Destination location is required.";
    if (
      !payload.incoming_product_items ||
      payload.incoming_product_items.length === 0
    ) {
      return "At least one product item is required.";
    }

    for (const item of payload.incoming_product_items) {
      if (!item.product) return "Product is required for all items";
      if (!item.expected_quantity)
        return "Expected quantity is required for all items";
      if (!item.quantity_received)
        return "Received quantity is required for all items";
    }

    return null;
  }, []);

  const handleBackorder = useCallback(
    async (IP_ID) => {
      const result = await Swal.fire({
        html: `
        <h1 class="swal-title">OOPS!</h1>
        <div class="swal-line-container">
          <div class="swal-line1"></div>
          <div class="swal-line2"></div>
        </div>
        <p class="swal-subtext">The received quantity is less than the expected quantity.</p>
        <p class="swal-question">Would you like to place a backorder for the remaining quantity?</p>
      `,
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        customClass: {
          popup: "custom-swal-popup",
          title: "custom-swal-title",
          confirmButton: "custom-swal-confirm-btn",
          cancelButton: "custom-swal-cancel-btn",
          htmlContainer: "custom-swal-html",
        },
      });

      const backorderPayload = {
        response: result.isConfirmed,
        incoming_product: IP_ID,
      };

      try {
        await createIncomingProductBackOrder(backorderPayload);
        await Swal.fire({
          icon: result.isConfirmed ? "success" : "info",
          title: result.isConfirmed ? "Success" : "Acknowledged",
          text: result.isConfirmed
            ? "Backorder created successfully"
            : "Backorder not created as per your choice.",
        });
        navigateToDetail(IP_ID);
      } catch (backorderErr) {
        console.error("Backorder error:", backorderErr);
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: backorderErr.message || "Failed to process backorder request.",
        });
      }
    },
    [createIncomingProductBackOrder]
  );

  const handleReturn = useCallback(
    async (IP_ID) => {
      try {
        const result = await Swal.fire({
          html: `
          <h1 class="swal-title">OOPS!</h1>
          <div class="swal-line-container">
            <div class="swal-line1"></div>
            <div class="swal-line2"></div>
          </div>
          <p class="swal-subtext">
            The received quantity is more than the expected quantity.
          </p>
          <p class="swal-question">
            Do you want to return the extra goods?
          </p>
        `,
          showCancelButton: true,
          confirmButtonText: "Yes",
          cancelButtonText: "No",
          customClass: {
            popup: "custom-swal-popup",
            title: "custom-swal-title",
            confirmButton: "custom-swal-confirm-btn",
            cancelButton: "custom-swal-cancel-btn",
            htmlContainer: "custom-swal-html",
          },
        });

        if (result.isConfirmed) {
          // Navigate to Returns page
          history.push(
            `/${tenant_schema_name}/inventory/operations/incoming-product/return/${IP_ID}`
          );
        } else {
          // Just continue the normal process
          navigateToDetail(IP_ID);
        }
      } catch (err) {
        console.error("Return process error:", err);
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: err.message || "Failed to process return request.",
        });
      }
    },
    [history, tenant_schema_name, navigateToDetail]
  );

  const handleSubmit = useCallback(
    async (filledFormData, status = "draft") => {
      const payload = {
        destination_location: filledFormData.location?.id,
        receipt_type: filledFormData.receiptType,
        related_po: filledFormData.related_po?.id,
        source_location: filledFormData.source_location,
        status,
        is_hidden: false,
        supplier: filledFormData.suppliersName?.id || null,
        incoming_product_items: filledFormData.items.map((item) => ({
          product: item.product.id,
          expected_quantity: Number(item.available_product_quantity),
          quantity_received: Number(item.qty_received),
        })),
        can_edit: status === "draft",
      };

      const errorMessage = validateRequiredFields(payload);
      if (errorMessage) {
        Swal.fire({
          icon: "warning",
          title: "Missing Information",
          text: errorMessage,
        });
        return;
      }

      try {
        const res = await createIncomingProduct(payload);

        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Incoming product created successfully",
        });

        navigateToDetail(res.data.incoming_product_id);
      } catch (err) {
        console.error("Submission error:", err);

        // Handle backorder scenario
        const detailRaw = err?.response?.data?.detail?.toString?.() || "";
        const jsonMatch = detailRaw.match(/string='(.*?)'/);
        const codeMatch = detailRaw.match(/code='(.*?)'/);
        const backorderCode = codeMatch?.[1];
        let IP_ID = null;

        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[1]);
            IP_ID = parsed?.IP_ID;
          } catch (parseErr) {
            console.warn("JSON parse error:", parseErr);
          }
        }

        if (backorderCode === "backorder_required" && IP_ID) {
          await handleBackorder(IP_ID);
          return;
        }
        console.log(backorderCode);
        if (backorderCode === "return_required") {
          await handleReturn(IP_ID);
          return;
        }

        // Handle validation errors
        const errorMessages = [];
        if (err?.response?.data?.non_field_errors) {
          errorMessages.push(...err.response.data.non_field_errors);
        }

        if (err?.response?.data?.detail) {
          if (typeof err.response.data.detail === "string") {
            errorMessages.push(err.response.data.detail);
          } else if (Array.isArray(err.response.data.detail)) {
            errorMessages.push(...err.response.data.detail);
          } else if (typeof err.response.data.detail === "object") {
            Object.values(err.response.data.detail).forEach((errors) => {
              if (Array.isArray(errors)) {
                errorMessages.push(...errors);
              }
            });
          }
        }

        if (errorMessages.length > 0) {
          Swal.fire({
            icon: "error",
            title: "Validation Error",
            html: errorMessages.map((msg) => `<p>${msg}</p>`).join(""),
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: err.message || "An unexpected error occurred",
          });
        }
      }
    },
    [
      createIncomingProduct,
      handleBackorder,
      navigateToDetail,
      validateRequiredFields,
    ]
  );

  return (
    <div>
      <CommonForm
        basicInformationTitle="Product Information"
        basicInformationInputs={IncomingProductBasicInputs}
        formTitle="New Incoming Product"
        formData={formData}
        setFormData={setFormData}
        rowConfig={rowConfig}
        isEdit={false}
        onSubmit={(data) => handleSubmit(data, "validated")}
        submitBtnText={incomingProductLoading ? "Submitting..." : "Validate"}
        saveAsSubmitBtnText="Save to Draft"
        onSubmitAsDone={(data) => handleSubmit(data, "draft")}
        autofillRow={["unit_of_measure", "available_product_quantity"]}
        isLoading={incomingProductLoading}
      />
      {openModal && <BackorderModal />}
    </div>
  );
};

export default CreateIncomingProduct;
