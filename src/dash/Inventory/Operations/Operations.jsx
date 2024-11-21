import React, { useState } from "react";
import InventoryHeader from "../InventoryHeader";
import draft from "../../../image/icons/draft.png";
import "./Operations.css";
import styled from "styled-components";
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
} from "@mui/material";
import IncomingProductManualForm from "./IncomingProductManualForm";
import IncomingProductManualListview from "./IncomingProductManualListview";

const Operations = () => {
  const [selectedLocation, setSelectedLocation] = useState("");
  const [showNewIncomingProductForm, setShowNewIncomingProductForm] =
    useState(false);
  const options = ["Suppliers location", "Customers location"];

  const handleChange = (event) => {
    setSelectedLocation(event.target.value);
  };

  const pendingIncomingProductCount = [
    "A",
    "B",
    "C",
    "A",
    "B",
    "C",
    "A",
    "B",
    "C",
    "A",
    "B",
    "C",
  ].length;
  const pendingDeliveryOrderCount = ["A", "B", "C"].length;
  const pendingInternalTransferCount = ["A", "B"].length;
  const pendingReturnsCount = ["A", "B", "C", "A", "B", "C"].length;
  const pendingManufacturingCount = ["A", "B", "C", "A", "B"].length;

  return (
    <div>
      <InventoryHeader />
      <div className="operation-wrapper">
        {showNewIncomingProductForm ? (
          <IncomingProductManualForm />
        ) : (
          <>
            {/* Operations and Select Location */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "10px",
                marginTop: "40px",
                marginBottom: "26px",
              }}
            >
              <OperationsHeadingText>Operations</OperationsHeadingText>
              {/* Select Location */}
              <FormControl
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    width: "200px",
                    height: "48px",
                    padding: "0 24px",
                    fontFamily: "Product Sans",
                    fontSize: "14px",
                    fontWeight: "400",
                    borderRadius: "4px",
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#7A8A98",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#7A8A98",
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderTop: "none",
                      borderLeft: "none",
                      borderRight: "none",
                      borderBottom: "2px solid #7A8A98", // Bottom border only
                    },
                  },
                }}
              >
                <InputLabel>Select Location</InputLabel>
                <Select
                  value={selectedLocation}
                  onChange={handleChange}
                  label="Select location"
                >
                  {options.map((option, index) => (
                    <MenuItem key={index} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            {/* pending-boxes-container */}
            <div className="pending-boxes-container">
              {/* Pending Incoming Product */}
              <PendingBox
                pendingText="Pending Incoming Product"
                colorValue="#4482EE"
                count={pendingIncomingProductCount}
                id="pending-incoming-product"
                onClick={() => alert("List not ready, check back later")}
              />

              {/* Pending Delivery Order */}
              <PendingBox
                pendingText="Pending Delivery Orders"
                colorValue="#E43D2B"
                count={pendingDeliveryOrderCount}
                id="pending-delivery-orders"
                onClick={() => alert("List not ready, check back later")}
              />

              {/* Pending Internal Transfer */}
              <PendingBox
                pendingText="Pending Internal Transfer"
                colorValue="#2BA24D"
                count={pendingInternalTransferCount}
                id="pending-internal-transfer"
                onClick={() => alert("List not ready, check back later")}
              />

              {/* Pending Returns */}
              <PendingBox
                pendingText="Pending Returns"
                colorValue="#d3a006"
                count={pendingReturnsCount}
                id="pending-returns"
                onClick={() => alert("List not ready, check back later")}
              />

              {/* Manufacturing Returns */}
              <PendingBox
                pendingText="Manufacturing Returns"
                colorValue="#593BED"
                count={pendingManufacturingCount}
                id="manufacturing-returns"
                onClick={() => alert("List not ready, check back later")}
              />
            </div>
            {/* Buttons and Search  */}
            <div className="button-and-search-container">
              <button
                className="new-incoming-product-btn"
                onClick={() => {
                  setShowNewIncomingProductForm(true);
                }}
              >
                New Incoming Product
              </button>
              <button className="view-incoming-purchase-order-btn">
                view-incoming-purchase-order
              </button>
              {/* Still remain others */}
            </div>

            <IncomingProductManualListview />
          </>
        )}
      </div>
    </div>
  );
};

export default Operations;

// PENDING BOX COMPONENT
const PendingBox = ({
  pendingText,
  icon = draft,
  colorValue,
  count,
  ...props
}) => {
  return (
    <div
      style={{
        color: "#FAFAFA",
        padding: "16px 22px 16px 16px",
        backgroundColor: colorValue,
        border: `1.5px solid ${colorValue}`,
        boxShadow: "0px 4px 4px 0px #00000040",
        borderRadius: "4px",
        minWidth: "178px",
        cursor: "pointer",
      }}
      {...props} // This allows additional props like id and onClick to be passed here
    >
      <img src={icon} alt="draft" />
      <p
        style={{
          fontSize: "32px",
          lineHeight: "38.82px",
          marginTop: "16px",
        }}
      >
        {count}
      </p>
      <div style={{ fontSize: "14px" }}>
        <p style={{ fontWeight: "400", color: "rgba(250, 250, 250, 0.5)" }}>
          {pendingText}
        </p>
        <p
          style={{
            textDecoration: "underline",
            textUnderlineOffset: "4px",
            fontWeight: "700",
          }}
        >
          View all
        </p>
      </div>
    </div>
  );
};

const OperationsHeadingText = styled.h1`
  font-family: Product Sans;
  font-size: 16px;
  font-weight: 400;
  line-height: 19.41px;
  text-align: left;
  text-underline-position: from-font;
  text-decoration-skip-ink: none;
  color: #1a1a1a;
`;
