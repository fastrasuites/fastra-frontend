import React, { useEffect, useMemo } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { FaCaretLeft, FaCaretRight } from "react-icons/fa";
import { useTenant } from "../../../../../context/TenantContext";
import { Link, useParams, useHistory } from "react-router-dom";
import { useInternalTransfer } from "../../../../../context/Inventory/InternalTransferContext";
import Swal from "sweetalert2";
import { formatDate } from "../../../../../helper/helper";

// Status color mapping
const getStatusColor = (status) => {
  const s = String(status).toLowerCase();
  if (s === "done") return "#158048";
  if (s === "draft") return "#2899B2";
  if (s === "approved") return "#2899B2";
  if (s === "released") return "#8B21DF";
  if (s === "canceled") return "#B13022";
  if (s === "cancelled") return "#B13022";
  if (s === "awaiting_approval") return "#BE8706";
  return "#9e9e9e";
};

// Normalize status display
const getStatusDisplay = (status) => {
  const s = String(status).toLowerCase();
  if (s === "awaiting_approval") return "Awaiting Approval";
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const InfoRow = ({ label, children }) => (
  <Grid item xs={12} sm={6} md={4} lg={3}>
    <Typography>{label}</Typography>
    <Typography color="#7A8A98">{children}</Typography>
  </Grid>
);

const InternalTransferInfo = () => {
  const { id } = useParams();
  const history = useHistory();
  const { tenantData } = useTenant();
  const tenant_schema_name = tenantData?.tenant_schema_name;
  const {
    internalTransfers,
    singleTransfer,
    getInternalTransfer,
    updateInternalTransfer,
    deleteInternalTransfer,
    isLoading,
  } = useInternalTransfer();

  // Fetch transfer data
  useEffect(() => {
    if (id) {
      getInternalTransfer(id);
    }
  }, [id, getInternalTransfer]);

  // Extract table data
  const tableData = useMemo(() => {
    return (
      singleTransfer?.internal_transfer_items?.map((item) => ({
        product_name: item.product_details?.product_name || "-",
        quantity_requested: item.quantity_requested ?? 0,
        unit_symbol:
          item.product_details?.unit_of_measure_details?.unit_symbol || "-",
      })) || []
    );
  }, [singleTransfer]);

  const handlePrev = () => {
    if (!singleTransfer) return;

    if (singleTransfer.prev_id) {
      history.push(
        `/${tenant_schema_name}/inventory/operations/internal-transfer/${singleTransfer.prev_id}`
      );
    } else if (internalTransfers.length > 0) {
      // wrap around → go to last record
      const lastId = internalTransfers[internalTransfers.length - 1].id;
      history.push(
        `/${tenant_schema_name}/inventory/operations/internal-transfer/${lastId}`
      );
    }
  };

  const handleNext = () => {
    if (!singleTransfer) return;

    if (singleTransfer.next_id) {
      history.push(
        `/${tenant_schema_name}/inventory/operations/internal-transfer/${singleTransfer.next_id}`
      );
    } else if (internalTransfers.length > 0) {
      // wrap around → go to first record
      const firstId = internalTransfers[0].id;
      history.push(
        `/${tenant_schema_name}/inventory/operations/internal-transfer/${firstId}`
      );
    }
  };

  // Handle loading state
  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Handle status updates
  const handleStatusUpdate = async (newStatus) => {
    if (!singleTransfer) return;

    try {
      const payload = {
        source_location: singleTransfer.source_location,
        destination_location: singleTransfer.destination_location,
        status: newStatus,
        internal_transfer_items: singleTransfer.internal_transfer_items.map(
          (item) => ({
            product: item.product_details.id,
            quantity_requested: String(item.quantity_requested),
          })
        ),
      };

      await updateInternalTransfer(id, payload);
      Swal.fire({
        icon: "success",
        title: "Success",
        text: `Internal transfer ${
          newStatus === "cancelled"
            ? "cancelled"
            : newStatus === "awaiting_approval"
            ? "sent for approval"
            : newStatus === "approved"
            ? "confirmed"
            : newStatus === "released"
            ? "marked as released"
            : "receipt confirmed"
        } successfully!`,
        timer: 4000,
      });
      // Refresh the transfer data
      getInternalTransfer(id);
    } catch (error) {
      let errorMessage = `Failed to ${
        newStatus === "cancelled"
          ? "cancel"
          : newStatus === "awaiting_approval"
          ? "send for approval"
          : newStatus === "approved"
          ? "confirm"
          : newStatus === "released"
          ? "mark as released"
          : "confirm receipt"
      } transfer`;
      if (error?.error?.non_field_errors) {
        errorMessage = error.error.non_field_errors.includes(
          "Insufficient stock for the product in the source location."
        )
          ? "Insufficient stock for one or more products. Please adjust the quantity requested or restock and try again."
          : error.response.data.non_field_errors.join("; ");
      }
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
    }
  };

  // Handle delete
  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You are about to delete this internal transfer. This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await deleteInternalTransfer(id);
        Swal.fire({
          icon: "success",
          title: "Deleted",
          text: "Internal transfer deleted successfully!",
        });
        history.push(
          `/${tenant_schema_name}/inventory/operations/internal-transfer`
        );
      } catch (error) {
        let errorMessage = "Failed to delete internal transfer";
        if (error.response?.data?.non_field_errors) {
          errorMessage = error.response.data.non_field_errors.join("; ");
        }
        Swal.fire({
          icon: "error",
          title: "Error",
          text: errorMessage,
        });
      }
    }
  };

  // Handle Edit navigation
  const handleEdit = () => {
    history.push(
      `/${tenant_schema_name}/inventory/operations/internal-transfer/${id}/edit/`
    );
  };

  // Render loading or error state
  if (!singleTransfer) {
    return (
      <Box p={4} textAlign="center">
        <Typography variant="h6">Internal Transfer record not found</Typography>
        <Link
          to={`/${tenant_schema_name}/inventory/operations/internal-transfer`}
        >
          <Button variant="outlined">Back to List</Button>
        </Link>
      </Box>
    );
  }

  return (
    <Box p={4} display="grid" gap={4}>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Link
          to={`/${tenant_schema_name}/inventory/operations/internal-transfer/create-internal-transfer`}
        >
          <Button variant="contained" size="large" disableElevation>
            New Internal Order
          </Button>
        </Link>

        {/* nav button */}
        <Box border="1px solid #E2E6E9" borderRadius={1}>
          <Tooltip title="Previous transfer">
            <IconButton onClick={handlePrev}>
              <FaCaretLeft />
            </IconButton>
          </Tooltip>
          <Tooltip title="Next transfer">
            <IconButton onClick={handleNext}>
              <FaCaretRight />
            </IconButton>
          </Tooltip>
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
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={2}
        >
          <Typography
            variant="h6"
            color="#3B7CED"
            fontSize={20}
            fontWeight={500}
          >
            Product Information
          </Typography>
          {/* Action buttons */}
          <Box display="flex" gap={2}>
            <Link
              to={`/${tenant_schema_name}/inventory/operations/internal-transfer`}
            >
              <Button variant="text" size="large" disableElevation>
                Close
              </Button>
            </Link>
            <Button
              variant="outlined"
              color="error"
              size="large"
              disableElevation
              onClick={handleDelete}
            >
              Delete
            </Button>
            {singleTransfer.status.toLowerCase() === "draft" && (
              <Button
                variant="contained"
                size="large"
                disableElevation
                onClick={handleEdit}
                disabled
              >
                Edit
              </Button>
            )}
          </Box>
        </Box>

        {/* Key details */}
        <Grid container spacing={3}>
          <InfoRow label="Status">
            <Typography color={getStatusColor(singleTransfer.status)}>
              {getStatusDisplay(singleTransfer.status)}
            </Typography>
          </InfoRow>
          <InfoRow label="ID">{singleTransfer.id}</InfoRow>
          <InfoRow label="Date">
            {formatDate(singleTransfer.date_created)}
          </InfoRow>
          <InfoRow label="Source Location">
            {singleTransfer.source_location_details.location_name}
          </InfoRow>
          <InfoRow label="Destination Location">
            {singleTransfer.destination_location_details.location_name}
          </InfoRow>
        </Grid>
        <Divider />
        {/* Items table */}
        <TableContainer
          elevation={0}
          sx={{
            borderRadius: "4px",
            border: "1.2px solid #E2E6E9",
            bgcolor: "#fff",
          }}
        >
          <Table stickyHeader sx={{ tableLayout: "fixed" }}>
            <TableHead>
              <TableRow>
                {["Product Name", "Requested Quantity", "Unit of measure"].map(
                  (text, index) => (
                    <TableCell
                      key={text}
                      sx={{
                        fontWeight: 500,
                        color: "#7A8A98",
                        fontSize: "14px",
                        p: 1,
                        width: index === 0 ? "40%" : "30%",
                      }}
                    >
                      {text}
                    </TableCell>
                  )
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {tableData.length > 0 ? (
                tableData.map((row, idx) => (
                  <TableRow
                    key={idx}
                    hover
                    sx={{
                      "&:nth-of-type(odd)": { bgcolor: "#f5f5f5" },
                      "&:last-child td, &:last-child th": { border: 0 },
                    }}
                  >
                    <TableCell
                      sx={{
                        fontSize: "14px",
                        color: "#7A8A98",
                        fontWeight: 400,
                        p: 1,
                      }}
                    >
                      {row.product_name}
                    </TableCell>
                    <TableCell
                      sx={{
                        fontSize: "14px",
                        color: "#7A8A98",
                        fontWeight: 400,
                        p: 1,
                      }}
                    >
                      {Number(row.quantity_requested).toLocaleString()}
                    </TableCell>
                    <TableCell
                      sx={{
                        fontSize: "14px",
                        color: "#7A8A98",
                        fontWeight: 400,
                        p: 1,
                      }}
                    >
                      {row.unit_symbol}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    align="center"
                    sx={{
                      fontSize: "14px",
                      color: "#7A8A98",
                      fontWeight: 400,
                      p: 3,
                    }}
                  >
                    No items available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Footer with status and action */}
        <Box display="flex" justifyContent="space-between">
          <Typography
            variant="body1"
            color={getStatusColor(singleTransfer.status)}
          >
            {getStatusDisplay(singleTransfer.status)}
          </Typography>
          <Box display="flex" gap={2}>
            {singleTransfer.status.toLowerCase() === "draft" && (
              <Button
                variant="contained"
                size="large"
                disableElevation
                onClick={() => handleStatusUpdate("awaiting_approval")}
              >
                Send for Approval
              </Button>
            )}
            {singleTransfer.status.toLowerCase() === "awaiting_approval" && (
              <>
                <Button
                  variant="outlined"
                  color="error"
                  size="large"
                  disableElevation
                  onClick={() => handleStatusUpdate("canceled")}
                >
                  Cancel Transfer
                </Button>
                <Button
                  variant="contained"
                  size="large"
                  disableElevation
                  onClick={() => handleStatusUpdate("approved")}
                >
                  Confirm Transfer
                </Button>
              </>
            )}
            {singleTransfer.status.toLowerCase() === "approved" && (
              <Button
                variant="contained"
                size="large"
                disableElevation
                onClick={() => handleStatusUpdate("released")}
              >
                Mark as Released
              </Button>
            )}
            {singleTransfer.status.toLowerCase() === "released" && (
              <Button
                variant="contained"
                size="large"
                disableElevation
                onClick={() => handleStatusUpdate("done")}
              >
                Confirm Receipt
              </Button>
            )}
            {singleTransfer.status.toLowerCase() === "canceled" && (
              <Button
                variant="contained"
                size="large"
                disableElevation
                onClick={() => handleStatusUpdate("draft")}
              >
                Set to Draft
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default InternalTransferInfo;
