import "../../Rfq/RfqForm/RfqForm.css";
import PurchaseHeader from "../../PurchaseHeader";
import autosave from "../../../../image/autosave.svg";

import React, { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { usePurchase } from "../../../../context/PurchaseContext";
import RfqItemsTable from "./POItemsTable";
import { useRFQ } from "../../../../context/RequestForQuotation";
import { extractRFQID, normalizedRFQ } from "../../../../helper/helper";
import POBasicInfoFields from "./POBasicInfoFields";
import { useTenant } from "../../../../context/TenantContext";
import { usePurchaseOrder } from "../../../../context/PurchaseOrderContext.";

const POForm = ({ onCancel, formUse, purchaseOrder }) => {
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

  const { createPurchaseOrder, updateRFQ } = usePurchaseOrder();
  const isEdit = formUse === "Edit RFQ";
  const tenant_schema_name = useTenant().tenantData?.tenant_schema_name;

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
    url,
  } = purchaseOrder;

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
          status: "draft",
          vendor: {},
          currency: "",
          payment_terms: "",
          purchase_policy: "",
          delivery_terms: "",
          created_by: "",
          items: [],
          is_hidden: true,
        }
  );

  const [prID, setPrID] = useState([]);

  // Fetch related data
  useEffect(() => {
    fetchVendors();
    fetchCurrencies();
    fetchProducts();
    fetchPurchaseRequests();
  }, []);

  useEffect(() => {
    setPrID(normalizedRFQ(purchaseRequests));
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRowChange = (index, field, value) => {
    console.log(value, "value");
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
      vendor: formData.vendor.url || formData.vendor,
      payment_terms: formData?.payment_terms,
      purchase_policy: formData?.purchase_policy,
      delivery_terms: formData?.delivery_terms,
      currency: formData?.currency?.url || formData?.currency,
      created_by: tenant_schema_name,
      status: "draft",
      items: Array.isArray(formData.items)
        ? formData.items.map((item) => ({
            product: item.product.url,
            description: item.description,
            qty: Number(item.qty) || 0,
            unit_of_measure:
              item.unit_of_measure.url || item.unit_of_measure[0],
            estimated_unit_price: item.estimated_unit_price,
          }))
        : [],
      is_hidden: false,
    };
    if (isEdit) {
      const id = extractRFQID(url);
      console.log("Updating RFQ:", cleanedFormData);
      updateRFQ(cleanedFormData, id).then((data) => {
        console.log(data);
      });
    } else {
      console.log("Creating new RFQ:", cleanedFormData);
      createPurchaseOrder(cleanedFormData).then((data) => {
        if (data.success === true) {
          setFormData({
            purchase_request: "",
            expiry_date: "",
            currency: "",
            vendor: "",
            vendor_category: "",
            items: [],
            status: "draft",
            is_hidden: true,
          });
        }
      });

      // API call or further logic for creating a new RFQ
    }
  };

  const saveAndSubmit = () => {
    const cleanedFormData = {
      expiry_date: formData.expiry_date || "",
      vendor: formData.vendor.url || formData.vendor,
      vendor_category: formData.vendor_category || "",
      purchase_request: formData.purchase_request || "",
      currency: formData?.currency?.url || formData?.currency,
      status: "pending",
      items: Array.isArray(formData.items)
        ? formData.items.map((item) => ({
            product: item.product.url,
            description: item.description,
            qty: Number(item.qty) || 0,
            unit_of_measure:
              item.unit_of_measure.url || item.unit_of_measure[0],
            estimated_unit_price: item.estimated_unit_price,
          }))
        : [],
      is_hidden: false,
    };

    createRFQ(cleanedFormData).then((data) => {
      if (data.success === true) {
        setFormData({
          purchase_request: "",
          expiry_date: "",
          currency: "",
          vendor: "",
          vendor_category: "",
          items: [],
          status: "draft",
          is_hidden: true,
        });
      }
    });
  };

  return (
    <div className="RfqForm">
      <PurchaseHeader />
      <div className="rfqAutoSave">
        <p className="raprhed">
          {isEdit ? "Edit Purchase Order" : "Create Purchase Order"}
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
            <Button variant="text" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rfqformEditAndCreate">
          <POBasicInfoFields
            formData={formData}
            handleInputChange={handleInputChange}
            formUse={formUse}
            currencies={currencies}
            vendors={vendors}
            purchaseIdList={prID}
            rfqID={url}
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
                {isEdit ? "Save Changes" : "Create RFQ Draft"}
              </Button>
              {!isEdit && (
                <Button
                  variant="contained"
                  onClick={() => {
                    saveAndSubmit(formData);
                  }}
                >
                  Save & Share
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default POForm;
