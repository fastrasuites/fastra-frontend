import React, { useState, useEffect } from "react";
import { Autocomplete, TextField } from "@mui/material";
import { extractRFQID, formatDate } from "../../../../../helper/helper";
import CommonForm from "../../../../../components/CommonForm/CommonForm";
import "./ScrapForm.css";

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
  },
  {
    label: "Adjusted Quantity",
    field: "qty_received",
    type: "number",
  },
];

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

// Default form data structure
const defaultFormData = {
  receiptTypes: null,
  id: extractRFQID("LAGIN0001"),
  date: formatDate(Date.now()),
  location: "xdx Stores",
  items: [],
  status: "draft",
  is_hidden: true,
  notes: "",
};

const ScrapBasicInputs = ({ formData, handleInputChange }) => {
  const [selectedReceipt, setSelectedReceipt] = useState(formData.receiptTypes || null);

  useEffect(() => {
    setSelectedReceipt(formData.receiptTypes || null);
  }, [formData.receiptTypes]);

  const handleReceiptChange = (event, newValue) => {
    setSelectedReceipt(newValue);
    handleInputChange("receiptTypes", newValue);
  };


  console.log(formData, "formData");
  return (
    <>
      <div className="scrapBasicInformationInputs">
        <div className="scrapFormLabelAndValue">
          <label>ID</label>
          <p>{formData.id}</p>
        </div>
        <div className="">
          <label style={{ marginBottom: "6px", display: "block" }}>
            Receipt Type
          </label>
          <Autocomplete
            disablePortal
            options={receiptTypes}
            value={selectedReceipt}
            getOptionLabel={(option) => option?.receiptType || ""}
            isOptionEqualToValue={(option, value) =>
              option?.receiptType === value?.receiptType
            }
            onChange={handleReceiptChange}
            sx={{ width: "100%", mb: 2 }}
            renderInput={(params) => (
              <TextField {...params} placeholder="Receipt Type" />
            )}
          />
        </div>
        <div className="formLabelAndValue">
          <label>Date</label>
          <p>{formData.date}</p>
        </div>
        <div className="formLabelAndValue">
          <label>Warehouse Location</label>
          <p>{formData.location}</p>
        </div>
      </div>
      <div className="scrapNotes">
        <label style={{ marginBottom: "6px", display: "block" }}>Notes</label>
        <TextField
          type="text"
          value={formData.notes || ""}
          onChange={(e) => handleInputChange("notes", e.target.value)}
          sx={{ width: "100%" }}
          placeholder="Input your notes here"
        />
      </div>
    </>
  );
};

const ScrapForm = () => {
  const [formData, setFormData] = useState(defaultFormData);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (filledFormData) => {
    console.log("Final Form Data", filledFormData);
  };

  return (
    <CommonForm
      basicInformationTitle="Product Information"
      basicInformationInputs={(props) => (
        <ScrapBasicInputs {...props} handleInputChange={handleInputChange} />
      )}
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

export default ScrapForm;
