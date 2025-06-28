import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import { useAccessGroups } from "../../../context/AccessGroups/AccessGroupsContext";
import { useTenant } from "../../../context/TenantContext";
import appIcons from "../../../helper/appIcons";
import { ViewList, GridView } from "@mui/icons-material";
import { formatDate } from "../../../helper/helper";
import { PaginationControls } from "../../../components/PaginationControls/PaginationControls";

const AccessGroups = () => {
  const { tenantData } = useTenant();
  const tenant_schema_name = tenantData?.tenant_schema_name || "";

  const { accessGroups, isLoading } = useAccessGroups();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'grid'
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 2;

  const filteredGroups = accessGroups.filter(
    (group) =>
      group.groupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.application.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };
  return (
    <Box p={{ xs: 2, sm: 4, md: 6 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
          <Typography variant="h5" color="primary">
            Access Groups
          </Typography>
          <Button
            variant="contained"
            color="primary"
            component={Link}
            to={`/${tenant_schema_name}/settings/accessgroups/new`}
          >
            Create
          </Button>
          <TextField
            label="Search access groups"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: "300px" }}
          />
        </Box>

        <Box display="flex" flexWrap="wrap">
          <PaginationControls
            onPrev={handlePrevPage}
            onNext={handleNextPage}
            page={currentPage}
            totalPages={totalPages}
          />
          <Box>
            <Tooltip title="List View">
              <IconButton
                color={viewMode === "list" ? "primary" : "default"}
                onClick={() => setViewMode("list")}
              >
                <ViewList />
              </IconButton>
            </Tooltip>
            <Tooltip title="Grid View">
              <IconButton
                color={viewMode === "grid" ? "primary" : "default"}
                onClick={() => setViewMode("grid")}
              >
                <GridView />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {isLoading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : filteredGroups.length === 0 ? (
        <Typography align="center" mt={4}>
          No access groups found
        </Typography>
      ) : viewMode === "list" ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {[
                  "AccessGroups",
                  "Group Name",
                  "Date of Creation",
                  "Actions",
                ].map((label, index) => (
                  <TableCell
                    key={index}
                    align={label === "Actions" ? "right" : "left"}
                    sx={{ color: "#7A8A98", fontWeight: "bold" }}
                  >
                    {label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredGroups.map((group, index) => (
                <TableRow
                  key={group.id}
                  sx={{
                    backgroundColor: index / 2 === 0 ? "#F2F2F2" : "white",
                    "&:hover": {
                      backgroundColor: "#E0E0E0",
                    },
                  }}
                >
                  <TableCell sx={{ color: "#7A8A98" }}>
                    <img
                      src={
                        appIcons[group.application.toUpperCase()] ||
                        appIcons.SETTINGS
                      }
                      alt="application icon"
                      style={{
                        width: 16,
                        height: 16,
                        marginRight: 8,
                        display: "inline-block",
                      }}
                    />
                    {group.id}
                  </TableCell>
                  <TableCell sx={{ color: "#7A8A98" }}>
                    {group.groupName}
                  </TableCell>
                  <TableCell sx={{ color: "#7A8A98" }}>
                    {group.createdAt}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      component={Link}
                      to={`/${tenant_schema_name}/settings/accessgroups/${group.id}`}
                      size="small"
                      sx={{ mr: 1 }}
                    >
                      View
                    </Button>
                    <Button
                      component={Link}
                      to={`/${tenant_schema_name}/settings/accessgroups/${group.id}/edit`}
                      size="small"
                      color="secondary"
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box
          display="grid"
          gridTemplateColumns="repeat(auto-fill, minmax(300px, 1fr))"
          gap={3}
        >
          {filteredGroups.map((group) => (
            <Paper key={group.id} sx={{ p: 2 }}>
              <Box display="flex" sx={{ color: "#7A8A98" }}>
                <Box>
                  <img
                    src={
                      appIcons[group.application.toUpperCase()] ||
                      appIcons.SETTINGS
                    }
                    alt="application icon"
                    style={{
                      width: 16,
                      height: 16,
                      marginRight: 8,
                      display: "inline-block",
                    }}
                  />
                </Box>
                <Box sx={{ width: "100%" }}>
                  <Box mb={2}>
                    <Box display="flex" justifyContent="space-between">
                      <Box>
                        <strong>{group.id}</strong>
                      </Box>

                      <Box>
                        <Button
                          component={Link}
                          to={`/${tenant_schema_name}/settings/accessgroups/${group.id}`}
                          size="small"
                          sx={{ mr: 1 }}
                        >
                          View
                        </Button>
                        <Button
                          component={Link}
                          to={`/${tenant_schema_name}/settings/accessgroups/${group.id}/edit`}
                          size="small"
                        >
                          Edit
                        </Button>
                      </Box>
                    </Box>
                    <Box>
                      <Box mt={1} fontSize="1.2rem" fontWeight="bold">
                        {group.groupName}
                      </Box>
                    </Box>
                  </Box>

                  <Box>
                    <strong>Created:</strong> {group.createdAt}
                  </Box>
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default AccessGroups;
