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

// Default form data
const defaultFormData = {
  adjustmentType: "Stock Level Update",
  // id: Date.now(),
  date: formatDate(Date.now()),
  location: "",
  items: [],
  status: "draft",
  is_hidden: true,
  notes: "",
};

// Renders your “basic info” block exactly as before
const StockAdjustmentBasicInputs = ({ formData, handleInputChange }) => {
  const [selectedLoaction, setSelectedLocation] = useState(null);
  const { locationList, getLocationList } = useCustomLocation();

  useEffect(() => {
    getLocationList();
  }, []);

  useEffect(() => {
    if (locationList.length <= 3 && locationList[0]) {
      setSelectedLocation(locationList[0]);
      handleInputChange("location", locationList[0]);
    }
  }, [locationList, handleInputChange]);

  const handleLocationChange = (_, newLoc) => {
    setSelectedLocation(newLoc);
    handleInputChange("location", newLoc);
  };

  // console.log("Location List", locationList);

  return (
    <Box display={"flex"} gap={10}>
      {/* <div className="formLabelAndValue">
        <label>ID</label>
        <p>{formData.id}</p>
      </div> */}
      <div className="formLabelAndValue">
        <label style={{ marginBottom: 6, display: "flex" }}>
          Adjustment Type
          <Asterisk />
        </label>
        <p>{formData.adjustmentType}</p>
      </div>
      <div className="formLabelAndValue">
        <label style={{ marginBottom: 6, display: "flex" }}>
          Date
          <Asterisk />
        </label>
        <p>{formData.date}</p>
      </div>
      {locationList.length <= 3 ? (
        <div className="formLabelAndValue">
          <label style={{ marginBottom: "6px", display: "flex" }}>
            Location
            <Asterisk />
          </label>
          <p>{selectedLoaction?.id || "N/A"}</p>
        </div>
      ) : (
        <div>
          <label style={{ marginBottom: "6px", display: "flex" }}>
            Location
            <Asterisk />
          </label>
          <Autocomplete
            disablePortal
            options={locationList}
            value={selectedLoaction}
            getOptionLabel={(option) => option?.id || ""}
            isOptionEqualToValue={(option, value) =>
              option?.receiptType === value?.id
            }
            onChange={handleLocationChange}
            sx={{ width: "100%", mb: 2 }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Receipt Type"
                sx={{ width: "300px", border: "red" }}
              />
            )}
          />
        </div>
      )}

      <div className="supplierName">
        <label style={{ marginBottom: "6px", display: "flex" }}>
          Notes
          <Asterisk />
        </label>
        <TextField
          type="text"
          value={formData.notes}
          onChange={(e) => handleInputChange("notes", e.target.value)}
          sx={{ width: "100%" }}
          placeholder="Input your notes here"
        />
      </div>
    </Box>
  );
};

const NewStockAdjustment = () => {
  const { tenant_schema_name } = useTenant().tenantData || {};
  const history = useHistory();
  const [formData, setFormData] = useState(defaultFormData);

  // Purchase context
  const { products, fetchProducts } = usePurchase();

  // Stock adjustment context (renamed flags to avoid collision)
  const {
    isLoading: stockLoading,
    // error: stockError,
    createStockAdjustment,
  } = useStockAdjustment();

  // Location context (renamed flags)

  // Fetch once on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Centralized state updater
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Turn [url, unit_code] into an object
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
      transform: (val) => val || "",
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
      warehouse_location: filledData.location.url,
      notes: filledData.notes,
      status: filledData.status,
      is_hidden: false,
      items: filledData.items.map((item) => ({
        product: item.product.url,
        adjusted_quantity: item.qty_received,
      })),
    };

    try {
      const created = await createStockAdjustment(cleanData);
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Stock adjustment created successfully",
      });
      navigateToDetail(created.data.id);
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

  const handleSubmitAsDone = async (filledData) => {
    const cleanData = {
      ...filledData,
      status: "done",
      warehouse_location: filledData.location.url,
      notes: filledData.notes,
      items: filledData.items.map((item) => ({
        product: item.product.url,
        adjusted_quantity: item.qty_received,
      })),
    };

    try {
      const created = await createStockAdjustment(cleanData);
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Stock adjustment marked as done",
      });
      navigateToDetail(created.data.id);
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

  console.log(formData.items);

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
      onSubmit={handleSubmit}
      onSubmitAsDone={handleSubmitAsDone}
      submitBtnText={stockLoading ? "Submitting..." : "Validate"}
      autofillRow={["unit_of_measure", "available_product_quantity"]}
    />
  );
};

export default NewStockAdjustment;
