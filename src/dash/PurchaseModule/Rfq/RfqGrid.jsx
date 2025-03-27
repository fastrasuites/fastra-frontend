import React from 'react'

const RfqGrid = ({quotations, handleClick, formatDate, statusColor}) => {
  return (
    <div className="rfqStatusCards">
    {quotations.map((item) => (
      <div
        className="rfqStatusCard"
        key={item.id}
        onClick={() => handleClick(item)}
      >
        <p className="rfqStatusCardId">{item.purchase_request}</p>
        <p className="rfqStatusCardVendor">{item.vendor}</p>
        <p className="rfqStatusCardDate">{formatDate(item.expiry_date)}</p>
        <p className="status" style={{ color: statusColor(item.status) }}>
          {item.status}
        </p>
      </div>
    ))}
    {quotations.length === 0 && <p>No quotations available.</p>}
  </div>
  )
}

export default RfqGrid