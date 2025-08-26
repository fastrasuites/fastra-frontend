import React from "react";
import { extractRFQID } from "../../../helper/helper";

const RfqGrid = ({ quotations = [], handleClick, formatDate, statusColor }) => {
  if (!Array.isArray(quotations) || quotations.length === 0) {
    return (
      <div className="rfqStatusCards">
        <p className="text-gray-500 italic">No quotations available.</p>
      </div>
    );
  }

  return (
    <div className="rfqStatusCards">
      {quotations.map((item) => {
        const rfqId = extractRFQID(item?.purchase_request);
        const vendorName =
          item?.vendor_details?.company_name || "Unknown Vendor";
        const expiryDate = item?.expiry_date
          ? formatDate(item.expiry_date)
          : "No Date";
        const status = item?.status || "N/A";

        return (
          <div
            className="rfqStatusCard cursor-pointer hover:shadow-md transition-shadow"
            key={item?.url}
            onClick={() => handleClick(item)}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === "Enter" && handleClick(item)}
          >
            <p className="rfqStatusCardId">{rfqId}</p>
            <p className="rfqStatusCardVendor">{vendorName}</p>
            <p className="rfqStatusCardDate">{expiryDate}</p>
            <p className="status" style={{ color: statusColor(status) }}>
              {status}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default RfqGrid;
