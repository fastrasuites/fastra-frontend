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
  const { locationList, getLocationList } = useCustomLocation();
  const { createPurchaseOrder, updatePurchaseOrder } = usePurchaseOrder();

  const formUse = edit ? "Edit Purchase Order" : "Create Purchase Order";
  const isEdit = formUse === "Edit Purchase Order";

  // ─── 1. Determine whether conversionRFQ actually has data ─────────────────
  // We check if conversionRFQ has at least one own property.
  const hasConversion = conversionRFQ && Object.keys(conversionRFQ).length > 0;

  // ─── 2. Build initial form state based on priority:
  //  a) If conversionRFQ is non-empty, use that (always status="draft")
  //  b) Else if editing (isEdit), use `po`
  //  c) Otherwise, use DEFAULT_FORM
  const computeInitialForm = () => {
    if (hasConversion) {
      return { ...DEFAULT_FORM, ...conversionRFQ, status: "draft" };
    } else if (isEdit) {
      return { ...po };
    } else {
      return DEFAULT_FORM;
    }
  };

  // ─── 3. State: formData and purchase‐request ID list ───────────────────────
  const [formData, setFormData] = useState(computeInitialForm());
  const [prIDList, setPrIDList] = useState([]);

  // ─── 4. Fetch dependencies on mount ────────────────────────────────────────
  useEffect(() => {
    fetchVendors();
    fetchCurrencies();
    fetchProducts();
    fetchPurchaseRequests();
    approvedGetRFQList();
    getLocationList();
  }, [
    fetchVendors,
    fetchCurrencies,
    fetchProducts,
    fetchPurchaseRequests,
    approvedGetRFQList,
    getLocationList,
  ]);

  // ─── 5. Update PR ID list whenever purchaseRequests change ────────────────
  useEffect(() => {
    setPrIDList(normalizedRFQ(purchaseRequests));
  }, [purchaseRequests]);

  // ─── 6. If `po` or `conversionRFQ` changes (e.g. after navigation), reset formData ───
  // For example, if user navigates with a new state, we want formData to reflect that.
  useEffect(() => {
    setFormData(computeInitialForm());
  }, []); // re‐run whenever the source objects change

  // ─── 7. Handlers for field changes ─────────────────────────────────────────
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

  // const handleAddRow = useCallback(() => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     items: [
  //       ...prev.items,
  //       {
  //         id: `new-${prev.items.length + 1}`,
  //         product: null,
  //         description: "",
  //         qty: "",
  //         unit_of_measure: "",
  //         estimated_unit_price: "",
  //       },
  //     ],
  //   }));
  // }, []);

  // ─── 8. Determine which set of items to use for payload ―──
  // If conversion is happening, we use conversionRFQ.items; otherwise `po.rfq.items`.
  // For simplicity, we just use formData.rfq.items if present, else empty array.
  const poItems = formData?.rfq?.items || [];

  // ─── 9. Prepare payload to send to API (map objects → URLs or IDs) ───────
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

  // ─── 10. Navigate to detail page after create/update ─────────────────────
  const navigateToDetail = (id) => {
    setTimeout(() => {
      history.push(`/${tenant_schema_name}/purchase/purchase-order/${id}`);
    }, 1500);
  };

  // ─── 11. Submit: save as draft or update ─────────────────────────────────
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

  // ─── 12. “Save & Send” handler ―──────────────────────────────────────────
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

  // Debug: see final formData at each render
  // console.log("POForm formData:", formData);

  // ─── 13. Render ───────────────────────────────────────────────────────────

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
              locationList={locationList}
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
              locationList={locationList}
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
            {/* <Button variant="outlined" onClick={handleAddRow}>
              Add Item
            </Button> */}
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
