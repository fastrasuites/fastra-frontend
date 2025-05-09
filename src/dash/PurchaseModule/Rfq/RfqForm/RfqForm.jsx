// src/dash/PurchaseModule/Rfq/RfqForm.js
import "./RfqForm.css";
import PurchaseHeader from "../../PurchaseHeader";
import autosave from "../../../../image/autosave.svg";
import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@mui/material";
import Swal from "sweetalert2";
import { usePurchase } from "../../../../context/PurchaseContext";
import RfqBasicInfoFields from "./RfqBasicInfoFields";
import RfqItemsTable from "./RfqItemsTable";
import { useRFQ } from "../../../../context/RequestForQuotation";
import { extractRFQID, normalizedRFQ } from "../../../../helper/helper";
import { useHistory, useLocation } from "react-router-dom";
import { useTenant } from "../../../../context/TenantContext";

const RfqForm = () => {
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
  const { state } = useLocation();
  console.log(state)
  const {rfq={}, edit=false} = state || {};
  const formUse = edit ? "Edit RFQ" : "Create RFQ";
  const quotation = rfq || {};
  const  conversionRFQ = rfq || {};

  const isEdit = formUse === "Edit RFQ";
  const { tenant_schema_name } = useTenant().tenantData || {};

  // Default and initial form data
  const defaultForm = {
    purchase_request: "",
    expiry_date: "",
    currency: "",
    vendor: "",
    vendor_category: "",
    items: [],
    status: "draft",
    is_hidden: true,
  };

  const initial =  conversionRFQ
  ? {
      ...defaultForm,
      ...conversionRFQ,
    }
  : isEdit
    ? { ...defaultForm, ...quotation }
    : defaultForm;

  const [formData, setFormData] = useState(initial);
  const [prIDList, setPrIDList] = useState([]);
  const history = useHistory();

  // Fetch dependencies
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

  useEffect(() => {
    setPrIDList(normalizedRFQ(purchaseRequests));
  }, [purchaseRequests]);


  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleRowChange = useCallback((idx, field, value) => {
    setFormData((prev) => {
      const items = [...prev.items];
      items[idx] = { ...items[idx], [field]: value };
      if (field === "product" && value?.product_description) {
        items[idx].description = value.product_description;
        items[idx].unit_of_measure = value.unit_of_measure;
      }
      return { ...prev, items };
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

  const cleanData = (status) => ({
    ...formData,
    status,
    vendor: formData.vendor?.url || formData.vendor,
    currency: formData.currency?.url || formData.currency,
    purchase_request:
      formData.purchase_request?.url || formData.purchase_request,
    items: formData.items.map((i) => ({
      product: i.product?.url || i.product || "",
      description: i.description,
      qty: Number(i.qty) || 0,
      unit_of_measure:
        i.unit_of_measure?.url ||
        (Array.isArray(i.unit_of_measure)
          ? i.unit_of_measure[0]
          : i.unit_of_measure),
      estimated_unit_price: i.estimated_unit_price,
    })),
    is_hidden: false,
  });

  const navigateToDetail = (id) => {
    setTimeout(() => {
      history.push(`/${tenant_schema_name}/purchase/request-for-quotations/${id}`);
    }, 1500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = cleanData("draft");
    try {
      if (isEdit) {
        const id = extractRFQID(quotation.url);
        const res = await updateRFQ(payload, id);
        console.log(res);

        if (res.success) Swal.fire("Updated!", "RFQ updated.", "success");
        else Swal.fire("Error", res.message, "error");
        navigateToDetail(id);
      } else {
        const res = await createRFQ(payload);
        if (res.success) {
          Swal.fire("Created!", "RFQ saved as draft.", "success");
          navigateToDetail(extractRFQID(res.data.url));
        } else Swal.fire("Error", res.message, "error");
      }
      setFormData(defaultForm);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Unexpected error occurred.", "error");
    }
  };

  // const saveAndSubmit = async () => {
  //   try {
  //     const cleanedData = cleanFormData("pending");
  //     await createRFQ(cleanedData);
  //     toast.success("RFQ created successfully", {
  //       position: "top-right",
  //       autoClose: 5000,
  //       transition: Bounce,
  //       toastId: "rfq-save-share",
  //     });
  //     setFormData(defaultFormData);
  //     if (conversionRFQ) {
  //       history.push(`/${tenant_schema_name}/rfq`);
  //     }
  //   } catch (error) {
  //     console.error("Error saving and submitting RFQ:", error);
  //     toast.error(`Error saving and submitting RFQ: ${error.message}`, {
  //       position: "top-right",
  //       autoClose: 5000,
  //       transition: Bounce,
  //       toastId: "rfq-save-share-error",
  //     });
  //   }
  // };
// console.log((formData, "formData"));
  const saveAndShare = async () => {
    const payload = cleanData("pending");
    try {
      const res = await createRFQ(payload);
      if (res.success) {
        Swal.fire("Shared!", "RFQ created and shared.", "success");
        navigateToDetail(extractRFQID(res.data.url));
      } else Swal.fire("Error", res.message, "error");
      // setFormData(defaultForm);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Unexpected error on share.", "error");
    }
  };

  console.log(formUse);

  return (
    <div className="RfqForm">
      <div className="rfqAutoSave">
        <p className="raprhed">{formUse}</p>
        <div className="rfqauto">
          <p>Autosaved</p>
          <img src={autosave} alt="Autosaved" />
        </div>
      </div>
      <div className="rfqFormSection">
        <div className="rfqBasicInfo">
          <h2>Basic Information</h2>
          <div className="editCancel">
            <Button variant="text" onClick={() => window.history.back()}>
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
            purchaseIdList={prIDList}
            rfqID={quotation?.url}
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
            <Button variant="outlined" onClick={handleAddRow}>
              Add Item
            </Button>
            <div style={{ display: "flex", gap: 16 }}>
              <Button variant="outlined" type="submit">
                {isEdit ? "Save Changes" : "Save Draft"}
              </Button>
              {!isEdit && (
                <Button variant="contained" onClick={saveAndShare}>
                  Save & Send
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RfqForm;
