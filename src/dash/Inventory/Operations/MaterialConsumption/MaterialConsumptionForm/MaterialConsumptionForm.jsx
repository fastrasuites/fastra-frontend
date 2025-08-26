// CreateIncomingProduct.jsx
import React, { useState } from "react";
import { Autocomplete, TextField } from "@mui/material";
import CommonForm from "../../../../../components/CommonForm/CommonForm";
import { extractRFQID, formatDate } from "../../../../../helper/helper";
import "./MaterialConsumptionForm.css";

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
    transform: (value) => value || "",
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
  id: extractRFQID("MCN0001"),
  dateCreated: formatDate(Date.now()),
  createdBy: "John Doe",
  location: "Location 1",
  items: [],
  status: "draft",
  is_hidden: true,
};

// Basic input component for the incoming product form
const MaterialConsumptionFormBasicInputs = ({
  formData,
  handleInputChange,
}) => {
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
      <div className="materialbasicInformationInputs">
        <div className="formLabelAndValue">
          <label>ID</label>
          <p>{formData.id}</p>
        </div>
        <div className="formLabelAndValue">
          <label>Created By</label>
          <p>{formData.createdBy}</p>
        </div>
        <div className="formLabelAndValue">
          <label>Date Created</label>
          <p>{formData.dateCreated}</p>
        </div>
        <div className="formLabelAndValue">
          <label>Location</label>
          <p>{formData.location}</p>
        </div>
      </div>
    </>
  );
};

const MaterialConsumptionForm = () => {
  const [formData, setFormData] = useState(defaultFormData);

  // Callback to process the final filled form data
  const handleSubmit = (filledFormData) => {
    console.log("Final Form Data", filledFormData);
  };
  return (
    <CommonForm
      basicInformationTitle="Product Information"
      basicInformationInputs={MaterialConsumptionFormBasicInputs}
      formTitle="New Material Consumption"
      formData={formData}
      setFormData={setFormData}
      rowConfig={rowConfig}
      isEdit={false}
      onSubmit={handleSubmit}
      submitBtnText="Validate"
    />
  );
};

export default MaterialConsumptionForm;
