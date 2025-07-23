import React, { useState, useMemo, useCallback } from "react";
import { Box, Typography } from "@mui/material";
import { useTenant } from "../../../../context/TenantContext";
import CommonTable from "../../../../components/CommonTable/CommonTable";

// Determine status color
const getStatusColor = (status) => {
  const key = status.toLowerCase();
  if (key === "done") return "#2ba24c";
  if (key === "draft") return "#158fec";
  if (key === "cancelled" || key === "cancel") return "#e43e2b";
  return "#9e9e9e";
};

// Table columns definition
const columns = [
  { id: "id", label: "ID" },
  { id: "location", label: "Location" },
  { id: "date_created", label: "Date Created" },
  { id: "date_closed", label: "Date Closed" },
  {
    id: "status",
    label: "Status",
    render: ({ status }) => (
      <Box display="flex" alignItems="center">
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: getStatusColor(status),
            mr: 1,
          }}
        />
        <Typography
          variant="caption"
          fontSize={12}
          color={getStatusColor(status)}
        >
          {status}
        </Typography>
      </Box>
    ),
  },
];

// Sample data (move to context or props in real use)
const materialConsumptionData = [
  {
    id: "MC001",
    location: "Location 1",
    date_created: "4 Apr 2024 - 4:48 PM",
    date_closed: "4 Apr 2024 - 4:48 PM",
    status: "Done",
  },
  {
    id: "MC002",
    location: "Location 2",
    date_created: "4 Apr 2024 - 4:48 PM",
    date_closed: "4 Apr 2024 - 4:48 PM",
    status: "Done",
  },
  {
    id: "MC003",
    location: "Location 3",
    date_created: "4 Apr 2024 - 4:48 PM",
    date_closed: "4 Apr 2024 - 4:48 PM",
    status: "Draft",
  },
];

export default function MaterialConsumption() {
  const { tenantData } = useTenant();
  const tenantSchema = tenantData?.tenant_schema_name || "";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState("list");

  // Memoize filtered rows
  const filteredRows = useMemo(() => {
    if (!searchQuery) return materialConsumptionData;
    const q = searchQuery.toLowerCase();
    return materialConsumptionData.filter((row) =>
      Object.values(row).some((val) => String(val).toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const handleRowSelect = useCallback((id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedRows((prev) =>
      prev.length === filteredRows.length ? [] : filteredRows.map((r) => r.id)
    );
  }, [filteredRows]);

  return (
    <Box p={3} mr={2}>
      <Typography variant="h6" fontSize={24} fontWeight={500} mb={2}>
        Material Consumption
      </Typography>

      <CommonTable
        columns={columns}
        rows={filteredRows}
        rowKey="id"
        searchable
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        paginated
        page={page}
        totalPages={Math.ceil(filteredRows.length / 5)}
        onPageChange={setPage}
        viewModes={["list", "grid"]}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectable
        selectedRows={selectedRows}
        onRowSelect={handleRowSelect}
        onSelectAll={handleSelectAll}
        actionButton={{
          text: "Create Consumption",
          link: `/${tenantSchema}/inventory/operations/material-consumption/create-material-consumption`,
          action: "create",
          app: "inventory",
          module: "materialconsumption",
        }}
        gridRenderItem={(item) => (
          <Box
            key={item.id}
            p={3}
            mb={2}
            border={1}
            borderColor="#E2E6E9"
            borderRadius={2}
            bgcolor="#fffffd"
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={2}
          >
            <Typography variant="subtitle2">{item.id}</Typography>
            <Typography variant="body2" fontSize={12} color="textSecondary">
              {item.location}
            </Typography>
            <Typography variant="body2" fontSize={12} color="textSecondary">
              {item.date_created}
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
                fontSize={12}
                color={getStatusColor(item.status)}
              >
                {item.status}
              </Typography>
            </Box>
          </Box>
        )}
        path={`/${tenantSchema}/inventory/stock/scrap`}
      />
    </Box>
  );
}
