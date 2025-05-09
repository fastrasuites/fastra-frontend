// src/dash/PurchaseModule/PurchOrder/POForm/POForm.js
import React, { useEffect, useState, useCallback } from "react";
import "../../Rfq/RfqForm/RfqForm.css";
import autosave from "../../../../image/autosave.svg";
import { Button } from "@mui/material";
import Swal from "sweetalert2";
import { useHistory, useLocation } from "react-router-dom";
import { usePurchase } from "../../../../context/PurchaseContext";
import { usePurchaseOrder } from "../../../../context/PurchaseOrderContext.";
import { useTenant } from "../../../../context/TenantContext";
import POBasicInfoFields from "./POBasicInfoFields";
import POItemsTable from "./POItemsTable";
import { extractRFQID, normalizedRFQ } from "../../../../helper/helper";

const POForm = () => {
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

  const { createPurchaseOrder, updatePurchaseOrder } = usePurchaseOrder();
  const { state } = useLocation();
  const {
    po = {},
    edit = false,
    conversionRFQ = {},
  } = state || {};
  const formUse = edit ? "Edit Purchase Order" : "Create Purchase Order";
  const isEdit = formUse === "Edit Purchase Order";
  const history = useHistory();
  const { tenant_schema_name } = useTenant().tenantData || {};

  // 1. Default & initial form data
  const defaultForm = {
    vendor: null,
    currency: null,
    payment_terms: "",
    purchase_policy: "",
    delivery_terms: "",
    items: [],
    status: "draft",
    is_hidden: true,
  };

  const initial = conversionRFQ
    ? { ...defaultForm, ...conversionRFQ, status: "draft" }
    : isEdit
    ? { ...defaultForm, ...po }
    : defaultForm;

  const [formData, setFormData] = useState(initial);
  const [prIDList, setPrIDList] = useState([]);

  // 2. Fetch dependencies
  useEffect(() => {
    fetchVendors();
    fetchCurrencies();
    fetchProducts();
    fetchPurchaseRequests();
  }, [fetchVendors, fetchCurrencies, fetchProducts, fetchPurchaseRequests]);

  useEffect(() => {
    setPrIDList(normalizedRFQ(purchaseRequests));
  }, [purchaseRequests]);

  // 3. Handlers
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

  // 4. Prepare payload for API
  const cleanData = (status) => ({
    ...formData,
    status,
    vendor: formData.vendor?.url || formData.vendor,
    currency: formData.currency?.url || formData.currency,
    payment_terms: formData.payment_terms,
    purchase_policy: formData.purchase_policy,
    delivery_terms: formData.delivery_terms,
    items: formData.items.map((i) => ({
      product: i.product?.url || i.product,
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
    created_by: tenant_schema_name,
    purchase_request:
      formData.purchase_request?.url || formData.purchase_request,
  });

  // 5. Navigate to detail page after create/update
  const navigateToDetail = (id) => {
    setTimeout(() => {
      history.push(`/${tenant_schema_name}/purchase/purchase-order/${id}`);
    }, 1500);
  };

  // 6. Submit handlers
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = cleanData("draft");
    try {
      if (isEdit) {
        const id = extractRFQID(po.url);
        const res = await updatePurchaseOrder(payload, id);
        if (res.success)
          Swal.fire("Updated!", "Purchase Order updated.", "success");
        else Swal.fire("Error", res.message, "error");
        navigateToDetail(id);
      } else {
        const res = await createPurchaseOrder(payload);
        if (res.success) {
          Swal.fire("Created!", "Purchase Order saved as draft.", "success");
          navigateToDetail(extractRFQID(res.data.url));
        } else Swal.fire("Error", res.message, "error");
      }
      setFormData(defaultForm);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Unexpected error occurred.", "error");
    }
  };

  const saveAndSend = async () => {
    const payload = cleanData("awaiting");
    try {
      const res = await createPurchaseOrder(payload);
      if (res.success) {
        Swal.fire("Sent!", "Purchase Order created and sent.", "success");
        navigateToDetail(extractRFQID(res.data.url));
      } else Swal.fire("Error", res.message, "error");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Unexpected error occurred.", "error");
    }
  };

  const handleClose = () => {
    history.goBack();
  };

  // 7. Render
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
            <Button variant="text" onClick={handleClose}>
              Close
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
            purchaseIdList={prIDList}
            poID={po?.url}
          />

          <POItemsTable
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
              
                <Button variant="contained" onClick={saveAndSend}>
                  Save &amp; Send
                </Button>
              
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default POForm;
