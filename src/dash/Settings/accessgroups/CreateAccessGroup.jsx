// src/dash/Settings/accessgroups/CreateAccessGroup.jsx
import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Typography,
  AppBar,
  Toolbar,
  Tabs,
  Tab,
  Grid,
} from "@mui/material";
import { Link, useHistory, useLocation } from "react-router-dom";
import { useAccessGroups } from "../../../context/AccessGroups/AccessGroupsContext";
import { useTenant } from "../../../context/TenantContext";
import { PaginationControls } from "../../../components/PaginationControls/PaginationControls";
import FormToolbar from "./FormToolbar";
import appIcons from "../../../helper/appIcons";
import { smartFormatLabel, tabStyles } from "../../../helper/helper";
import Swal from "sweetalert2";

const CreateAccessGroup = () => {
  const { applications, modules, createAccessGroup, isLoading, accessRights } =
    useAccessGroups();
  const history = useHistory();
  const tenant_schema_name = useTenant()?.tenantData?.tenant_schema_name;
  const [activeTab, setActiveTab] = useState("create");
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 2;

  const location = useLocation();
  const fromStepModal = location.state?.fromStepModal || localStorage.getItem("fromStepModal") === "true";
  console.log("step",fromStepModal)



  const [formData, setFormData] = useState({
    groupName: "",
    application: applications[0],
    permissions: {},
  });

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
    if (newValue === "create") setCurrentPage(1);
  };

  // const handleSubmit = async () => {
  //   try {
  //     const id = await createAccessGroup(formData);
  //     console.log("Access group created with ID:", id);
  //     // Show success message

  //     if (id) {
  //       await Swal.fire(
  //         "Success",
  //         "Access group updated successfully",
  //         "success"
  //       );
  //     }
  //     history.push(`/${tenant_schema_name}/settings/accessgroups/${id}`);
  //   } catch (error) {
  //     // Error handling is already done in context
  //     console.log(error);
  //   }
  // };

  const handleSubmit = async () => {
    try {
      // Show loading state
      Swal.fire({
        title: "Creating Access Group",
        text: "Please wait...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const access_code = await createAccessGroup(formData);

      // Close loading and show success
      Swal.close();
      Swal.fire("Success", "Access group created successfully", "success");

      console.log("Almost at submit")
      // Move to the thurd step for first time users
     

      if (fromStepModal) { 
        localStorage.removeItem("fromStepModal");
        history.push(`/${tenant_schema_name}/dashboard`, { fromStepModal: true });
      } else {
        // Navigate to view page only if not in onboarding flow
        history.push(
          `/${tenant_schema_name}/settings/accessgroups/${access_code}`
        );
      }
    } catch (error) {
      Swal.close();
      // Error handling is already done in context
      console.log(error);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  console.log("accessRights", accessRights);

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
            <Tab
              value="create"
              label="Create"
              sx={tabStyles("create", activeTab)}
            />
          </Tabs>
          {/* Right-aligned Page Controls */}
          {activeTab === "create" && (
            <Box>
              <PaginationControls
                page={currentPage}
                totalPages={totalPages}
                onPrev={handlePrevPage}
                onNext={handleNextPage}
              />
            </Box>
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
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          style={{ width: "100%" }}
        >
          {/* access Setup */}
          <FormToolbar
            btnTextLabel={"Close"}
            btnContainedLabel="Save"
            isLoading={isLoading}
            tenant_schema_name={tenant_schema_name}
            h6_label="Access Setup"
          />

          <Box display="flex" flexWrap="wrap" gap={1}>
            <Box alignSelf={"center"}>
              {/* chosen application Icon goes here */}
              <img
                src={
                  appIcons[formData.application?.toUpperCase()] ||
                  appIcons.INVENTORY
                }
                alt="app icons"
                width={24}
                height={24}
              />
            </Box>
            <Grid container spacing={3} mb={4}>
              <Grid item xs={12} md={6} lg={4}>
                <Typography style={{ marginBottom: "2px" }}>
                  Application
                </Typography>
                <TextField
                  select
                  fullWidth
                  label="Application"
                  name="application"
                  value={formData.application}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                >
                  {applications.map((app) => (
                    <MenuItem key={app} value={app}>
                      {app}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6} lg={4}>
                <Typography style={{ marginBottom: "2px" }}>
                  Group Name
                </Typography>
                <TextField
                  fullWidth
                  label="Group Name"
                  name="groupName"
                  value={formData.groupName}
                  onChange={handleInputChange}
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6} lg={4}></Grid>
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
                  {formData.application &&
                    modules[formData.application]?.map((rawModule) => {
                      const moduleLabel = smartFormatLabel(rawModule);
                      return (
                        <TableRow key={rawModule}>
                          <TableCell>{moduleLabel}</TableCell>
                          {accessRights.map((right) => (
                            <TableCell key={right.name} align="center">
                              <Checkbox
                                checked={
                                  formData.permissions[rawModule]?.[
                                    right.name
                                  ] || false
                                }
                                onChange={(e) =>
                                  handlePermissionChange(
                                    rawModule,
                                    right.name,
                                    e.target.checked
                                  )
                                }
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
        </form>
      </Box>
    </Box>
  );
};

export default CreateAccessGroup;
