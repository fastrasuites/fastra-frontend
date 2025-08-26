import React from "react";
import PropTypes from "prop-types";
import { extractRFQID } from "../../../helper/helper";
import { Box, Typography } from "@mui/material";

const PurchaseRequestGrid = ({
  quotations = [],
  handleClick,
  formatDate,
  statusColor,
}) => {
  const renderQuotationCard = (item) => {
    const id = extractRFQID(item?.url);
    const vendor = item?.vendor_details?.company_name || "Unknown Vendor";
    const createdDate = formatDate?.(item?.date_created) || "N/A";
    const totalPrice = item?.pr_total_price || 0;
    const status = item?.status || "Unknown";
    const statusStyle = { color: statusColor?.(status) };

    console.log(quotations);

    return (
      <div
        className="rfqStatusCard"
        key={item?.url}
        onClick={() => handleClick?.(item)}
      >
        <Typography className="cardid" variant="body2" fontWeight="bold">
          {id}
        </Typography>

        <Typography className="rfqStatusCardVendor" variant="body1">
          {vendor}
        </Typography>

        <Typography className="rfqStatusCardDate" variant="body2">
          {createdDate}
        </Typography>

        <Typography className="rfqStatusCardDate" variant="body2">
          ₦{totalPrice.toLocaleString()}
        </Typography>

        <Box display={"flex"} alignItems={"center"}>
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: statusColor(status),
              mr: 1,
            }}
          />
          <Typography
            className="status"
            textTransform={"capitalize"}
            style={statusStyle}
          >
            {status}
          </Typography>
        </Box>
      </div>
    );
  };

  return (
    <div className="rfqStatusCards">
      {quotations.length > 0 ? (
        quotations.map(renderQuotationCard)
      ) : (
        <p className="noQuotationsMessage">No quotations available.</p>
      )}
    </div>
  );
};

PurchaseRequestGrid.propTypes = {
  quotations: PropTypes.array.isRequired,
  handleClick: PropTypes.func.isRequired,
  formatDate: PropTypes.func.isRequired,
  statusColor: PropTypes.func.isRequired,
};

export default PurchaseRequestGrid;
