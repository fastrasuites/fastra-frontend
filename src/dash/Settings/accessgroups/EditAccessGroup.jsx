// src/dash/Settings/accessgroups/EditAccessGroup.jsx
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
  Checkbox,
  Typography,
  MenuItem,
  AppBar,
  Toolbar,
  Tabs,
  Tab,
  Grid,
} from "@mui/material";
import { Link, useParams, useHistory } from "react-router-dom";
import { useAccessGroups } from "../../../context/AccessGroups/AccessGroupsContext";
import { useTenant } from "../../../context/TenantContext";
import appIcons from "../../../helper/appIcons";
import { tabStyles } from "../../../helper/helper";
import { PaginationControls } from "../../../components/PaginationControls/PaginationControls";
import FormToolbar from "./FormToolbar";
import { width } from "@mui/system";

const EditAccessGroup = () => {
  const { id } = useParams();
  const history = useHistory();
  const tenant_schema_name = useTenant()?.tenantData?.tenant_schema_name;
  const { accessGroups, applications, rights, updateAccessGroup } =
    useAccessGroups();

  const group = accessGroups.find((g) => g.id === id);
  const access_code = group.id;
  const [formData, setFormData] = React.useState(group || null);
  const [activeTab, setActiveTab] = useState("edit");
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 2;

  React.useEffect(() => {
    if (group) {
      setFormData(group);
    }
  }, [group]);

  if (!formData) {
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePermissionChange = (right, permission, value) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [right]: {
          ...prev.permissions[right],
          [permission]: value,
        },
      },
    }));
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (newValue === "edit") setCurrentPage(1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev + 1);
  };

  const handleSubmit = () => {
    updateAccessGroup(formData);
    history.push(`/${tenant_schema_name}/settings/accessgroups/${id}`);
  };
  console.log("tenant_schema_name", tenant_schema_name);
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
            <Tab value="edit" label="Edit" sx={tabStyles("edit", activeTab)} />
          </Tabs>
          {/* Right-aligned Page Controls */}
          {activeTab === "edit" && (
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
        <form onSubmit={handleSubmit} xs={{ width: "100%" }}>
          <FormToolbar
            tenant_schema_name={tenant_schema_name}
            h6_label="Access Setup"
            access_code={access_code}
            btnContainedLabel="Save"
            btnTextLabel="Close"
          />
          <Box mb={2}>
            {/* chosen application Icon goes here */}
            <img
              src={
                appIcons[formData.application.toUpperCase()] ||
                appIcons.INVENTORY
              }
              alt="app icons"
              width={24}
              height={24}
            />
          </Box>
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} md={6} lg={4}>
              <Typography>Application</Typography>
              <TextField
                select
                fullWidth
                label="Application"
                name="application"
                value={formData.application}
                onChange={handleInputChange}
                margin="normal"
              >
                {applications.map((app) => (
                  <MenuItem key={app} value={app}>
                    {app}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <Typography>Group Name</Typography>
              <TextField
                fullWidth
                label="Group Name"
                name="groupName"
                value={formData.groupName}
                onChange={handleInputChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6} lg={4} sx={{ alignSelf: "center" }}>
              <Typography fontSize={24} fontWeight="bold" color="#7A8A98">
                {access_code}
              </Typography>
            </Grid>
          </Grid>

          <Box maxWidth="768px">
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
                  {Object.entries(formData.permissions).map(
                    ([right, perms]) => (
                      <TableRow key={right}>
                        <TableCell>{right}</TableCell>
                        {[
                          "View",
                          "Edit",
                          "Approve",
                          "Create",
                          "Reject",
                          "Delete",
                        ].map((permission) => (
                          <TableCell key={permission} align="center">
                            <Checkbox
                              checked={perms[permission]}
                              onChange={(e) =>
                                handlePermissionChange(
                                  right,
                                  permission,
                                  e.target.checked
                                )
                              }
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default EditAccessGroup;
