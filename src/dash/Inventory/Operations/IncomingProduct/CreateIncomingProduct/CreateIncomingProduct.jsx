// CreateIncomingProduct.jsx
import React, { useEffect, useState } from "react";
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

// Receipt types array (UI remains the same)
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

// Default formData: keep related_po and suppliersName as single selected objects
const defaultFormData = {
  receiptType: "",
  related_po: null,
  source_location: "",
  receiptDate: formatDate(Date.now()),
  suppliersName: null,
  suppliers: [], // we'll populate this from context
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

  const { locationList, getLocationList } = useCustomLocation();
  const { vendors, fetchVendors } = usePurchase();
  const { purchaseOrderList, getApprovedPurchaseOrderList } =
    usePurchaseOrder();

  useEffect(() => {
    // fetch vendors and purchase orders if not already done
    fetchVendors();
    getApprovedPurchaseOrderList();
    getLocationList();
  }, [fetchVendors, getApprovedPurchaseOrderList, getLocationList]);

  const handleReceiptChange = (e, newVal) => {
    setSelectedReceipt(newVal);
    handleInputChange("receiptType", newVal ? newVal.value : "");
  };

  const handleSupplierChange = (e, newVal) => {
    setSelectedSupplier(newVal);
    handleInputChange("suppliersName", newVal);
  };

  const handleRelatedPOChange = (e, newVal) => {
    setSelectedRelatedPO(newVal);

    const mappedItems = newVal.items.map((it) => ({
      product: it.product_details,
      available_product_quantity: it.qty,
      qty_received: it.quantity_received,
      unit_of_measure: {
        unit_category:
          it?.product_details?.unit_of_measure_details?.unit_category,
        unit_name: it?.product_details?.unit_of_measure_details?.unit_category,
      },
    }));

    setFormData({ ...formData, items: mappedItems });
    handleInputChange("related_po", newVal);
  };

  const handleLocationChange = (e, newVal) => {
    setSelectedLocation(newVal);
    handleInputChange("location", newVal);
  };

  // Find the supplier source location with code "SUPP"
  const sourceLocObj = locationList.find((loc) => loc.location_code === "SUPP");

  return (
    <>
      <div className="receiptTypeAndID">
        <div>
          <label style={{ marginBottom: 6, display: "block" }}>
            Receipt Type
            {REQUIRED_ASTERISK}
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
          <label>Source Location {REQUIRED_ASTERISK}</label>
          <p>{sourceLocObj?.location_name || formData.source_location}</p>
        </div>
        <div className="formLabelAndValue">
          <label>Receipt Date {REQUIRED_ASTERISK}</label>
          <p>{formData.receiptDate}</p>
        </div>
      </div>

      <Box display="flex" gap={5}>
        <Box flex={1}>
          <label style={{ marginBottom: 6, display: "block" }}>
            Purchase Order
            {REQUIRED_ASTERISK}
          </label>
          <Autocomplete
            disablePortal
            options={Array.isArray(purchaseOrderList) ? purchaseOrderList : []}
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
          <label style={{ marginBottom: 6, display: "block" }}>
            Name of Supplier
            {REQUIRED_ASTERISK}
          </label>
          <Autocomplete
            disablePortal
            options={Array.isArray(vendors) ? vendors : []}
            value={selectedSupplier}
            getOptionLabel={(opt) => opt.company_name || ""}
            isOptionEqualToValue={(opt, val) => opt.id === val?.id}
            onChange={handleSupplierChange}
            sx={{ width: "100%", mb: 2 }}
            renderInput={(params) => (
              <TextField {...params} placeholder="Select supplier" />
            )}
          />
        </Box>

        {locationList.length <= 1 ? (
          <Box flex={1}>
            <label>Destination Location {REQUIRED_ASTERISK}</label>
            <p>{formData.location?.id || ""}</p>
          </Box>
        ) : (
          <Box flex={1}>
            <label style={{ marginBottom: 6, display: "block" }}>
              Destination Location {REQUIRED_ASTERISK}
            </label>
            <Autocomplete
              disablePortal
              options={Array.isArray(locationList) ? locationList : []}
              value={selectedLocation}
              getOptionLabel={(opt) => opt.id || ""}
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
  const { isLoading: incomingProductLoading, createIncomingProduct } =
    useIncomingProduct();
  const { products, fetchProducts } = usePurchase();
  const { getLocationList } = useCustomLocation();

  // Fetch products and locations on mount
  useEffect(() => {
    fetchProducts();
    getLocationList().then((res) => {
      const src = res.data.find((loc) => loc.location_code === "SUPP");
      if (src) {
        setFormData((prev) => ({ ...prev, source_location: src.id }));
      }
    });
  }, [fetchProducts, getLocationList]);

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
      transform: (val) => val || "",
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

  const navigateToDetail = (id) =>
    setTimeout(
      () =>
        history.push(
          `/${tenant_schema_name}/inventory/operations/incoming-product/${id}`
        ),
      1500
    );

  const handleSubmit = async (filledFormData) => {
    const payload = {
      destination_location: filledFormData.location?.id,
      receipt_type: filledFormData.receiptType,
      related_po: filledFormData.related_po?.id,
      source_location: filledFormData.source_location,
      status: filledFormData.status,
      is_hidden: false,
      supplier: filledFormData.suppliersName?.id || null,
      incoming_product_items: filledFormData.items.map((item) => ({
        product: item.product.id,
        expected_quantity: Number(item.available_product_quantity),
        quantity_received: Number(item.qty_received),
      })),
      //  is_validated: true,
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
  const handleSubmitValidated = async (filledFormData) => {
    const payload = {
      destination_location: filledFormData.location?.id,
      receipt_type: filledFormData.receiptType,
      related_po: filledFormData.related_po?.id,
      source_location: filledFormData.source_location,
      status: "validated",
      is_hidden: false,
      supplier: filledFormData.suppliersName?.id || null,
      incoming_product_items: filledFormData.items.map((item) => ({
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
        text: "Incoming product validated and created successfully",
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

  return (
    <CommonForm
      basicInformationTitle="Product Information"
      basicInformationInputs={IncomingProductBasicInputs}
      formTitle="New Incoming Product"
      formData={formData}
      setFormData={setFormData}
      rowConfig={rowConfig}
      isEdit={false}
      onSubmit={handleSubmit}
      submitBtnText={incomingProductLoading ? "Submitting..." : "Validate"}
      autofillRow={["unit_of_measure", "available_product_quantity"]}
      onSubmitAsDone={handleSubmitValidated}
      isLoading={incomingProductLoading}
    />
  );
};

export default CreateIncomingProduct;
