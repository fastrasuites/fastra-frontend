import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import CommonTable from "../../../../components/CommonTable/CommonTable";
import { useTenant } from "../../../../context/TenantContext";
import { useIncomingProduct } from "../../../../context/Inventory/IncomingProduct";

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case "validated":
      return "#2ba24c";
    case "draft":
      return "#158fec";
    case "cancelled":
    case "cancel":
      return "#e43e2b";
    default:
      return "#9e9e9e";
  }
};

const IncomingProductManualListview = ({ selectedLocation }) => {
  const { tenantData } = useTenant();
  const tenantSchemaName = tenantData?.tenant_schema_name;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState("list");

  const { incomingProductList, getIncomingProductList, isLoading } =
    useIncomingProduct();

  console.log(selectedLocation);

  useEffect(() => {
    const debounce = setTimeout(() => {
      getIncomingProductList(searchQuery, selectedLocation);
    }, 500);
    return () => clearTimeout(debounce);
  }, [searchQuery, getIncomingProductList, selectedLocation]);

  const cleanedIncomingProductList = incomingProductList.map((item) => ({
    ...item,
    destination_location:
      item.destination_location_details?.location_name || "N/A",
    source_location: item.source_location_details?.location_name || "N/A",
  }));

  const columns = [
    { id: "incoming_product_id", label: "Incoming Product ID" },
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
  ];

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
      <Typography variant="body2" color={"textSecondary"} fontSize={12}>
        {item.receipt_type?.replace(/_/g, " ")}
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
            ? cleanedIncomingProductList
            : cleanedIncomingProductList.filter((item) =>
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
        totalPages={Math.ceil(cleanedIncomingProductList.length / 5)}
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
            prev.length === cleanedIncomingProductList.length
              ? []
              : cleanedIncomingProductList.map((r) => r.requestId)
          )
        }
        actionButton={{
          text: "New Incoming Product",
          link: `/${tenantSchemaName}/inventory/operations/creat-incoming-product`,
          action: "create",
          app: "inventory",
          module: "incomingproduct",
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
