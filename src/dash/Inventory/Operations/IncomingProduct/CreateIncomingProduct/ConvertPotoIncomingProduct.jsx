// src/dash/Inventory/Operations/IncomingProduct/CreateIncomingProduct.jsx

import React, { useEffect, useState } from "react";
import { Autocomplete, Box, TextField, Typography } from "@mui/material";
import CommonForm from "../../../../../components/CommonForm/CommonForm";
import { formatDate } from "../../../../../helper/helper";
import { useTenant } from "../../../../../context/TenantContext";
import { useHistory, useLocation } from "react-router-dom";
import { useIncomingProduct } from "../../../../../context/Inventory/IncomingProduct";
import { useCustomLocation } from "../../../../../context/Inventory/LocationContext";
import { usePurchase } from "../../../../../context/PurchaseContext";
import Swal from "sweetalert2";
import { usePurchaseOrder } from "../../../../../context/PurchaseOrderContext.";
import "./CreateIncomingProduct.css";

// ─── Receipt Type Options ───────────────────────────────────────────────────
const RECEIPT_TYPES = [
  { value: "vendor_receipt", label: "Vendor Receipt" },
  { value: "manufacturing_receipt", label: "Manufacturing Receipt" },
  { value: "internal_transfer", label: "Internal Transfer" },
  { value: "returns", label: "Returns" },
  { value: "scrap", label: "Scrap" },
];

// ─── Helper: Resolve a formValue (object or string) into a matching object from `list` ──
const getSelectedOption = (formValue, list = [], key) => {
  if (typeof formValue === "object" && formValue !== null) {
    return formValue;
  }
  if (typeof formValue === "string") {
    return list.find((item) => item[key] === formValue) || null;
  }
  return null;
};

const REQUIRED_ASTERISK = (
  <Typography component="span" color="#D32F2F" ml={0.5} fontSize="20px">
    *
  </Typography>
);

// ─── Basic Inputs Component ─────────────────────────────────────────────────────
function IncomingProductBasicInputs({ formData, handleInputChange }) {
  const { locationList } = useCustomLocation();
  const { purchaseOrderList, getApprovedPurchaseOrderList } =
    usePurchaseOrder();

  // Ensure RFQ list is loaded
  useEffect(() => {
    getApprovedPurchaseOrderList();
  }, [getApprovedPurchaseOrderList]);

  // Resolve selectedReceipt, selectedPO, selectedSupplier, selectedLocation
  const selectedReceipt = getSelectedOption(
    formData.receiptType,
    RECEIPT_TYPES,
    "value"
  );

  const selectedPO = getSelectedOption(
    formData.relatedPO,
    purchaseOrderList,
    "id"
  );

  const selectedSupplier = getSelectedOption(
    formData.suppliersName,
    formData.suppliers,
    "id"
  );

  const selectedLocation = getSelectedOption(
    formData.location,
    locationList,
    "id"
  );

  // Source location object (for display)
  const sourceLocationObj = locationList.find(
    (loc) => loc.location_code === "SUPP"
  );

  return (
    <>
      {/* ─── Row: Receipt Type / Source ID / Receipt Date ───────────────────── */}
      <div className="receiptTypeAndID">
        {/* Receipt Type */}
        <div>
          <label>Receipt Type {REQUIRED_ASTERISK}</label>
          <Autocomplete
            options={RECEIPT_TYPES}
            value={selectedReceipt}
            getOptionLabel={(opt) => opt.label}
            onChange={(e, newValue) =>
              handleInputChange("receiptType", newValue?.value || "")
            }
            renderInput={(params) => (
              <TextField {...params} placeholder="Select receipt type" />
            )}
          />
        </div>

        {/* Source ID (read-only) */}
        <div className="formLabelAndValue">
          <label>Source ID {REQUIRED_ASTERISK}</label>
          <p>{formData.sourceLocation || sourceLocationObj?.id}</p>
        </div>

        {/* Receipt Date (read-only) */}
        <div className="formLabelAndValue">
          <label>Receipt Date {REQUIRED_ASTERISK}</label>
          <p>{formData.receiptDate}</p>
        </div>
      </div>

      {/* ─── Row: Purchase Order / Supplier / Destination Location ───────────── */}
      <Box className="supplierNameAndLocation" mt={2} display="flex" gap={2}>
        {/* Purchase Order */}
        <Box flex={1}>
          <label style={{ marginBottom: 6, display: "block" }}>
            Purchase Order {REQUIRED_ASTERISK}
          </label>
          <Autocomplete
            disablePortal
            options={purchaseOrderList || []}
            value={selectedPO}
            getOptionLabel={(opt) => opt.id || ""}
            isOptionEqualToValue={(opt, val) => opt.id === val?.id}
            onChange={(e, newValue) => {
              // New PO selection: update relatedPO and auto‐fill items
              handleInputChange("relatedPO", newValue || null);
              if (newValue?.items) {
                handleInputChange("items", newValue.items);
              }
            }}
            renderInput={(params) => (
              <TextField {...params} placeholder="Purchase Order" />
            )}
          />
        </Box>

        {/* Supplier */}
        <Box flex={1}>
          <label style={{ marginBottom: 6, display: "block" }}>
            Name of Supplier {REQUIRED_ASTERISK}
          </label>
          <Autocomplete
            options={formData.suppliers || []}
            value={selectedSupplier}
            getOptionLabel={(opt) => opt.company_name || ""}
            isOptionEqualToValue={(opt, val) => opt.id === val?.id}
            onChange={(e, newValue) =>
              handleInputChange("suppliersName", newValue || null)
            }
            renderInput={(params) => (
              <TextField {...params} placeholder="Select supplier" />
            )}
          />
        </Box>

        {/* Destination Location: if already chosen, show read-only; otherwise let user pick */}
        {formData.location && formData.location.id ? (
          <Box className="formLabelAndValue" flex={1}>
            <label>Destination Location {REQUIRED_ASTERISK}</label>
            <p>{formData.location.id}</p>
          </Box>
        ) : (
          <Box flex={1}>
            <label style={{ marginBottom: 6, display: "block" }}>
              Destination Location {REQUIRED_ASTERISK}
            </label>
            <Autocomplete
              disablePortal
              options={locationList || []}
              value={selectedLocation}
              getOptionLabel={(opt) => opt.id || ""}
              isOptionEqualToValue={(opt, val) => opt.id === val?.id}
              onChange={(e, newValue) =>
                handleInputChange("location", newValue || null)
              }
              renderInput={(params) => (
                <TextField {...params} placeholder="Select location" />
              )}
            />
          </Box>
        )}
      </Box>
    </>
  );
}

// ─── Parent Component: Convert to Incoming Product ─────────────────────────────
export default function ConvertPoToIncomingProduct() {
  const { tenant_schema_name } = useTenant().tenantData || {};
  const history = useHistory();
  const location = useLocation();

  // Initialize formData with default values
  const [formData, setFormData] = useState({
    receiptType: "",
    sourceLocation: "",
    receiptDate: formatDate(Date.now()),
    suppliersName: null,
    suppliers: [],
    location: null,
    relatedPO: null,
    items: [],
    status: "draft",
    is_hidden: true,
  });

  const { getLocationList, locationList } = useCustomLocation();
  const { products, fetchProducts, vendors, fetchVendors } = usePurchase();
  const { isLoading, createIncomingProduct } = useIncomingProduct();
  // eslint-disable-next-line no-unused-vars
  const { purchaseOrderList, getApprovedPurchaseOrderList } =
    usePurchaseOrder();

  // Fetch lookups and set default source_location
  useEffect(() => {
    fetchProducts();
    fetchVendors();
    getApprovedPurchaseOrderList();

    getLocationList().then((res) => {
      const src = res.data.find((loc) => loc.location_code === "SUPP");
      if (src) {
        setFormData((prev) => ({ ...prev, sourceLocation: src.id }));
      }
    });
  }, [
    fetchProducts,
    fetchVendors,
    getApprovedPurchaseOrderList,
    getLocationList,
  ]);

  // Populate `suppliers` once vendors load
  useEffect(() => {
    if (Array.isArray(vendors) && vendors.length > 0) {
      setFormData((prev) => ({ ...prev, suppliers: vendors }));
    }
  }, [vendors]);

  // If we navigated here with a `po` in state, auto‐fill relevant fields
  useEffect(() => {
    const incoming = location.state?.po;
    if (
      incoming &&
      products.length > 0 &&
      vendors.length > 0 &&
      locationList.length > 0
    ) {
      // Map each PO item into the format our table expects:
      const mappedItems = incoming.items.map((it) => ({
        product: it.product, // assume this is the full product object
        available_product_quantity: it.qty,
        qty_received: it.quantity_received,
        unit_of_measure: {
          unit_category: it.unit_of_measure.unit_category,
          unit_name: it.unit_of_measure.unit_category,
        },
      }));

      // Find the matching supplier object by ID
      const foundSupplier =
        vendors.find((v) => v.id === incoming.vendor.id) || null;

      setFormData((prev) => ({
        ...prev,
        receiptDate: formatDate(Date.now()),
        suppliersName: foundSupplier,
        relatedPO: incoming, // store PO object so we can pull items from it
        items: mappedItems,
      }));
    }
  }, [location.state, products, vendors, locationList]);

  // Navigate to detail page after creation
  const navigateToDetail = (id) => {
    setTimeout(
      () =>
        history.push(
          `/${tenant_schema_name}/inventory/operations/incoming-product/${id}`
        ),
      1500
    );
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Build the payload
    const payload = {
      destination_location: formData.location?.id,
      receipt_type: formData.receiptType,
      source_location: formData.sourceLocation,
      status: formData.status,
      is_hidden: false,
      related_po: formData?.relatedPO?.id,
      supplier: formData.suppliersName?.id || null,
      incoming_product_items: formData.items.map((item) => ({
        product: item.product.id,
        expected_quantity: Number(item.available_product_quantity),
        quantity_received: Number(item.qty_received),
      })),
    };

    console.log(payload);

    try {
      const res = await createIncomingProduct(payload);
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Incoming product created successfully",
      });
      console.log(res);
      navigateToDetail(res.data.incoming_product_id);
    } catch (err) {
      console.error(err);
      if (err.validation) {
        Swal.fire({
          icon: "error",
          title: "Validation Error",
          html: Object.values(err.validation)
            .map((msg) => `<p>${msg}</p>`)
            .join(""),
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err.message,
        });
      }
    }
  };

  // Transform products for the table’s Autocomplete
  const transformProducts = (list) =>
    list.map((prod) => {
      const [url, unit_category] = prod.unit_of_measure;
      return {
        ...prod,
        unit_of_measure: { url, unit_category, unit_name: unit_category },
      };
    });

  // Configuration for rows in the items table
  const rowConfig = [
    {
      label: "Product Name",
      field: "product",
      type: "autocomplete",
      options: transformProducts(products || []),
      getOptionLabel: (opt) => opt.product_name,
    },
    {
      label: "Expected QTY",
      field: "available_product_quantity",
      type: "number",
    },
    {
      label: "Unit of Measure",
      field: "unit_of_measure",
      type: "text",
      disabled: true,
      transform: (val) => val.unit_category,
    },
    { label: "QTY Received", field: "qty_received", type: "number" },
  ];

  console.log(formData);

  return (
    <CommonForm
      basicInformationTitle="Product Information"
      basicInformationInputs={IncomingProductBasicInputs}
      formTitle="Convert to Incoming Product"
      formData={formData}
      setFormData={setFormData}
      rowConfig={rowConfig}
      isEdit={false}
      onSubmit={handleSubmit}
      submitBtnText={isLoading ? "Submitting..." : "Validate"}
      autofillRow={["unit_of_measure", "available_product_quantity"]}
    />
  );
}
