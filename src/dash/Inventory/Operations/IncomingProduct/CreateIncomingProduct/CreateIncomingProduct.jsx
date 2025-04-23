// CreateIncomingProduct.jsx
import React, { useState } from "react";
import { Autocomplete, TextField } from "@mui/material";
import CommonForm from "../../../../../components/CommonForm/CommonForm";
import { extractRFQID, formatDate } from "../../../../../helper/helper";
import "./CreateIncomingProduct.css";

// Sample receipt types array
const receiptTypes = [
  {
    receiptType: "Goods Receipt Against Purchase Order",
    description:
      "Receipt of goods referencing an existing purchase order, ensuring delivered items match order specifications.",
    movementType: "101",
    referenceDocument: "Purchase Order",
  },
  {
    receiptType: "Goods Receipt Against Production Order",
    description:
      "Receipt of finished products into inventory following internal production processes.",
    movementType: "101",
    referenceDocument: "Production Order",
  },
  {
    receiptType: "Goods Receipt Without Reference",
    description:
      "Receipt of goods without any preceding document, such as unplanned deliveries or free samples.",
    movementType: "501",
    referenceDocument: "None",
  },
  {
    receiptType: "Goods Receipt for Returns",
    description:
      "Receipt of returned goods from customers back into inventory.",
    movementType: "451",
    referenceDocument: "Sales Order",
  },
  {
    receiptType: "Goods Receipt from Stock Transport Order",
    description:
      "Receipt of goods transferred from another plant or storage location within the organization.",
    movementType: "101",
    referenceDocument: "Stock Transport Order",
  },
];

// Sample products list array
const productsList = [
  {
    id: 3,
    product_name: "Meat Burger",
    product_description: "Delicious Meat",
    product_category: "consumable",
    available_product_quantity: 2,
    url: "http://tega.fastrasuiteapi.com.ng/purchase/products/3/",
    unit_of_measure: {
      url: "http://tega.fastrasuiteapi.com.ng/purchase/unit-of-measure/2/",
      unit_name: "centimeter",
      unit_category: "cm",
    },
  },
  {
    id: 4,
    product_name: "Vegetable Mix",
    product_description: "Assorted fresh vegetables",
    product_category: "perishable",
    available_product_quantity: 50,
    url: "http://tega.fastrasuiteapi.com.ng/purchase/products/4/",
    unit_of_measure: {
      url: "http://tega.fastrasuiteapi.com.ng/purchase/unit-of-measure/3/",
      unit_name: "kilogram",
      unit_category: "kg",
    },
  },
  {
    id: 5,
    product_name: "Wheat Bread",
    product_description: "Freshly baked wheat bread",
    product_category: "bakery",
    available_product_quantity: 100,
    url: "http://tega.fastrasuiteapi.com.ng/purchase/products/5/",
    unit_of_measure: {
      url: "http://tega.fastrasuiteapi.com.ng/purchase/unit-of-measure/4/",
      unit_name: "loaf",
      unit_category: "unit",
    },
  },
  {
    id: 6,
    product_name: "Organic Whole Milk",
    product_description: "Fresh organic whole milk",
    product_category: "dairy",
    available_product_quantity: 75,
    url: "http://tega.fastrasuiteapi.com.ng/purchase/products/6/",
    unit_of_measure: {
      url: "http://tega.fastrasuiteapi.com.ng/purchase/unit-of-measure/5/",
      unit_name: "liter",
      unit_category: "L",
    },
  },
  {
    id: 7,
    product_name: "Premium Cheese",
    product_description: "High quality premium cheese",
    product_category: "dairy",
    available_product_quantity: 20,
    url: "http://tega.fastrasuiteapi.com.ng/purchase/products/7/",
    unit_of_measure: {
      url: "http://tega.fastrasuiteapi.com.ng/purchase/unit-of-measure/6/",
      unit_name: "slice",
      unit_category: "unit",
    },
  },
];

// Sample locations array
const locations = [
  {
    id: "loc-001",
    name: "Downtown Office",
    address: "123 Main St",
    city: "New York",
    state: "NY",
    country: "USA",
    postalCode: "10001",
    coordinates: { lat: 40.7128, lng: -74.006 },
  },
  {
    id: "loc-002",
    name: "Westside Warehouse",
    address: "456 West Ave",
    city: "Los Angeles",
    state: "CA",
    country: "USA",
    postalCode: "90001",
    coordinates: { lat: 34.0522, lng: -118.2437 },
  },
  {
    id: "loc-003",
    name: "Midtown Hub",
    address: "789 Central Blvd",
    city: "Chicago",
    state: "IL",
    country: "USA",
    postalCode: "60601",
    coordinates: { lat: 41.8781, lng: -87.6298 },
  },
  {
    id: "loc-004",
    name: "City Center Point",
    address: "101 East Street",
    city: "Houston",
    state: "TX",
    country: "USA",
    postalCode: "77002",
    coordinates: { lat: 29.7604, lng: -95.3698 },
  },
  {
    id: "loc-005",
    name: "Suburban Plaza",
    address: "202 North Road",
    city: "Phoenix",
    state: "AZ",
    country: "USA",
    postalCode: "85001",
    coordinates: { lat: 33.4484, lng: -112.074 },
  },
];

// Row configuration for the dynamic table
const rowConfig = [
  {
    label: "Product Name",
    field: "product",
    type: "autocomplete",
    options: productsList,
    getOptionLabel: (option) => option?.product_name || "",
  },
  {
    label: "Expected QTY",
    field: "available_product_quantity",
    type: "number",
    transform: (value) => value|| "",
  },
  {
    label: "Unit of Measure",
    field: "unit_of_measure",
    type: "text",
    disabled: true,
    transform: (value) => value?.unit_category || "",
  },
  {
    label: "QTY Received",
    field: "qty_received",
    type: "number",
  },
];

// Default form data structure
const defaultFormData = {
  receiptTypes: "",
  id: extractRFQID("LAGIN0001"),
  receiptDate: formatDate(Date.now()),
  suppliersName: "",
  location: "",
  items: [],
  status: "draft",
  is_hidden: true,
};

// Basic input component for the incoming product form
const IncomingProductBasicInputs = ({ formData, handleInputChange }) => {
  const [selectedReceipt, setSelectedReceipt] = React.useState(null);
  const [selectedLocation, setSelectedLocation] = React.useState(null);

  // Sync with parent state upon selection change
  const handleReceiptChange = (event, newValue) => {
    setSelectedReceipt(newValue);
    handleInputChange("receiptTypes", newValue);
  };

  const handleLocationChange = (event, newValue) => {
    setSelectedLocation(newValue);
    handleInputChange("location", newValue);
  };

  return (
    <>
      <div className="receiptTypeAndID">
        <div>
          <label style={{ marginBottom: "6px", display: "block" }}>
            Receipt Type
          </label>
          <Autocomplete
            disablePortal
            options={receiptTypes}
            value={selectedReceipt}
            getOptionLabel={(option) => option.receiptType}
            isOptionEqualToValue={(option, value) =>
              option.receiptType === value.receiptType
            }
            onChange={handleReceiptChange}
            sx={{ width: "100%", mb: 2 }}
            renderInput={(params) => (
              <TextField {...params} placeholder="Receipt Type" />
            )}
          />
        </div>
        <div className="formLabelAndValue">
          <label>ID</label>
          <p>{formData.id}</p>
        </div>
        <div className="formLabelAndValue">
          <label>Receipt Date</label>
          <p>{formData.receiptDate}</p>
        </div>
      </div>
      <div className="supplierNameAndLocation">
        <div className="supplierName">
          <label style={{ marginBottom: "6px", display: "block" }}>
            Name of Supplier
          </label>
          <TextField
            type="text"
            value={formData.suppliersName || ""}
            onChange={(e) => handleInputChange("suppliersName", e.target.value)}
            sx={{ width: "100%" }}
            placeholder="Enter supplier’s name"
          />
        </div>
        <div>
          <label style={{ marginBottom: "6px", display: "block" }}>
            Location
          </label>
          <Autocomplete
            disablePortal
            options={locations}
            value={selectedLocation}
            getOptionLabel={(option) => option.address}
            isOptionEqualToValue={(option, value) =>
              option.address === value.address
            }
            onChange={handleLocationChange}
            sx={{ width: "100%", mb: 2 }}
            renderInput={(params) => (
              <TextField {...params} placeholder="Select your location" />
            )}
          />
        </div>
      </div>
    </>
  );
};

const CreateIncomingProduct = () => {
  const [formData, setFormData] = useState(defaultFormData);

  // Callback to process the final filled form data
  const handleSubmit = (filledFormData) => {
    console.log("Final Form Data", filledFormData);
   
  };
  console.log("Form Data", formData);
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
      submitBtnText="Validate"
    />
  );
};

export default CreateIncomingProduct;
