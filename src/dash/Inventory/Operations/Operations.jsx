import React, { useEffect, useState, useMemo } from "react";
import {
  useTheme,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Typography,
} from "@mui/material";
import { Link, useHistory } from "react-router-dom";
import styled from "styled-components";
import IncomingProductManualListview from "./IncomingProduct/IncomingProductManualListview";
import inventoryShareStyle from "../inventorySharedStyles";
import draftIcon from "../../../image/icons/draft.png";
import { useIncomingProduct } from "../../../context/Inventory/IncomingProduct";
import { useDeliveryOrder } from "../../../context/Inventory/DeliveryOrderContext";
import { useCustomLocation } from "../../../context/Inventory/LocationContext";
import { useCallback } from "react";
import { useTenant } from "../../../context/TenantContext";

// Constants
const LOCATION_OPTIONS = ["Suppliers location", "Customers location"];

const INITIAL_STATE = [
  {
    id: "incoming-product",
    text: "Incoming Product",
    color: "#4482EE",
    count: 0,
    href: "/inventory/operations",
  },
  {
    id: "delivery-orders",
    text: "Delivery Orders",
    color: "#E43D2B",
    count: 0,
    href: "/inventory/operations/delivery-order",
  },
  {
    id: "internal-transfer",
    text: "Pending Internal Transfer",
    color: "#2BA24D",
    count: 0,
    href: "/inventory/operations/internal-transfer",
  },
  { id: "returns", text: "Returns", color: "#d3a006", count: 0 },
  {
    id: "manufacturing-returns",
    text: "Manufacturing Returns",
    color: "#593BED",
    count: 0,
    href: "/inventory/operations/manufactioning",
  },
];

// Styled Components
const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin: 40px 0 26px 0;
`;

const OperationsHeading = styled.h1`
  font-family: "Product Sans", sans-serif;
  font-size: 16px;
  font-weight: 400;
  color: #1a1a1a;
`;

const PendingBoxesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
`;

const StyledPendingBox = styled(Box)`
  color: #fafafa;
  padding: 16px 22px 16px 16px;
  border-radius: 8px;
  min-width: 178px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.18);
    opacity: 0.95;
  }
`;

const PendingBox = ({
  icon = draftIcon,
  pendingText,
  color,
  count,
  onClick,
}) => (
  <StyledPendingBox
    onClick={onClick}
    sx={{
      backgroundColor: color,
      border: `1.5px solid ${color}`,
    }}
    role="button"
    aria-label={`View all ${pendingText}`}
  >
    <img src={icon} alt={`${pendingText} icon`} width={24} height={24} />
    <Typography variant="h4" mt={2}>
      {count}
    </Typography>
    <Typography variant="body2" color="rgba(250, 250, 250, 0.5)">
      {pendingText}
    </Typography>
    <Typography
      variant="body2"
      fontWeight={700}
      sx={{ textDecoration: "underline", textUnderlineOffset: "4px" }}
    >
      View all
    </Typography>
  </StyledPendingBox>
);

// Main Component
const Operations = () => {
  const theme = useTheme();
  const tenant = useTenant().tenantData.tenant_schema_name;
  console.log(tenant);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [inventoryModule, setInventoryModule] = useState(INITIAL_STATE);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const history = useHistory();
  const {
    incomingProductList,
    getIncomingProductList,
    isLoading: isIncomingProductLoading,
  } = useIncomingProduct();
  const {
    deliveryOrderList,
    getDeliveryOrderList,
    getDeliveryOrderReturnList,
    deliveryOrderReturnList,
  } = useDeliveryOrder();
  const { locationList, getLocationList } = useCustomLocation();

  const handleChange = (event) => setSelectedLocation(event.target.value);
  // Filter incoming products by selected location
  const filteredIncoming = useMemo(
    () =>
      incomingProductList.filter(
        (item) =>
          !selectedLocation || item.destination_location === selectedLocation
      ),
    [incomingProductList, selectedLocation]
  );

  const fetchInventoryCounts = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        getIncomingProductList(),
        getDeliveryOrderList(),
        getDeliveryOrderReturnList(),
        getLocationList(),
      ]);
    } catch (err) {
      setError("An error occurred while loading data.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [
    getLocationList,
    getIncomingProductList,
    getDeliveryOrderReturnList,
    getDeliveryOrderList,
  ]);

  useEffect(() => {
    fetchInventoryCounts();
  }, [fetchInventoryCounts]);

  useEffect(() => {
    setInventoryModule((prev) =>
      prev.map((item) => {
        switch (item.id) {
          case "incoming-product":
            return { ...item, count: incomingProductList?.length || 0 };
          case "delivery-orders":
            return { ...item, count: deliveryOrderList?.length || 0 };
          case "returns":
            return { ...item, count: deliveryOrderReturnList?.length || 0 };
          default:
            return item;
        }
      })
    );
  }, [incomingProductList, deliveryOrderList, deliveryOrderReturnList]);

  const renderPendingBoxes = useMemo(
    () =>
      inventoryModule.map(({ id, text, color, count, href }) => (
        <PendingBox
          key={id}
          pendingText={text}
          color={color}
          count={count}
          onClick={() => history.push(`/${tenant}${href}`)}
        />
      )),
    [inventoryModule]
  );
  return (
    <Box sx={inventoryShareStyle.operationWrapper(theme)}>
      <HeaderContainer>
        <OperationsHeading>Operations</OperationsHeading>
        <FormControl variant="outlined">
          <InputLabel>Select Location</InputLabel>
          <Select
            value={selectedLocation}
            onChange={handleChange}
            label="Select Location"
            sx={{
              width: 200,
              height: 48,
              fontFamily: "Product Sans",
              fontSize: 14,
              "& .MuiOutlinedInput-notchedOutline": {
                borderBottom: "2px solid #7A8A98",
                borderTop: "none",
                borderLeft: "none",
                borderRight: "none",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#7A8A98",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#7A8A98",
              },
            }}
          >
            <MenuItem value={""}>All location</MenuItem>
            {locationList.map((location) => (
              <MenuItem key={location.id} value={location.id}>
                {location.location_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </HeaderContainer>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" py={5}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <PendingBoxesContainer>{renderPendingBoxes}</PendingBoxesContainer>
          <Box pt={5}>
            <IncomingProductManualListview
              incomingProductList={filteredIncoming}
              isLoading={isIncomingProductLoading}
            />
          </Box>
        </>
      )}
    </Box>
  );
};

export default Operations;
