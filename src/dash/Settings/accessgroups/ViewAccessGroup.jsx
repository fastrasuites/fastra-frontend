// src/dash/Settings/accessgroups/ViewAccessGroup.jsx
import React, { useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Checkbox,
  Tabs,
  Tab,
  AppBar,
  Toolbar,
  Grid,
} from "@mui/material";
import { Link, useParams } from "react-router-dom";
import { useAccessGroups } from "../../../context/AccessGroups/AccessGroupsContext";
import { useTenant } from "../../../context/TenantContext";
import { PaginationControls } from "../../../components/PaginationControls/PaginationControls";
import FormToolbar from "./FormToolbar";
import appIcons from "../../../helper/appIcons";
import { smartFormatLabel, tabStyles } from "../../../helper/helper";

const ViewAccessGroup = () => {
  const { id } = useParams();
  const { accessGroups, accessRights } = useAccessGroups();
  const tenant_schema_name = useTenant()?.tenantData?.tenant_schema_name;
  const [activeTab, setActiveTab] = useState("view");
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 2;

  const group = accessGroups.find((g) => g.id === id);
  const access_code = group.id;

  if (!group) {
    return (
      <Box p={{ xs: 2, sm: 4, md: 6 }}>
        <Typography variant="h5" mb={2}>
          Access Group Not Found
        </Typography>

        <Button
          component={Link}
          to={`/${tenant_schema_name}/settings/accessgroups`}
        >
          Back to Access Groups
        </Button>
      </Box>
    );
  }

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (newValue === "view") setCurrentPage(1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  return (
    <Box p={{ xs: 2, sm: 4, md: 6 }}>
      <AppBar
        position="static"
        sx={{
          backgroundColor: "transparent",
          boxShadow: "none",
        }}
      >
        <Toolbar
          variant="dense"
          disableGutters
          sx={{ justifyContent: "space-between" }}
        >
          <Tabs
            onChange={handleTabChange}
            value={activeTab}
            aria-label="create access right"
            TabIndicatorProps={{ style: { display: "none" } }}
            sx={{ minHeight: "auto" }}
          >
            <Link to={`/${tenant_schema_name}/settings/accessgroups`}>
              <Tab
                value="accessGroup"
                label="Access Group"
                sx={tabStyles("accessGroup", activeTab)}
              />
            </Link>
            <Tab value="view" label="View" sx={tabStyles("view", activeTab)} />
          </Tabs>
          {/* Right-aligned Page Controls */}
          {activeTab === "view" && (
            <PaginationControls
              page={currentPage}
              totalPages={totalPages}
              onPrev={handlePrevPage}
              onNext={handleNextPage}
            />
          )}
        </Toolbar>
      </AppBar>

      <Box
        fullWidth
        backgroundColor="white"
        sx={{ p: { xs: 2, sm: 3, md: 4 } }}
        border={1}
        borderColor="divider"
        borderRadius={2}
      >
        <FormToolbar
          tenant_schema_name={tenant_schema_name}
          btnContainedLabel="Edit"
          btnTextLabel="Done"
          h6_label={`Access Group: ${access_code}`}
          access_code={access_code}
        />

        <Box mb={3}>
          <Box display="flex" gap={3} alignItems="center" mb={3}>
            <img
              src={
                appIcons[group.application.toUpperCase()] || appIcons.PURCHASE
              }
              alt="Application icon"
              width={24}
              height={24}
            />
            <Typography fontSize={24} fontWeight="bold" color="#7A8A98">
              {access_code}
            </Typography>
          </Box>

          <Grid container spacing={4} mb={3}>
            <Grid item xs={12} sm={6} md={4}>
              <Typography fontWeight="bold" color="#1A1A1A" mb={1}>
                Application
              </Typography>
              <Typography fontSize={16} color="#7A8A98">
                {group.application}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography fontWeight="bold" color="#1A1A1A" mb={1}>
                Group Name
              </Typography>
              <Typography fontSize={16} color="#7A8A98">
                {group.groupName}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Box maxWidth="800px">
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  {[
                    "Access right",
                    "View",
                    "Edit",
                    "Approve",
                    "Create",
                    "Reject",
                    "Delete",
                  ].map((label, index) => (
                    <TableCell
                      key={index}
                      align={index === 0 ? "left" : "center"}
                      sx={{
                        color: "primary.main",
                        fontWeight: "bold",
                        fontSize: index === 0 && "16px",
                      }}
                    >
                      {label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(group.permissions).map(([rawModule, perms]) => {
                  const moduleLabel = smartFormatLabel(rawModule);
                  return (
                    <TableRow key={rawModule}>
                      <TableCell>{moduleLabel}</TableCell>
                      {accessRights.map((right) => (
                        <TableCell key={right.name} align="center">
                          <Checkbox
                            checked={perms[right.name] || false}
                            disabled
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </Box>
  );
};

export default ViewAccessGroup;
