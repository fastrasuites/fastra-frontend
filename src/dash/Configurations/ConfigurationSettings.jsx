import React, { useState, useEffect } from "react";
import { MenuItem, Button, TextField, Box } from "@mui/material";
import "./ConfigurationForm.css";
import PurchaseHeader from "../PurchaseModule/PurchaseHeader";
import { getTenantClient } from "../../services/apiService";
import { useTenant } from "../../context/TenantContext";
import { usePurchase } from "../../context/PurchaseContext";
import Swal from "sweetalert2";

const ConfigurationSettings = () => {
  const [selectedCurrency, setSelectedCurrency] = useState({
    currency_name: "",
    currency_symbol: "",
  });
  const [unitName, setUnitName] = useState("");
  const [unitCategory, setUnitCategory] = useState("");
  const [savedUnits, setSavedUnits] = useState([]);

  const { tenantData } = useTenant();
  const { tenant_schema_name, access_token } = tenantData || {};
  const client = getTenantClient(tenant_schema_name, access_token);

  const { createCurrency } = usePurchase();

  const currencyOptions = [
    { currency_name: "NGN", currency_symbol: "₦" },
    { currency_name: "USD", currency_symbol: "$" },
    { currency_name: "EUR", currency_symbol: "€" },
    { currency_name: "GBP", currency_symbol: "£" },
    { currency_name: "JPY", currency_symbol: "¥" },
  ];

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("savedUnits")) || [];
    setSavedUnits(saved);
  }, []);

  const handleCurrencySubmit = async (event) => {
    event.preventDefault();

    const { currency_name, currency_symbol } = selectedCurrency;

    if (!currency_name || !currency_symbol) {
      return Swal.fire({
        icon: "warning",
        title: "Incomplete Fields",
        text: "Please select or type a valid currency name and symbol.",
      });
    }

    try {
      await createCurrency(selectedCurrency);
      setSelectedCurrency({ currency_name: "", currency_symbol: "" });

      Swal.fire({
        icon: "success",
        title: "Currency Created",
        text: "Currency created successfully!",
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Creation Failed",
        text: "Error creating currency. Please try again.",
      });
    }
  };

  const handleUnitSubmit = async (event) => {
    event.preventDefault();

    if (!unitName.trim() || !unitCategory.trim()) {
      return Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill in both Unit Name and Unit Category.",
      });
    }

    const newUnit = {
      unit_name: unitName.trim(),
      unit_category: unitCategory.trim(),
    };
    const updatedUnits = [...savedUnits, newUnit];

    localStorage.setItem("savedUnits", JSON.stringify(updatedUnits));
    setSavedUnits(updatedUnits);

    try {
      const response = await client.post(`/purchase/unit-of-measure/`, newUnit);
      console.log(response.data);

      Swal.fire({
        icon: "success",
        title: "Unit Created",
        text: "Unit of measure created successfully!",
      });
    } catch (err) {
      console.error("Error saving unit-measure:", err);
      Swal.fire({
        icon: "error",
        title: "Save Failed",
        text: "Failed to save unit of measure. Please try again.",
      });
    }

    setUnitName("");
    setUnitCategory("");
  };

  return (
    <Box>
      <PurchaseHeader />
      <Box pr={6} py={4}>
        <div className="configuration-header">
          <h1>Configuration</h1>
        </div>

        <Box
          component="form"
          onSubmit={handleCurrencySubmit}
          className="configuration-form"
        >
          <h2>Currency</h2>
          <hr /> <br /> <br />
          <div className="configuration-card">
            <div className="form-section currency-form-group">
              <TextField
                label="Currency Name"
                value={selectedCurrency.currency_name}
                onChange={(e) =>
                  setSelectedCurrency({
                    ...selectedCurrency,
                    currency_name: e.target.value,
                  })
                }
                fullWidth
              />

              <TextField
                select
                label="Currency Symbol"
                value={selectedCurrency.currency_symbol}
                onChange={(e) =>
                  setSelectedCurrency({
                    ...selectedCurrency,
                    currency_symbol: e.target.value,
                  })
                }
                fullWidth
              >
                {currencyOptions.map((currency) => (
                  <MenuItem
                    key={currency.currency_symbol}
                    value={currency.currency_symbol}
                  >
                    {currency.currency_symbol}
                  </MenuItem>
                ))}
              </TextField>
            </div>

            <div className="create-button">
              <Button variant="contained" className="w-65" type="submit">
                Create Currency
              </Button>
            </div>
          </div>
        </Box>

        <Box
          component="form"
          onSubmit={handleUnitSubmit}
          className="configuration-form"
        >
          <h3>Unit of Measure</h3>
          <hr /> <br /> <br />
          <div className="configuration-card">
            <div className="form-section unit-measure-form-group">
              <TextField
                label="Unit Name"
                value={unitName}
                onChange={(e) => setUnitName(e.target.value)}
                fullWidth
              />
              <TextField
                label="Unit Category"
                value={unitCategory}
                onChange={(e) => setUnitCategory(e.target.value)}
                fullWidth
              />
            </div>

            <div className="create-button">
              <Button variant="contained" type="submit">
                Create Unit of Measure
              </Button>
            </div>
          </div>
        </Box>
      </Box>
    </Box>
  );
};

export default ConfigurationSettings;
