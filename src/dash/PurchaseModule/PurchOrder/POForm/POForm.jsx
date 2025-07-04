// src/dash/PurchaseModule/PurchOrder/POForm/POForm.js
import React, { useEffect, useState, useCallback } from "react";
import "../../Rfq/RfqForm/RfqForm.css";
import autosave from "../../../../image/autosave.svg";
import { Button } from "@mui/material";
import Swal from "sweetalert2";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { usePurchase } from "../../../../context/PurchaseContext";
import { usePurchaseOrder } from "../../../../context/PurchaseOrderContext.";
import { useTenant } from "../../../../context/TenantContext";
import POBasicInfoFields from "./POBasicInfoFields";
import POItemsTable from "./POItemsTable";
import { extractRFQID, normalizedRFQ } from "../../../../helper/helper";
import { useRFQ } from "../../../../context/RequestForQuotation";
import { useCustomLocation } from "../../../../context/Inventory/LocationContext";
import POBasicInfoFieldsConverToPO from "./POBasicInforCoverToPO";

const DEFAULT_FORM = {
  vendor: null,
  rfq: null,
  destination_location: null,
  currency: null,
  payment_terms: "",
  purchase_policy: "",
  delivery_terms: "",
  items: [],
  status: "draft",
  is_hidden: true,
};

const POForm = () => {
  const history = useHistory();
  const { state } = useLocation();
  const {
    po = {},
    edit = false,
    conversionRFQ = {},
    isConvertToPO = false,
  } = state || {};
  const { tenant_schema_name } = useTenant().tenantData || {};
  const { id } = useParams();

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
  const { approvedGetRFQList, rfqList, isLoading: isRfqLoading } = useRFQ();
  const { activeLocationList, getActiveLocationList } = useCustomLocation();
  const { createPurchaseOrder, updatePurchaseOrder } = usePurchaseOrder();

  const formUse = edit ? "Edit Purchase Order" : "Create Purchase Order";
  const isEdit = formUse === "Edit Purchase Order";

  const hasConversion = conversionRFQ && Object.keys(conversionRFQ).length > 0;

  const computeInitialForm = () => {
    if (hasConversion) {
      return { ...DEFAULT_FORM, ...conversionRFQ, status: "draft" };
    } else if (isEdit) {
      return { ...po };
    } else {
      return DEFAULT_FORM;
    }
  };

  const [formData, setFormData] = useState(computeInitialForm());
  const [prIDList, setPrIDList] = useState([]);

  useEffect(() => {
    fetchVendors();
    fetchCurrencies();
    fetchProducts();
    fetchPurchaseRequests();
    approvedGetRFQList();
    getActiveLocationList();
  }, [
    fetchVendors,
    fetchCurrencies,
    fetchProducts,
    fetchPurchaseRequests,
    approvedGetRFQList,
    getActiveLocationList,
  ]);

  useEffect(() => {
    setPrIDList(normalizedRFQ(purchaseRequests));
  }, [purchaseRequests]);

  useEffect(() => {
    setFormData(computeInitialForm());
  }, []);

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

  const poItems = formData?.rfq?.items || [];

  const cleanData = (status) => ({
    ...formData,
    status,
    vendor: formData.rfq.vendor?.url || formData.rfq.vendor,
    destination_location:
      formData.destination_location?.id || formData.destination_location,
    related_rfq: formData.rfq?.id || formData.rfq,
    currency: formData?.rfq?.currency?.url || formData?.rfq.currency,
    payment_terms: formData.payment_terms,
    purchase_policy: formData.purchase_policy,
    delivery_terms: formData.delivery_terms,
    items: poItems.map((i) => ({
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
    is_submitted: true,
    can_edit: true,
  });

  const navigateToDetail = (id) => {
    setTimeout(() => {
      history.push(`/${tenant_schema_name}/purchase/purchase-order/${id}`);
    }, 1500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = cleanData("draft");
    console.log(payload);
    try {
      if (isEdit) {
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
      // setFormData(DEFAULT_FORM);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Unexpected error occurred.", "error");
    }
  };

  const saveAndSend = async () => {
    const payload = cleanData("awaiting");
    try {
      if (isEdit) {
        const res = await updatePurchaseOrder(payload, id);
        if (res.success)
          Swal.fire("Updated!", "Purchase Order updated.", "success");
        else Swal.fire("Error", res.message, "error");
        navigateToDetail(id);
      } else {
        const res = await createPurchaseOrder(payload);
        if (res.success) {
          Swal.fire("Sent!", "Purchase Order created and sent.", "success");
          navigateToDetail(extractRFQID(res.data.url));
        } else Swal.fire("Error", res.message, "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Unexpected error occurred.", "error");
    }
  };

  const handleClose = () => {
    history.goBack();
  };

  // console.log(formData);

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
          {isConvertToPO ? (
            <POBasicInfoFieldsConverToPO
              formData={formData}
              handleInputChange={handleInputChange}
              formUse={formUse}
              currencies={currencies}
              vendors={vendors}
              purchaseIdList={prIDList}
              poID={po?.url}
              rfqList={rfqList}
              locationList={activeLocationList}
              isRfqLoading={isRfqLoading}
              isConvertToPO={isConvertToPO}
            />
          ) : (
            <POBasicInfoFields
              formData={formData}
              handleInputChange={handleInputChange}
              formUse={formUse}
              currencies={currencies}
              vendors={vendors}
              purchaseIdList={prIDList}
              poID={po?.url}
              rfqList={rfqList}
              locationList={activeLocationList}
              isRfqLoading={isRfqLoading}
            />
          )}

          <POItemsTable
            items={formData?.rfq?.items}
            handleRowChange={handleRowChange}
            products={products}
            isConversion={!!conversionRFQ?.items?.length}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "end",
              alignItems: "center",
            }}
          >
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
