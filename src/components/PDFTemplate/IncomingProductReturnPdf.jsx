import React from "react";
import fastraSuite from "../../assets/images/fastraSuite.svg";

const IncomingProductReturnPdf = ({ payload, formData }) => {
  const items = payload?.return_incoming_product_items || [];

  const formatDate = (date) => {
    return new Date(date || Date.now()).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div
      id="incoming-return-pdf"
      style={{
        fontFamily: "'Segoe UI', -apple-system, sans-serif",
        backgroundColor: "#ffffff",
        maxWidth: "210mm",
        margin: "0 auto",
        padding: "40px",
        color: "#2d3748",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "40px",
          paddingBottom: "20px",
          borderBottom: "2px solid #e2e8f0",
        }}
      >
        <img src={fastraSuite} alt="FastraSuite" style={{ height: "50px" }} />
        <div style={{ textAlign: "right" }}>
          <h1
            style={{
              margin: 0,
              fontSize: "24px",
              fontWeight: "600",
              color: "#e53e3e",
            }}
          >
            Incoming Product Return
          </h1>
          <p
            style={{
              margin: "5px 0 0 0",
              fontSize: "16px",
              fontWeight: "600",
              color: "#2d3748",
            }}
          >
            {payload?.source_document || "Order"}
          </p>
        </div>
      </div>

      {/* Details */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "30px",
          marginBottom: "40px",
          padding: "25px",
          backgroundColor: "#f8fafc",
          borderRadius: "8px",
          border: "1px solid #e2e8f0",
        }}
      >
        <DetailGroup>
          <DetailItem label="Order ID" value={payload?.source_document} />
          <DetailItem
            label="Source Location"
            value={formData?.source_location}
          />
        </DetailGroup>
        <DetailGroup>
          <DetailItem label="Date Created" value={formData?.date_created} />
          <DetailItem
            label="Returned Date"
            value={formatDate(payload?.returned_date)}
          />
        </DetailGroup>
        <DetailGroup>
          <DetailItem
            label="Reason for Return"
            value={payload?.reason_for_return}
          />
          <DetailItem label="Items Returned" value={items.length} />
        </DetailGroup>
      </div>

      {/* Items Table */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          overflow: "hidden",
          border: "1px solid #e2e8f0",
        }}
      >
        <div
          style={{
            backgroundColor: "#e53e3e",
            color: "#ffffff",
            padding: "15px 20px",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600" }}>
            Returned Items
          </h3>
        </div>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "14px",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f8fafc" }}>
              <th style={headerStyle}>Product</th>
              <th style={headerStyle}>Initial Qty</th>
              <th style={headerStyle}>Return Qty</th>
              <th style={headerStyle}>Unit</th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? (
              items.map((row, idx) => (
                <tr
                  key={idx}
                  style={{
                    backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f8fafc",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  <td style={cellStyle}>{row.product_name || row.product}</td>
                  <td style={{ ...cellStyle, textAlign: "center" }}>
                    {row.quantity_received}
                  </td>
                  <td
                    style={{
                      ...cellStyle,
                      textAlign: "center",
                      color: "#e53e3e",
                      fontWeight: "600",
                    }}
                  >
                    {row.quantity_to_be_returned}
                  </td>
                  <td style={{ ...cellStyle, textAlign: "center" }}>
                    {row.unit_of_measure || "PCS"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#a0aec0",
                  }}
                >
                  No return items specified
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: "40px",
          textAlign: "center",
          fontSize: "12px",
          color: "#718096",
          paddingTop: "20px",
          borderTop: "1px solid #e2e8f0",
        }}
      >
        <p style={{ margin: "0 0 8px 0" }}>
          FastraSuite © {new Date().getFullYear()} | Generated on {formatDate()}
        </p>
        <p style={{ margin: 0 }}>For inquiries, contact: info@bigfixtech.com</p>
      </div>
    </div>
  );
};

// Reusable subcomponents
const DetailGroup = ({ children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
    {children}
  </div>
);

const DetailItem = ({ label, value }) => (
  <div>
    <div style={{ fontSize: "12px", color: "#718096", marginBottom: "4px" }}>
      {label}
    </div>
    <div style={{ fontSize: "14px", color: "#2d3748", fontWeight: "600" }}>
      {value || "N/A"}
    </div>
  </div>
);

const headerStyle = {
  padding: "15px 20px",
  fontWeight: "600",
  color: "#2d3748",
  fontSize: "13px",
  borderBottom: "1px solid #e2e8f0",
};

const cellStyle = {
  padding: "15px 20px",
  borderBottom: "1px solid #f1f5f9",
};

export default IncomingProductReturnPdf;
