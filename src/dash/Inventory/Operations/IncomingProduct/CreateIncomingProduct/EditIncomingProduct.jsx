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
  const { locationList, getLocationList } = useCustomLocation();

  useEffect(() => {
    getLocationList();
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
          <p>{formatDate(Date.now())}</p>
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
        <Box>
          <label>Destination Location</label>
          {formData.location && locationList.length > 1 ? (
            <Autocomplete
              options={locationList}
              value={selectedLocation}
              getOptionLabel={(opt) => opt.id}
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
  const { products, fetchProducts, vendors, fetchVendors } = usePurchase();
  const { isLoading, updateIncomingProduct } = useIncomingProduct();

  // Fetch lookups
  useEffect(() => {
    Promise.all([fetchProducts(), fetchVendors(), getLocationList()]).then(
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
        unit_of_measure: { unit_category: it.product.unit_of_measure[1] },
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
        suppliers: vendors,
        location: loc,
        items,
        status: incoming.status,
        is_hidden: incoming.is_hidden,
      });
    }
  }, [location.state, products, vendors, locationList]);

  const handleSubmit = async (data) => {
    console.log(id);
    const payload = {
      destination_location: data.location.id,
      receipt_type: data.receiptType,
      source_location: data.source_location,
      status: data.status,
      is_hidden: false,
      supplier: data.suppliersName?.id || null,
      items: data.items.map((it) => ({
        product: it.product.id,
        expected_quantity: Number(it.available_product_quantity),
        quantity_received: Number(it.qty_received),
      })),
    };
    try {
      const res = await updateIncomingProduct(id, payload);
      console.log(res);

      Swal.fire("Success", "Record saved", "success");
      history.push(
        `/${tenant_schema_name}/inventory/operations/incoming-product/${res.id}`
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
