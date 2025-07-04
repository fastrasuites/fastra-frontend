import React, { useState, useEffect } from "react";
import { Autocomplete, TextField, Typography } from "@mui/material";
import { formatDate } from "../../../../../helper/helper";
import CommonForm from "../../../../../components/CommonForm/CommonForm";
import "./ScrapForm.css";
import { useScrap } from "../../../../../context/Inventory/Scrap";
import { useCustomLocation } from "../../../../../context/Inventory/LocationContext";
import { usePurchase } from "../../../../../context/PurchaseContext";
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
  const { locationList, getLocationList } = useCustomLocation();

  useEffect(() => {
    getLocationList();
  }, [getLocationList]);

  useEffect(() => {
    if (locationList.length <= 3 && locationList[0]) {
      setSelectedLocation(locationList[0]);
      handleInputChange("location", locationList[0]);
    }
  }, [locationList, handleInputChange]);

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

  console.log(formData?.notes);

  return (
    <>
      <div className="scrapBasicInformationInputs">
        {/* <div className="scrapFormLabelAndValue">
          <label>ID</label>
          <p>{formData.id}</p>
        </div> */}
        <div>
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
        </div>
        <div className="formLabelAndValue">
          <label>Date</label>
          <p>{formData.date}</p>
        </div>
        <div>
          <label style={{ marginBottom: 6, display: "flex" }}>
            Warehouse Location
            <Asterisk />
          </label>
          {locationList.length <= 3 ? (
            <Typography color={"gray"}>
              {selectedLocation?.id || "N/A"}
            </Typography>
          ) : (
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
          )}
        </div>
      </div>
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
  const { products, fetchProducts } = usePurchase();
  const { createScrap } = useScrap();

  useEffect(() => {
    fetchProducts();
  }, []);

  const transformProducts = (products) =>
    products.map((prod) => {
      const [url, unit_category] = prod.unit_of_measure;
      return {
        ...prod,
        unit_of_measure: {
          url,
          unit_category,
          unit_name: unit_category,
        },
      };
    });

  const rowConfig = [
    {
      label: "Product Name",
      field: "product",
      type: "autocomplete",
      options: transformProducts(products),
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
      transform: (value) => value || "",
    },
    {
      label: "Adjusted Quantity",
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
    const items = filledFormData.items.map((item) => ({
      product: item.product.url,
      adjusted_quantity: item.qty_received,
    }));

    try {
      const createdScrap = await createScrap({ ...filledFormData, items });
      setFormData(defaultFormData);
      console.log(createdScrap);
      Swal.fire("Success", "Scrap created successfully", "success");
      navigateToDetail(createdScrap?.data?.id);
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
  };

  const handleSubmitValidate = async (filledFormData) => {
    const items = filledFormData.items.map((item) => ({
      product: item.product.url,
      adjusted_quantity: item.qty_received,
    }));

    try {
      const createdScrap = await createScrap({
        ...filledFormData,
        items,
        status: "done",
      });
      setFormData(defaultFormData);
      console.log(createdScrap);
      Swal.fire("Success", "Scrap created successfully", "success");
      navigateToDetail(createdScrap?.data?.id);
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
      onSubmit={handleSubmit}
      submitBtnText="Validate"
      autofillRow={["unit_of_measure", "available_product_quantity"]}
      onSubmitAsDone={handleSubmitValidate}
    />
  );
};

export default ScrapForm;
