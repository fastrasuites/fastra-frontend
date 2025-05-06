import React, { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { scraps } from "../../../data/incomingProductData";
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

// Status‐to‐color mapping extracted for reuse and easy maintenance
const STATUS_COLOR = {
  Validate: "#2ba24c",
  Validated: "#2ba24c",
  Draft: "#158fec",
  Drafted: "#158fec",
  Cancel: "#e43e2b",
  Cancelled: "#e43e2b",
};

const getStatusColor = (status) => STATUS_COLOR[status] || "#9e9e9e";

// Small helper to render a label + value pair consistently
const InfoRow = ({ label, children }) => (
  <Box>
    <Typography>{label}</Typography>
    <Typography color="#7A8A98">{children}</Typography>
  </Box>
);

const ScrapInfo = () => {
  // useParams should not be instantiated with `new`
  const { id } = useParams();
  const { tenantData } = useTenant();
  const tenant_schema_name = tenantData?.tenant_schema_name;

  // Memoize lookup to avoid re-computing on each render
  const scrap = useMemo(
    () => scraps.find((s) => s.id === id?.toUpperCase()),
    [id]
  );

  if (!scrap) {
    return (
      <Box p={4} textAlign="center">
        <Typography variant="h6">Scrap record not found</Typography>
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
        <Link to={`/${tenant_schema_name}/inventory/stock/scrap/create-scrap`}>
          <Button variant="contained" size="large" disableElevation>
            New Scrap
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
          <Typography color={getStatusColor(scrap.status)}>
            {scrap.status}
          </Typography>
        </InfoRow>

        {/* Key details */}
        <Box display="flex" gap={14} borderBottom="1px solid #E2E6E9" pb={3}>
          <InfoRow label="ID">{scrap.id}</InfoRow>
          <InfoRow label="Adjustment Type">{scrap.adjustment_type}</InfoRow>
          <InfoRow label="Date">{scrap.date}</InfoRow>
          <InfoRow label="Warehouse Location">
            {scrap.warehouse_location}
          </InfoRow>
        </Box>

        {/* Optional notes section */}
        {scrap.notes && (
          <Box display="flex" gap={6} borderBottom="1px solid #E2E6E9" pb={3}>
            <InfoRow label="Notes">{scrap.notes}</InfoRow>
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
                {[
                  "Product Name",
                  "Description",
                  "Description",
                  "QTY Received",
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
              {scrap.items?.map((row, idx) => (
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
                    {row.product}
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
                    {row.product}
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
        <Typography variant="body1" color={getStatusColor(scrap.status)}>
          {scrap.status}
        </Typography>
        {scrap.status === "Draft" && (
          <Button variant="contained" size="large" disableElevation>
            Validate
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default ScrapInfo;
