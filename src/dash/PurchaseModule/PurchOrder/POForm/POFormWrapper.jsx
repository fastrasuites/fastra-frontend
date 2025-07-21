import { useLocation } from "react-router-dom";
import POForm from "./POForm";

const POFormWrapper = (props) => {
  const location = useLocation();
  // Extract RFQ data from location state if available
  const conversionRFQ = location.state?.rfq || null;

  return <POForm conversionRFQ={conversionRFQ} {...props} />;
};

export default POFormWrapper;
