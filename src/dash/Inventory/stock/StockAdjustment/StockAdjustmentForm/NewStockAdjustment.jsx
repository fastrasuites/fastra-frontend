import React, { useEffect, useState } from "react";
import { Autocomplete, Box, TextField } from "@mui/material";
import { formatDate } from "../../../../../helper/helper";
import CommonForm from "../../../../../components/CommonForm/CommonForm";
import "./NewStockAdjustment.css";
import { useStockAdjustment } from "../../../../../context/Inventory/StockAdjustment";
import { usePurchase } from "../../../../../context/PurchaseContext";
import { useCustomLocation } from "../../../../../context/Inventory/LocationContext";
import Swal from "sweetalert2";
import { useTenant } from "../../../../../context/TenantContext";
import { useHistory } from "react-router-dom";
import Asterisk from "../../../../../components/Asterisk";

// ---------- DEFAULT FORM DATA ----------
const defaultFormData = {
  adjustmentType: "Stock Level Update",
  date: formatDate(Date.now()),
  location: "",
  items: [],
  status: "draft",
  is_hidden: true,
  notes: "",
};

// ---------- COMPONENT: Basic Form Inputs ----------
const StockAdjustmentBasicInputs = ({ formData, handleInputChange }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const { activeLocationList, getActiveLocationList } = useCustomLocation();

  useEffect(() => {
    getActiveLocationList();
  }, []);

  useEffect(() => {
    if (activeLocationList.length <= 1 && activeLocationList[0]) {
      setSelectedLocation(activeLocationList[0]);
      handleInputChange("location", activeLocationList[0]);
    }
  }, [activeLocationList, handleInputChange]);

  const handleLocationChange = (_, newLoc) => {
    setSelectedLocation(newLoc);
    handleInputChange("location", newLoc);
  };

  return (
    <Box display="flex" gap={10}>
      <div className="formLabelAndValue">
        <label style={{ marginBottom: 6, display: "flex" }}>
          Adjustment Type <Asterisk />
        </label>
        <p>{formData.adjustmentType}</p>
      </div>
      <div className="formLabelAndValue">
        <label style={{ marginBottom: 6, display: "flex" }}>
          Date <Asterisk />
        </label>
        <p>{formData.date}</p>
      </div>
      {activeLocationList.length <= 1 ? (
        <div className="formLabelAndValue">
          <label style={{ marginBottom: 6, display: "flex" }}>
            Location <Asterisk />
          </label>
          <p>{selectedLocation?.id || "N/A"}</p>
        </div>
      ) : (
        <div>
          <label style={{ marginBottom: 6, display: "flex" }}>
            Location <Asterisk />
          </label>
          <Autocomplete
            disablePortal
            options={activeLocationList}
            value={selectedLocation}
            getOptionLabel={(option) => option?.location_name || ""}
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
            onChange={handleLocationChange}
            sx={{ width: 300, mb: 2 }}
            renderInput={(params) => (
              <TextField {...params} placeholder="Select Location" />
            )}
          />
        </div>
      )}
      <div className="supplierName">
        <label style={{ marginBottom: 6, display: "flex" }}>
          Notes <Asterisk />
        </label>
        <TextField
          value={formData.notes}
          onChange={(e) => handleInputChange("notes", e.target.value)}
          sx={{ width: "100%" }}
          placeholder="Input your notes here"
        />
      </div>
    </Box>
  );
};

// ---------- COMPONENT: Main ----------
const NewStockAdjustment = () => {
  const { tenant_schema_name } = useTenant().tenantData || {};
  const history = useHistory();
  const [formData, setFormData] = useState(defaultFormData);

  const { products, fetchProducts } = usePurchase();
  const { isLoading: stockLoading, createStockAdjustment } =
    useStockAdjustment();

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const transformProducts = (list) =>
    list.map((prod) => ({
      ...prod,
      unit_of_measure: {
        url: prod.unit_of_measure,
        unit_category: prod?.unit_of_measure_details?.unit_category,
        unit_name: prod?.unit_of_measure_details?.unit_category,
      },
    }));

  const rowConfig = [
    {
      label: "Product Name",
      field: "product",
      type: "autocomplete",
      options: transformProducts(products),
      getOptionLabel: (opt) => opt?.product_name || "",
    },
    {
      label: "Unit of Measure",
      field: "unit_of_measure",
      type: "text",
      disabled: true,
      transform: (val) => val?.unit_category || "",
    },
    {
      label: "Current Quantity",
      field: "available_product_quantity",
      type: "number",
      disabled: true,
      transform: (val) => val || 0,
    },
    {
      label: "Adjusted Quantity",
      field: "qty_received",
      type: "number",
    },
  ];

  const navigateToDetail = (id) => {
    setTimeout(() => {
      history.push(
        `/${tenant_schema_name}/inventory/stock/stock-adjustment/${id}`
      );
    }, 1500);
  };

  const validateForm = (data) => {
    const errors = {};
    if (!data.warehouse_location) {
      errors.warehouse_location = "Location is required.";
    }
    if (!data.notes) {
      errors.notes = "Notes is required.";
    }
    if (!data.items || data.items.length === 0) {
      errors.items = "At least one item is required.";
    } else {
      data.items.forEach((item, index) => {
        if (!item.product) {
          if (!errors.items) errors.items = [];
          errors.items.push(`Item ${index + 1}: Product is required.`);
        }
      });
    }
    return Object.keys(errors).length > 0 ? errors : null;
  };

  const showValidationErrors = (errorData) => {
    const messages = Object.values(errorData)
      .flat()
      .map((msg) => `<p>${msg}</p>`)
      .join("");

    Swal.fire({
      icon: "error",
      title: "Validation Error",
      html: messages || "An unknown error occurred.",
    });
  };

  const handleSubmitBase = async (filledData, status = "draft") => {
    const cleanData = {
      warehouse_location: filledData?.location?.id,
      notes: filledData?.notes,
      status,
      is_hidden: false,
      items: filledData.items.map((item) => ({
        product: item.product.url,
        adjusted_quantity: item.qty_received,
      })),
    };

    validateForm(cleanData);
    if (validateForm(cleanData)) {
      showValidationErrors(validateForm(cleanData));
      return;
    }

    try {
      const created = await createStockAdjustment(cleanData);

      if (created?.success) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text:
            status === "done"
              ? "Stock adjustment marked as done"
              : "Stock adjustment created successfully",
        });
        navigateToDetail(created.data.id);
      } else {
        showValidationErrors(created?.error?.response?.data || {});
      }
    } catch (err) {
      console.error(err);
      showValidationErrors(err?.response?.data || { general: [err.message] });
    }
  };

  return (
    <CommonForm
      basicInformationTitle="Product Information"
      basicInformationInputs={StockAdjustmentBasicInputs}
      formTitle="New Stock Adjustment"
      formData={formData}
      setFormData={setFormData}
      handleInputChange={handleInputChange}
      rowConfig={rowConfig}
      isEdit={false}
      onSubmit={(data) => handleSubmitBase(data, "draft")}
      onSubmitAsDone={(data) => handleSubmitBase(data, "done")}
      submitBtnText={stockLoading ? "Submitting..." : "Send to Draft"}
      autofillRow={["unit_of_measure", "available_product_quantity"]}
    />
  );
};

export default NewStockAdjustment;
