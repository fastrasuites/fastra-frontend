import { createContext, useCallback, useContext, useState } from "react";

const FormContext = createContext();

export const FormProvider = ({ children }) => {
    const [isFormVisible, setIsFormVisible] = useState(false);
  

  // Function to update form data
  const handleOpenForm = useCallback(() => {
     setIsFormVisible(true);
   }, []);

 
   const handleCloseForm = useCallback(() => {
     setIsFormVisible(false);
   }, []);

  return (
    <FormContext.Provider value={{ isFormVisible, handleOpenForm, handleCloseForm }}>
      {children}
    </FormContext.Provider>
  );
};

// Custom hook to use the form context
export const useForm = () => {
  return useContext(FormContext);
};
