import React, { useCallback, useEffect, useState } from "react";
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
} from "@mui/material";
import { Link, useHistory, useParams } from "react-router-dom";
import Swal from "sweetalert2";

import { useIncomingProduct } from "../../../../../context/Inventory/IncomingProduct";
import { usePurchase } from "../../../../../context/PurchaseContext";
import { useTenant } from "../../../../../context/TenantContext";

const getStatusColor = (status) => {
  const s = status != null ? String(status) : "";
  switch (s.toLowerCase()) {
    case "validated":
      return "#2ba24c";
    case "draft":
      return "#158fec";
    case "canceled":
      return "#e43e2b";
    default:
      return "#9e9e9e";
  }
};

export default function IncomingProductInfo() {
  const { id } = useParams();
  const { tenantData } = useTenant();
  const schema = tenantData?.tenant_schema_name;
  const history = useHistory();

  // context hooks
  const { getSingleIncomingProduct, updateIncomingProductStatus } =
    useIncomingProduct();
  const { fetchVendors, vendors, fetchSingleProduct } = usePurchase();

  // local state
  const [incoming, setIncoming] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // load data exactly like StockAdjustmentInfo
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // fetch the raw incoming product
      const { data: raw } = await getSingleIncomingProduct(id);

      // fetch all vendors (so we can look up supplier name later)
      await fetchVendors();

      // enrich each item with full product info
      const items = await Promise.all(
        (raw.incoming_product_items || []).map(async (item) => {
          const { data: product } = await fetchSingleProduct(item.product);
          return {
            ...item,
            product,
          };
        })
      );

      setIncoming({
        ...raw,
        incoming_product_items: items,
      });
      setError(null);
    } catch (e) {
      console.error(e);
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [id, getSingleIncomingProduct, fetchVendors, fetchSingleProduct]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // navigate to edit screen
  const handleEdit = () => {
    history.push(
      `/${schema}/inventory/operations/incoming-product/${id}/edit`,
      {
        incoming,
      }
    );
  };

  const refactoredIncoming_product_items = incoming?.incoming_product_items.map(
    (item) => {
      return {
        expected_quantity: item?.expected_quantity,
        id: item?.id,
        incoming_product: item?.incoming_product,
        product: item?.product?.id,
      };
    }
  );

  // mark as validated
  const handleValidate = async () => {
    const payload = {
      // incoming_product_items: refactoredIncoming_product_items,
      status: "validated",
      is_hidden: false,
      is_validated: true,
      can_edit: false,

      // receipt_type: incoming?.receipt_type,
      // related_po: incoming?.related_po || null,
      // supplier: parseInt(incoming?.supplier),
      // source_location: incoming?.source_location,
      // destination_location: incoming?.destination_location,
      // incoming_product_items: item?.incoming_product_items,
    };

    try {
      await updateIncomingProductStatus(id, payload);
      Swal.fire({
        icon: "success",
        title: "Validated",
        text: "Incoming product has been validated.",
      });
      loadData();
    } catch (err) {
      console.error("Validation error:", err);
      if (err.validation) {
        Swal.fire({
          icon: "error",
          title: "Validation Error",
          html: Object.values(err.validation)
            .map((msg) => `<p>${msg}</p>`)
            .join(""),
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err.message || "Failed to validate incoming product",
        });
      }
    }
  };

  const handleCancel = async () => {
    const payload = {
      status: "canceled",
      // incoming_product_items: refactoredIncoming_product_items,
      is_hidden: false,
      is_validated: true,
      can_edit: false,
      // receipt_type: incoming?.receipt_type,
      // related_po: incoming?.related_po || null,
      // supplier: parseInt(incoming?.supplier),
      // source_location: incoming?.source_location,
      // destination_location: incoming?.destination_location,
    };

    try {
      await updateIncomingProductStatus(id, payload);
      Swal.fire({
        icon: "success",
        title: "Cancelled",
        text: "Incoming product has been cancelled.",
      });
      loadData();
    } catch (err) {
      console.error("Validation error:", err);
      if (err.validation) {
        Swal.fire({
          icon: "error",
          title: "Validation Cancel Error",
          html: Object.values(err.validation)
            .map((msg) => `<p>${msg}</p>`)
            .join(""),
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err.message || "Failed to cancel incoming product",
        });
      }
    }
  };

  if (loading) {
    return (
      <Box p={4} textAlign="center">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !incoming) {
    return (
      <Box p={4} textAlign="center">
        <Typography variant="h6">Incoming product not found</Typography>
        <Link to={`/${schema}/inventory/operations`}>
          <Button variant="outlined" sx={{ mt: 2 }}>
            Back to List
          </Button>
        </Link>
      </Box>
    );
  }

  const supplier = vendors.find((v) => v.id === incoming.supplier);

  return (
    <Box p={4} display="grid" gap={4} mr={4}>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Link to={`/${schema}/inventory/operations/creat-incoming-product`}>
          <Button variant="contained" size="large" disableElevation>
            New Incoming Product
          </Button>
        </Link>
        <Box display="flex" gap={2}>
          <Link to={`/${schema}/inventory/operations`}>
            <Button size="large" disableElevation>
              Close
            </Button>
          </Link>
          {incoming.status === "draft" && (
            <Button
              variant="contained"
              size="large"
              disableElevation
              onClick={handleEdit}
            >
              Edit
            </Button>
          )}
        </Box>
      </Box>

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

        <Box>
          <Typography>Status</Typography>
          <Typography color={getStatusColor(incoming.status)}>
            {incoming.status}
          </Typography>
        </Box>

        <Box
          display="grid"
          gridTemplateColumns={"1fr 1fr 1fr 1fr 1fr"}
          justifyContent={"space-between"}
          gap={1}
          borderBottom="1px solid #E2E6E9"
          pb={3}
        >
          <Box>
            <Typography mb={1}>ID</Typography>
            <Typography variant="body2" color="#7A8A98">
              {incoming.id}
            </Typography>
          </Box>
          <Box>
            <Typography mb={1}>Receipt Type</Typography>
            <Typography
              variant="body2"
              color="#7A8A98"
              sx={{ textTransform: "capitalize" }}
            >
              {incoming.receipt_type.replace(/_/g, " ")}
            </Typography>
          </Box>
          <Box>
            <Typography mb={1}>Source Location</Typography>
            <Typography variant="body2" color="#7A8A98">
              {incoming.source_location}
            </Typography>
          </Box>
          <Box>
            <Typography mb={1}>Destination Location</Typography>
            <Typography variant="body2" color="#7A8A98">
              {incoming.destination_location}
            </Typography>
          </Box>
          <Box>
            <Typography mb={1}>Name of Supplier</Typography>
            <Typography variant="body2" color="#7A8A98">
              {supplier?.company_name}
            </Typography>
          </Box>
        </Box>

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
                  "Expected QTY",
                  "Unit of Measure",
                  "Qty Received",
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
              {incoming.incoming_product_items.map((row, idx) => (
                <TableRow
                  key={idx}
                  hover
                  sx={{ "&:nth-of-type(odd)": { bgcolor: "#f5f5f5" } }}
                >
                  <TableCell sx={{ fontSize: "14px", color: "#7A8A98", p: 3 }}>
                    {row.product.product_name}
                  </TableCell>
                  <TableCell sx={{ fontSize: "14px", color: "#7A8A98" }}>
                    {row.expected_quantity}
                  </TableCell>
                  <TableCell sx={{ fontSize: "14px", color: "#7A8A98" }}>
                    {row?.product?.unit_of_measure[1]}
                  </TableCell>
                  <TableCell sx={{ fontSize: "14px", color: "#7A8A98" }}>
                    {row.quantity_received}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Box display="flex" justifyContent="space-between" mr={4}>
        <Typography
          variant="body1"
          color={getStatusColor(incoming.status)}
          sx={{ textTransform: "capitalize" }}
        >
          {incoming.status}
        </Typography>
        {incoming.status === "draft" && (
          <Box display="flex" gap={2}>
            <Button
              variant="contained"
              color="error"
              size="large"
              disableElevation
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              size="large"
              disableElevation
              onClick={handleValidate}
            >
              Validate
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}
