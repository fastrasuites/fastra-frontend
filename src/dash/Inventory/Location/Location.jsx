import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import InventoryHeader from '../InventoryHeader';
import LocationStep from './LocationStep';

const Location = () => {
  // Used by Purchase Module wizard ===========================
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.step) {
      setCurrentStep(location.state.step);
      setIsModalOpen(true);
    } else {
      const timer = setTimeout(() => {
        setIsModalOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  // End ---------------------------------------------------------------------------
  
  return (
    <div>
      <InventoryHeader />
    
      <LocationStep 
          open={isModalOpen}
          onClose={handleCloseModal}
          step={currentStep}
        />
    </div>
  );
};

export default Location;
