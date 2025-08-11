// CreateIncomingProduct.jsx (auto-fill enhancements)
import React, { useEffect, useState } from "react";
import { Autocomplete, Box, TextField } from "@mui/material";
import CommonForm from "../../../../../components/CommonForm/CommonForm";
import { formatDate } from "../../../../../helper/helper";
import "./CreateIncomingProduct.css";
import { useTenant } from "../../../../../context/TenantContext";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { useIncomingProduct } from "../../../../../context/Inventory/IncomingProduct";
import { useCustomLocation } from "../../../../../context/Inventory/LocationContext";
import { usePurchase } from "../../../../../context/PurchaseContext";
import Swal from "sweetalert2";
import { usePurchaseOrder } from "../../../../../context/PurchaseOrderContext.";

const receiptTypes = [
  { value: "vendor_receipt", label: "Vendor Receipt" },
  { value: "manufacturing_receipt", label: "Manufacturing Receipt" },
  { value: "internal_transfer", label: "Internal Transfer" },
  { value: "returns", label: "Returns" },
  { value: "scrap", label: "Scrap" },
];

const getSelectedOption = (formValue, list = [], key) => {
  if (typeof formValue === "object" && formValue !== null) {
    return formValue;
  }
  if (typeof formValue === "string") {
    return list.find((item) => item[key] === formValue) || null;
  }
  return null;
};

function IncomingProductBasicInputs({ formData, handleInputChange }) {
  const [selectedReceipt, setSelectedReceipt] = useState(
    receiptTypes.find((rt) => rt.value === formData.receiptType) || null
  );
  const [selectedSupplier, setSelectedSupplier] = useState(
    formData.suppliersName || null
  );
  const [selectedLocation, setSelectedLocation] = useState(
    formData.location || null
  );
  const { activeLocationList, getActiveLocationList } = useCustomLocation();

  const { purchaseOrderList, getPurchaseOrderUnrelatedListForForm } =
    usePurchaseOrder();

  // Ensure RFQ list is loaded
  useEffect(() => {
    getPurchaseOrderUnrelatedListForForm();
  }, [getPurchaseOrderUnrelatedListForForm]);

  useEffect(() => {
    getActiveLocationList();
  }, []);

  useEffect(() => {
    if (formData.receiptType) {
      setSelectedReceipt(
        receiptTypes.find((rt) => rt.value === formData.receiptType)
      );
    }
  }, [formData.receiptType]);

  useEffect(() => {
    if (formData.suppliersName) setSelectedSupplier(formData.suppliersName);
  }, [formData.suppliersName]);

  useEffect(() => {
    if (formData.location) setSelectedLocation(formData.location);
  }, [formData.location]);

  const handleReceiptChange = (e, newVal) => {
    setSelectedReceipt(newVal);
    handleInputChange("receiptType", newVal?.value || "");
  };
  const handleSupplierChange = (e, newVal) => {
    setSelectedSupplier(newVal);
    handleInputChange("suppliersName", newVal);
  };
  const handleLocationChange = (e, newVal) => {
    setSelectedLocation(newVal);
    handleInputChange("location", newVal);
  };

  const sourceObj = activeLocationList.find((l) => l.location_code === "SUPP");

  const selectedPO = getSelectedOption(
    formData.relatedPO,
    purchaseOrderList,
    "id"
  );

  return (
    <>
      <div className="receiptTypeAndID">
        <div>
          <label>Receipt Type</label>
          <Autocomplete
            options={receiptTypes}
            value={selectedReceipt}
            getOptionLabel={(opt) => opt.label}
            onChange={handleReceiptChange}
            renderInput={(params) => (
              <TextField {...params} placeholder="Select receipt type" />
            )}
          />
        </div>
        <div className="formLabelAndValue">
          <label>Source ID</label>
          <p>{formData.source_location || sourceObj?.id}</p>
        </div>
        <div className="formLabelAndValue">
          <label>Receipt Date</label>
          <p>{formatDate(Date.now())}</p>
        </div>
      </div>

      <Box mt={2} display={"flex"} gap={4}>
        <Box flex={1}>
          <label style={{ marginBottom: 6, display: "flex" }}>
            Name of Supplier
          </label>
          <Autocomplete
            options={formData.suppliers}
            value={selectedSupplier}
            getOptionLabel={(opt) => opt.company_name || ""}
            onChange={handleSupplierChange}
            renderInput={(params) => (
              <TextField {...params} placeholder="Select supplier" />
            )}
          />
        </Box>
        <Box flex={1}>
          <label style={{ marginBottom: 6, display: "flex" }}>
            Purchase Order
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
        <Box flex={1}>
          <label style={{ marginBottom: 6, display: "flex" }}>
            Destination Location
          </label>
          {formData.location && activeLocationList.length > 1 ? (
            <Autocomplete
              options={activeLocationList}
              value={selectedLocation}
              getOptionLabel={(opt) => opt.location_name}
              onChange={handleLocationChange}
              renderInput={(params) => (
                <TextField {...params} placeholder="Select location" />
              )}
            />
          ) : (
            <p>{formData.location?.id || ""}</p>
          )}
        </Box>
      </Box>
    </>
  );
}

export default function EditIncomingProduct() {
  const { tenant_schema_name } = useTenant().tenantData || {};
  const history = useHistory();
  const location = useLocation();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    receiptType: "",
    source_location: "",
    receiptDate: formatDate(Date.now()),
    suppliersName: null,
    suppliers: [],
    location: null,
    items: [],
    status: "draft",
    is_hidden: true,
  });
  const { getLocationList, locationList } = useCustomLocation();
  const { products, fetchProductsForForm, vendors, fetchVendorsForForm } =
    usePurchase();
  const { isLoading, updateIncomingProduct } = useIncomingProduct();

  // Fetch lookups
  useEffect(() => {
    Promise.all([
      fetchProductsForForm(),
      fetchVendorsForForm(),
      getLocationList(),
    ]).then(
      // eslint-disable-next-line no-unused-vars
      ([prodRes, vendRes, locRes]) => {
        setFormData((f) => ({ ...f, suppliers: vendRes }));
        // set source location default
        const src = locRes.data.find((l) => l.location_code === "SUPP");
        if (src) setFormData((f) => ({ ...f, source_location: src.id }));
      }
    );
  }, []);

  // Auto-fill incoming state
  useEffect(() => {
    const incoming = location.state?.incoming;
    if (incoming && products.length && vendors.length && locationList.length) {
      const items = incoming.incoming_product_items.map((it) => ({
        ...it,
        product: it.product,
        available_product_quantity: it.expected_quantity,
        qty_received: it.quantity_received,
        unit_of_measure: {
          unit_category:
            it.product_details?.unit_of_measure_details.unit_category,
        },
      }));
      const sup = vendors.find((v) => v.id === incoming.supplier) || null;
      const loc =
        locationList.find((l) => l.id === incoming.destination_location) ||
        null;
      setFormData({
        receiptType: incoming.receipt_type,
        source_location: incoming.source_location,
        receiptDate: formatDate(new Date(incoming.receipt_date)),
        suppliersName: sup,
        relatedPO: incoming.related_po,
        suppliers: vendors,
        location: loc,
        items,
        status: incoming.status,
        is_hidden: incoming.is_hidden,
      });
    }
  }, [location.state, products, vendors, locationList]);

  const handleSubmit = async (data) => {
    console.log(data);
    const payload = {
      destination_location: data?.location?.id,
      receipt_type: data.receiptType,
      source_location: data.source_location,
      related_po: data.relatedPO,
      status: data.status,
      is_hidden: false,
      supplier: data.suppliersName?.id || null,
      incoming_product_items: data?.items.map((it) => ({
        id: it?.id,
        product: it?.product,
        expected_quantity: Number(it?.available_product_quantity),
        quantity_received: Number(it?.qty_received),
      })),
    };

    console.log(payload);
    try {
      const res = await updateIncomingProduct(id, payload);

      Swal.fire("Success", "Record saved", "success");
      history.push(
        `/${tenant_schema_name}/inventory/operations/incoming-product/${res.incoming_product_id}`
      );
    } catch (e) {
      console.error(e);
      const html = e.validation
        ? Object.values(e.validation)
            .map((m) => `<p>${m}</p>`)
            .join("")
        : e.message;
      Swal.fire({ icon: "error", title: "Error", html });
    }

    try {
      const res = await updateIncomingProduct(id, payload);

      // Show success message
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Incoming product created successfully",
      });

      history.push(
        `/${tenant_schema_name}/inventory/operations/incoming-product/${res.incoming_product_id}`
      );
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

      // Try to extract backorder-related info
      const jsonMatch = detailRaw.match(/string='(.*?)'/);
      const codeMatch = detailRaw.match(/code='(.*?)'/);

      const backorderCode = codeMatch?.[1];
      let IP_ID = null;

      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[1]);
          IP_ID = parsed?.IP_ID;
        } catch (parseErr) {
          console.warn("Failed to parse embedded JSON:", parseErr);
        }
      }

      // Handle backorder_required
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
            const backorderPayload = {
              response: true,
              incoming_product: IP_ID,
            };

            await createIncomingProductBackOrder(backorderPayload);

            await Swal.fire({
              icon: "success",
              title: "Success",
              text: "Backorder created successfully",
            });
          } catch (backorderErr) {
            console.error("Backorder creation failed:", backorderErr);
            await Swal.fire({
              icon: "error",
              title: "Backorder Error",
              text: backorderErr.message || "Failed to create backorder.",
            });
          }
        } else {
          // User clicked "No"
          const backorderPayload = {
            response: false,
            incoming_product: IP_ID,
          };

          try {
            await createIncomingProductBackOrder(backorderPayload);

            await Swal.fire({
              icon: "info",
              title: "Acknowledged",
              text: "Backorder not created as per your choice.",
            });
          } catch (backorderErr) {
            console.error(
              "Error sending backorder decline response:",
              backorderErr
            );
            await Swal.fire({
              icon: "error",
              title: "Error",
              text: backorderErr.message || "Failed to process your decision.",
            });
          }
        }

        return;
      }

      // Handle known validation error format (object with field errors)
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
    list.map((prod) => ({
      ...prod,
      unit_of_measure: {
        url: prod.unit_of_measure,
        unit_category: prod?.unit_of_measure_details?.unit_category,
        unit_name: prod?.unit_of_measure_details?.unit_category,
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
      formTitle="Edit Incoming Product"
      formData={formData}
      setFormData={setFormData}
      rowConfig={rowConfig}
      isEdit={true}
      onSubmit={handleSubmit}
      submitBtnText={isLoading ? "Saving..." : "Save"}
      autofillRow={["unit_of_measure", "available_product_quantity"]}
    />
  );
}
