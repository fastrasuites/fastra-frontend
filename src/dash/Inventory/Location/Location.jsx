import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useTenant } from "../../../context/TenantContext";
import { useCustomLocation } from "../../../context/Inventory/LocationContext";
import CommonTable from "../../../components/CommonTable/CommonTable";
import LocationStep from "./LocationStep";
import Can from "../../../components/Access/Can";

const locationTypes = [
  {
    type: "Suppliers Location",
    desc: "Products coming in from suppliers (PO).",
  },
  {
    type: "Customers Location",
    desc: "Product going out to customers (deliveries).",
  },
];

const LocationGridItem = ({ item }) => {
  const theme = useTheme();

  return (
    <Paper
      sx={{
        p: 3,
        cursor: "pointer",
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        mb: 2,
        "&:hover": { boxShadow: theme.shadows[2] },
      }}
    >
      <Typography variant="subtitle2" gutterBottom>
        {item.id}
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        {item.location_name}
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        {item.address}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {item.contact_information}
      </Typography>
    </Paper>
  );
};

function Location() {
  const theme = useTheme();
  const { tenantData } = useTenant();
  const tenantSchemaName = tenantData?.tenant_schema_name;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState("list");

  const { locationList, getLocationList, isLoading, error } =
    useCustomLocation();

  const columns = [
    { id: "id", label: "Location ID" },
    { id: "location_name", label: "Location Name" },
    { id: "address", label: "Address" },
    { id: "contact_information", label: "Phone Number" },
  ];

  useEffect(() => {
    getLocationList();
  }, [getLocationList]);

  const handleRowSelect = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedRows((prev) =>
      prev.length === locationList.length ? [] : locationList.map((r) => r.id)
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Can app="inventory" module="location" action="create">
          <Button
            component={Link}
            to={`/${tenantData?.tenant_schema_name}/inventory/location/create-inventory-location`}
            variant="contained"
            startIcon={<LocationOnIcon />}
          >
            Create Location
          </Button>
        </Can>
      </Box>

      {/* Location Types Table */}
      <TableContainer component={Paper} sx={{ mb: 4, maxWidth: "900px" }}>
        <Table>
          <TableBody>
            {locationTypes.map((location, index) => (
              <TableRow
                key={location.type}
                sx={{
                  backgroundColor:
                    theme.palette.background[index % 2 ? "default" : "paper"],
                }}
              >
                <TableCell
                  sx={{ display: "flex", alignItems: "center", gap: 2 }}
                >
                  <LocationOnIcon color="primary" />
                  <Typography variant="body1">{location.type}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {location.desc}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Locations Table */}
      <CommonTable
        columns={columns}
        rows={locationList}
        rowKey="id"
        searchable
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        paginated
        page={page}
        totalPages={Math.ceil(locationList.length / 5)}
        onPageChange={setPage}
        viewModes={["list", "grid"]}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectable
        selectedRows={selectedRows}
        onRowSelect={handleRowSelect}
        onSelectAll={handleSelectAll}
        gridRenderItem={(item) => <LocationGridItem item={item} />}
        loading={isLoading}
        error={error}
        sx={{ boxShadow: "none" }}
        path={`/${tenantSchemaName}/inventory/location`}
      />

      <LocationStep open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </Box>
  );
}

export default Location;
