import React, { useState } from 'react';
import {
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Button,
  TextField,
  Box
} from '@mui/material';
import './ConfigurationForm.css'; 

// Complete list of currencies with symbols
const currencyOptions = [
  { name: 'Naira', symbol: '₦' },
  { name: 'Dollar', symbol: '$' },
  { name: 'Euro', symbol: '€' },
  { name: 'Pound', symbol: '£' },
  { name: 'Yen', symbol: '¥' },
  { name: 'Rupee', symbol: '₹' },
  { name: 'Australian Dollar', symbol: 'A$' },
  { name: 'Canadian Dollar', symbol: 'C$' },
  { name: 'Swiss Franc', symbol: 'CHF' },
  { name: 'Yuan', symbol: '元' },
  { name: 'Krona', symbol: 'kr' },
  { name: 'Ruble', symbol: '₽' },
  { name: 'Rand', symbol: 'R' },
  // Add more currencies as needed
];

const ConfigurationSettings = () => {
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [unitName, setUnitName] = useState('');
  const [unitCategory, setUnitCategory] = useState('');

  // Handle currency name change
  const handleCurrencyChange = (event) => {
    const currency = event.target.value;
    setSelectedCurrency(currency);
    const foundCurrency = currencyOptions.find((cur) => cur.name === currency);
    if (foundCurrency) {
      setSelectedSymbol(foundCurrency.symbol);
    }
  };

  // Handle currency symbol change
  const handleSymbolChange = (event) => {
    setSelectedSymbol(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Handle form submission logic here, e.g., sending data to an API or localStorage
    console.log('Selected Currency:', selectedCurrency);
    console.log('Currency Symbol:', selectedSymbol);
    console.log('Unit Name:', unitName);
    console.log('Unit Category:', unitCategory);
  };

  return (
    <div className="configurations">
    <div className="configuration-header">
      <h1>Configuration</h1>
      <div className="pagination">
        <span>1-6 of 6</span>
        <button className='switch-btn'>
        <button className="prev">◀</button>
        <button className="next">▶</button>
        </button>
      </div>
    </div>

    <Box component="form" onSubmit={handleSubmit} className="configuration-form">
     
     <h2>Currency</h2>
      <hr /> <br /> <br />
      <div className="configuration-card">
      {/* Currency Section */}
      <div className="form-section currency-form-group">
        {/* Dropdown for currency names */}
        <FormControl fullWidth>
          <InputLabel>Currency Name</InputLabel>
          <Select
            value={selectedCurrency}
            onChange={handleCurrencyChange}
            label="Currency Name"
          >
            {currencyOptions.map((currency) => (
              <MenuItem key={currency.name} value={currency.name}>
                {currency.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Dropdown for currency symbols */}
        <FormControl fullWidth>
          <InputLabel>Currency Symbol</InputLabel>
          <Select
            value={selectedSymbol}
            onChange={handleSymbolChange}
            label="Currency Symbol"
          >
            {currencyOptions.map((currency) => (
              <MenuItem key={currency.symbol} value={currency.symbol}>
                {currency.symbol}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
   
      <div className="create-button">
        <Button variant="contained" className='w-65' type="submit">
          Create Currency
        </Button>
      </div>
     </div>
      
      {/* Unit of Measure Section */}
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
  );
};

export default ConfigurationSettings;
