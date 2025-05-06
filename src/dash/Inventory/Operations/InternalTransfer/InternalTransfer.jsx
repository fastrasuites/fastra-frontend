import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Typography,
  Button,
} from "@mui/material";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import CommonTable from "../../../../components/CommonTable/CommonTable";
import { useTenant } from "../../../../context/TenantContext";
import { internalTransferData } from "../../data/incomingProductData";

// Status color mapping extracted once
const getStatusColor = (status) => {
  const s = String(status).toLowerCase();
  if (s === "done") return "#2ba24c";
  if (s === "draft") return "#158fec";
  if (s === "cancelled") return "#e43e2b";
  if (s === "awaiting" || s === "awaiting approval") return "#F0B501";
  return "#9e9e9e";
};

// Column definitions extracted once
const columns = [
  { id: "sourceLocation", label: "Source Location" },
  { id: "productName", label: "Product Name" },
  { id: "quantity", label: "Quantity" },
  { id: "unitOfMeasure", label: "Unit of Measure" },
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
          {row.status}
        </Typography>
      </Box>
    ),
  },
];



export default function InternalTransfer() {
  const { tenantData } = useTenant();
  const tenantSchema = tenantData?.tenant_schema_name ?? "";

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState("list");

  // Memoized filtered rows
  const filteredRows = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return internalTransferData.filter((row) =>
      Object.values(row).some((val) => String(val).toLowerCase().includes(q))
    );
  }, [searchQuery]);

  return (
    <Box p={2} mr={2}>
      <Typography variant="h6" fontSize="24px" fontWeight={500} mb={2}>
        Internal Transfer
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
        onRowSelect={(id) =>
          setSelectedRows((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
          )
        }
        onSelectAll={() =>
          setSelectedRows((prev) =>
            prev.length === internalTransferData.length
              ? []
              : internalTransferData.map((r) => r.id)
          )
        }
        actionButton={{
          text: "New Transfer Order",
          link: `/${tenantSchema}/inventory/operations/internal-transfer/create-internal-transfer`,
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
            }}
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={2}
          >
            <Typography variant="subtitle2">{item.id}</Typography>
            <Typography variant="body2" color="textSecondary" fontSize={12}>
              {item.productName}
            </Typography>
            <Typography variant="body2" color="textSecondary" fontSize={12}>
              Qty: {item.quantity} {item.unitOfMeasure}
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
        path={`/${tenantSchema}/inventory/operations/internal-transfer`}
      />
    </Box>
  );
}
