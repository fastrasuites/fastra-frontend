import React, { useState, useEffect } from 'react';
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
import PurchaseHeader from '../PurchaseModule/PurchaseHeader';
import { getTenantClient } from "../../services/apiService";
import { useTenant } from "../../context/TenantContext";


const ConfigurationSettings = () => {
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [unitName, setUnitName] = useState('');
  const [unitCategory, setUnitCategory] = useState('');
  const [savedCurrencies, setSavedCurrencies] = useState([]);
  const [savedUnits, setSavedUnits] = useState([]);

  const { tenantData } = useTenant();
  const { tenant_schema_name, access_token } = tenantData || {};
  const client = getTenantClient(tenant_schema_name, access_token);
  
  // Complete list of currencies with symbols
  const currencyOptions = [
    { name: 'Currency Name' },
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
    { name: 'Rand', symbol: 'R' }
  ];

  useEffect(() => {
    const savedCurrencies = JSON.parse(localStorage.getItem('savedCurrencies')) || [];
    const savedUnits = JSON.parse(localStorage.getItem('savedUnits')) || [];
    setSavedCurrencies(savedCurrencies);
    setSavedUnits(savedUnits);
  }, []);

  // Handle the selection or typing of the currency name
  const handleCurrencyChange = (event) => {
    const currency = event.target.value;
    setSelectedCurrency(currency);
    
    // Try to find the currency symbol from the options
    const foundCurrency = currencyOptions.find((cur) => cur.name.toLowerCase() === currency.toLowerCase());
    if (foundCurrency) {
      setSelectedSymbol(foundCurrency.symbol);
    } else {
      setSelectedSymbol('');
    }
  };

  // Handle currency symbol change when manually selected
  const handleSymbolChange = (event) => {
    setSelectedSymbol(event.target.value);
  };

  // Handle submission for creating a currency
  const handleCurrencySubmit = (event) => {
    event.preventDefault();

    if (!selectedCurrency || !selectedSymbol) {
      alert('Please select or type a valid currency name and symbol.');
      return;
    }

    const newCurrency = { name: selectedCurrency, symbol: selectedSymbol };
    const updatedCurrencies = [...savedCurrencies, newCurrency];
    localStorage.setItem('savedCurrencies', JSON.stringify(updatedCurrencies));
    setSavedCurrencies(updatedCurrencies);

    // Reset form fields
    setSelectedCurrency('');
    setSelectedSymbol('');
  };

  // Handle submission for creating a unit of measure
  const handleUnitSubmit = async (event) => {
    event.preventDefault();

    const newUnit = { unit_name: unitName, unit_category: unitCategory };
    const updatedUnits = [...savedUnits, newUnit];
    localStorage.setItem('savedUnits', JSON.stringify(updatedUnits));
    setSavedUnits(updatedUnits);

    // Reset unit form fields
    console.log(newUnit)
    try {
      const response = await client.post(`/purchase/unit-of-measure/`, newUnit);
        console.log(response.data)
    } catch (err) {
      console.error("Error saving unit-measure:", err);
    }

    setUnitName('');
    setUnitCategory('');
  };

  return (
    <div className='congiure-contain'>
      <PurchaseHeader />
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

        <Box component="form" onSubmit={handleCurrencySubmit} className="configuration-form">
          <h2>Currency</h2>
          <hr /> <br /> <br />
          <div className="configuration-card">
            <div className="form-section currency-form-group">
              {/* Currency Name with dropdown and ability to type */}
              <TextField
                // label="Currency Name"
                value={selectedCurrency}
                onChange={handleCurrencyChange}
                fullWidth
                select
                SelectProps={{
                  native: true,
                }}
              >
                {currencyOptions.map((currency) => (
                  <option key={currency.name} value={currency.name}>
                    {currency.name}
                  </option>
                ))}
              </TextField>

              {/* Currency Symbol dropdown */}
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
        </Box>

        <Box component="form" onSubmit={handleUnitSubmit} className="configuration-form">
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


// import React, { useState, useEffect } from 'react';
// import {
//   MenuItem,
//   FormControl,
//   InputLabel,
//   Select,
//   Button,
//   TextField,
//   Box
// } from '@mui/material';
// import './ConfigurationForm.css'; 
// import PurchaseHeader from '../PurchaseModule/PurchaseHeader';

// const ConfigurationSettings = () => {
//   const [selectedCurrency, setSelectedCurrency] = useState('');
//   const [selectedSymbol, setSelectedSymbol] = useState('');
//   const [unitName, setUnitName] = useState('');
//   const [unitCategory, setUnitCategory] = useState('');
//   const [savedCurrencies, setSavedCurrencies] = useState([]);
//   const [savedUnits, setSavedUnits] = useState([]);  // Added state for saved units

//   // Complete list of currencies with symbols
//   const currencyOptions = [
//     { name: 'Naira', symbol: '₦' },
//     { name: 'Dollar', symbol: '$' },
//     { name: 'Euro', symbol: '€' },
//     { name: 'Pound', symbol: '£' },
//     { name: 'Yen', symbol: '¥' },
//     { name: 'Rupee', symbol: '₹' },
//     { name: 'Australian Dollar', symbol: 'A$' },
//     { name: 'Canadian Dollar', symbol: 'C$' },
//     { name: 'Swiss Franc', symbol: 'CHF' },
//     { name: 'Yuan', symbol: '元' },
//     { name: 'Krona', symbol: 'kr' },
//     { name: 'Ruble', symbol: '₽' },
//     { name: 'Rand', symbol: 'R' }
//   ];

//   useEffect(() => {
//     // Load saved currencies and units from localStorage on component mount
//     const savedCurrencies = JSON.parse(localStorage.getItem('savedCurrencies')) || [];
//     const savedUnits = JSON.parse(localStorage.getItem('savedUnits')) || [];  // Load saved units
//     setSavedCurrencies(savedCurrencies);
//     setSavedUnits(savedUnits);  // Set saved units
//   }, []);

//   const handleCurrencyChange = (event) => {
//     const currency = event.target.value;
//     setSelectedCurrency(currency);
//     const foundCurrency = currencyOptions.find((cur) => cur.name === currency);
//     if (foundCurrency) {
//       setSelectedSymbol(foundCurrency.symbol);
//     }
//   };

//   const handleSymbolChange = (event) => {
//     setSelectedSymbol(event.target.value);
//   };

//   // Handle submission for creating a currency
//   const handleCurrencySubmit = (event) => {
//     event.preventDefault();

//     // Save the selected currency to localStorage
//     const newCurrency = { name: selectedCurrency, symbol: selectedSymbol };
//     const updatedCurrencies = [...savedCurrencies, newCurrency];
//     localStorage.setItem('savedCurrencies', JSON.stringify(updatedCurrencies));
//     setSavedCurrencies(updatedCurrencies);

//     // Log the saved values
//     console.log("Saved Currency:", newCurrency);

//     // Reset currency form fields
//     setSelectedCurrency('');
//     setSelectedSymbol('');
//   };

//   // Handle submission for creating a unit of measure
//   const handleUnitSubmit = (event) => {
//     event.preventDefault();

//     // Save the unit name and unit category to localStorage
//     const newUnit = { unitName: unitName, unitCategory: unitCategory };
//     const updatedUnits = [...savedUnits, newUnit];
//     localStorage.setItem('savedUnits', JSON.stringify(updatedUnits));
//     setSavedUnits(updatedUnits);

//     // Log the saved values
//     console.log("Saved Unit:", newUnit);

//     // Reset unit form fields
//     setUnitName('');
//     setUnitCategory('');
//   };

//   return (
//     <div className='congiure-contain'>
//       <PurchaseHeader />
//     <div className="configurations">
//       <div className="configuration-header">
//         <h1>Configuration</h1>
//         <div className="pagination">
//           <span>1-6 of 6</span>
//           <button className='switch-btn'>
//             <button className="prev">◀</button>
//             <button className="next">▶</button>
//           </button>
//         </div>
//       </div>

//       <Box component="form" onSubmit={handleCurrencySubmit} className="configuration-form">
//         <h2>Currency</h2>
//         <hr /> <br /> <br />
//         <div className="configuration-card">
//           <div className="form-section currency-form-group">
//             <FormControl fullWidth>
//               <InputLabel>Currency Name</InputLabel>
//               <Select
//                 value={selectedCurrency}
//                 onChange={handleCurrencyChange}
//                 label="Currency Name"
//               >
//                 {currencyOptions.map((currency) => (
//                   <MenuItem key={currency.name} value={currency.name}>
//                     {currency.name}
//                   </MenuItem>
//                 ))}
//               </Select>
//             </FormControl>

//             <FormControl fullWidth>
//               <InputLabel>Currency Symbol</InputLabel>
//               <Select
//                 value={selectedSymbol}
//                 onChange={handleSymbolChange}
//                 label="Currency Symbol"
//               >
//                 {currencyOptions.map((currency) => (
//                   <MenuItem key={currency.symbol} value={currency.symbol}>
//                     {currency.symbol}
//                   </MenuItem>
//                 ))}
//               </Select>
//             </FormControl>
//           </div>

//           <div className="create-button">
//             <Button variant="contained" className='w-65' type="submit">
//               Create Currency
//             </Button>
//           </div>
//         </div>
//       </Box>

//       <Box component="form" onSubmit={handleUnitSubmit} className="configuration-form">
//         <h3>Unit of Measure</h3>
//         <hr /> <br /> <br />
//         <div className="configuration-card">
//           <div className="form-section unit-measure-form-group">
//             <TextField
//               label="Unit Name"
//               value={unitName}
//               onChange={(e) => setUnitName(e.target.value)}
//               fullWidth
//             />
//             <TextField
//               label="Unit Category"
//               value={unitCategory}
//               onChange={(e) => setUnitCategory(e.target.value)}
//               fullWidth
//             />
//           </div>

//           <div className="create-button">
//             <Button variant="contained" type="submit">
//               Create Unit of Measure
//             </Button>
//           </div>
//         </div>
//       </Box>

//       {/* Display saved currencies */}
//       {/* <div className="saved-currencies">
//         <FormControl fullWidth>
//           <h3>Saved Currencies:</h3>
//           <ul>
//             {savedCurrencies.map((currency, index) => (
//               <li key={index}>
//                 {currency.name} - {currency.symbol}
//               </li>
//             ))}
//           </ul>
//         </FormControl>
//       </div> */}

//       {/* Display saved units */}
//       {/* <div className="saved-units">
//         <FormControl fullWidth>
//           <h3>Saved Units:</h3>
//           <ul>
//             {savedUnits.map((unit, index) => (
//               <li key={index}>
//                 {unit.unitName} - {unit.unitCategory}
//               </li>
//             ))}
//           </ul>
//         </FormControl>
//       </div> */}
//     </div></div>
//   );
// };

// export default ConfigurationSettings;
