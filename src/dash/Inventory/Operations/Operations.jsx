import React, { useState } from "react";
import {
  useTheme,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
} from "@mui/material";
import { Link } from "react-router-dom";
import styled from "styled-components";
import IncomingProductManualListview from "./IncomingProduct/IncomingProductManualListview";
import inventoryShareStyle from "../inventorySharedStyles";
import draftIcon from "../../../image/icons/draft.png";

// Data for pending boxes
const pendingBoxesData = [
  {
    id: "pending-incoming-product",
    text: "Pending Incoming Product",
    color: "#4482EE",
    count: 12,
  },
  {
    id: "pending-delivery-orders",
    text: "Pending Delivery Orders",
    color: "#E43D2B",
    count: 8,
  },
  {
    id: "pending-internal-transfer",
    text: "Pending Internal Transfer",
    color: "#2BA24D",
    count: 5,
  },
  {
    id: "pending-returns",
    text: "Pending Returns",
    color: "#d3a006",
    count: 7,
  },
  {
    id: "manufacturing-returns",
    text: "Manufacturing Returns",
    color: "#593BED",
    count: 6,
  },
];

// Styled components for cleaner styling
const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin: 40px 0 26px 0;
`;

const OperationsHeadingText = styled.h1`
  font-family: "Product Sans";
  font-size: 16px;
  font-weight: 400;
  line-height: 19.41px;
  color: #1a1a1a;
  text-align: left;
`;

const PendingBoxesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
`;

// PendingBox component
const PendingBox = ({
  pendingText,
  icon = draftIcon,
  color,
  count,
  ...props
}) => (
  <Box
    onClick={() => alert("List not ready, check back later")}
    sx={{
      color: "#FAFAFA",
      padding: "16px 22px 16px 16px",
      backgroundColor: color,
      border: `1.5px solid ${color}`,
      boxShadow: "0px 4px 4px 0px #00000040",
      borderRadius: "4px",
      minWidth: "178px",
      cursor: "pointer",
    }}
    {...props}
  >
    <img src={icon} alt="draft icon" />
    <p style={{ fontSize: "32px", lineHeight: "38.82px", marginTop: "16px" }}>
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
  </Box>
);

const Operations = () => {
  const theme = useTheme();

  const [selectedLocation, setSelectedLocation] = useState("");
  const options = ["Suppliers location", "Customers location"];

  const handleChange = (event) => {
    setSelectedLocation(event.target.value);
  };

  return (
    <Box sx={inventoryShareStyle.operationWrapper(theme)}>
      <HeaderContainer>
        <OperationsHeadingText>Operations</OperationsHeadingText>
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
                borderBottom: "2px solid #7A8A98",
              },
            },
          }}
        >
          <InputLabel>Select Location</InputLabel>
          <Select
            value={selectedLocation}
            onChange={handleChange}
            label="Select Location"
          >
            {options.map((option, index) => (
              <MenuItem key={index} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </HeaderContainer>

      <PendingBoxesContainer>
        {pendingBoxesData.map(({ id, text, color, count }) => (
          <PendingBox
            key={id}
            id={id}
            pendingText={text}
            color={color}
            count={count}
          />
        ))}
      </PendingBoxesContainer>

      <Box paddingTop={"32px"}>
        <IncomingProductManualListview />
      </Box>
    </Box>
  );
};

export default Operations;
