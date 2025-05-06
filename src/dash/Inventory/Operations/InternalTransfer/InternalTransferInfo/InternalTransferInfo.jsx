import React, { useMemo } from "react";
import { internalTransferData } from "../../../data/incomingProductData";
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
} from "@mui/material";
import { useTenant } from "../../../../../context/TenantContext";
import { Link, useParams } from "react-router-dom";

const getStatusColor = (status) => {
  const s = String(status).toLowerCase();
  if (s === "done") return "#2ba24c";
  if (s === "draft") return "#158fec";
  if (s === "cancelled") return "#e43e2b";
  if (s === "awaiting" || s === "awaiting approval") return "#F0B501";
  return "#9e9e9e";
};

const InfoRow = ({ label, children }) => (
  <Box>
    <Typography>{label}</Typography>
    <Typography color="#7A8A98">{children}</Typography>
  </Box>
);

const InternalTransferInfo = () => {
  // useParams should not be instantiated with `new`
  const { id } = useParams();
  const { tenantData } = useTenant();
  const tenant_schema_name = tenantData?.tenant_schema_name;

  // Memoize lookup to avoid re-computing on each render
  const internalTransfer = useMemo(
    () => internalTransferData.find((s) => s.id === id?.toUpperCase()),
    [id]
  );

  if (!internalTransfer) {
    return (
      <Box p={4} textAlign="center">
        <Typography variant="h6">Internal Transfer record not found</Typography>
        <Link to="/inventory/stock/scrap">
          <Button variant="outlined">Back to List</Button>
        </Link>
      </Box>
    );
  }

  return (
    <Box p={4} display="grid" gap={4}>
      {/* Action button */}

      <Box display="flex" justifyContent="space-between" mb={2}>
        <Link to={`/${tenant_schema_name}/inventory/operations/internal-transfer/create-internal-transfer`}>
          <Button variant="contained" size="large" disableElevation>
            New Internal Order
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

        {/* Key details */}
        <Box display="flex" gap={14} borderBottom="1px solid #E2E6E9" pb={3}>
          <InfoRow label="Status">
            <Typography color={getStatusColor(internalTransfer.status)}>
              {internalTransfer.status}
            </Typography>
          </InfoRow>
          <InfoRow label="ID">{internalTransfer.id}</InfoRow>
          <InfoRow label="Date">{internalTransfer.date}</InfoRow>
          <InfoRow label="Warehouse Location">
            {internalTransfer.sourceLocation}
          </InfoRow>
          <Box>
            <Typography>Notes</Typography>
            <Box
              display="grid"
              border="1px solid #E2E6E9"
              p={3}
              width={500}
              boxShadow={1}
              borderRadius={2}
            >
              <Typography display={"block"} sx={{ display: "block" }}>
               Lorem ipsum dolor sit, amet consectetur adipisicing elit. Vel praesentium illum id?
              </Typography>
            </Box>
            {/* <InfoRow label="Notes">{stock.notes}</InfoRow> */}
          </Box>
        </Box>

        {/* Optional notes section */}
        {internalTransfer.notes && (
          <Box display="flex" gap={6} borderBottom="1px solid #E2E6E9" pb={3}>
            <InfoRow label="Notes">{internalTransfer.notes}</InfoRow>
          </Box>
        )}

        {/* Items table */}
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ borderRadius: 2, border: "1px solid #E2E6E9", bgcolor: "#fff" }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {["Product Name", "Quantity", "Unit of Measure"].map((text) => (
                  <TableCell
                    key={text}
                    sx={{
                      fontWeight: 500,
                      color: "#7A8A98",
                      fontSize: "14px",
                      py: 3,
                    }}
                  >
                    {text}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {internalTransfer.items?.map((row, idx) => (
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
                    {row.productName}
                  </TableCell>
                  <TableCell
                    sx={{ fontSize: "14px", color: "#7A8A98", fontWeight: 400 }}
                  >
                    {row.quantity}
                  </TableCell>
                  <TableCell
                    sx={{ fontSize: "14px", color: "#7A8A98", fontWeight: 400 }}
                  >
                    {row.unitOfMeasure}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Footer with status and action */}
      <Box display="flex" justifyContent="space-between" mr={4}>
        <Typography
          variant="body1"
          color={getStatusColor(internalTransfer.status)}
        >
          {internalTransfer.status}
        </Typography>
        {internalTransfer.status === "Draft" && (
          <Button variant="contained" size="large" disableElevation>
            Validate
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default InternalTransferInfo;
