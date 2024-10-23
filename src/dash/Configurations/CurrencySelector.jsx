// CurrencySelector.js
import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const CurrencySelector = ({ savedCurrencies, selectedCurrency, handleCurrencyChange }) => {
  return (
    <FormControl fullWidth>
      <InputLabel>Select Currency</InputLabel>
      <Select
        value={selectedCurrency}
        onChange={handleCurrencyChange}
        label="Select Currency"
      >
        {savedCurrencies.map((currency, index) => (
          <MenuItem key={index} value={currency.name}>
            {currency.name} - {currency.symbol}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default CurrencySelector;
