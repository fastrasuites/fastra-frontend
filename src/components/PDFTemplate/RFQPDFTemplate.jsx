import React from "react";
import fastraSuite from "../../assets/images/fastraSuite.svg";

const PdfTemplate = ({ item }) => {
  const rfqId = item?.url?.split("/").slice(-2, -1)[0] || "RFQ-2024-001";
  const items = item?.items || [];

  const calculateSubtotal = () => {
    return items.reduce((sum, row) => {
      const price = parseFloat(row.estimated_unit_price || 0);
      const qty = parseInt(row.qty || 0, 10);
      return sum + price * qty;
    }, 0);
  };

  const subtotal = calculateSubtotal();

  const formatCurrency = (amount) => {
    const symbol = item?.currency_details?.currency_symbol || "$";
    return `${symbol}${amount.toFixed(2)}`;
  };

  const formatDate = (date) => {
    return new Date(date || Date.now()).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div
      id="pdf-content"
      style={{
        fontFamily: "'Segoe UI', -apple-system, sans-serif",
        backgroundColor: "#ffffff",
        maxWidth: "210mm",
        margin: "0 auto",
        padding: "40px",
        color: "#2d3748",
      }}
    >
      {/* Simple Header */}
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
              color: "#2ba24c",
            }}
          >
            Request For Quotation
          </h1>
          <p
            style={{
              margin: "5px 0 0 0",
              fontSize: "16px",
              fontWeight: "600",
              color: "#667eea",
            }}
          >
            {rfqId}
          </p>
        </div>
      </div>

      {/* RFQ Details */}
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
          <DetailItem label="Status" value={item?.status || "Open"} />
          <DetailItem
            label="Date Opened"
            value={formatDate(item?.date_created)}
          />
        </DetailGroup>

        <DetailGroup>
          <DetailItem
            label="Expiry Date"
            value={formatDate(item?.expiry_date)}
          />
          <DetailItem
            label="Currency"
            value={`${item?.currency_details?.currency_name || "USD"} (${
              item?.currency_details?.currency_symbol || "$"
            })`}
          />
        </DetailGroup>

        <DetailGroup>
          <DetailItem label="Items Count" value={items.length.toString()} />
          <DetailItem
            label="Est. Total"
            value={subtotal > 0 ? formatCurrency(subtotal) : "TBD"}
          />
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
            backgroundColor: "#667eea",
            color: "#ffffff",
            padding: "15px 20px",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: "16px",
              fontWeight: "600",
            }}
          >
            Requested Items
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
              <th style={headerStyle}>Description</th>
              <th
                style={{ ...headerStyle, textAlign: "center", width: "80px" }}
              >
                Qty
              </th>
              <th
                style={{ ...headerStyle, textAlign: "center", width: "60px" }}
              >
                Unit
              </th>
              <th
                style={{ ...headerStyle, textAlign: "right", width: "100px" }}
              >
                Unit Price
              </th>
              <th
                style={{ ...headerStyle, textAlign: "right", width: "100px" }}
              >
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? (
              items.map((row, idx) => {
                const price = parseFloat(row.estimated_unit_price || 0);
                const qty = parseInt(row.qty || 0, 10);
                const total = price * qty;

                return (
                  <tr
                    key={idx}
                    style={{
                      backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f8fafc",
                      borderBottom: "1px solid #e2e8f0",
                    }}
                  >
                    <td style={cellStyle}>
                      <div style={{ fontWeight: "600", color: "#2d3748" }}>
                        {row.product_details?.product_name || "N/A"}
                      </div>
                    </td>
                    <td style={cellStyle}>
                      {row.description || "No description"}
                    </td>
                    <td
                      style={{
                        ...cellStyle,
                        textAlign: "center",
                        fontWeight: "600",
                      }}
                    >
                      {qty || 0}
                    </td>
                    <td
                      style={{
                        ...cellStyle,
                        textAlign: "center",
                        fontSize: "12px",
                        color: "#718096",
                      }}
                    >
                      {row.product_details?.unit_of_measure_details
                        ?.unit_name || "PCS"}
                    </td>
                    <td
                      style={{
                        ...cellStyle,
                        textAlign: "right",
                        fontWeight: "600",
                      }}
                    >
                      {price ? formatCurrency(price) : "TBD"}
                    </td>
                    <td
                      style={{
                        ...cellStyle,
                        textAlign: "right",
                        fontWeight: "700",
                        color: "#667eea",
                      }}
                    >
                      {total ? formatCurrency(total) : "TBD"}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="6"
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#a0aec0",
                    fontSize: "14px",
                  }}
                >
                  No items specified for this RFQ
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Simple Total */}
        {items.length > 0 && subtotal > 0 && (
          <div
            style={{
              backgroundColor: "#f8fafc",
              padding: "20px",
              borderTop: "2px solid #667eea",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: "20px",
              }}
            >
              <span
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#4a5568",
                }}
              >
                Estimated Total:
              </span>
              <span
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "#667eea",
                }}
              >
                {formatCurrency(subtotal)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Simple Footer */}
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

// Helper Components
const DetailGroup = ({ children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
    {children}
  </div>
);

const DetailItem = ({ label, value }) => (
  <div>
    <div
      style={{
        fontSize: "12px",
        color: "#718096",
        fontWeight: "500",
        marginBottom: "4px",
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontSize: "14px",
        color: "#2d3748",
        fontWeight: "600",
      }}
    >
      {value}
    </div>
  </div>
);

// Styles
const headerStyle = {
  padding: "15px 20px",
  fontWeight: "600",
  color: "#2d3748",
  textAlign: "left",
  fontSize: "13px",
  borderBottom: "1px solid #e2e8f0",
};

const cellStyle = {
  padding: "15px 20px",
  borderBottom: "1px solid #f1f5f9",
  verticalAlign: "top",
  lineHeight: "1.4",
};

export default PdfTemplate;
