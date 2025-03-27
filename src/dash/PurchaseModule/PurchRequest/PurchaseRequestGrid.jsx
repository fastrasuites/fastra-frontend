import React from "react";
import { extractRFQID } from "../../../helper/helper";

const PurchaseRequestGrid = ({
  quotations,
  handleClick,
  formatDate,
  statusColor,
}) => {
  return (
    <div className="rfqStatusCards">
      {quotations.map((item) => (
        <div
          className="rfqStatusCard"
          key={item?.url}
          onClick={() => handleClick(item)}
        >
          <p className="cardid">{extractRFQID(item?.url)}</p>
          <p className="rfqStatusCardVendor">{item?.vendor.company_name}</p>
          <p className="rfqStatusCardDate">{formatDate(item?.date_created)}</p>
          <p className="status" style={{ color: statusColor(item?.status) }}>
            {item?.status}
          </p>
        </div>
      ))}
      {quotations?.length === 0 && <p>No quotations available.</p>}
    </div>
  );
};

export default PurchaseRequestGrid;
