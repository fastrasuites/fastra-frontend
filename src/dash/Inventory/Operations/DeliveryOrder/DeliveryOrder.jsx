import React, { useState, useMemo, useEffect } from "react";
import "./DeliveryOrder.css";
import { Box } from "@mui/system";
import { Typography, CircularProgress, Button } from "@mui/material";
import CommonTable from "../../../../components/CommonTable/CommonTable";
import { useTenant } from "../../../../context/TenantContext";
import { useDeliveryOrder } from "../../../../context/Inventory/DeliveryOrderContext";
import { formatDate } from "../../../../helper/helper";
import { highlightMatch } from "../../../../helper/highlightMatch";
import { useCustomLocation } from "../../../../context/Inventory/LocationContext";

// Status color mapping extracted once
const getStatusColor = (status) => {
  const s = String(status).toLowerCase();
  if (s === "ready") return "#2ba24c";
  if (s === "draft") return "#158fec";
  if (s === "waiting" || s === "awaiting approval") return "#e43e2b";
  if (s === "done") return "#2ba24c";
  if (s === "cancelled") return "#e43e2b";
  return "#9e9e9e";
};

const DeliveryOrder = () => {
  const { tenantData } = useTenant();
  const tenantSchema = tenantData?.tenant_schema_name ?? "";
  const { deliveryOrderList, getDeliveryOrderList, isLoading, error } =
    useDeliveryOrder();
  const { locationList, getLocationList } = useCustomLocation();

  useEffect(() => {
    getLocationList();
  }, [getLocationList]);

  useEffect(() => {
    getDeliveryOrderList();
  }, [getDeliveryOrderList]);

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState("list");
  const [selectedRows, setSelectedRows] = useState([]);

  // Column definitions extracted once
  const columns = useMemo(
    () => [
      {
        id: "requestId",
        label: "ID",
        render: (row) => highlightMatch(row.requestId, searchQuery),
      },
      {
        id: "partner",
        label: "Partner",
        render: (row) => highlightMatch(row.partner, searchQuery),
      },
      {
        id: "sourceLocation",
        label: "Source Location",
        render: (row) => highlightMatch(row.sourceLocation, searchQuery),
      },
      {
        id: "destinationLocation",
        label: "Destination Location",
        render: (row) => highlightMatch(row.destinationLocation, searchQuery),
      },
      {
        id: "dateCreated",
        label: "Date Created",
        render: (row) => highlightMatch(row.dateCreated, searchQuery),
      },
      {
        id: "amount",
        label: "Amount",
        render: (row) => highlightMatch(row.amount, searchQuery),
      },
      {
        id: "status",
        label: "Status",
        render: (row) => (
          <Box display="flex" alignItems="center">
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: getStatusColor(row.status),
                mr: 1,
              }}
            />
            <Typography variant="caption" color={getStatusColor(row.status)}>
              {highlightMatch(row.status, searchQuery)}
            </Typography>
          </Box>
        ),
      },
    ],
    [searchQuery]
  );

  const orderLocationDetails = (sourceLocation) =>
    locationList.find((loc) => loc?.id === sourceLocation);

  const transformedData = useMemo(
    () =>
      deliveryOrderList.map((order) => ({
        id: order.id,
        requestId: order.order_unique_id,
        partner: order.customer_name,
        sourceLocation: orderLocationDetails(order.source_location)
          ?.location_name,
        destinationLocation: order.delivery_address,
        dateCreated: formatDate(order.date_created),
        amount: order.delivery_order_items
          .reduce((acc, cur) => acc + parseFloat(cur.total_price || "0"), 0)
          .toFixed(2),
        status: order.status.charAt(0).toUpperCase() + order.status.slice(1),
      })),
    [deliveryOrderList]
  );

  // Memoized filtered rows
  const filteredRows = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return transformedData.filter((row) =>
      Object.values(row).some((val) => String(val).toLowerCase().includes(q))
    );
  }, [searchQuery, transformedData]);

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
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => window.history.back()}
        >
          Back
        </Button>
      </Box>
    );
  }

  return (
    <Box p={2} mr={2}>
      <CommonTable
        actionButton={{
          text: "New Delivery Order",
          link: `/${tenantSchema}/inventory/operations/delivery-order/create-delivery-order`,
          action: "create",
          app: "inventory",
          module: "deliveryorder",
        }}
        columns={columns}
        rows={filteredRows}
        rowKey="id"
        columnKeys={columns.map((col) => col.id)}
        searchable
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        paginated
        page={page}
        totalPages={Math.ceil(filteredRows.length)}
        onPageChange={setPage}
        viewModes={["list", "grid"]}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectable
        selectedRows={selectedRows}
        onRowSelect={(id) =>
          setSelectedRows((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
          )
        }
        onSelectAll={() =>
          setSelectedRows((prev) =>
            prev.length === transformedData.length
              ? []
              : transformedData.map((r) => r.id)
          )
        }
        gridRenderItem={(item) => (
          <Box
            key={item.id}
            sx={{
              p: 3,
              cursor: "pointer",
              border: "1.2px solid #E2E6E9",
              borderRadius: 2,
              mb: 2,
              backgroundColor: "#fffffd",
            }}
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={2}
          >
            <Typography variant="subtitle2">{item.requestId}</Typography>
            <Typography variant="body2" color="textSecondary" fontSize={12}>
              {item.dateCreated}
            </Typography>
            <Typography variant="body2" color="textSecondary" fontSize={12}>
              {item.sourceLocation}
            </Typography>
            <Typography variant="body2" color="textSecondary" fontSize={12}>
              {item.partner}
            </Typography>
            <Typography variant="body2" color="textSecondary" fontSize={12}>
              {item.amount}
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: getStatusColor(item.status),
                }}
              />
              <Typography
                variant="caption"
                color={getStatusColor(item.status)}
                fontSize={12}
              >
                {item.status}
              </Typography>
            </Box>
          </Box>
        )}
        path={`/${tenantSchema}/inventory/operations/delivery-order`}
      />
    </Box>
  );
};

export default DeliveryOrder;
