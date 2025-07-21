import { Box, Typography } from "@mui/material";
import "./Scrap.css";
import { useTenant } from "../../../../context/TenantContext";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import CommonTable from "../../../../components/CommonTable/CommonTable";
import { useScrap } from "../../../../context/Inventory/Scrap";
// import { scraps } from "../../data/incomingProductData";

const getStatusColor = (status) => {
  switch (status) {
    case "DONE":
    case "Done":
      return "#2ba24c";
    case "DRAFT":
    case "Drafted":
      return "#158fec";
    case "Cancelled":
    case "Cancel":
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

function Scrap() {
  const { tenantData } = useTenant();
  const tenant_schema_name = tenantData?.tenant_schema_name;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState("list");

  const { scrapList, isLoading, error, getScrapList } = useScrap();

  useEffect(() => {
    getScrapList();
  }, []);

  const arrangeScrap = scrapList.map((item) => ({
    ...item,
    status: item.status.toUpperCase(),
    warehouse_location: item.warehouse_location?.location_name ?? "—",
  }));

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
      <Typography variant="subtitle2">{item?.id}</Typography>

      <Typography variant="body2" color={"textSecondary"} fontSize={12}>
        {item?.warehouse_location}
      </Typography>
      <Typography
        variant="body2"
        color={"textSecondary"}
        fontSize={12}
        textTransform={"capitalize"}
      >
        {item?.adjustment_type}
      </Typography>
      <Typography variant="body2" color="textSecondary" fontSize={12}>
        {item?.date}
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

  if (error) {
    return (
      <Box padding={"20px"} marginRight={"20px"}>
        <Typography
          variant="h6"
          fontSize={"24px"}
          fontWeight={500}
          marginBottom={2}
        >
          Scrap
        </Typography>
        <Typography variant="body2" color={"textSecondary"} fontSize={12}>
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box padding={"20px"} marginRight={"20px"}>
      <Typography
        variant="h6"
        fontSize={"24px"}
        fontWeight={500}
        marginBottom={2}
      >
        Scrap
      </Typography>
      <CommonTable
        columns={columns}
        rows={arrangeScrap.filter((item) =>
          Object.values(item).some((v) =>
            String(v).toLowerCase().includes(searchQuery.toLowerCase())
          )
        )}
        rowKey="id"
        searchable
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        paginated
        page={page}
        totalPages={Math.ceil(arrangeScrap.length / 5)}
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
            prev.length === arrangeScrap.length
              ? []
              : arrangeScrap.map((r) => r.requestId)
          )
        }
        actionButton={{
          text: "New Scrap",
          link: `/${tenant_schema_name}/inventory/stock/scrap/create-scrap`,
        }}
        gridRenderItem={renderGridItem}
        path={`/${tenant_schema_name}/inventory/stock/scrap`}
        isLoading={isLoading}
      />
    </Box>
  );
}

export default Scrap;
