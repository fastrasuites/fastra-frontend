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
import Swal from "sweetalert2";
import "./CreateIncomingProduct.css";
import { usePurchaseOrder } from "../../../../../context/PurchaseOrderContext.";

// Receipt Type Options
const RECEIPT_TYPES = [
  { value: "vendor_receipt", label: "Vendor Receipt" },
  { value: "manufacturing_receipt", label: "Manufacturing Receipt" },
  { value: "internal_transfer", label: "Internal Transfer" },
  { value: "returns", label: "Returns" },
  { value: "scrap", label: "Scrap" },
];

// Helper: Resolve formValue to matching object from list
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

  console.log(formData);

  return (
    <>
      <Box display="flex" gap="50px" justifyContent="space-between" pr={60}>
        <div className="formLabelAndValue">
          <label>Receipt Type {REQUIRED_ASTERISK}</label>
          <p>{selectedReceipt?.label || "Vendor Receipt"}</p>
        </div>

        <div className="formLabelAndValue">
          <label>Source ID {REQUIRED_ASTERISK}</label>
          <p>Supplier Location</p>
        </div>

        <div className="formLabelAndValue">
          <label>Receipt Date {REQUIRED_ASTERISK}</label>
          <p>{formData.receiptDate}</p>
        </div>
      </Box>

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

        <Box className="formLabelAndValue" flex={1}>
          <label style={{ marginBottom: 6, display: "block" }}>
            Name of Supplier {REQUIRED_ASTERISK}
          </label>
          {/* <Autocomplete
            options={formData.suppliers || []}
            value={selectedSupplier}
            getOptionLabel={(opt) => opt.company_name || ""}
            isOptionEqualToValue={(opt, val) => opt.id === val?.id}
            onChange={(e, newValue) =>
              handleInputChange("suppliersName", newValue || null)
            }
            renderInput={(params) => (
              <TextField {...params} placeholder="Select supplier" required />
            )}
          /> */}
          <p>{formData?.relatedPO?.vendor_details?.company_name}</p>
        </Box>

        <Box className="formLabelAndValue" flex={1}>
          <label>Destination Location {REQUIRED_ASTERISK}</label>
          <p>{singleLocation?.location_name}</p>
        </Box>
      </Box>
    </>
  );
}

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

  const { products, fetchProductsForForm, vendors, fetchVendorsForForm } =
    usePurchase();
  const { isLoading, createIncomingProduct, createIncomingProductBackOrder } =
    useIncomingProduct();
  const { getApprovedPurchaseOrderList } = usePurchaseOrder();
  const { locationList, getLocationListForForm } = useCustomLocation();

  useEffect(() => {
    fetchProductsForForm();
    fetchVendorsForForm();
    getApprovedPurchaseOrderList();
    getLocationListForForm();
  }, []);

  useEffect(() => {
    if (Array.isArray(vendors) && vendors.length > 0) {
      setFormData((prev) => ({ ...prev, suppliers: vendors }));
    }
  }, [vendors]);

  const sourceLocObj = useMemo(
    () => locationList.find((loc) => loc.location_code === "SUPP"),
    [locationList]
  );

  // console.log(location.state.po);

  useEffect(() => {
    const incoming = location.state?.po;
    if (incoming && products.length > 0 && vendors.length > 0) {
      const mappedItems = incoming.items.map((it) => ({
        product: it.product_details,
        available_product_quantity: it.qty,
        qty_received: it.quantity_received,
        unit_of_measure: {
          unit_category:
            it?.product_details?.unit_of_measure_details?.unit_name,
          unit_name: it?.product_details?.unit_of_measure_details?.unit_name,
        },
      }));

      const foundSupplier =
        vendors.find((v) => v.id === incoming.vendor.id) || null;

      setFormData((prev) => ({
        ...prev,
        receiptDate: formatDate(Date.now()),
        receiptType: "vendor_receipt",
        sourceLocation: sourceLocObj,
        destination_location: incoming.destination_location,
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

  // console.log(formData);
  const handleSubmit = async (filledFormData, status = "draft") => {
    const payload = {
      destination_location: filledFormData.destination_location,
      receipt_type: filledFormData.receiptType,
      related_po: filledFormData.relatedPO?.id,
      source_location: filledFormData.sourceLocation.id,
      status,
      is_hidden: false,
      supplier: filledFormData.relatedPO.vendor || null,
      incoming_product_items: filledFormData.items.map((item) => ({
        product: item.product.id,
        expected_quantity: Number(item.available_product_quantity),
        quantity_received: Number(item.qty_received),
      })),
      can_edit: true,
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

      if (
        Array.isArray(err?.response?.data?.non_field_errors) &&
        err.response.data.non_field_errors.length > 0
      ) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err.response.data.non_field_errors[0],
        });
        return;
      }

      const detailRaw = err?.response?.data?.detail?.toString?.() || "";
      const jsonMatch = detailRaw.match(/string='(.*?)'/);
      const codeMatch = detailRaw.match(/code='(.*?)'/);

      const backorderCode = codeMatch?.[1];
      let IP_ID = null;

      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[1]);
          IP_ID = parsed?.IP_ID;
        } catch {}
      }

      if (backorderCode === "backorder_required" && IP_ID) {
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

        if (result.isConfirmed) {
          try {
            await createIncomingProductBackOrder({
              response: true,
              incoming_product: IP_ID,
            });
            await Swal.fire({
              icon: "success",
              title: "Success",
              text: "Backorder created successfully",
            });
            navigateToDetail(IP_ID);
          } catch (backorderErr) {
            await Swal.fire({
              icon: "error",
              title: "Backorder Error",
              text: backorderErr.message || "Failed to create backorder.",
            });
          }
        } else {
          try {
            await createIncomingProductBackOrder({
              response: false,
              incoming_product: IP_ID,
            });
            await Swal.fire({
              icon: "info",
              title: "Acknowledged",
              text: "Backorder not created as per your choice.",
            });
          } catch (backorderErr) {
            await Swal.fire({
              icon: "error",
              title: "Error",
              text: backorderErr.message || "Failed to process your decision.",
            });
          }
        }
        return;
      }

      const detailData = err?.response?.data?.detail;
      if (
        detailData &&
        typeof detailData === "object" &&
        !Array.isArray(detailData)
      ) {
        const messages = Object.values(detailData)
          .flat()
          .map((msg) => `<p>${msg}</p>`)
          .join("");
        await Swal.fire({
          icon: "error",
          title: "Validation Error",
          html: messages || "An unknown validation error occurred.",
        });
        return;
      }

      await Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.message || "Something went wrong. Please try again.",
      });
    }
  };

  const transformProducts = (list) =>
    list.map((prod) => {
      const unit_category = prod?.unit_of_measure_details?.unit_name;
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
    { label: "QTY Received", field: "qty_received", type: "number" },
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
      onSubmit={() => handleSubmit(formData, "draft")}
      submitBtnText={isLoading ? "Submitting..." : "Save to Draft"}
      autofillRow={["unit_of_measure", "available_product_quantity"]}
    />
  );
}
