import React, { useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useDeliveryOrder } from "../../../../../context/Inventory/DeliveryOrderContext";
import { useTenant } from "../../../../../context/TenantContext";
import {
  Box,
  Button,
  Divider,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
} from "@mui/material";
import { formatDate } from "../../../../../helper/helper";
import Swal from "sweetalert2";
import { useCustomLocation } from "../../../../../context/Inventory/LocationContext";

const tableColumns = ["Product Name", "Quantity to Deliver", "Unit of Measure"];

const STATUS_COLOR = {
  done: "#2ba24c",
  ready: "#2ba24c",
  draft: "#158fec",
  waiting: "#e43e2b",
};

const getStatusColor = (status) => STATUS_COLOR[status] || "#9e9e9e";

const transformStatus = (status) =>
  status.charAt(0).toUpperCase() + status.slice(1);

const FormGroup = ({ label, children }) => {
  return (
    <>
      <Typography>{label}</Typography>
      <Typography color="#7A8A98">{children}</Typography>
    </>
  );
};

const DeliveryOrderInfo = () => {
  const { id } = useParams();
  const orderId = Number(id);

  const { tenantData } = useTenant();
  const tenant_schema_name = tenantData?.tenant_schema_name;

  const {
    getSingleDeliveryOrder,
    singleDeliveryOrder,
    checkDeliveryOrderAvailability,
    confirmDeliveryOrder,
    error,
    isLoading,
    deleteDeliveryOrder,
  } = useDeliveryOrder();

  const { getSingleLocation, singleLocation } = useCustomLocation();

  useEffect(() => {
    if (singleDeliveryOrder?.source_location) {
      getSingleLocation(singleDeliveryOrder.source_location);
    }
  }, [singleDeliveryOrder?.source_location, getSingleLocation]);

  useEffect(() => {
    const fetchData = async () => {
      if (orderId) {
        await getSingleDeliveryOrder(orderId);
      }
    };
    fetchData();
  }, [orderId, getSingleDeliveryOrder]);

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

  // Handle error state
  if (error) {
    return (
      <Box p={4}>
        <Typography color="error">
          Error: {error.message || "Failed to load delivery order"}
        </Typography>
        <Link to={`/${tenant_schema_name}/inventory/operations/delivery-order`}>
          <Button variant="contained" sx={{ mt: 2 }}>
            Back to List
          </Button>
        </Link>
      </Box>
    );
  }

  // Handle case where data is still null after loading
  if (!singleDeliveryOrder) {
    return (
      <Box p={4}>
        <Typography>Delivery order not found</Typography>
        <Link to={`/${tenant_schema_name}/inventory/operations/delivery-order`}>
          <Button variant="contained" sx={{ mt: 2 }}>
            Back to List
          </Button>
        </Link>
      </Box>
    );
  }

  const status = singleDeliveryOrder?.status || "draft";

  const handleDelete = async () => {
    // Add null check
    if (!singleDeliveryOrder) return;
    const orderId = singleDeliveryOrder.id;
    try {
      // confirm before delete
      const result = await Swal.fire({
        title: "Are you sure",
        text: `You are about to delete this order: ${singleDeliveryOrder.order_unique_id}`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
      });
      if (!result.isConfirmed) return;
      const response = await deleteDeliveryOrder(orderId);
      if (response.success) {
        Swal.fire({
          title: "Deleted",
          text: "Delivery order has been deleted successfully.",
          icon: "success",
          confirmButtonText: "OK",
        }).then(() => {
          window.location.href = `/${tenant_schema_name}/inventory/operations/delivery-order`;
        });
      } else {
        Swal.fire({
          title: "Error",
          text: "Failed to delete delivery order.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.message || "An error occurred while deleting the order.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const handleSubmit = async () => {
    const orderId =
      singleDeliveryOrder?.id || singleDeliveryOrder.order_unique_id;

    try {
      if (status === "draft" || status === "waiting") {
        const response = await checkDeliveryOrderAvailability(orderId);
        // Access status from response.data
        if (response.data?.status === "ready") {
          Swal.fire({
            title: "Ready to proceed",
            text: "You can now confirm the delivery order.",
            icon: "success",
            confirmButtonText: "Proceed",
          });
        } else {
          Swal.fire({
            title: "Waiting: Not enough stock",
            text: "Please check the stock availability later.",
            icon: "info",
            confirmButtonText: "OK",
          });
        }
      } else if (status === "ready") {
        const response = await confirmDeliveryOrder(orderId);
        // Access status from response.data
        if (response.data?.status === "done") {
          Swal.fire({
            title: "Successful",
            text: "Delivery status is done",
            icon: "success",
            confirmButtonText: "OK",
          });
        } else {
          Swal.fire({
            title: "Not Done",
            text: "Delivery is not done, try again",
            icon: "error",
            confirmButtonText: "Ok",
          });
        }
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.message || "An error occurred. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <Box p={4} display="grid" gap={4}>
      <Box display="flex" gap={3}>
        <Link
          to={`/${tenant_schema_name}/inventory/operations/delivery-order/create-delivery-order`}
        >
          <Button variant="contained" size="large" disableElevation>
            New Delivery Order
          </Button>
        </Link>
      </Box>

      {/* Deliver y order details */}
      <Box
        p={2}
        bgcolor="white"
        border="1px solid #E2E6E9"
        display="grid"
        gap={2}
      >
        {/* details header */}
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Typography
            variant="h6"
            color="#3B7CED"
            fontSize={20}
            fontWeight={500}
          >
            Product Information
          </Typography>
          <Box display="flex" gap={2}>
            <Button
              variant="text"
              size="large"
              disableElevation
              onClick={() => window.history.back()}
            >
              Close
            </Button>

            <Button onClick={handleDelete}>Delete</Button>

            {(status === "draft" || status === "waiting") && (
              <Link
                to={`/${tenant_schema_name}/inventory/operations/delivery-order/${id}/edit`}
              >
                <Button variant="contained" size="large" disableElevation>
                  Edit
                </Button>
              </Link>
            )}
          </Box>
        </Box>
        {/* main details */}
        <Box display="flex" flexDirection="column" gap={3}>
          {/* First group */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} lg={3}>
              <FormGroup label="ID">
                {singleDeliveryOrder.order_unique_id}
              </FormGroup>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <FormGroup label="Status">
                <Typography color={getStatusColor(status)}>
                  {transformStatus(status)}
                </Typography>
              </FormGroup>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <FormGroup label="Customer Name">
                {singleDeliveryOrder.customer_name}
              </FormGroup>
            </Grid>

            <Grid item xs={12} sm={6} lg={3}>
              <FormGroup label="Source Location">
                <Typography>{singleLocation?.location_name}</Typography>
              </FormGroup>
            </Grid>
          </Grid>
          <Divider />
          {/* Second group */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} lg={3}>
              <FormGroup label="Delivery Address">
                <Box>{singleDeliveryOrder.delivery_address}</Box>
              </FormGroup>
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <FormGroup label="Delivery Date">
                {formatDate(singleDeliveryOrder.delivery_date)}
              </FormGroup>
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <FormGroup label="Shipping Policy">
                <Box>{singleDeliveryOrder.shipping_policy}</Box>
              </FormGroup>
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <FormGroup label="Assigned to">
                <Box>{singleDeliveryOrder.assigned_to}</Box>
              </FormGroup>
            </Grid>
          </Grid>
          <Divider />
          {/* product table */}
          <TableContainer
            sx={{
              borderRadius: 2,
              border: "1px solid #E2E6E9",
              bgcolor: "#fff",
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow
                  sx={{
                    fontWeight: 500,
                    color: "#7A8A98",
                    fontSize: "14px",
                    p: 3,
                  }}
                >
                  {tableColumns.map((columnLabel) => (
                    <TableCell key={columnLabel}>{columnLabel}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {singleDeliveryOrder.delivery_order_items.map((row) => (
                  <TableRow
                    key={row.id}
                    hover
                    sx={{
                      "&:nth-of-type(odd)": {
                        bgcolor: "#f1f1f1",
                        color: "#7A8A98",
                      },
                    }}
                  >
                    <TableCell>
                      {row.product_details.product_name || "Product name"}
                    </TableCell>
                    <TableCell>{row.quantity_to_deliver}</TableCell>
                    <TableCell>
                      {row.product_details.unit_of_measure_details
                        .unit_category || "Unit of measure"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        {/* detail footer */}
        <Box display="flex" justifyContent="space-between">
          <Typography color={getStatusColor(status)}>
            {transformStatus(status)}
          </Typography>
          {status !== "done" && (
            <Button variant="contained" onClick={handleSubmit}>
              {status === "draft" || status === "waiting"
                ? "Check Availability"
                : status === "ready"
                ? "Proceed"
                : ""}
            </Button>
          )}
          {status === "done" && (
            <Link
              to={`/${tenant_schema_name}/inventory/operations/delivery-order/${orderId}/return`}
            >
              <Button>Return</Button>
            </Link>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default DeliveryOrderInfo;
