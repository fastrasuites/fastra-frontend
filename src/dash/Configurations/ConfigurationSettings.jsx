import React, { useState, useEffect } from "react";
import {
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Button,
  TextField,
  Box,
} from "@mui/material";
import "./ConfigurationForm.css";
import PurchaseHeader from "../PurchaseModule/PurchaseHeader";
import { getTenantClient } from "../../services/apiService";
import { useTenant } from "../../context/TenantContext";
import { usePurchase } from "../../context/PurchaseContext";

const ConfigurationSettings = () => {
  // const [selectedCurrency, setSelectedCurrency] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState({
    currency_name: "",
    currency_symbol: "",
  });
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [unitName, setUnitName] = useState("");
  const [unitCategory, setUnitCategory] = useState("");
  const [savedCurrencies, setSavedCurrencies] = useState([]);
  const [savedUnits, setSavedUnits] = useState([]);

  const { tenantData } = useTenant();
  const { tenant_schema_name, access_token } = tenantData || {};
  const client = getTenantClient(tenant_schema_name, access_token);

  const { createCurrency, currencie } = usePurchase();

  // Complete list of currencies with symbols
  const currencyOptions = [
    { currency_name: "NGN", currency_symbol: "₦" },
    { currency_name: "USD", currency_symbol: "$" },
    { currency_name: "EUR", currency_symbol: "€" },
    { currency_name: "GBP", currency_symbol: "£" },
    { currency_name: "JPY", currency_symbol: "¥" },
  ];

  useEffect(() => {
    // const savedCurrencies =
    //   JSON.parse(localStorage.getItem("savedCurrencies")) || [];
    // setSavedCurrencies(savedCurrencies);
    const savedUnits = JSON.parse(localStorage.getItem("savedUnits")) || [];
    setSavedUnits(savedUnits);
  }, []);

  // Handle the selection or typing of the currency name
  const handleCurrencyChange = (event) => {
    const currency = event.target.value;
    setSelectedCurrency(currency);

    // Try to find the currency symbol from the options
    const foundCurrency = currencyOptions.find(
      (cur) => cur.name.toLowerCase() === currency.toLowerCase()
    );
    if (foundCurrency) {
      setSelectedSymbol(foundCurrency.symbol);
    } else {
      setSelectedSymbol("");
    }
  };

  // Handle currency symbol change when manually selected
  const handleSymbolChange = (event) => {
    setSelectedSymbol(event.target.value);
  };

  // Handle submission for creating a currency
  const handleCurrencySubmit = async (event) => {
    event.preventDefault();

    if (!selectedCurrency.currency_name || !selectedCurrency.currency_symbol) {
      alert("Please select or type a valid currency name and symbol.");
      return;
    }

    try {
      await createCurrency(selectedCurrency);
      setSelectedCurrency({ currency_name: "", currency_symbol: "" });
      alert("Currency created successfully!");
    } catch (err) {
      alert("Error creating currency");
    }
  };

  // Handle submission for creating a unit of measure
  const handleUnitSubmit = async (event) => {
    event.preventDefault();

    const newUnit = { unit_name: unitName, unit_category: unitCategory };
    const updatedUnits = [...savedUnits, newUnit];
    localStorage.setItem("savedUnits", JSON.stringify(updatedUnits));
    setSavedUnits(updatedUnits);

    // Reset unit form fields
    console.log(newUnit);
    try {
      const response = await client.post(`/purchase/unit-of-measure/`, newUnit);
      console.log(response.data);
    } catch (err) {
      console.error("Error saving unit-measure:", err);
    }

    setUnitName("");
    setUnitCategory("");
  };

  return (
    <div className="congiure-contain">
      <PurchaseHeader />
      <div className="configurations">
        <div className="configuration-header">
          <h1>Configuration</h1>
          <div className="pagination">
            <span>1-6 of 6</span>
            <button className="switch-btn">
              <button className="prev">◀</button>
              <button className="next">▶</button>
            </button>
          </div>
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
              {/* Currency Name with dropdown and ability to type */}
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
                // select
                // SelectProps={{
                //   native: true,
                // }}
              >
                {currencyOptions.map((currency) => (
                  <MenuItem
                    key={currency.currency_name}
                    value={currency.currency_name}
                  >
                    {currency.currency_name}
                  </MenuItem>
                ))}
              </TextField>

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
      </div>
    </div>
  );
};

export default ConfigurationSettings;
