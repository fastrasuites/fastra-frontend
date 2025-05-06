import { Link } from "react-router-dom";
import {
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
  Box,
} from "@mui/material";
import "./StockAdjustment.css";
import CommonTable from "../../../../components/CommonTable/CommonTable";
import { useEffect, useState } from "react";
import { useTenant } from "../../../../context/TenantContext";
import { stocks } from "../../data/incomingProductData";
import { useStockAdjustment } from "../../../../context/Inventory/StockAdjustment";
function StockAdjustment() {
  const { tenantData } = useTenant();
  const tenantSchemaName = tenantData?.tenant_schema_name;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState("list");
  

  const {
    adjustmentList,
    isLoading,
    error,
    getStockAdjustmentList,
  } = useStockAdjustment();



  useEffect(() => {
    getStockAdjustmentList()
  }, [])



  const arrangeStockAdjustments = adjustmentList.map((item) => ({
    ...item,
    warehouse_location: item.warehouse_location?.location_name ?? "—",
  }));




  const getStatusColor = (status) => {
    const normalized = status.toLowerCase();
    switch (normalized) {
      case "validate":
      case "validated":
        return "#2ba24c";
      case "draft":
      case "drafted":
        return "#158fec";
      case "cancelled":
      case "cancel":
        return "#e43e2b";
      default:
        return "#9e9e9e";
    }
  };
  const columns = [
    { id: "id", label: "ID" },
    { id: "adjustment_type", label: "Adjustment Type" },
    { id: "warehouse_location", label: "Location" },
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

  console.log("adjustmentList", adjustmentList);

  // Grid item renderer
  const renderGridItem = (item) => (
    <Box
      key={item.requestId}
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
      gap="16px"
    >
      <Typography variant="subtitle2">{item.Id}</Typography>
      <Typography variant="body2" color={"textSecondary"} fontSize={12}>
        {item.dateCreated}
      </Typography>
      <Typography variant="body2" color={"textSecondary"} fontSize={12}>
        {item.location}
      </Typography>
      <Typography variant="body2" color="textSecondary" fontSize={12}>
        {item.dateClosed}
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
          color={getStatusColor(item.status)}
          fontSize={12}
        >
          {item.status}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box padding={"20px"} marginRight={"20px"}>
      <Typography
        variant="h6"
        fontSize={"24px"}
        fontWeight={500}
        marginBottom={2}
      >
        Stock Adjustment
      </Typography>

      
      <CommonTable
        columns={columns}
        rows={arrangeStockAdjustments.filter((item) =>
          Object.values(item).some((v) =>
            String(v ?? "")
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
          )
        )}
        rowKey="id"
        searchable
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        paginated
        page={page}
        totalPages={Math.ceil(stocks.length / 5)}
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
            prev.length === stocks.length ? [] : stocks.map((r) => r.requestId)
          )
        }
        actionButton={{
          text: "New Stock Adjustment",
          link: `/${tenantSchemaName}/inventory/stock/stock-adjustment/create-stock-adjustment`,
        }}
        gridRenderItem={renderGridItem}
        path={`/${tenantSchemaName}/inventory/stock/stock-adjustment`}
        isLoading={isLoading}

      />
    </Box>
  );
}

export default StockAdjustment;
