// InternalTransfer
import React, { useState, useMemo, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";
import { useTenant } from "../../../../context/TenantContext";
import { useInternalTransfer } from "../../../../context/Inventory/InternalTransferContext";
import InternalTransferCommonTable from "./componentInternalTransfer/InternalTransferCommonTable";
import { formatDate } from "../../../../helper/helper";

// Status color mapping
const getStatusColor = (status) => {
  const s = String(status).toLowerCase();
  if (s === "approved") return "#2899B2";
  if (s === "done") return "#158048";
  if (s === "draft") return "#2899B2";
  if (s === "release") return "#8B21DF";
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

// Column definitions
const columns = [
  { id: "id", label: "ID" },
  { id: "sourceLocation", label: "Source Location" },
  { id: "destinationLocation", label: "Destination Location" },
  { id: "dateCreated", label: "Date Created" },
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
          color={getStatusColor(row.status)}
          fontSize={12}
        >
          {getStatusDisplay(row.status)}
        </Typography>
      </Box>
    ),
  },
];

export default function InternalTransfer() {
  const { tenantData } = useTenant();
  const tenantSchema = tenantData?.tenant_schema_name ?? "";
  const { getInternalTransferList, internalTransfers, isLoading, error } =
    useInternalTransfer();
  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState("list");
  const rowsPerPage = 50; // Adjustable rows per page

  const history = useHistory();

  // Map API data to flat row format
  const mappedInternalTransfers = useMemo(() => {
    return internalTransfers.map((transfer) => ({
      id: transfer.id,
      sourceLocation:
        transfer.source_location_details?.location_name ||
        transfer.source_location ||
        "",
      destinationLocation:
        transfer.destination_location_details?.location_name ||
        transfer.destination_location ||
        "",
      dateCreated: transfer.date_created
        ? formatDate(transfer.date_created)
        : "",
      status: transfer.status || "",
    }));
  }, [internalTransfers]);

  // Local filtering due to server-side search error
  const filteredRows = useMemo(() => {
    if (!searchQuery) return mappedInternalTransfers;
    const q = searchQuery.toLowerCase();
    return mappedInternalTransfers.filter((row) =>
      Object.values(row).some((val) => String(val).toLowerCase().includes(q))
    );
  }, [mappedInternalTransfers, searchQuery]);

  // Debounced search effect (keep for when backend is fixed)
  useEffect(() => {
    const handler = setTimeout(() => {
      getInternalTransferList(searchQuery);
    }, 300); // Debounce by 300ms

    return () => clearTimeout(handler);
  }, [searchQuery, getInternalTransferList]);

  useEffect(() => {
    getInternalTransferList(); // Initial load
  }, [getInternalTransferList]);

  return (
    <Box p={2} mr={2}>
      <Typography variant="h6" fontSize="24px" fontWeight={500} mb={2}>
        Internal Transfer
      </Typography>

      {error && (
        <Typography color="error" mb={2}>
          {typeof error === "object" ? JSON.stringify(error) : error}
        </Typography>
      )}

      <InternalTransferCommonTable
        columns={columns}
        rows={filteredRows}
        rowKey="id"
        searchable
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        paginated
        page={page}
        rowsPerPage={rowsPerPage}
        totalPages={Math.ceil(filteredRows.length / rowsPerPage)}
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
            prev.length === filteredRows.length
              ? []
              : filteredRows.map((r) => r.id)
          )
        }
        actionButton={{
          text: "New Transfer Order",
          link: `/${tenantSchema}/inventory/operations/internal-transfer/create-internal-transfer`,
          action: "create",
          app: "inventory",
          module: "internaltransfer",
        }}
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
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": {
                transform: "scale(1.02)",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              },
            }}
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={2}
            onClick={() =>
              history.push(
                `/${tenantSchema}/inventory/operations/internal-transfer/${item.id}`
              )
            }
          >
            <Typography variant="subtitle2">{item.id}</Typography>
            <Typography variant="body2" color="textSecondary" fontSize={12}>
              Source: {item.sourceLocation}
            </Typography>
            <Typography variant="body2" color="textSecondary" fontSize={12}>
              Destination: {item.destinationLocation}
            </Typography>
            <Typography variant="body2" color="textSecondary" fontSize={12}>
              Created: {item.dateCreated}
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
                {getStatusDisplay(item.status)}
              </Typography>
            </Box>
          </Box>
        )}
        path={`/${tenantSchema}/inventory/operations/internal-transfer`}
        isLoading={isLoading}
      />
    </Box>
  );
}
