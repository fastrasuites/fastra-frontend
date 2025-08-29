import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Box,
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import "./ConfigurationForm.css";
import PurchaseHeader from "../PurchaseModule/PurchaseHeader";
import { getTenantClient } from "../../services/apiService";
import { useTenant } from "../../context/TenantContext";
import { usePurchase } from "../../context/PurchaseContext";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";

const ConfigurationSettings = () => {
  const [selectedCurrency, setSelectedCurrency] = useState({
    currency_name: "",
    currency_code: "",
    currency_symbol: "",
    is_hidden: false,
  });

  const [unitName, setUnitName] = useState("");
  const [unitSymbol, setUnitSymbol] = useState("");
  const [unitCategory, setUnitCategory] = useState("");
  const [savedUnits, setSavedUnits] = useState([]);
  const [currencyOptions, setCurrencyOptions] = useState([]);

  const [loadingCurrencies, setLoadingCurrencies] = useState(false);
  const [errorCurrencies, setErrorCurrencies] = useState(null);

  const { tenantData } = useTenant();
  const { tenant_schema_name, access_token } = tenantData || {};
  const client = getTenantClient(tenant_schema_name, access_token);

  const { createCurrency } = usePurchase();

  /** Fetch currencies from RestCountries */
  useEffect(() => {
    const fetchCurrencies = async () => {
      setLoadingCurrencies(true);
      setErrorCurrencies(null);

      try {
        const res = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,currencies"
        );

        if (!res.ok) throw new Error("Failed to fetch currencies");

        const data = await res.json();
        const options = [];

        data.forEach((country) => {
          const countryName = country?.name?.common;
          const currencies = country?.currencies || {};

          Object.entries(currencies).forEach(([code, cur]) => {
            options.push({
              country: countryName,
              currency_name: cur.name,
              currency_code: code,
              currency_symbol: cur.symbol || "",
            });
          });
        });

        // Remove duplicates by currency code
        const unique = Object.values(
          options.reduce((acc, cur) => {
            acc[cur.currency_code] = cur;
            return acc;
          }, {})
        );

        unique.sort((a, b) => a.currency_name.localeCompare(b.currency_name));
        setCurrencyOptions(unique);
      } catch (err) {
        console.error("Error fetching currencies:", err);
        setErrorCurrencies("Could not load currency list.");
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch currency data. Please refresh.",
        });
      } finally {
        setLoadingCurrencies(false);
      }
    };

    fetchCurrencies();

    const saved = JSON.parse(localStorage.getItem("savedUnits")) || [];
    setSavedUnits(saved);
  }, []);

  /** Submit Currency */
  const handleCurrencySubmit = async (event) => {
    event.preventDefault();

    const { currency_name, currency_code, currency_symbol } = selectedCurrency;
    if (!currency_name || !currency_code || !currency_symbol) {
      return Swal.fire({
        icon: "warning",
        title: "Incomplete Fields",
        text: "Please select or type a valid currency name, code, and symbol.",
      });
    }

    try {
      await createCurrency(selectedCurrency);

      setSelectedCurrency({
        currency_name: "",
        currency_code: "",
        currency_symbol: "",
        is_hidden: false,
      });

      Swal.fire({
        icon: "success",
        title: "Currency Created",
        text: "Currency created successfully!",
      });
    } catch (err) {
      console.error("Currency creation failed:", err);

      let message = "Error creating currency. Please try again.";

      if (err.response?.data) {
        // Collect all error messages into a string
        const errors = err.response.data;
        message = Object.values(errors).flat().join("\n");
      }

      Swal.fire({
        icon: "error",
        title: "Creation Failed",
        text: message,
      });
    }
  };

  /** Submit Unit of Measure */
  const handleUnitSubmit = async (event) => {
    event.preventDefault();

    if (!unitName.trim() || !unitCategory.trim() || !unitSymbol.trim()) {
      return Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill in Unit Name, Symbol and Category.",
      });
    }

    const newUnit = {
      unit_name: unitName.trim(),
      unit_symbol: unitSymbol.trim(),
      unit_category: unitCategory.trim(),
      is_hidden: false,
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

      let message = "Failed to save unit of measure. Please try again.";

      if (err.response?.data) {
        // Collect backend validation messages
        const errors = err.response.data;
        message = Object.values(errors).flat().join("\n");
      }

      Swal.fire({
        icon: "error",
        title: "Save Failed",
        text: message,
      });
    }
    setUnitName("");
    setUnitSymbol("");
    setUnitCategory("");
  };

  return (
    <Box>
      <Box pr={6} py={4}>
        <div className="configuration-header">
          <h1>Configuration</h1>
        </div>

        {/* Currency Form */}
        <Box
          component="form"
          onSubmit={handleCurrencySubmit}
          className="configuration-form"
        >
          <h2>Currency</h2>
          <hr /> <br /> <br />
          <div className="configuration-card">
            {loadingCurrencies && (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <CircularProgress size={20} />
                <span>Loading currencies...</span>
              </div>
            )}
            {errorCurrencies && (
              <p style={{ color: "red" }}>{errorCurrencies}</p>
            )}

            <div
              className="form-section currency-form-group"
              style={{ gap: 16 }}
            >
              {/* Currency Dropdown */}
              <Autocomplete
                options={currencyOptions.map(
                  (c) =>
                    `${c.currency_name} (${c.currency_code}) - ${c.country}`
                )}
                value={
                  selectedCurrency.currency_name
                    ? `${selectedCurrency.currency_name} (${selectedCurrency.currency_code})`
                    : ""
                }
                onChange={(event, newValue) => {
                  const match = currencyOptions.find(
                    (c) =>
                      `${c.currency_name} (${c.currency_code}) - ${c.country}` ===
                      newValue
                  );
                  if (match) {
                    setSelectedCurrency({
                      currency_name: match.currency_name,
                      currency_code: match.currency_code,
                      currency_symbol: match.currency_symbol,
                      is_hidden: false,
                    });
                  }
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Currency" fullWidth />
                )}
              />

              {/* Currency Symbol */}
              <TextField
                label="Currency Symbol"
                value={selectedCurrency.currency_symbol}
                onChange={(e) =>
                  setSelectedCurrency((prev) => ({
                    ...prev,
                    currency_symbol: e.target.value,
                  }))
                }
                fullWidth
              />
            </div>

            <div className="create-button">
              <Button variant="contained" className="w-65" type="submit">
                Create Currency
              </Button>
            </div>
            <Box
              sx={{ pt: 2, mt: 3 }}
              display={"flex"}
              justifyContent={"end"}
              borderTop={"1px solid #dedcdcff"}
            >
              <Link
                to={`/${tenantData.tenant_schema_name}/purchase/configurations/currencies`}
              >
                <Button variant="contained" disableElevation>
                  View Currency List
                </Button>
              </Link>
            </Box>
          </div>
        </Box>

        {/* Unit of Measure Form */}
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
                label="Unit Symbol"
                value={unitSymbol}
                onChange={(e) => setUnitSymbol(e.target.value)}
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
            <Box
              sx={{ pt: 2, mt: 3 }}
              display={"flex"}
              justifyContent={"end"}
              borderTop={"1px solid #dedcdcff"}
            >
              <Link
                to={`/${tenantData.tenant_schema_name}/purchase/configurations/unit_of_measure`}
              >
                <Button variant="contained" disableElevation>
                  View Unit of Measure List
                </Button>
              </Link>
            </Box>
          </div>
        </Box>
      </Box>
    </Box>
  );
};

export default ConfigurationSettings;
