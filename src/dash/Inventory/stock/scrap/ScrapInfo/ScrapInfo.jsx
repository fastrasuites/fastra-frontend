import React, { useCallback, useEffect, useState } from "react";
import { Link, useHistory, useParams } from "react-router-dom";
import {
  Box,
  Button,
  CircularProgress,
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
import { useScrap } from "../../../../../context/Inventory/Scrap";
import { useCustomLocation } from "../../../../../context/Inventory/LocationContext";
import { usePurchase } from "../../../../../context/PurchaseContext";

// Status‐to‐color mapping extracted for reuse and easy maintenance
const STATUS_COLOR = {
  done: "#2ba24c",
  Done: "#2ba24c",
  draft: "#158fec",
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
  const history = useHistory();
  const { tenantData } = useTenant();
  const tenant_schema_name = tenantData?.tenant_schema_name;
  const { getSingleScrap } = useScrap();

  const [scrap, setScrap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { getSingleLocation } = useCustomLocation();
  const { fetchSingleProduct } = usePurchase();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: raw } = await getSingleScrap(id);
      console.log(raw);
      const { data: location } = await getSingleLocation(
        raw.warehouse_location
      );
      const items = await Promise.all(
        raw.scrap_items.map(async (item) => {
          const { data: product } = await fetchSingleProduct(item.product);
          return {
            ...item,
            product,
          };
        })
      );
      setScrap({
        ...raw,
        warehouse_location: location,
        scrap_items: items,
      });
    } catch (e) {
      console.error(e);
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [id, getSingleScrap, getSingleLocation, fetchSingleProduct]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleNavigateToEdit = (id) => {
    history.push({
      pathname: `/${tenant_schema_name}/inventory/stock/scrap/${id}/edit`,
      state: { Scrap: scrap },
    });
  };
  if (loading)
    return (
      <Box p={4} textAlign="center">
        <CircularProgress />
      </Box>
    );

  if (error && !scrap)
    return (
      <Box p={4} textAlign="center">
        <Typography variant="h6">Scrap not found</Typography>
        <Link to={`/${tenant_schema_name}/inventory/stock/scrap`}>
          <Button variant="outlined" sx={{ mt: 2 }}>
            Back to List
          </Button>
        </Link>
      </Box>
    );

  return (
    <Box p={4} display="grid" gap={4} mr={4}>
      {/* Action button */}

      <Box display="flex" justifyContent="space-between" mb={2}>
        <Link to={`/${tenant_schema_name}/inventory/stock/scrap/create-scrap`}>
          <Button variant="contained" size="large" disableElevation>
            New Scrap
          </Button>
        </Link>
        <Box display="flex" gap={4}>
          <Link to={`/${tenant_schema_name}/inventory/stock/scrap`}>
            <Button variant="outlined" size="large" disableElevation>
              Close
            </Button>
          </Link>
          {scrap.status === "draft" && (
            <Button
              variant="contained"
              size="large"
              disableElevation
              onClick={() => handleNavigateToEdit(id)}
            >
              Edit
            </Button>
          )}
        </Box>
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
          <Typography
            color={getStatusColor(scrap.status)}
            textTransform={"capitalize"}
          >
            {scrap.status.toUpperCase()}
          </Typography>
        </InfoRow>

        {/* Key details */}
        <Box display="flex" gap={14} borderBottom="1px solid #E2E6E9" pb={3}>
          <InfoRow label="ID">{scrap.id}</InfoRow>
          <InfoRow label="Adjustment Type">{scrap.adjustment_type}</InfoRow>
          {/* <InfoRow label="Date">{scrap.date}</InfoRow> */}
          <InfoRow label="Warehouse Location">
            {scrap.warehouse_location?.location_name}
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
                {["Product Name", "Scrap Quantity", "Scrap Quantity"].map(
                  (text) => (
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
                  )
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {scrap.scrap_items?.map((row, idx) => (
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
                    {row?.scrap_quantity}
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
        <Typography
          variant="body1"
          color={getStatusColor(scrap.status)}
          textTransform={"capitalize"}
        >
          {scrap.status}
        </Typography>
        {scrap.status === "draft" && (
          <Button variant="contained" size="large" disableElevation>
            Validate
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default ScrapInfo;
