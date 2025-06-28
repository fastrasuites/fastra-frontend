import { Box, Button, CircularProgress, Typography } from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";
import { useAccessGroups } from "../../../context/AccessGroups/AccessGroupsContext";

const FormToolbar = ({
  tenant_schema_name,
  btnTextLabel = "Close",
  btnContainedLabel = "Save",
  h6_label = "Access Setup",
  access_code,
  isLoading = false,
}) => {
  const { isLoading: isloading } = useAccessGroups();
  return (
    <Box display="flex" justifyContent="space-between" mb={4}>
      <Typography variant="h6" color="primary" sx={{ fontWeight: "bold" }}>
        {h6_label}
      </Typography>
      <Box>
        <Button
          component={Link}
          to={`/${tenant_schema_name}/settings/accessgroups`}
        >
          {btnTextLabel}
        </Button>
        {btnContainedLabel === "Edit" && (
          <Button
            component={Link}
            to={`/${tenant_schema_name}/settings/accessgroups/${access_code}/edit`}
            variant="contained"
            color="primary"
            sx={{ ml: 2 }}
          >
            {btnContainedLabel}
          </Button>
        )}
        {btnContainedLabel === "Save" && (
          <Button
            variant="contained"
            color="primary"
            sx={{ ml: 2 }}
            type="submit"
            disabled={isLoading}
          >
            {isloading ? <CircularProgress size={24} /> : btnContainedLabel}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default FormToolbar;
