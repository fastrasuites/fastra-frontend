import "../../Rfq/RfqForm/RfqForm.css";
import PurchaseHeader from "../../PurchaseHeader";
import autosave from "../../../../image/autosave.svg";

import React, { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { usePurchase } from "../../../../context/PurchaseContext";
// import RfqBasicInfoFields from "./RfqBasicInfoFields";
import { extractRFQID, normalizedRFQ } from "../../../../helper/helper";
import PRBasicInfoFields from "./PRBasicInfoFields";
import PRItemsTable from "./PRItemsTable";
import { toast } from "react-toastify";

const PRForm = ({ onCancel, formUse, quotation }) => {
  const {
    products,
    fetchProducts,
    vendors,
    currencies,
    fetchCurrencies,
    fetchVendors,
    fetchPurchaseRequests,
    purchaseRequests,
  } = usePurchase();

  const { createPurchaseRequest, updatePurchaseRequest } = usePurchase();
  const isEdit = formUse === "Edit Purchase Request";

  // For editing, we expect the quotation to include purpose instead of vendor_category
  const { purpose, currency, vendor, items, status, is_hidden, url } =
    quotation;

  const filteredQuotation = {
    purpose,
    currency,
    vendor,
    items,
    status,
    is_hidden,
  };

  const [formData, setFormData] = useState(
    isEdit
      ? filteredQuotation
      : {
          purpose: "",
          currency: "",
          vendor: "",
          items: [],
          status: "draft",
          is_hidden: true,
        }
  );

  const [prID, setPrID] = useState([]);

  // Fetch related data on mount
  useEffect(() => {
    fetchVendors();
    fetchCurrencies();
    fetchProducts();
    fetchPurchaseRequests();
  }, []);

  useEffect(() => {
    setPrID(normalizedRFQ(purchaseRequests));
  }, [purchaseRequests]);

  const handleInputChange = (field, value) => {
    console.log(field, value);
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleReload = () => {
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleRowChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    // Auto-update description and unit_of_measure when a product is selected
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

  const getCleanedFormData = (overrideStatus) => {
    return {
      status: overrideStatus || formData.status, // use provided status or current
      currency: formData.currency?.url || formData.currency,
      purpose: formData.purpose,
      vendor: formData.vendor?.url || formData.vendor,
      items: Array.isArray(formData.items)
        ? formData.items.map((item) => ({
            product: item.product?.url || item.product,
            description: item.description,
            qty: Number(item.qty) || 0,
            unit_of_measure:
              item.unit_of_measure?.url ||
              (Array.isArray(item.unit_of_measure)
                ? item.unit_of_measure[0]
                : item.unit_of_measure),
            estimated_unit_price: item.estimated_unit_price,
          }))
        : [],
      is_hidden: formData.is_hidden,
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Save as draft (status: "draft")
    const cleanedFormData = getCleanedFormData("draft");
    if (isEdit) {
      const id = extractRFQID(url);
      updatePurchaseRequest(id, cleanedFormData)
        .then((data) => {
          console.log("Updated RFQ:", data);
          if (data.success === true) {
            alert("Purchase Request updated successfully");
          }
        })
        .catch((err) => console.error("Error updating RFQ:", err));
    } else {
      createPurchaseRequest(cleanedFormData).then((data) => {
        console.log("Created RFQ Draft:", data);
        toast.success("Purchase Request created successfully");
        if (data.success === true) {
          alert("Purchase Request created successfully");
          setFormData({
            purpose: "",
            currency: "",
            vendor: "",
            items: [],
            status: "draft",
            is_hidden: true,
          });

          fetchPurchaseRequests();
        }
      });
    }
  };

  const saveAndSubmit = () => {
    // For "Save & Share" we might want to update the status if required.
    // Here we assume sharing sets the status to "pending".
    const cleanedFormData = getCleanedFormData("pending");
    console.log("Save & Share RFQ:", cleanedFormData);
    createPurchaseRequest(cleanedFormData).then((data) => {
      console.log("Created and Shared RFQ:", data);
      if (data.success === true) {
        alert("Purchase Request created and shared successfully");
        setFormData({
          purpose: "",
          currency: "",
          vendor: "",
          items: [],
          status: "draft",
          is_hidden: true,
        });
      }
    });
  };

  return (
    <div className="RfqForm">
      {isEdit && <PurchaseHeader />}
      <div className="rfqAutoSave">
        <p className="raprhed">
          {isEdit ? "Edit Purchase Request" : "Create Purchase Request"}
        </p>
        <div className="rfqauto">
          <p>Autosaved</p>
          <img src={autosave} alt="Autosaved" />
        </div>
      </div>
      <div className="rfqFormSection">
        <div className="rfqBasicInfo">
          <h2>Basic Information</h2>
          <div className="editCancel">
            <Button variant="text" onClick={handleReload}>
              Cancel
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rfqformEditAndCreate">
          <PRBasicInfoFields
            formData={formData}
            handleInputChange={handleInputChange}
            formUse={formUse}
            currencies={currencies}
            vendors={vendors}
            purchaseIdList={prID}
            rfqID={url}
          />

          <PRItemsTable
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
            <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
              <Button variant="outlined" type="submit">
                {/* {isEdit ? "Save Changes" : "Create RFQ Draft"} */}
                {isEdit ? "Save Changes" : "Save"}
              </Button>

              <Button variant="contained" onClick={saveAndSubmit}>
                Save & Send
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PRForm;
