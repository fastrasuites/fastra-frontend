import "../../Rfq/RfqForm/RfqForm.css";
import PurchaseHeader from "../../PurchaseHeader";
import autosave from "../../../../image/autosave.svg";

import React, { useEffect, useState } from "react";
import { Button } from "@mui/material";
import Swal from "sweetalert2";
import { usePurchase } from "../../../../context/PurchaseContext";
import { extractRFQID, normalizedRFQ } from "../../../../helper/helper";
import PRBasicInfoFields from "./PRBasicInfoFields";
import PRItemsTable from "./PRItemsTable";
import { useHistory, useLocation } from "react-router-dom";
import { useTenant } from "../../../../context/TenantContext";

const CreatePRForm = ({ formUse, quotation = {} }) => {
  const {
    products,
    fetchProducts,
    vendors,
    currencies,
    fetchCurrencies,
    fetchVendors,
    fetchPurchaseRequests,
    purchaseRequests,
    createPurchaseRequest,
    updatePurchaseRequest,
  } = usePurchase();
  const {tenantData} = useTenant();
  const {tenant_schema_name: tenantSchemaName} = tenantData;
  const history = useHistory();
  const location = useLocation();
  const { pr = {}, edit = false } = location.state || {};
  let isEdit =
    edit === true ? "Edit Purchase Request" : "Create Purchase Request";
  const {
    purpose = "",
    currency = "",
    vendor = "",
    items = [],
    status = "draft",
    is_hidden = true,
    url,
  } = pr;

  const [formData, setFormData] = useState({
    purpose,
    currency,
    vendor,
    items,
    status,
    is_hidden,
  });
  const [prID, setPrID] = useState([]);

  useEffect(() => {
    fetchVendors();
    fetchCurrencies();
    fetchProducts();
    fetchPurchaseRequests();
  }, []);

  useEffect(() => {
    setPrID(normalizedRFQ(purchaseRequests));
  }, [purchaseRequests]);

  const handleInputChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleRowChange = (idx, field, value) => {
    const updated = [...formData.items];
    updated[idx] = { ...updated[idx], [field]: value };
    if (field === "product" && value?.product_description) {
      updated[idx].description = value.product_description;
      updated[idx].unit_of_measure = value.unit_of_measure;
    }
    setFormData((prev) => ({ ...prev, items: updated }));
  };

  const handleAddRow = () =>
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

  const handleSuccessfulNavigation = (id) => {
    setTimeout(() => {
      history.push(`/${tenantSchemaName}/purchase/purchase-request/${id}`);
    }, 2000);
  };

  const getCleanedFormData = (overrideStatus) => ({
    status: overrideStatus || formData.status,
    currency: formData.currency?.url || formData.currency,
    purpose: formData.purpose,
    vendor: formData.vendor?.url || formData.vendor,
    items: formData.items.map((item) => ({
      product: item.product?.url || item.product,
      description: item.description,
      qty: Number(item.qty) || 0,
      unit_of_measure:
        item.unit_of_measure?.url ||
        (Array.isArray(item.unit_of_measure)
          ? item.unit_of_measure[0]
          : item.unit_of_measure),
      estimated_unit_price: item.estimated_unit_price,
    })),
    is_hidden: formData.is_hidden,
  });

  const resetForm = () =>
    setFormData({
      purpose: "",
      currency: "",
      vendor: "",
      items: [],
      status: "draft",
      is_hidden: true,
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = getCleanedFormData("draft");
    try {
      if (edit) {
        const id = extractRFQID(url);
        const res = await updatePurchaseRequest(id, payload);
        if (res.success) {
          Swal.fire({
            title: "Updated!",
            text: "Purchase Request updated successfully.",
            icon: "success",
          });
          handleSuccessfulNavigation(id);
        } else {
          Swal.fire({
            title: "Update Failed",
            text: res.message || "Could not update the Purchase Request.",
            icon: "error",
          });
        }
      } else {
        const res = await createPurchaseRequest(payload);
        if (res.success) {
          Swal.fire({
            title: "Created!",
            text: "Purchase Request saved as draft successfully.",
            icon: "success",
          });
          resetForm();
          fetchPurchaseRequests();
          handleSuccessfulNavigation(extractRFQID(res.data.url));

        } else {
          Swal.fire({
            title: "Creation Failed",
            text: res.message || "Could not create Purchase Request.",
            icon: "error",
          });
        }
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "Error",
        text: "An unexpected error occurred.",
        icon: "error",
      });
    }
  };

  const saveAndSubmit = async () => {
    const payload = getCleanedFormData("pending");
    try {
      const res = await createPurchaseRequest(payload);
      if (res.success) {
        console.log(res);

        Swal.fire({
          title: "Shared!",
          text: "Purchase Request created and shared successfully.",
          icon: "success",
        });
        resetForm();
        handleSuccessfulNavigation(extractRFQID(res.data.url));
      } else {
        Swal.fire({
          title: "Share Failed",
          text: res.message || "Could not share Purchase Request.",
          icon: "error",
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "Error",
        text: "An unexpected error occurred while sharing.",
        icon: "error",
      });
    }
  };

  return (
    <div className="RfqForm">
      <div className="rfqAutoSave">
        <p className="raprhed">{isEdit}</p>
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
          <PRBasicInfoFields
            formData={formData}
            handleInputChange={handleInputChange}
            formUse={edit}
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
            <Button variant="outlined" onClick={handleAddRow}>
              Add Item
            </Button>
            <div style={{ display: "flex", gap: 20 }}>
              <Button variant="outlined" type="submit">
                {edit ? "Save Changes" : "Save"}
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

export default CreatePRForm;
