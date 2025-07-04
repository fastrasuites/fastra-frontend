export function formatDate(isoString) {
  const date = new Date(isoString);
  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // Convert '0' to '12'
  const minutesFormatted = minutes < 10 ? "0" + minutes : minutes;
  return `${day} ${month} ${year} - ${hours}:${minutesFormatted} ${ampm}`;
}

export const normalizedRFQ = (rfqList) =>
  rfqList.map((item) => {
    const segments = item.url.split("/").filter(Boolean);
    const rfqID = segments[segments.length - 1];
    return { url: item.url, rfqID };
  });

export const extractRFQID = (url) => {
  if (!url) {
    console.warn("extractRFQID: url is undefined");
    return ""; // or handle the case appropriately
  }
  const segments = url.split("/").filter(Boolean);
  return segments[segments.length - 1];
};

export const extractId = (url) => {
  if (!url) return "";
  const segments = url.split("/").filter(Boolean);
  return segments[segments.length - 1];
};

export const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// Tab styling function
export const tabStyles = (tabValue, activeTab) => ({
  borderRadius: "4px",
  border: "2px solid",
  borderColor: activeTab === tabValue ? "#976d2" : "grey.400",
  color: activeTab === tabValue ? "#1976d2" : "grey.600",
  fontWeight: activeTab === tabValue ? "bold" : "normal",
  textTransform: "none",
  backgroundColor:
    activeTab === tabValue ? "rgba(25, 118, 210, 0.08)" : "white",
  "&:hover": {
    color: "#1976d2",
    borderColor: "#1976d2",
    backgroundColor: "rgba(25, 118, 210, 0.04)",
  },
});

export const labelMap = {
  stockadjustment: "Stock Adjustment",
  scrap: "Scrap",
  stockmove: "Stock Move",
  incomingproduct: "Incoming Product",
  deliveryorderreturn: "Delivery Order Return",
  deliveryorder: "Delivery Order",
  returnincomingproduct: "Return Incoming Product",
  product: "Product",
  purchaseorder: "Purchase Order",
  requestforquotation: "Request For Quotation",
  unitofmeasure: "Unit Of Measure",
  vendor: "Vendor",
  purchaserequest: "Purchase Request",
};

export const smartFormatLabel = (value) => {
  return (
    labelMap[value] ||
    value
      .split(/(?=[A-Z])/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );
};

export const formatApiDate = (dateString) => {
  const options = {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleString("en-GB", options);
};
