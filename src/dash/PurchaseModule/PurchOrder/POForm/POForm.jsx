// src/dash/PurchaseModule/PurchOrder/POForm/POForm.js
import React, { useEffect, useState } from "react";
import { Box, Button } from "@mui/material";
import { useHistory } from "react-router-dom";
import autosave from "../../../../image/autosave.svg";
import RfqItemsTable from "./POItemsTable"; // Ensure this path is correct
import POBasicInfoFields from "./POBasicInfoFields"; // Ensure this path is correct
import { useTenant } from "../../../../context/TenantContext";
import { usePurchase } from "../../../../context/PurchaseContext";
import { usePurchaseOrder } from "../../../../context/PurchaseOrderContext.";
import { Bounce, toast } from "react-toastify";
import { extractRFQID } from "../../../../helper/helper";
import "../../Rfq/RfqForm/RfqForm.css";
import PurchaseHeader from "../../PurchaseHeader";

const POForm = ({ onCancel, formUse, purchaseOrder, refresh, conversionRFQ }) => {
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
  const isEdit = formUse === "Edit RFQ";
  const tenant_schema_name = useTenant().tenantData?.tenant_schema_name;
  const history = useHistory();

  // Default form data depends on whether we're converting from an RFQ
  const defaultFormData = conversionRFQ
    ? {
        status: "draft",
        vendor: conversionRFQ.vendor || null,
        currency: conversionRFQ.currency || null,
        payment_terms: conversionRFQ.payment_terms || "",
        purchase_policy: conversionRFQ.purchase_policy || "",
        delivery_terms: conversionRFQ.delivery_terms || "",
        items: conversionRFQ.items || [],
        is_hidden: true,
      }
    : {
        status: "draft",
        vendor: null,
        currency: null,
        payment_terms: "",
        purchase_policy: "",
        delivery_terms: "",
        items: [],
        is_hidden: true,
      };

  const [formData, setFormData] = useState(defaultFormData);
  const [, setPrID] = useState([]);

  // Fetch necessary data when the component mounts
  useEffect(() => {
    const initializeFormData = async () => {
      await Promise.all([
        fetchVendors(),
        fetchCurrencies(),
        fetchProducts(),
        fetchPurchaseRequests(),
      ]);

      if (isEdit && purchaseOrder) {
        setFormData({
          ...purchaseOrder,
          vendor: vendors.find((v) => v.url === purchaseOrder.vendor.url),
          currency: currencies.find((c) => c.url === purchaseOrder.currency.url),
          items: purchaseOrder.items.map((item) => ({
            ...item,
            product: products.find((p) => p.url === item.product.url),
            unit_of_measure: item.unit_of_measure,
          })),
        });
      }
    };

    initializeFormData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setPrID(purchaseRequests.map((pr) => extractRFQID(pr.url)));
  }, [purchaseRequests]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRowChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };

    if (field === "product" && value?.product_description) {
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

  const cleanFormData = (status = null) => ({
    vendor: formData.vendor?.url || formData.vendor,
    payment_terms: formData.payment_terms,
    purchase_policy: formData.purchase_policy,
    delivery_terms: formData.delivery_terms,
    currency: formData.currency?.url || formData.currency,
    status: status ? status : formData.status,
    created_by: tenant_schema_name,
    items: formData.items.map((item) => ({
      product: item.product?.url || item.product,
      description: item.description,
      qty: Number(item.qty) || 0,
      unit_of_measure: Array.isArray(item.unit_of_measure)
        ? item.unit_of_measure[0]
        : item.unit_of_measure.url,
      estimated_unit_price: item.estimated_unit_price,
    })),
    is_hidden: false,
  });

  // Custom cancel handler:
  const handleCancel = () => {
    if (conversionRFQ) {
      // Navigate back to the conversion page (or a specific route if needed)
      history.goBack();
    } else {
      onCancel();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanedData = cleanFormData();

    try {
      if (isEdit) {
        const id = extractRFQID(purchaseOrder.url);
        const updatedPO = await updatePurchaseOrder(cleanedData, id);
        if (updatedPO) {
          toast.success("Purchase Order updated successfully", {
            position: "top-right",
            transition: Bounce,
          });
        }
      } else {
        const createdPO = await createPurchaseOrder(cleanedData);
        if (createdPO) {
          toast.success("Purchase Order created successfully", {
            position: "top-right",
            transition: Bounce,
          });
          // In conversion mode, redirect to the PO dashboard after successful submission
          if (conversionRFQ) {
            history.push(`/${tenant_schema_name}/purchase-order`);
          }
        }
        setFormData(defaultFormData);
      }
      // If not converting, use the provided onCancel function
      if (!conversionRFQ) {
        onCancel();
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      refresh();
    }
  };

  const saveAndSubmit = async () => {
    try {
      const cleanedData = cleanFormData("awaiting");
      await createPurchaseOrder(cleanedData);
      toast.success("Purchase Order created successfully", {
        position: "top-right",
        transition: Bounce,
      });
      // Redirect to PO dashboard if in conversion mode
      if (conversionRFQ) {
        history.push(`/${tenant_schema_name}/purchase-order`);
      } else {
        onCancel();
      }
      refresh();
    } catch (error) {
      toast.error(`Error saving and submitting PO: ${error.message}`);
    }
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
            <Button variant="text" onClick={handleCancel}>
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
            purchaseOrder={purchaseOrder}
            rfqID={purchaseOrder?.url}
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
                {isEdit ? "Save Changes" : "Save Draft"}
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

export default POForm;
