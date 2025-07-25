import React, { useEffect, useState } from "react";
import { Autocomplete, TextField } from "@mui/material";
import { formatDate } from "../../../../../helper/helper";
import CommonForm from "../../../../../components/CommonForm/CommonForm";
import { useStockAdjustment } from "../../../../../context/Inventory/StockAdjustment";
import { usePurchase } from "../../../../../context/PurchaseContext";
import { useCustomLocation } from "../../../../../context/Inventory/LocationContext";
import Swal from "sweetalert2";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { useTenant } from "../../../../../context/TenantContext";

// Default form state
const defaultFormData = {
  adjustmentType: "Stock Level Update",
  date: formatDate(Date.now()),
  location: "",
  items: [],
  status: "draft",
  is_hidden: true,
  notes: "",
};

// Renders the top form section
const StockAdjustmentBasicInputs = ({ formData, handleInputChange }) => {
  const { locationList, getLocationList } = useCustomLocation();
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    getLocationList();
  }, []);

  useEffect(() => {
    if (locationList.length <= 3 && locationList[0]) {
      setSelectedLocation(locationList[0]);
      handleInputChange("location", locationList[0]);
    }
  }, [locationList, handleInputChange]);

  useEffect(() => {
    // Prefill Autocomplete with matching location object
    if (formData.location && locationList.length > 0) {
      const matched = locationList.find(
        (loc) => loc.id === formData.location?.id || formData.location
      );
      setSelectedLocation(matched || null);
    }
  }, [formData.location, locationList]);

  const handleReceiptChange = (event, newValue) => {
    setSelectedLocation(newValue);
    handleInputChange("location", newValue);
  };

  console.log(locationList);

  return (
    <div className="stockbasicInformationInputs">
      <div className="formLabelAndValue">
        <label>ID</label>
        <p>{formData.id}</p>
      </div>
      <div className="formLabelAndValue">
        <label>Adjustment Type</label>
        <p>{formData.adjustmentType}</p>
      </div>

      <div className="formLabelAndValue">
        <label>Date</label>
        <p>{formData.date}</p>
      </div>

      {locationList.length <= 3 ? (
        <div className="formLabelAndValue">
          <label>Location</label>
          <p>{selectedLocation?.id || "N/A"}</p>
        </div>
      ) : (
        <div>
          <label style={{ marginBottom: "6px", display: "block" }}>
            Location
          </label>
          <Autocomplete
            disablePortal
            options={locationList}
            value={selectedLocation}
            getOptionLabel={(option) => option?.id || ""}
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
            onChange={handleReceiptChange}
            sx={{ width: "100%", mb: 2 }}
            renderInput={(params) => (
              <TextField {...params} placeholder="Select Location" />
            )}
          />
        </div>
      )}

      <div className="supplierName">
        <label style={{ marginBottom: "6px", display: "block" }}>Notes</label>
        <TextField
          type="text"
          value={formData.notes}
          onChange={(e) => handleInputChange("notes", e.target.value)}
          sx={{ width: "100%" }}
          placeholder="Input your notes here"
        />
      </div>
    </div>
  );
};

const EditStockAdjustment = () => {
  const { tenant_schema_name } = useTenant().tenantData || {};
  const history = useHistory();
  const [formData, setFormData] = useState(defaultFormData);
  const location = useLocation();
  const { products, fetchProducts } = usePurchase();
  const { locationList } = useCustomLocation(); // Get locationList here
  const { isLoading: stockLoading, updateStockAdjustment } =
    useStockAdjustment();

  const { id } = useParams();

  // Transform products with UOM structure
  const transformProducts = (products) =>
    products.map((prod) => ({
      ...prod,
      unit_of_measure: Array.isArray(prod.unit_of_measure)
        ? {
            url: prod.unit_of_measure[0],
            unit_category: prod.unit_of_measure[1],
          }
        : prod.unit_of_measure,
    }));

  useEffect(() => {
    fetchProducts();
  }, []);

  // Initialize form data when products/locations load
  useEffect(() => {
    if (
      location?.state?.StockAdjustment &&
      products.length &&
      locationList.length
    ) {
      const adj = location.state.StockAdjustment;

      // Map adjustment items to form items
      const items = adj.stock_adjustment_items.map((item) => {
        return {
          ...item,
          product: item?.product,
          unit_of_measure: item.product?.unit_of_measure
            ? { unit_category: item.product.unit_of_measure[1] }
            : { unit_category: item?.unit_of_measure },
          available_product_quantity: item.current_quantity,
          qty_received: item.adjusted_quantity,
        };
      });

      // Find matching location object
      const locationObj = locationList.find(
        (loc) => loc.url === adj.warehouse_location
      );

      setFormData({
        ...defaultFormData,
        id: adj.id,
        adjustmentType: adj.adjustment_type || "Stock Level Update",
        date: formatDate(adj.date ? new Date(adj.date) : Date.now()),
        location: locationObj || adj.warehouse_location,
        items: items,
        notes: adj.notes || "",
        status: adj.status || "draft",
        is_hidden: adj.is_hidden || false,
      });
    }
  }, [location.state, products, locationList]); // Re-run when these update

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

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

  const handleSubmit = async (filledData) => {
    const cleanData = {
      id: filledData.id || null,
      adjustment_type: filledData.adjustmentType || null,
      warehouse_location: filledData.location?.url || filledData.location,
      notes: filledData.notes || null,
      status: filledData.status || null,
      is_hidden: false,
      items: filledData.items.map((item) => ({
        product: item.product.url,
        adjusted_quantity: item.qty_received,
      })),
    };

    try {
      const { data } = await updateStockAdjustment(cleanData, id);
      setFormData(defaultFormData);
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Stock adjustment updated successfully",
      });
      navigateToDetail(data.id);
    } catch (err) {
      // Validation errors thrown as { validation: {...} }
      if (err.validation) {
        Swal.fire({
          icon: "error",
          title: "Validation Error",
          html: Object.values(err.validation)
            .map((msg) => `<p>${msg}</p>`)
            .join(""),
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err.message || "Failed to update stock adjustment",
        });
      }
    }
  };

  const handleSubmitAsDone = async (filledData) => {
    const cleanData = {
      id: filledData.id || null,
      adjustment_type: filledData.adjustmentType || null,
      warehouse_location: filledData.location?.url || filledData.location,
      notes: filledData.notes || null,
      status: "done",
      is_hidden: false,
      items: filledData.items.map((item) => ({
        product: item.product.url,
        adjusted_quantity: item.qty_received,
      })),
    };

    try {
      const { data } = await updateStockAdjustment(cleanData, id);
      setFormData(defaultFormData);
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Stock adjustment marked as done",
      });
      navigateToDetail(data.id);
    } catch (err) {
      if (err.validation) {
        Swal.fire({
          icon: "error",
          title: "Validation Error",
          html: Object.values(err.validation)
            .map((msg) => `<p>${msg}</p>`)
            .join(""),
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err.message || "Failed to mark adjustment as done",
        });
      }
    }
  };

  return (
    <CommonForm
      basicInformationTitle="Product Information"
      basicInformationInputs={StockAdjustmentBasicInputs}
      formTitle="Edit Stock Adjustment"
      formData={formData}
      setFormData={setFormData}
      handleInputChange={handleInputChange}
      rowConfig={rowConfig}
      isEdit={true}
      onSubmit={handleSubmit}
      submitBtnText={stockLoading ? "Submitting..." : "Validate"}
      autofillRow={["unit_of_measure", "available_product_quantity"]}
      onSubmitAsDone={handleSubmitAsDone}
    />
  );
};

export default EditStockAdjustment;
