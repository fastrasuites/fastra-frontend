import React from "react";
import { useLocation } from "react-router-dom";
import RfqForm from "./RfqForm";

const RFQFormWrapper = (props) => {
  const location = useLocation();
  // Extract conversion data from location.state (using "pr" as key in this example)
  const conversionPR = location.state?.pr || null;
  return <RfqForm conversionRFQ={conversionPR} {...props} />;
};

export default RFQFormWrapper;
