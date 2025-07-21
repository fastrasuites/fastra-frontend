import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Box, Button, Paper, Typography } from "@mui/material";
import CommonTable from "../../../../components/CommonTable/CommonTable";
import { useTenant } from "../../../../context/TenantContext";
import { useIncomingProduct } from "../../../../context/Inventory/IncomingProduct";
// import { mockData } from "../../data/incomingProductData";
// import { getStatusColor } from '../../utils';

const getStatusColor = (status) => {
  switch (status) {
    case "validated":
    case "Validated":
      return "#2ba24c";
    case "draft":
    case "Drafted":
      return "#158fec";
    case "Cancelled":
    case "Cancel":
      return "#e43e2b";
    default:
      return "#9e9e9e";
  }
};

const IncomingProductManualListview = () => {
  const { tenantData } = useTenant();
  const tenantSchemaName = tenantData?.tenant_schema_name;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState("list");

  const { incomingProductList, getIncomingProductList, isLoading } =
    useIncomingProduct();

  useEffect(() => {
    const debounce = setTimeout(() => {
      getIncomingProductList(searchQuery);
    }, 500);
    return () => clearTimeout(debounce);
  }, [searchQuery, getIncomingProductList]);

  const columns = [
    { id: "incoming_product_id", label: "Incoming Product ID" },
    { id: "receipt_type", label: "Receipt Type" },
    // { id: "dateCreated", label: "Date Created" },
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
      <Typography variant="subtitle2">{item.id}</Typography>
      <Typography
        variant="body2"
        color={"textSecondary"}
        fontSize={12}
        sx={{ textTransform: "capitalize" }}
      >
        {item.receipt_type.split("_").join(" ")}
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
    <Box>
      <CommonTable
        columns={columns}
        rows={
          searchQuery === ""
            ? incomingProductList
            : incomingProductList.filter((item) =>
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
        totalPages={Math.ceil(incomingProductList.length / 5)}
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
            prev.length === incomingProductList.length
              ? []
              : incomingProductList.map((r) => r.requestId)
          )
        }
        actionButton={{
          text: "New Incoming Product",
          link: `/${tenantSchemaName}/inventory/operations/creat-incoming-product`,
        }}
        gridRenderItem={renderGridItem}
        path={`/${tenantSchemaName}/inventory/operations/incoming-product`}
        isLoading={isLoading}
        rowKey="incoming_product_id"
      />
    </Box>
  );
};

export default IncomingProductManualListview;
