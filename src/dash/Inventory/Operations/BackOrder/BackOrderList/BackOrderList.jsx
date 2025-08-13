// src/dash/Inventory/Operations/BackOrder/BackOrderManualListview.jsx

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Button,
} from "@mui/material";
import CommonTable from "../../../../../components/CommonTable/CommonTable";
import { useTenant } from "../../../../../context/TenantContext";
import { useBackOrder } from "../../../../../context/Inventory/BackOrderContext";
import { formatDate } from "../../../../../helper/helper";

const getStatusColor = (status) => {
  if (!status) return "#9e9e9e";
  switch (String(status).toLowerCase()) {
    case "validated":
      return "#2ba24c";
    case "draft":
      return "#158fec";
    case "canceled":
    case "cancelled":
    case "cancel":
      return "#e43e2b";
    default:
      return "#9e9e9e";
  }
};

const BackOrderList = ({ selectedLocation }) => {
  const { tenantData } = useTenant();
  const tenantSchemaName = tenantData?.tenant_schema_name;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState("list");
  const [statusFilter, setStatusFilter] = useState(""); // "", "draft", "validated", "canceled"
  const [backorderOfIncomingId, setBackorderOfIncomingId] = useState("");

  const { backOrderList = [], getBackOrderList, isLoading } = useBackOrder();

  // Debounced fetch
  useEffect(() => {
    const debounce = setTimeout(() => {
      // call getBackOrderList(search, destination_location_id, status, backorder_of_incoming_product_id)
      getBackOrderList(
        searchQuery,
        selectedLocation || "",
        statusFilter,
        backorderOfIncomingId
      );
    }, 500);

    return () => clearTimeout(debounce);
  }, [
    searchQuery,
    selectedLocation,
    statusFilter,
    backorderOfIncomingId,
    getBackOrderList,
  ]);

  console.log(backOrderList);
  // Map API fields to what the table expects
  const cleanedBackOrderList = (backOrderList || []).map((item) => ({
    ...item,
    destination_location:
      item?.backorder_of_details?.destination_location_details?.location_name ||
      "N/A",
    source_location:
      item?.backorder_of_details?.source_location_details?.location_name ||
      "N/A",
    receipt_type: item?.backorder_of_details?.receipt_type || item.receipt_type,
    backorder_id: item.backorder_id,
    status: item.status,
    date_created: formatDate(item.date_created),
    // attach incoming product id if available (for display or filters)
    backorder_of_incoming_product_id:
      item.backorder_of_details?.incoming_product_id || item.backorder_of,
  }));

  const columns = [
    { id: "backorder_id", label: "Backorder ID" },
    { id: "backorder_of_incoming_product_id", label: "From Incoming Product" },
    { id: "receipt_type", label: "Receipt Type" },
    { id: "source_location", label: "Source Location" },
    { id: "destination_location", label: "Destination Location" },
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
          <Typography
            variant="caption"
            sx={{ textTransform: "capitalize" }}
            color={getStatusColor(row.status)}
            fontSize={12}
          >
            {row.status}
          </Typography>
        </Box>
      ),
    },
    { id: "date_created", label: "Date Created" },
  ];

  const renderGridItem = (item) => (
    <Box
      key={item.backorder_id}
      sx={{
        padding: "24px",
        cursor: "pointer",
        border: "1.2px solid #E2E6E9",
        borderRadius: 2,
        mb: 2,
        backgroundColor: "#fffffd",
      }}
      display={"flex"}
      flexDirection={"column"}
      alignItems={"center"}
      gap="12px"
    >
      <Typography variant="subtitle2">{item.backorder_id}</Typography>

      <Typography variant="body2" color={"textSecondary"} fontSize={12}>
        {String(item.receipt_type || "N/A").replace(/_/g, " ")}
      </Typography>

      <Typography variant="body2" color={"textSecondary"} fontSize={12}>
        {item.source_location}
      </Typography>

      <Typography variant="body2" color="textSecondary" fontSize={12}>
        {item.destination_location}
      </Typography>

      <Box display="flex" alignItems="center" gap={1}>
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            bgcolor: getStatusColor(item.status),
            mr: 1,
          }}
        />
        <Typography
          variant="caption"
          sx={{ textTransform: "capitalize" }}
          color={getStatusColor(item.status)}
          fontSize={12}
        >
          {item.status}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box px={4}>
      {/* Filters row */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        mb={2}
        px={4}
        alignItems="center"
      >
        {/* <TextField
          label="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
        /> */}

        {/* <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="backorder-status-label">Status</InputLabel>
          <Select
            labelId="backorder-status-label"
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="draft">Draft</MenuItem>
            <MenuItem value="validated">Validated</MenuItem>
            <MenuItem value="canceled">Canceled</MenuItem>
          </Select>
        </FormControl> */}
        {/* 
        <TextField
          label="Backorder of (Incoming Product ID)"
          value={backorderOfIncomingId}
          onChange={(e) => setBackorderOfIncomingId(e.target.value)}
          size="small"
          helperText="Filter by incoming product id that this backorder belongs to"
        /> */}

        {/* <Box>
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              // Clear filters
              setSearchQuery("");
              setStatusFilter("");
              setBackorderOfIncomingId("");
            }}
          >
            Clear
          </Button>
        </Box> */}
      </Stack>

      <CommonTable
        columns={columns}
        rows={
          // Keep client-side fallback filtering for fields not indexed server-side
          searchQuery === ""
            ? cleanedBackOrderList
            : cleanedBackOrderList.filter((item) =>
                Object.values(item).some((v) =>
                  String(v).toLowerCase().includes(searchQuery.toLowerCase())
                )
              )
        }
        searchable
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        paginated
        page={page}
        totalPages={Math.max(1, Math.ceil(cleanedBackOrderList.length / 5))}
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
            prev.length === cleanedBackOrderList.length
              ? []
              : cleanedBackOrderList.map((r) => r.backorder_id)
          )
        }
        actionButton={{
          text: "New Back Order",
          link: `/${tenantSchemaName}/inventory/operations/create-back-order`,
          action: "create",
          app: "inventory",
          module: "backorder",
        }}
        gridRenderItem={renderGridItem}
        path={`/${tenantSchemaName}/inventory/operations/back-orders`}
        isLoading={isLoading}
        rowKey="backorder_id"
      />
    </Box>
  );
};

export default BackOrderList;
