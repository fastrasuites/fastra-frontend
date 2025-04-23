import React, { useState } from "react";
import { TextField } from "@mui/material";
import { extractRFQID, formatDate } from "../../../../../helper/helper";
import CommonForm from "../../../../../components/CommonForm/CommonForm";
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

const rowConfig = [
  {
    label: "Product Name",
    field: "product",
    type: "autocomplete",
    options: productsList,
    getOptionLabel: (option) => option?.product_name || "",
  },
  {
    label: "Unit of Measure",
    field: "unit_of_measure",
    type: "text",
    disabled: true,
    transform: (value) => value?.unit_category || "",
  },
  {
    label: "Current Quantity",
    field: "available_product_quantity",
    type: "number",
    transform: (value) => value || "",
    // disabled: true,
  },

  {
    label: "Adjusted Quantity",
    field: "qty_received",
    type: "number",
  },
];

// Default form data structure
const defaultFormData = {
  adjustmentType: "Stock Level Update",
  id: extractRFQID("LAGIN0001"),
  date: formatDate(Date.now()),
  suppliersName: "",
  location: "xdx Stores",
  items: [],
  status: "draft",
  is_hidden: true,
};

const StockAdjustmentBasicInputs = ({ formData, handleInputChange }) => {
  return (
    <>
      <div className="stockbasicInformationInputs">
        <div className="formLabelAndValue">
          <label>ID</label>
          <p>{formData.id}</p>
        </div>
        <div className="formLabelAndValue">
          <label>Adjustment Type</label>
          <p>{formData?.adjustmentType}</p>
        </div>
        <div className="formLabelAndValue">
          <label>Date</label>
          <p>{formData.date}</p>
        </div>
        <div className="formLabelAndValue">
          <label>Location</label>
          <p>{formData?.location}</p>
        </div>
        <div className="supplierName">
          <label style={{ marginBottom: "6px", display: "block" }}>Notes</label>
          <TextField
            type="text"
            value={formData.suppliersName || ""}
            onChange={(e) => handleInputChange("notes", e.target.value)}
            sx={{ width: "100%" }}
            placeholder="Input your notes here"
          />
        </div>
      </div>
    </>
  );
};

const StockMovesForm = () => {
  const [formData, setFormData] = useState(defaultFormData);

  // Callback to process the final filled form data
  const handleSubmit = (filledFormData) => {
    console.log("Final Form Data", filledFormData);
  };
  return (
    <CommonForm
      basicInformationTitle="Product Information"
      basicInformationInputs={StockAdjustmentBasicInputs}
      formTitle="New Stock Adjustment"
      formData={formData}
      setFormData={setFormData}
      rowConfig={rowConfig}
      isEdit={false}
      onSubmit={handleSubmit}
      submitBtnText="Validate"
      autofillRow={["unit_of_measure", "available_product_quantity"]}
    />
  );
};

export default StockMovesForm;
