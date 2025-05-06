import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Box, Button, Paper, Typography } from "@mui/material";
import CommonTable from "../../../../components/CommonTable/CommonTable";
import { useTenant } from "../../../../context/TenantContext";
import { mockData } from "../../data/incomingProductData";
// import { getStatusColor } from '../../utils';

const IncomingProductManualListview = () => {
  const { tenantData } = useTenant();
  const tenantSchemaName = tenantData?.tenant_schema_name;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState("list");

  const getStatusColor = (status) => {
    switch (status) {
      case "Validate":
      case "Validated":
        return "#2ba24c";
      case "Draft":
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
    { id: "requestId", label: "Request ID" },
    { id: "partner", label: "Partner" },
    { id: "dateCreated", label: "Date Created" },
    { id: "sourceLocation", label: "Source Location" },
    { id: "destinationLocation", label: "Destination Location" },
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
      <Typography variant="subtitle2">{item.requestId}</Typography>
      <Typography variant="body2" color={"textSecondary"} fontSize={12}>
        {item.dateCreated}
      </Typography>
      <Typography variant="body2" color={"textSecondary"} fontSize={12}>
        {item.sourceLocation}
      </Typography>
      <Typography variant="body2" color="textSecondary" fontSize={12}>
        {item.partner}
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
    <Box>
      <CommonTable
        columns={columns}
        rows={mockData.filter((item) =>
          Object.values(item).some((v) =>
            String(v).toLowerCase().includes(searchQuery.toLowerCase())
          )
        )}
        rowKey="requestId"
        searchable
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        paginated
        page={page}
        totalPages={Math.ceil(mockData.length / 5)}
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
            prev.length === mockData.length
              ? []
              : mockData.map((r) => r.requestId)
          )
        }
        actionButton={{
          text: "New Incoming Product",
          link: `/${tenantSchemaName}/inventory/operations/creat-incoming-product`,
        }}
        gridRenderItem={renderGridItem}
        path={`/${tenantSchemaName}/inventory/operations/incoming-product`}
      />
    </Box>
  );
};

export default IncomingProductManualListview;
