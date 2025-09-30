import React, { useState, useEffect } from "react";
import { Autocomplete, Box, TextField, Typography } from "@mui/material";
import { formatDate } from "../../../../../helper/helper";
import CommonForm from "../../../../../components/CommonForm/CommonForm";
import "./ScrapForm.css";
import { useScrap } from "../../../../../context/Inventory/Scrap";
import { useCustomLocation } from "../../../../../context/Inventory/LocationContext";
import Swal from "sweetalert2";
import { useTenant } from "../../../../../context/TenantContext";
import { useHistory } from "react-router-dom";
import Asterisk from "../../../../../components/Asterisk";

const adjustmentTypes = ["Damage", "Loss"];

const defaultFormData = {
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
  const { activeLocationList, getActiveLocationListForForm } =
    useCustomLocation();

  useEffect(() => {
    getActiveLocationListForForm();
  }, [getActiveLocationListForForm]);

  useEffect(() => {
    if (activeLocationList.length <= 1 && activeLocationList[0]) {
      setSelectedLocation(activeLocationList[0]);
      handleInputChange("location", activeLocationList[0]);
    }
  }, [activeLocationList, handleInputChange]);

  // Sync local state when formData changes
  useEffect(() => {
    setSelectedLocation(formData.location);
  }, [formData.location]);

  useEffect(() => {
    setSelectedAdjustment(formData.adjustmentType);
  }, [formData.adjustmentType]);

  const handleAdjustmentChange = (event, newValue) => {
    setSelectedAdjustment(newValue);
    handleInputChange("adjustmentType", newValue);
  };

  const handleLocationChange = (event, newValue) => {
    setSelectedLocation(newValue);
    handleInputChange("location", newValue);
  };

  return (
    <>
      <Box display={"flex"} gap={4}>
        {/* <div className="scrapFormLabelAndValue">
          <label>ID</label>
          <p>{formData.id}</p>
        </div> */}
        <Box flex={1} maxWidth={"400px"}>
          <label style={{ marginBottom: 6, display: "flex" }}>
            Adjustment Type
            <Asterisk />
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
        <Box className="formLabelAndValue" flex={1} maxWidth={"400px"}>
          <label>Date</label>
          <p>{formData.date}</p>
        </Box>
        <Box flex={1} maxWidth={"400px"}>
          <label style={{ marginBottom: 6, display: "flex" }}>
            Warehouse Location
            <Asterisk />
          </label>
          {activeLocationList.length <= 1 ? (
            <Typography color={"gray"}>
              {selectedLocation?.location_name || "N/A"}
            </Typography>
          ) : (
            <Autocomplete
              disablePortal
              options={activeLocationList}
              value={selectedLocation}
              getOptionLabel={(option) =>
                option.location_name || option.id || ""
              }
              isOptionEqualToValue={(option, value) => option?.id === value?.id}
              onChange={handleLocationChange}
              renderInput={(params) => (
                <TextField {...params} placeholder="Select Location" />
              )}
              sx={{ width: "100%", mb: 2 }}
            />
          )}
        </Box>
      </Box>
      <div className="scrapNotes">
        <label style={{ marginBottom: 6, display: "flex" }}>
          Notes
          <Asterisk />
        </label>
        <TextField
          type="text"
          value={formData.notes}
          onChange={(e) => {
            handleInputChange("notes", e.target.value);
          }}
          sx={{ width: "100%" }}
          placeholder="Input your notes here"
        />
      </div>
    </>
  );
};

const ScrapForm = () => {
  const { tenant_schema_name } = useTenant().tenantData || {};
  const history = useHistory();
  const [formData, setFormData] = useState(defaultFormData);
  // const { products, fetchProducts } = usePurchase();
  const { getLocationProducts, locationProducts } = useCustomLocation();
  const { createScrap } = useScrap();

  console.log(formData);
  const locationId = formData?.location?.id;

  useEffect(() => {
    if (locationId) {
      getLocationProducts(locationId);
    }
  }, [locationId, getLocationProducts]);

  const transformProducts = (list) =>
    list.map((prod) => ({
      ...prod,
      available_product_quantity: prod?.quantity,
      id: prod?.product_id,
      product_name: prod?.product_name,
      product_description: prod?.product_name,
      unit_of_measure: {
        unit_name: prod?.product_unit_of_measure,
        url: prod?.product_unit_of_measure,
        unit_category: prod?.product_unit_of_measure,
      },
    }));

  const rowConfig = [
    {
      label: "Product Name",
      field: "product",
      type: "autocomplete",
      options: transformProducts(locationProducts),
      getOptionLabel: (option) => option.product_name || "",
    },
    {
      label: "Unit of Measure",
      field: "unit_of_measure",
      type: "text",
      disabled: true,
      transform: (value) => value.unit_category || "",
    },
    {
      label: "Current Quantity",
      field: "available_product_quantity",
      type: "number",
      disabled: true,
      transform: (value) => value || 0,
    },
    {
      label: "Scrap Quantity",
      field: "qty_received",
      type: "number",
    },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  const navigateToDetail = (id) => {
    setTimeout(() => {
      history.push(`/${tenant_schema_name}/inventory/stock/scrap/${id}`);
    }, 1500);
  };

  const handleSubmit = async (filledFormData) => {
    // Validation
    if (filledFormData.items.length === 0) {
      Swal.fire("Error", "No items added to scrap", "error");
      return;
    }
    for (const item of filledFormData.items) {
      if (!item.product || !item.product.product_name) {
        Swal.fire("Error", "Product name is required for all items", "error");
        return;
      }
      if (!item.unit_of_measure || !item.unit_of_measure.unit_category) {
        Swal.fire(
          "Error",
          "Unit of measure is required for all items",
          "error"
        );
        return;
      }
      if (
        !item.available_product_quantity ||
        item.available_product_quantity <= 0
      ) {
        Swal.fire(
          "Error",
          "Current quantity must be greater than 0 for all items",
          "error"
        );
        return;
      }
      if (!item.qty_received || item.qty_received <= 0) {
        Swal.fire(
          "Error",
          "Scrap quantity must be greater than 0 for all items",
          "error"
        );
        return;
      }
    }

    const items = filledFormData.items.map((item) => ({
      product: item.product.id,
      scrap_quantity: item.qty_received,
    }));
    try {
      const createdScrap = await createScrap({
        ...filledFormData,
        items,
      });
      setFormData(defaultFormData);
      Swal.fire("Success", "Scrap created successfully", "success");
      navigateToDetail(createdScrap?.data?.id);
    } catch (err) {
      console.error(err);
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
  };

  const handleSubmitValidate = async (filledFormData) => {
    // Validation
    if (filledFormData.items.length === 0) {
      Swal.fire("Error", "No items added to scrap", "error");
      return;
    }
    for (const item of filledFormData.items) {
      if (!item.product || !item.product.product_name) {
        Swal.fire("Error", "Product name is required for all items", "error");
        return;
      }
      if (!item.unit_of_measure || !item.unit_of_measure.unit_category) {
        Swal.fire(
          "Error",
          "Unit of measure is required for all items",
          "error"
        );
        return;
      }
      if (
        !item.available_product_quantity ||
        item.available_product_quantity <= 0
      ) {
        Swal.fire(
          "Error",
          "Current quantity must be greater than 0 for all items",
          "error"
        );
        return;
      }
      if (!item.qty_received || item.qty_received <= 0) {
        Swal.fire(
          "Error",
          "Scrap quantity must be greater than 0 for all items",
          "error"
        );
        return;
      }
    }

    const items = filledFormData.items.map((item) => ({
      product: item.product.id,
      scrap_quantity: item.qty_received,
    }));

    try {
      const createdScrap = await createScrap({
        ...filledFormData,
        items,
        status: "done",
      });
      setFormData(defaultFormData);
      Swal.fire("Success", "Scrap created successfully", "success");
      navigateToDetail(createdScrap?.data?.id);
    } catch (err) {
      console.error(err);
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
  };

  return (
    <CommonForm
      basicInformationTitle="Product Information"
      basicInformationInputs={ScrapBasicInputs}
      handleInputChange={handleInputChange}
      formTitle="New Scrap"
      formData={formData}
      setFormData={setFormData}
      rowConfig={rowConfig}
      isEdit={false}
      onSubmit={handleSubmitValidate}
      saveAsSubmitBtnText="Save to draft"
      submitBtnText="Validate"
      autofillRow={["unit_of_measure", "available_product_quantity"]}
      onSubmitAsDone={handleSubmit}
      setMax={{
        field: "qty_received",
        limit: "available_product_quantity",
      }}
    />
  );
};

export default ScrapForm;
