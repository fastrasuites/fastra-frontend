import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Autocomplete, Box, TextField } from "@mui/material";
import { formatDate } from "../../../../../helper/helper";
import CommonForm from "../../../../../components/CommonForm/CommonForm";
import "./ScrapForm.css";
import { useScrap } from "../../../../../context/Inventory/Scrap";
import { useCustomLocation } from "../../../../../context/Inventory/LocationContext";
import { usePurchase } from "../../../../../context/PurchaseContext";
import Swal from "sweetalert2";
import { useTenant } from "../../../../../context/TenantContext";
import { useHistory, useLocation, useParams } from "react-router-dom";

const adjustmentTypes = ["Damage", "Loss"];

const defaultFormData = {
  id: "",
  adjustmentType: null,
  date: formatDate(Date.now()),
  location: null,
  items: [],
  status: "draft",
  is_hidden: true,
  notes: "",
};

const ScrapBasicInputs = ({ formData, handleInputChange }) => {
  const [selectedLocation, setSelectedLocation] = useState(formData.location);
  const [selectedAdjustment, setSelectedAdjustment] = useState(
    formData.adjustmentType
  );
  const { locationList, getLocationList } = useCustomLocation();

  useEffect(() => {
    getLocationList();
  }, [getLocationList]);

  useEffect(() => {
    setSelectedLocation(formData.location);
  }, [formData.location]);

  useEffect(() => {
    setSelectedAdjustment(formData.adjustmentType);
  }, [formData.adjustmentType]);

  const handleAdjustmentChange = useCallback(
    (_, newValue) => {
      setSelectedAdjustment(newValue);
      handleInputChange("adjustmentType", newValue);
    },
    [handleInputChange]
  );

  const handleLocationChange = useCallback(
    (_, newValue) => {
      setSelectedLocation(newValue);
      handleInputChange("location", newValue);
    },
    [handleInputChange]
  );

  return (
    <>
      <div className="scrapBasicInformationInputs">
        <div className="scrapFormLabelAndValue">
          <label>ID</label>
          <p>{formData.id}</p>
        </div>
        <Box width={300}>
          <label style={{ marginBottom: 6, display: "block" }}>
            Adjustment Type
          </label>
          <Autocomplete
            disablePortal
            options={adjustmentTypes}
            value={selectedAdjustment}
            onChange={handleAdjustmentChange}
            renderInput={(params) => (
              <TextField {...params} placeholder="Select Adjustment" />
            )}
            sx={{ width: "100%", mb: 2 }}
          />
        </Box>
        <div className="formLabelAndValue">
          <label>Date</label>
          <p>{formData.date}</p>
        </div>
        <div>
          <label style={{ marginBottom: 6, display: "block" }}>
            Warehouse Location
          </label>
          <Autocomplete
            disablePortal
            options={locationList}
            value={selectedLocation}
            getOptionLabel={(option) => option.name || option.id || ""}
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
            onChange={handleLocationChange}
            renderInput={(params) => (
              <TextField {...params} placeholder="Select Location" />
            )}
            sx={{ width: "100%", mb: 2 }}
          />
        </div>
      </div>
      <div className="scrapNotes">
        <label style={{ marginBottom: 6, display: "block" }}>Notes</label>
        <TextField
          type="text"
          multiline
          rows={3}
          value={formData.notes}
          onChange={(e) => handleInputChange("notes", e.target.value)}
          sx={{ width: "100%" }}
          placeholder="Input your notes here"
        />
      </div>
    </>
  );
};

const ScrapEditForm = () => {
  const { tenant_schema_name } = useTenant().tenantData || {};
  const history = useHistory();
  const [formData, setFormData] = useState(defaultFormData);
  const { products, fetchProducts } = usePurchase();
  const { updateScrap } = useScrap();

  const location = useLocation();
  const { locationList } = useCustomLocation();
  const { id } = useParams();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  useEffect(() => {
    const scrap = location.state?.Scrap;
    if (scrap && products.length && locationList.length) {
      const items = scrap.scrap_items.map((item) => ({
        ...item,
        product: item?.product,
        unit_of_measure: {
          url: item.product.unit_of_measure,
          unit_category: item.product?.unit_of_measure_details?.unit_name,
          unit_name: item.product?.unit_of_measure_details?.unit_name,
        },

        available_product_quantity: item?.product?.available_product_quantity,
        qty_received: item.adjusted_quantity,
      }));

      const locationObj = locationList.find(
        (loc) => loc.url === scrap.warehouse_location
      );

      setFormData({
        ...defaultFormData,
        id: scrap.id,
        adjustmentType:
          scrap.adjustment_type[0].toUpperCase() +
          scrap.adjustment_type.slice(1),
        date: formatDate(scrap.date ? new Date(scrap.date) : Date.now()),
        location: locationObj || scrap.warehouse_location,
        items,
        notes: scrap.notes || "",
        status: scrap.status || "draft",
        is_hidden: scrap.is_hidden || false,
      });
    }
  }, [location.state, products, locationList]);

  const transformProducts = (list) =>
    list.map((prod) => ({
      ...prod,
      unit_of_measure: {
        url: prod.unit_of_measure,
        unit_category: prod?.unit_of_measure_details?.unit_name,
        unit_name: prod?.unit_of_measure_details?.unit_name,
      },
    }));

  const memoizedProducts = useMemo(
    () => transformProducts(products),
    [products, transformProducts]
  );

  const rowConfig = useMemo(
    () => [
      {
        label: "Product Name",
        field: "product",
        type: "autocomplete",
        options: memoizedProducts,
        getOptionLabel: (option) => option.product_name || "",
      },
      {
        label: "Unit of Measure",
        field: "unit_of_measure",
        type: "text",
        disabled: true,
        transform: (value) => value.unit_name || "",
      },
      {
        label: "Current Quantity",
        field: "available_product_quantity",
        type: "number",
        disabled: true,
        transform: (value) => value || "",
      },
      {
        label: "Scrap Quantity",
        field: "qty_received",
        type: "number",
      },
    ],
    [memoizedProducts]
  );

  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const navigateToDetail = useCallback(
    (scrapId) => {
      setTimeout(() => {
        history.push(`/${tenant_schema_name}/inventory/stock/scrap/${scrapId}`);
      }, 1500);
    },
    [history, tenant_schema_name]
  );

  const handleSubmit = useCallback(
    async (filledFormData, status = "draft") => {
      const items = filledFormData.items.map((item) => ({
        id: parseInt(item?.id),
        product: parseInt(item.product?.id),
        scrap_quantity: parseInt(item?.scrap_quantity),
      }));

      try {
        const payload = { ...filledFormData, items, status };
        const response = await updateScrap(payload, id);
        setFormData(defaultFormData);
        Swal.fire("Success", "Scrap updated successfully", "success");
        navigateToDetail(response?.data?.id);
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
            text: err.message,
          });
        }
      }
    },
    [updateScrap, id, navigateToDetail]
  );

  return (
    <CommonForm
      basicInformationTitle="Product Information"
      basicInformationInputs={ScrapBasicInputs}
      handleInputChange={handleInputChange}
      formTitle="Edit Scrap"
      formData={formData}
      setFormData={setFormData}
      rowConfig={rowConfig}
      isEdit={true}
      onSubmit={(data) => handleSubmit(data)}
      submitBtnText="Validate"
      autofillRow={["unit_of_measure", "available_product_quantity"]}
      // onSubmitAsDone={(data) => handleSubmit(data)}
      setMax={{
        field: "qty_received",
        limit: "available_product_quantity",
      }}
    />
  );
};

export default ScrapEditForm;
