import React, { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTenant } from "../../../../../context/TenantContext";
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  TextField,
} from "@mui/material";
import { useStockAdjustment } from "../../../../../context/Inventory/StockAdjustment";
import { useCustomLocation } from "../../../../../context/Inventory/LocationContext";
import { extractId } from "../../../../../helper/helper";
import { usePurchase } from "../../../../../context/PurchaseContext";

// Safely normalize status to a string before lowercasing
const getStatusColor = (status) => {
  const s = status != null ? String(status) : "";
  switch (s.toLowerCase()) {
    case "validate":
    case "validated":
      return "#2ba24c";
    case "draft":
    case "drafted":
      return "#158fec";
    case "cancelled":
    case "cancel":
      return "#e43e2b";
    default:
      return "#9e9e9e";
  }
};

const InfoRow = ({ label, children }) => (
  <Box display="flex" flexDirection="column" gap={0.5}>
    <Typography variant="subtitle2">{label}</Typography>
    <Typography variant="body2" color="#7A8A98">
      {children}
    </Typography>
  </Box>
);

export default function StockAdjustmentInfo() {
  const { id } = useParams();
  const { tenantData } = useTenant();
  const schema = tenantData?.tenant_schema_name;
  const { getSingleStockAdjustment } = useStockAdjustment();
  const { getSingleLocation } = useCustomLocation();
  const { fetchSingleProduct } = usePurchase();

  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: raw } = await getSingleStockAdjustment(id);
      const { data: location } = await getSingleLocation(
        extractId(raw.warehouse_location)
      );
      const items = await Promise.all(
        raw.stock_adjustment_items.map(async (item) => {
          const { data: product } = await fetchSingleProduct(
            extractId(item.product)
          );
          return {
            ...item,
            product,
          };
        })
      );
      setStock({
        ...raw,
        warehouse_location: location,
        stock_adjustment_items: items,
      });
    } catch (e) {
      console.error(e);
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [id, getSingleStockAdjustment, getSingleLocation, fetchSingleProduct]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading)
    return (
      <Box p={4} textAlign="center">
        <CircularProgress />
      </Box>
    );

  if (error || !stock)
    return (
      <Box p={4} textAlign="center">
        <Typography variant="h6">Adjustment not found</Typography>
        <Link to={`/${schema}/inventory/stock/stock-adjustment`}>
          <Button variant="outlined" sx={{ mt: 2 }}>
            Back to List
          </Button>
        </Link>
      </Box>
    );

  console.log(stock);
  return (
    <Box p={4} display="grid" gap={4} mr={4}>
      {/* Action button */}

      <Box display="flex" justifyContent="space-between" mb={2}>
        <Link
          to={`/${schema}/inventory/stock/stock-adjustment/create-stock-adjustment`}
        >
          <Button variant="contained" size="large" disableElevation>
            Stock Adjustment
          </Button>
        </Link>
        <Button
          variant="outlined"
          size="large"
          disableElevation
          onClick={() => window.history.back()}
        >
          Close
        </Button>
      </Box>

      {/* Main info card */}
      <Box
        p={3}
        display="grid"
        gap={4}
        border="1px solid #E2E6E9"
        bgcolor="#FFFFFF"
      >
        <Typography variant="h6" color="#3B7CED" fontSize={20} fontWeight={500}>
          Product Information
        </Typography>

        {/* Status row */}
        <InfoRow label="Status">
          <Typography color={getStatusColor(stock.status)}>
            {stock.status}
          </Typography>
        </InfoRow>

        {/* Key details */}
        <Box display="flex" gap={14} borderBottom="1px solid #E2E6E9" pb={3}>
          <InfoRow label="ID">{stock.id}</InfoRow>
          <InfoRow label="Adjustment Type">{stock.adjustment_type}</InfoRow>
          {/* <InfoRow label="Date">{stock.date}</InfoRow> */}
          <InfoRow label="Location">
            {stock?.warehouse_location?.location_name}
          </InfoRow>

          {stock.notes && (
            <Box>
              <Typography>Notes</Typography>
              <TextField
                value={stock.notes}
                multiline
                fullWidth
                rows={2}
                variant="outlined"
                sx={{ width: 500, mt: 1 }}
                InputProps={{
                  readOnly: true, // remove if you want it editable
                }}
              />
            </Box>
          )}
        </Box>

        {/* Optional notes section */}

        {/* Items table */}
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ borderRadius: 2, border: "1px solid #E2E6E9", bgcolor: "#fff" }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {[
                  "Product Name",
                  "Unit of Measure",
                  "Current Quantity",
                  "Adjusted Quantity",
                ].map((text) => (
                  <TableCell
                    key={text}
                    sx={{
                      fontWeight: 500,
                      color: "#7A8A98",
                      fontSize: "14px",
                      p: 3,
                    }}
                  >
                    {text}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {stock.stock_adjustment_items?.map((row, idx) => (
                <TableRow
                  key={idx}
                  hover
                  sx={{ "&:nth-of-type(odd)": { bgcolor: "#f5f5f5" } }}
                >
                  <TableCell
                    sx={{
                      fontSize: "14px",
                      color: "#7A8A98",
                      fontWeight: 400,
                      p: 3,
                    }}
                  >
                    {row?.product?.product_name}
                  </TableCell>
                  <TableCell
                    sx={{ fontSize: "14px", color: "#7A8A98", fontWeight: 400 }}
                  >
                    Product Description
                  </TableCell>
                  <TableCell
                    sx={{ fontSize: "14px", color: "#7A8A98", fontWeight: 400 }}
                  >
                    5
                  </TableCell>
                  <TableCell
                    sx={{ fontSize: "14px", color: "#7A8A98", fontWeight: 400 }}
                  >
                    {row?.adjusted_quantity}
                    <Box borderBottom="1px solid #E2E6E9" mt={1} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Footer with status and action */}
      <Box display="flex" justifyContent="space-between" mr={4}>
        <Typography variant="body1" color={getStatusColor(stock.status)}>
          {stock.status}
        </Typography>
        {stock.status === "Draft" && (
          <Button variant="contained" size="large" disableElevation>
            Validate
          </Button>
        )}
      </Box>
    </Box>
  );
}
