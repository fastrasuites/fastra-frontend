import "../../Rfq/RfqForm/RfqForm.css";
import PurchaseHeader from "../../PurchaseHeader";
import autosave from "../../../../image/autosave.svg";

import React, { useEffect, useState } from "react";
import { Button } from "@mui/material";
import Swal from "sweetalert2";
import { useHistory, useLocation } from "react-router-dom";

import { usePurchase } from "../../../../context/PurchaseContext";
import { useTenant } from "../../../../context/TenantContext";
import { useCustomLocation } from "../../../../context/Inventory/LocationContext";

import PRBasicInfoFields from "./PRBasicInfoFields";
import PRItemsTable from "./PRItemsTable";

import { extractRFQID, normalizedRFQ } from "../../../../helper/helper";
import { extractPermissions } from "../../../../helper/extractPermissions";
import { useCanAccess } from "../../../../context/Access/AccessContext";

const CreatePRForm = () => {
  const history = useHistory();
  const location = useLocation();
  const { pr = {}, edit = false } = location.state || {};
  const isEdit = edit ? "Edit Purchase Request" : "Create Purchase Request";

  const {
    fetchProducts,
    products,
    fetchVendors,
    vendors,
    fetchCurrencies,
    currencies,
    fetchPurchaseRequests,
    purchaseRequests,
    createPurchaseRequest,
    updatePurchaseRequest,
  } = usePurchase();

  const { getActiveLocationList, activeLocationList } = useCustomLocation();
  const { tenantData } = useTenant();
  const examps = useCanAccess();
  const { tenant_schema_name: tenantSchemaName } = tenantData;

  // console.log("tenantData", tenantData);
  // // const extractedpermission = extractPermissions(tenantData.user_accesses);
  // // console.log(extractedpermission);

  const [formData, setFormData] = useState({
    purpose: pr.purpose || "",
    currency: pr.currency || "",
    vendor: pr.vendor || "",
    requesting_location: pr.requesting_location || "",
    status: pr.status || "draft",
    is_hidden: pr.is_hidden ?? true,
    items: (pr.items || []).map((item) => ({
      ...item,
      product: item.product_details,
    })),
  });

  const [prID, setPrID] = useState([]);

  // ─── Load Required Data ─────────────────────────────────────
  useEffect(() => {
    fetchVendors();
    fetchCurrencies();
    fetchProducts();
    fetchPurchaseRequests();
    getActiveLocationList();
  }, []);

  useEffect(() => {
    setPrID(normalizedRFQ(purchaseRequests));
  }, [purchaseRequests]);

  // ─── Handlers ───────────────────────────────────────────────
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRowChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
      ...(field === "product" && value?.product_description
        ? {
            description: value.product_description,
            unit_of_measure: value.unit_of_measure,
          }
        : {}),
    };
    setFormData((prev) => ({ ...prev, items: updatedItems }));
  };

  const handleAddRow = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          product: null,
          description: "",
          qty: "",
          unit_of_measure: "",
          estimated_unit_price: "",
        },
      ],
    }));
  };

  const handleSuccessfulNavigation = (id) => {
    setTimeout(() => {
      history.push(`/${tenantSchemaName}/purchase/purchase-request/${id}`);
    }, 2000);
  };

  const resetForm = () => {
    setFormData({
      purpose: "",
      currency: "",
      vendor: "",
      requesting_location: "",
      status: "draft",
      is_hidden: true,
      items: [],
    });
  };

  const getCleanedFormData = (overrideStatus = formData.status) => ({
    status: overrideStatus,
    currency: formData.currency,
    purpose: formData.purpose,
    vendor: formData.vendor,
    requesting_location: formData.requesting_location,
    is_hidden: false,
    items: formData.items.map((item) => ({
      id: item.id,
      product: item.product?.id || item.product,
      description: item.description,
      qty: Number(item.qty) || 0,
      unit_of_measure:
        item.unit_of_measure?.id ||
        (Array.isArray(item.unit_of_measure)
          ? item.unit_of_measure[0]
          : item.unit_of_measure),
      estimated_unit_price: item.estimated_unit_price,
    })),
  });

  const handleError = (err) => {
    const message =
      err?.response?.data?.non_field_errors?.[0] ||
      err?.response?.data?.detail ||
      err?.response?.data?.message ||
      err.message ||
      "An unexpected error occurred.";

    Swal.fire({
      title: "Error",
      text: message,
      icon: "error",
    });
  };

  const validateRequiredFields = (payload) => {
    if (!payload.currency) return "Currency is required.";
    if (!payload.vendor) return "Vendor is required.";
    if (!payload.purpose) return "Purpose is required.";
    if (!payload.requesting_location) return "Requesting location is required.";
    if (!payload.items || payload.items.length === 0)
      return "At least one product item is required.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = getCleanedFormData("draft");

    const errorMessage = validateRequiredFields(payload);
    if (errorMessage) {
      Swal.fire({
        icon: "warning",
        title: "Missing Information",
        text: errorMessage,
      });
      return;
    }

    try {
      if (edit) {
        const id = extractRFQID(pr.url);
        const res = await updatePurchaseRequest(id, payload);
        if (res.success) {
          Swal.fire(
            "Updated!",
            "Purchase Request updated successfully.",
            "success"
          );
          handleSuccessfulNavigation(id);
        } else {
          Swal.fire(
            "Update Failed",
            res.message || "Could not update the Purchase Request.",
            "error"
          );
        }
      } else {
        const res = await createPurchaseRequest(payload);
        if (res.success) {
          Swal.fire(
            "Created!",
            "Purchase Request saved as draft successfully.",
            "success"
          );
          resetForm();
          fetchPurchaseRequests();
          handleSuccessfulNavigation(extractRFQID(res.data.url));
        } else {
          Swal.fire(
            "Creation Failed",
            res.message || "Could not create Purchase Request.",
            "error"
          );
        }
      }
    } catch (err) {
      handleError(err);
    }
  };

  const saveAndSubmit = async () => {
    const payload = getCleanedFormData("pending");

    const errorMessage = validateRequiredFields(payload);
    if (errorMessage) {
      Swal.fire({
        icon: "warning",
        title: "Missing Information",
        text: errorMessage,
      });
      return;
    }

    try {
      if (edit) {
        const id = extractRFQID(pr.url);
        const res = await updatePurchaseRequest(id, payload);
        if (res.success) {
          Swal.fire(
            "Updated!",
            "Purchase Request updated successfully.",
            "success"
          );
          handleSuccessfulNavigation(id);
        } else {
          Swal.fire(
            "Update Failed",
            res.message || "Could not update the Purchase Request.",
            "error"
          );
        }
      } else {
        const res = await createPurchaseRequest(payload);
        if (res.success) {
          Swal.fire(
            "Shared!",
            "Purchase Request created and shared successfully.",
            "success"
          );
          resetForm();
          handleSuccessfulNavigation(extractRFQID(res.data.url));
        } else {
          Swal.fire(
            "Share Failed",
            res.message || "Could not share Purchase Request.",
            "error"
          );
        }
      }
    } catch (err) {
      handleError(err);
    }
  };

  // ─── Render ────────────────────────────────────────────────
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
            requester={pr.requester_name}
            rfqID={pr.url}
            locationList={activeLocationList}
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
