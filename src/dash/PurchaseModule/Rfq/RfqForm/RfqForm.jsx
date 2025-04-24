// src/dash/PurchaseModule/Rfq/RfqForm.js
import "./RfqForm.css";
import PurchaseHeader from "../../PurchaseHeader";
import autosave from "../../../../image/autosave.svg";
import React, { useEffect, useState, useCallback } from "react";
import { Box, Button } from "@mui/material";
import { toast, Bounce } from "react-toastify";
import { usePurchase } from "../../../../context/PurchaseContext";
import RfqBasicInfoFields from "./RfqBasicInfoFields";
import RfqItemsTable from "./RfqItemsTable";
import { useRFQ } from "../../../../context/RequestForQuotation";
import { extractRFQID, normalizedRFQ } from "../../../../helper/helper";
import { useHistory } from "react-router-dom";
import { useTenant } from "../../../../context/TenantContext";

const RfqForm = ({
  onCancel,
  formUse,
  quotation,
  triggerRefresh,
  conversionRFQ,
}) => {
  const {
    products,
    fetchProducts,
    vendors,
    currencies,
    fetchCurrencies,
    fetchVendors,
    fetchApprovedPurchaseRequests,
    purchaseRequests,
  } = usePurchase();

  const { createRFQ, updateRFQ } = useRFQ();
  const isEdit = formUse === "Edit RFQ";
  const tenant_schema_name = useTenant().tenantData?.tenant_schema_name;

  // Default form data for a new RFQ
  const defaultFormData = {
    purchase_request: "",
    expiry_date: "",
    currency: "",
    vendor: "",
    vendor_category: "",
    items: [],
    status: "draft",
    is_hidden: true,
  };

  // If converting from another source, use the conversion data;
  // otherwise, if editing an existing RFQ, use that quotation data;
  // if neither, use default form data.
  const initialData = conversionRFQ
    ? {
        purchase_request: conversionRFQ?.url || "",
        expiry_date: conversionRFQ.expiry_date || "",
        currency: conversionRFQ.currency || "",
        vendor: conversionRFQ.vendor || "",
        vendor_category: conversionRFQ.vendor_category || "",
        items: conversionRFQ.items || [],
        status: conversionRFQ.status || "draft",
        is_hidden: conversionRFQ.is_hidden || true,
      }
    : isEdit && quotation
    ? {
        purchase_request: quotation.purchase_request,
        expiry_date: quotation.expiry_date,
        currency: quotation.currency,
        vendor: quotation.vendor,
        vendor_category: quotation.vendor_category,
        items: quotation.items,
        status: quotation.status,
        is_hidden: quotation.is_hidden,
      }
    : defaultFormData;

  const [formData, setFormData] = useState(initialData);
  const [prID, setPrID] = useState([]);

  const history = useHistory();

  // Fetch vendors, currencies, products and purchase requests on mount
  useEffect(() => {
    fetchVendors();
    fetchCurrencies();
    fetchProducts();
    fetchApprovedPurchaseRequests();
  }, [
    fetchVendors,
    fetchCurrencies,
    fetchProducts,
    fetchApprovedPurchaseRequests,
  ]);

  // Update purchase request IDs when purchaseRequests changes
  useEffect(() => {
    if (purchaseRequests?.length) {
      setPrID(normalizedRFQ(purchaseRequests));
    }
  }, [purchaseRequests]);

  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleRowChange = useCallback((index, field, value) => {
    setFormData((prev) => {
      const updatedItems = [...prev.items];
      updatedItems[index] = { ...updatedItems[index], [field]: value };

      // Auto-update description and unit of measure when a product is selected
      if (field === "product" && value?.product_description) {
        updatedItems[index].description = value.product_description;
        updatedItems[index].unit_of_measure = value.unit_of_measure;
      }
      return { ...prev, items: updatedItems };
    });
  }, []);

  const handleAddRow = useCallback(() => {
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
  }, []);

  console.log(formData, "formData");

  // Helper to clean form data based on a given status
  const cleanFormData = (status = "draft") => ({
    expiry_date: formData.expiry_date || "",
    vendor: formData.vendor?.url || formData.vendor,
    vendor_category: formData.vendor_category || "",
    purchase_request:
      formData.purchase_request?.url || formData.purchase_request || "",
    currency: formData.currency?.url || formData.currency,
    status,
    items: Array.isArray(formData.items)
      ? formData.items.map((item) => ({
          product: item.product?.url || "",
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
    is_hidden: false,
  });

  // Custom cancel handler: if converting, go back; otherwise, call onCancel
  const handleCancel = () => {
    if (conversionRFQ) {
      history.goBack();
    } else {
      onCancel();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const cleanedData = cleanFormData("draft");

      if (isEdit) {
        const id = extractRFQID(quotation.url);
        await updateRFQ(cleanedData, id);
        toast.success("RFQ updated successfully", {
          position: "top-right",
          autoClose: 5000,
          transition: Bounce,
          toastId: "rfq-update",
        });
      } else {
        console.log("Cleaned RFQ Data:", cleanedData);

        const result = await createRFQ(cleanedData);
        if (result.success) {
          toast.success("RFQ created successfully", {
            position: "top-right",
            autoClose: 5000,
            transition: Bounce,
            toastId: "rfq-create",
          });
          // If in conversion mode, redirect to the RFQ dashboard after successful submission
          if (conversionRFQ) {
            history.push(`/${tenant_schema_name}/rfq`);
          }
        }
      }
      setFormData(defaultFormData);
      if (!conversionRFQ) {
        onCancel();
      }
    } catch (error) {
      console.error("Error submitting RFQ:", error);
      toast.error(`Error submitting RFQ: ${error.message}`, {
        position: "top-right",
        autoClose: 5000,
        transition: Bounce,
        toastId: "rfq-error",
      });
    } finally {
      triggerRefresh();
    }
  };

  const saveAndSubmit = async () => {
    try {
      const cleanedData = cleanFormData("pending");
      await createRFQ(cleanedData);
      toast.success("RFQ created successfully", {
        position: "top-right",
        autoClose: 5000,
        transition: Bounce,
        toastId: "rfq-save-share",
      });
      setFormData(defaultFormData);
      if (conversionRFQ) {
        history.push(`/${tenant_schema_name}/rfq`);
      } else {
        onCancel();
      }
    } catch (error) {
      console.error("Error saving and submitting RFQ:", error);
      toast.error(`Error saving and submitting RFQ: ${error.message}`, {
        position: "top-right",
        autoClose: 5000,
        transition: Bounce,
        toastId: "rfq-save-share-error",
      });
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
            <Button variant="text" onClick={handleCancel}>
              Close
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
            rfqID={quotation?.url}
          />
          <RfqItemsTable
            items={formData.items}
            handleRowChange={handleRowChange}
            products={products}
          />
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Button variant="outlined" onClick={handleAddRow}>
              Add Item
            </Button>
            <Box sx={{ display: "flex", gap: "10px" }}>
              <Button variant="outlined" type="submit">
                {isEdit ? "Save Changes" : "Create RFQ Draft"}
              </Button>
              {!isEdit && (
                <Button variant="contained" onClick={saveAndSubmit}>
                  Save &amp; Share
                </Button>
              )}
            </Box>
          </Box>
        </form>
      </div>
    </div>
  );
};

export default RfqForm;
