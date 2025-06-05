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
