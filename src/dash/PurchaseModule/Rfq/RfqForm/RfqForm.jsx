import "./RfqForm.css";
import PurchaseHeader from "../../PurchaseHeader";
import autosave from "../../../../image/autosave.svg";

import React, { useEffect, useState } from "react";
import {
  Autocomplete,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import CustomAutocomplete from "../../../../components/ui/CustomAutocomplete";
import { usePurchase } from "../../../../context/PurchaseContext";
import RfqBasicInfoFields from "./RfqBasicInfoFields";
import RfqItemsTable from "./RfqItemsTable";
import { useRFQ } from "../../../../context/RequestForQuotation";

const RfqForm = ({ onCancel, formUse, quotation, prID }) => {
  const {
    products,
    fetchProducts,
    vendors,
    currencies,
    fetchCurrencies,
    fetchVendors,
  } = usePurchase();

  const {
    createRFQ
  } = useRFQ();
  const isEdit = formUse === "Edit RFQ";


  // Initialize form state with existing quotation (edit) or default values (create)
  const {
    purchase_request,
    expiry_date,
    currency,
    vendor,
    vendor_category,
    items,
    status,
    is_hidden,
  } = quotation;
  const filteredQuotation = {
    purchase_request,
    expiry_date,
    currency,
    vendor,
    vendor_category,
    items,
    status,
    is_hidden,
  };
  const [formData, setFormData] = useState(
    isEdit
      ? filteredQuotation
      : {
          purchase_request: "",
          expiry_date: "",
          currency: "",
          vendor: "",
          vendor_category: "",
          items: [],
          status: "draft",
          is_hidden: true,
        }
  );

  // Fetch related data
  useEffect(() => {
    fetchVendors();
    fetchCurrencies();
    fetchProducts();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRowChange = (index, field, value) => {
    // console.log(value, "value")
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    // Auto-update description when a product is selected
    if (field === "product" && value && value.product_description) {
      updatedItems[index].description = value.product_description;
      updatedItems[index].unit_of_measure = value.unit_of_measure;
    }
    setFormData((prev) => ({ ...prev, items: updatedItems }));
  };

  const handleAddRow = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: `new-${prev.items.length + 1}`,
          product: null,
          description: "",
          qty: "",
          unit_of_measure: "",
          estimated_unit_price: "",
        },
      ],
    }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanedFormData = {
      expiry_date: formData.expiry_date || "",
      vendor: formData.vendor || "",
      vendor_category: formData.vendor_category || "",
      purchase_request: formData.purchase_request || "",
      currency: formData.currency || "",
      status: "draft",
      items: Array.isArray(formData.items)
        ? formData.items.map((item) => ({
            product: item.product.url,
            description: item.description,
            qty: Number(item.qty) || 0,
            unit_of_measure: item.unit_of_measure[0],
            estimated_unit_price: item.estimated_unit_price,
          }))
        : [],
      is_hidden:
        typeof formData.is_hidden === "boolean" ? formData.is_hidden : true,
    };
    if (isEdit) {
      console.log("Updating RFQ:", formData);
      // API call or further update logic for editing
    } else {
      // console.log("Creating new RFQ:", cleanedFormData);
     createRFQ(cleanedFormData).then((data) => {
      if(data.success === true) {
        setFormData({
          purchase_request: "",
          expiry_date: "",
          currency: "",
          vendor: "",
          vendor_category: "",
          items: [],
          status: "draft",
          is_hidden: true,
        })
      }
     })
      
      // API call or further logic for creating a new RFQ
    }
  };

  return (
    <div className="RfqForm">
      <PurchaseHeader />
      <div className="rfqAutoSave">
        <p className="raprhed">{isEdit ? "Edit RFQ" : "Create RFQ"}</p>
        <div className="rfqauto">
          <p>Autosaved</p>
          <img src={autosave} alt="Autosaved" />
        </div>
      </div>
      <div className="rfqFormSection">
        <div className="rfqBasicInfo">
          <h2>Basic Information</h2>
          <div className="editCancel">
            <Button variant="text" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rfqformEditAndCreate">
          <RfqBasicInfoFields
            formData={formData}
            handleInputChange={handleInputChange}
            formUse={formUse}
            currencies={currencies}
            vendors={vendors}
            purchaseIdList={prID}
          />


          <RfqItemsTable
            items={formData.items}
            handleRowChange={handleRowChange}
            products={products}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ marginTop: "1rem" }}>
              <Button variant="outlined" onClick={handleAddRow}>
                Add Item
              </Button>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "20px",
              }}
            >
              <Button variant="outlined" type="submit">
                {isEdit ? "Save Changes" : "Create RFQ"}
              </Button>
              <Button variant="contained">Share</Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RfqForm;
