import React, { useEffect, useState } from "react";
import { Autocomplete, Box, TextField } from "@mui/material";
import CommonForm from "../../../../../components/CommonForm/CommonForm";
import { formatDate } from "../../../../../helper/helper";
import "./CreateIncomingProduct.css";
import { useTenant } from "../../../../../context/TenantContext";
import { useHistory, useLocation } from "react-router-dom";
import { useIncomingProduct } from "../../../../../context/Inventory/IncomingProduct";
import { useCustomLocation } from "../../../../../context/Inventory/LocationContext";
import { usePurchase } from "../../../../../context/PurchaseContext";
import Swal from "sweetalert2";

const receiptTypes = [
  { value: "vendor_receipt", label: "Vendor Receipt" },
  { value: "manufacturing_receipt", label: "Manufacturing Receipt" },
  { value: "internal_transfer", label: "Internal Transfer" },
  { value: "returns", label: "Returns" },
  { value: "scrap", label: "Scrap" },
];

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
  const { locationList } = useCustomLocation();

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

  const sourceObj = locationList.find((l) => l.location_code === "SUPP");

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
          <p>{formData.receiptDate}</p>
        </div>
      </div>

      <Box className="supplierNameAndLocation" mt={2}>
        <div>
          <label>Name of Supplier</label>
          <Autocomplete
            options={formData.suppliers}
            value={selectedSupplier}
            getOptionLabel={(opt) => opt.company_name || ""}
            onChange={handleSupplierChange}
            renderInput={(params) => (
              <TextField {...params} placeholder="Select supplier" />
            )}
          />
        </div>
        {formData.location && formData.location.id ? (
          <div className="formLabelAndValue">
            <label>Destination Location</label>
            <p>{formData.location.id}</p>
          </div>
        ) : (
          <div>
            <label style={{ marginBottom: "6px", display: "block" }}>
              Destination Location
            </label>
            <Autocomplete
              disablePortal
              options={locationList}
              value={selectedLocation}
              getOptionLabel={(opt) => opt.id || ""}
              isOptionEqualToValue={(opt, val) => opt.id === val.id}
              onChange={handleLocationChange}
              sx={{ width: "100%", mb: 2 }}
              renderInput={(params) => (
                <TextField {...params} placeholder="Select location" />
              )}
            />
          </div>
        )}
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
  const { products, fetchProducts, vendors, fetchVendors } = usePurchase();
  const { isLoading, createIncomingProduct } = useIncomingProduct();

  // Fetch lookups and set defaults

  useEffect(() => {
    fetchProducts();
    fetchVendors();
    getLocationList().then((res) => {
      const src = res.data.find((loc) => loc.location_code === "SUPP");
      console.log("Source location:", src);
      if (src) setFormData((prev) => ({ ...prev, source_location: src.id }));
    });
  }, [fetchProducts, fetchVendors, getLocationList]);

  useEffect(() => {
    if (Array.isArray(vendors) && vendors.length > 0) {
      setFormData((prev) => ({ ...prev, suppliers: vendors }));
    }
  }, [vendors]);

  // Auto-fill incoming state
  useEffect(() => {
    const incoming = location.state?.po;
    if (incoming && products.length && vendors.length && locationList.length) {
      const items = incoming.items.map((it) => ({
        ...it,
        product: it.product,
        available_product_quantity: it.qty,
        qty_received: it.quantity_received,
        unit_of_measure: { unit_category: it.unit_of_measure.unit_category },
      }));
      const sup = vendors.find((v) => v.id === incoming.vendor.id) || null;
      setFormData((prev) => ({
        ...prev,
        receiptDate: formatDate(Date.now()),
        suppliersName: sup,
        suppliers: vendors,
        items,
      }));
    }
  }, [location.state, products, vendors, locationList]);

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
      destination_location: filledFormData?.location?.id,
      receipt_type: filledFormData.receiptType,
      source_location: filledFormData.source_location,
      status: filledFormData.status,
      is_hidden: false,
      supplier: filledFormData.suppliersName?.id || null,
      items: filledFormData.items.map((item) => ({
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
        text: "Stock adjustment created successfully",
      });
      navigateToDetail(res.data.id);
    } catch (err) {
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
    // console.log(filledFormData);
  };

  const transformProducts = (list) =>
    list.map((prod) => {
      const [url, unit_category] = prod.unit_of_measure;
      return {
        ...prod,
        unit_of_measure: { url, unit_category, unit_name: unit_category },
      };
    });

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
