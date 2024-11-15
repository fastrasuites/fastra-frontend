import React, { useState, useEffect } from 'react';
import {
  Box
} from '@mui/material';
import './LocationConfigure.css'; 
import InventoryHeader from '../InventoryHeader';

const LocationConfiguration = () => {
    const [isMultiLocationEnabled, setIsMultiLocationEnabled] = useState(false);

    useEffect(() => {
      // Retrieve the initial state from localStorage or set default to false
      const savedMultiLocationStatus = JSON.parse(localStorage.getItem('multiLocationEnabled'));
      setIsMultiLocationEnabled(savedMultiLocationStatus || false);
    }, []);
  
    const handleSwitchToggle = () => {
      const newStatus = !isMultiLocationEnabled;
      setIsMultiLocationEnabled(newStatus);
      localStorage.setItem('multiLocationEnabled', JSON.stringify(newStatus));
    };

  return (
    <div className='congiure-contain'>
      <InventoryHeader />
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

      <Box component="form" className="configuration-form">
        <h3>Multi Location</h3>
        <hr /> <br /> <br />
        <div className='switch-container'>
        <h3 style={{color: "#000"}}>
        Activate Multi Location</h3>

        <div
          className={`switch ${isMultiLocationEnabled ? "switch-on" : "switch-off"}`}
          onClick={handleSwitchToggle}
        >
          <div className={`switch-handle ${isMultiLocationEnabled ? "switch-handle-on" : ""}`} />
        </div>
        </div>
        
      </Box>

      
    </div></div>
  );
};

export default LocationConfiguration;
