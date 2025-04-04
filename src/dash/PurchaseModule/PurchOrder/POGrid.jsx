import React from "react";
import { extractRFQID } from "../../../helper/helper";

const POGrid = ({ purchaseOrders, handleClick, formatDate, statusColor }) => {
  console.log(purchaseOrders);
  return (
    <div className="rfqStatusCards">
      {purchaseOrders.map((item) => (
        <div
          className="rfqStatusCard"
          key={item?.url}
          onClick={() => handleClick(item)}
        >
          <p className="rfqStatusCardId">
            {extractRFQID(item?.id)}
          </p>
          <p className="rfqStatusCardVendor">{item?.vendor.company_name}</p>
          <p className="rfqStatusCardDate">{formatDate(item?.date_created)}</p>
          <p className="status" style={{ color: statusColor(item?.status) }}>
            {item?.status}
          </p>
        </div>
      ))}
      {purchaseOrders?.length === 0 && <p>No quotations available.</p>}
    </div>
  );
};

export default POGrid;
