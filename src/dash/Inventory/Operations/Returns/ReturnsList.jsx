import { useEffect, useState } from "react";
import { Typography, Box } from "@mui/material";
import CommonTable from "../../../../components/CommonTable/CommonTable";
import { useTenant } from "../../../../context/TenantContext";
import { useIncomingProduct } from "../../../../context/Inventory/IncomingProduct";

function ReturnList() {
  const { tenantData } = useTenant();
  const tenantSchemaName = tenantData?.tenant_schema_name;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState("list");

  const { returnList, isLoading, getIncomingReturnList } = useIncomingProduct();

  console.log(returnList);

  useEffect(() => {
    getIncomingReturnList();
  }, []);

  const cleanedReturn = returnList.map((item) => {
    return {
      ...item,
      sourceLocation:
        item?.source_document_details?.source_location_details?.location_name,
    };
  });

  const getStatusColor = (status) => {
    const normalized = (status || "").toLowerCase();
    switch (normalized) {
      case "completed":
        return "#2ba24c";
      case "pending":
        return "#158fec";
      default:
        return "#9e9e9e";
    }
  };

  const columns = [
    { id: "unique_id", label: "ID" },
    { id: "reason_for_return", label: "Reason For Return" },
    { id: "sourceLocation", label: "Supplier Location" },
    // {
    //   id: "status",
    //   label: "Status",
    //   render: (row) => (
    //     <Box display="flex" alignItems="center">
    //       <Box
    //         sx={{
    //           width: 8,
    //           height: 8,
    //           borderRadius: "50%",
    //           backgroundColor: getStatusColor(row.status),
    //           mr: 1,
    //         }}
    //       />
    //       <Typography
    //         variant="caption"
    //         color={getStatusColor(row.status)}
    //         fontSize={12}
    //       >
    //         {row.status}
    //       </Typography>
    //     </Box>
    //   ),
    // },
  ];

  return (
    <Box padding={"20px"} marginRight={"20px"}>
      <Typography
        variant="h6"
        fontSize={"24px"}
        fontWeight={500}
        marginBottom={2}
      >
        Return List
      </Typography>

      <CommonTable
        columns={columns}
        rows={cleanedReturn.filter((item) =>
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
        totalPages={Math.ceil(cleanedReturn.length / 5)}
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
            prev.length === cleanedReturn.length
              ? []
              : cleanedReturn.map((r) => r.id)
          )
        }
        gridRenderItem={(item) => (
          <Box
            key={item.id}
            sx={{
              padding: "24px",
              border: "1.2px solid #E2E6E9",
              borderRadius: 2,
              mb: 2,
              backgroundColor: "#fffffd",
            }}
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap="8px"
          >
            <Typography variant="subtitle2">{item.product_name}</Typography>
            <Typography variant="body2" fontSize={12}>
              {item.quantity}
            </Typography>
            <Typography variant="body2" fontSize={12}>
              {item.warehouse_location}
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
        // path={`/${tenantSchemaName}/inventory/return-incoming-product`}
        disableClick={true}
        isLoading={isLoading}
      />
    </Box>
  );
}

export default ReturnList;
