// src/dash/Inventory/Operations/IncomingProduct/CreateIncomingProduct.jsx

import React, { useEffect, useState, useMemo } from "react";
import { Autocomplete, Box, TextField, Typography } from "@mui/material";
import CommonForm from "../../../../../components/CommonForm/CommonForm";
import { formatDate } from "../../../../../helper/helper";
import { useTenant } from "../../../../../context/TenantContext";
import { useHistory, useLocation } from "react-router-dom";
import { useIncomingProduct } from "../../../../../context/Inventory/IncomingProduct";
import { useCustomLocation } from "../../../../../context/Inventory/LocationContext";
import { usePurchase } from "../../../../../context/PurchaseContext";
import { usePurchaseOrder } from "../../../../../context/PurchaseOrderContext.";
import Swal from "sweetalert2";
import "./CreateIncomingProduct.css";

// ─── Receipt Type Options ───────────────────────────────────────────────────
const RECEIPT_TYPES = [
  { value: "vendor_receipt", label: "Vendor Receipt" },
  { value: "manufacturing_receipt", label: "Manufacturing Receipt" },
  { value: "internal_transfer", label: "Internal Transfer" },
  { value: "returns", label: "Returns" },
  { value: "scrap", label: "Scrap" },
];

// ─── Helper: Resolve a formValue (object or string) into a matching object from list ──
const getSelectedOption = (formValue, list = [], key) => {
  if (typeof formValue === "object" && formValue !== null) return formValue;
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
  const { getSingleLocation, singleLocation } = useCustomLocation();
  const { purchaseOrderList, getApprovedPurchaseOrderList } =
    usePurchaseOrder();

  const locationId = formData?.relatedPO?.destination_location;

  useEffect(() => {
    if (locationId) getSingleLocation(locationId);
  }, [locationId, getSingleLocation]);

  useEffect(() => {
    getApprovedPurchaseOrderList();
  }, [getApprovedPurchaseOrderList]);

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

  return (
    <>
      <div className="receiptTypeAndID">
        <div>
          <label>Receipt Type {REQUIRED_ASTERISK}</label>
          <Autocomplete
            options={RECEIPT_TYPES}
            value={selectedReceipt}
            getOptionLabel={(opt) => opt.label || ""}
            isOptionEqualToValue={(opt, val) => opt.value === val?.value}
            onChange={(e, newValue) =>
              handleInputChange("receiptType", newValue?.value || "")
            }
            renderInput={(params) => (
              <TextField {...params} placeholder="Select receipt type" />
            )}
          />
        </div>

        <div className="formLabelAndValue">
          <label>Source ID {REQUIRED_ASTERISK}</label>
          <p>Supplier Location</p>
        </div>

        <div className="formLabelAndValue">
          <label>Receipt Date {REQUIRED_ASTERISK}</label>
          <p>{formData.receiptDate}</p>
        </div>
      </div>

      <Box className="supplierNameAndLocation" mt={2} display="flex" gap={2}>
        <Box flex={1}>
          <label style={{ marginBottom: 6, display: "block" }}>
            Purchase Order {REQUIRED_ASTERISK}
          </label>
          <Autocomplete
            options={purchaseOrderList || []}
            value={selectedPO}
            getOptionLabel={(opt) => opt.id || ""}
            isOptionEqualToValue={(opt, val) => opt.id === val?.id}
            onChange={(e, newValue) => {
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

        <Box className="formLabelAndValue" flex={1}>
          <label>Destination Location {REQUIRED_ASTERISK}</label>
          <p>{singleLocation?.location_name}</p>
        </Box>
      </Box>
    </>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────
export default function ConvertPoToIncomingProduct() {
  const { tenant_schema_name } = useTenant().tenantData || {};
  const history = useHistory();
  const location = useLocation();

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

  const { products, fetchProducts, vendors, fetchVendors } = usePurchase();
  const { isLoading, createIncomingProduct } = useIncomingProduct();
  const { getApprovedPurchaseOrderList } = usePurchaseOrder();
  const { activeLocationList, getActiveLocationList } = useCustomLocation();

  useEffect(() => {
    fetchProducts();
    fetchVendors();
    getApprovedPurchaseOrderList();
    getActiveLocationList();
  }, []);

  useEffect(() => {
    if (Array.isArray(vendors) && vendors.length > 0) {
      setFormData((prev) => ({ ...prev, suppliers: vendors }));
    }
  }, [vendors]);

  const sourceLocObj = useMemo(
    () => activeLocationList.find((loc) => loc.location_code === "SUPP"),
    [activeLocationList]
  );

  useEffect(() => {
    const incoming = location.state?.po;
    if (incoming && products.length > 0 && vendors.length > 0) {
      const mappedItems = incoming.items.map((it) => ({
        product: it.product_details,
        available_product_quantity: it.qty,
        qty_received: it.quantity_received,
        unit_of_measure: {
          unit_category:
            it?.product_details?.unit_of_measure_details?.unit_category,
          unit_name:
            it?.product_details?.unit_of_measure_details?.unit_category,
        },
      }));

      const foundSupplier =
        vendors.find((v) => v.id === incoming.vendor.id) || null;

      setFormData((prev) => ({
        ...prev,
        receiptDate: formatDate(Date.now()),
        suppliersName: foundSupplier,
        relatedPO: incoming,
        items: mappedItems,
      }));
    }
  }, [location.state, products, vendors]);

  const navigateToDetail = (id) => {
    setTimeout(() => {
      history.push(
        `/${tenant_schema_name}/inventory/operations/incoming-product/${id}`
      );
    }, 1500);
  };

  const handleSubmit = async () => {
    const payload = {
      destination_location: formData?.relatedPO?.destination_location,
      receipt_type: formData.receiptType,
      source_location: sourceLocObj?.id,
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
    try {
      const res = await createIncomingProduct(payload);
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Incoming product created successfully",
      });
      navigateToDetail(res.data.incoming_product_id);
    } catch (err) {
      console.error(err);

      const errorData = err?.response?.data;

      if (errorData) {
        const messages = Object.values(errorData)
          .flat() // flatten arrays of messages
          .map((msg) => `<p>${msg}</p>`)
          .join("");

        Swal.fire({
          icon: "error",
          title: "Validation Error",
          html: messages || "An unknown error occurred.",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err.message || "Something went wrong",
        });
      }
    }
  };

  const transformProducts = (list) =>
    list.map((prod) => {
      const unit_category = prod?.unit_of_measure_details?.unit_category;
      return {
        ...prod,
        unit_of_measure: {
          url: prod.unit_of_measure,
          unit_category,
          unit_name: unit_category,
        },
      };
    });

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
      disabled: true,
    },
    {
      label: "Unit of Measure",
      field: "unit_of_measure",
      type: "text",
      disabled: true,
      transform: (val) => val.unit_category,
    },
    {
      label: "QTY Received",
      field: "qty_received",
      type: "number",
    },
  ];

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
