import React, { useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Chip,
  Grid,
  Button,
} from "@mui/material";
import Swal from "sweetalert2";
import EditIcon from "@mui/icons-material/Edit";
import { useHistory } from "react-router-dom";
import { useTenant } from "../../../context/TenantContext";
import { useCompany } from "../../../context/Settings/CompanyContext";

const CompanyInfo = () => {
  const history = useHistory();
  const { company, isLoading, error, getCompany } = useCompany();
  const { tenantData } = useTenant();

  useEffect(() => {
    const fetchData = async () => {
      try {
        await getCompany();
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Data Load Error",
          text: `Failed to load company data: ${
            err.message || "Unknown error"
          }`,
        });
      }
    };

    fetchData();
  }, [getCompany]);

  // Function to format empty values
  const formatValue = (value) => value || "N/A";

  const handleEdit = () => {
    history.push(`/${tenantData?.tenant_schema_name}/settings/company/new`);
  };

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="80vh"
      >
        <CircularProgress size={60} />
        <Typography variant="h6" ml={2}>
          Loading company data...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        height="80vh"
        textAlign="center"
        p={3}
      >
        <Typography variant="h5" color="error" gutterBottom>
          Data Load Error
        </Typography>
        <Typography variant="body1" mb={3}>
          {error.message || "Failed to load company information"}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </Box>
    );
  }

  if (!company) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="80vh"
      >
        <Typography variant="h5">No company information available</Typography>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Typography variant="h4" fontWeight={500}>
          Company Profile
        </Typography>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={handleEdit}
          sx={{
            backgroundColor: "#3B7CED",
            color: "white",
            "&:hover": { backgroundColor: "#2d63c0" },
          }}
        >
          Edit Information
        </Button>
      </Box>

      {/* Basic Information Section */}
      <Box
        border="1px solid #E2E6E9"
        borderRadius="4px"
        backgroundColor="white"
        mb={4}
        boxShadow="0px 2px 8px rgba(0, 0, 0, 0.05)"
      >
        <Box
          borderBottom="1px solid #E2E6E9"
          p={3}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography color="#3B7CED" fontSize="20px" fontWeight={500}>
            Basic Information
          </Typography>
        </Box>

        <Box p={3} display="flex" gap={4} alignItems="center">
          {company.logo ? (
            <img
              src={`data:image/png;base64,${company.logo}`}
              alt="Company Logo"
              style={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                objectFit: "cover",
                border: "1px solid #E2E6E9",
              }}
            />
          ) : (
            <Box
              width={100}
              height={100}
              borderRadius="50%"
              bgcolor="#F5F7FA"
              display="flex"
              justifyContent="center"
              alignItems="center"
              border="1px dashed #C6CCD2"
            >
              <Typography color="#8C9AA8" fontSize={12}>
                No logo
              </Typography>
            </Box>
          )}

          <Box>
            <Typography fontSize={14} color="#8C9AA8">
              Company name
            </Typography>
            <Typography fontSize={24} color="#1A1A1A">
              {tenantData.tenant_company_name || "N/A"}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Contact Information */}
      <Box
        border="1px solid #E2E6E9"
        borderRadius="4px"
        backgroundColor="white"
        mb={4}
        boxShadow="0px 2px 8px rgba(0, 0, 0, 0.05)"
      >
        <Box borderBottom="1px solid #E2E6E9" p={3}>
          <Typography color="#3B7CED" fontSize="20px" fontWeight={500}>
            Contact Information
          </Typography>
        </Box>

        <Box p={3}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography fontSize={14} color="#8C9AA8">
                Email
              </Typography>
              <Typography fontSize={18} color="#1A1A1A">
                {formatValue(tenantData?.user?.email)}
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography fontSize={14} color="#8C9AA8">
                Phone Number
              </Typography>
              <Typography fontSize={18} color="#1A1A1A">
                {formatValue(company.phone)}
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography fontSize={14} color="#8C9AA8">
                Website
              </Typography>
              <Typography fontSize={18} color="#1A1A1A">
                {formatValue(company.website)}
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography fontSize={14} color="#8C9AA8">
                Address
              </Typography>
              <Typography fontSize={18} color="#1A1A1A">
                {formatValue(company.street_address)}
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography fontSize={14} color="#8C9AA8">
                City / LGA
              </Typography>
              <Typography fontSize={18} color="#1A1A1A">
                {formatValue(company.city)}
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography fontSize={14} color="#8C9AA8">
                State
              </Typography>
              <Typography fontSize={18} color="#1A1A1A">
                {formatValue(company.state)}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* Company Registration Info */}
      <Box
        border="1px solid #E2E6E9"
        borderRadius="4px"
        backgroundColor="white"
        mb={4}
        boxShadow="0px 2px 8px rgba(0, 0, 0, 0.05)"
      >
        <Box borderBottom="1px solid #E2E6E9" p={3}>
          <Typography color="#3B7CED" fontSize="20px" fontWeight={500}>
            Company Registration Info
          </Typography>
        </Box>

        <Box p={3}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography fontSize={14} color="#8C9AA8">
                Registration Number
              </Typography>
              <Typography fontSize={18} color="#1A1A1A">
                {formatValue(company.registration_number)}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography fontSize={14} color="#8C9AA8">
                Tax ID
              </Typography>
              <Typography fontSize={18} color="#1A1A1A">
                {formatValue(company.tax_id)}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* Other Information */}
      <Box
        border="1px solid #E2E6E9"
        borderRadius="4px"
        backgroundColor="white"
        mb={4}
        boxShadow="0px 2px 8px rgba(0, 0, 0, 0.05)"
      >
        <Box borderBottom="1px solid #E2E6E9" p={3}>
          <Typography color="#3B7CED" fontSize="20px" fontWeight={500}>
            Other Information
          </Typography>
        </Box>

        <Box p={3}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography fontSize={14} color="#8C9AA8">
                Industry
              </Typography>
              <Typography fontSize={18} color="#1A1A1A">
                {formatValue(company.industry)}
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography fontSize={14} color="#8C9AA8">
                Language
              </Typography>
              <Typography fontSize={18} color="#1A1A1A">
                {company.language === "en"
                  ? "English"
                  : formatValue(company.language)}
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography fontSize={14} color="#8C9AA8">
                Company Size
              </Typography>
              <Typography fontSize={18} color="#1A1A1A">
                {formatValue(company.company_size)}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* Roles Section */}
      <Box
        border="1px solid #E2E6E9"
        borderRadius="4px"
        backgroundColor="white"
        boxShadow="0px 2px 8px rgba(0, 0, 0, 0.05)"
      >
        <Box borderBottom="1px solid #E2E6E9" p={3}>
          <Typography color="#3B7CED" fontSize="20px" fontWeight={500}>
            Roles
          </Typography>
        </Box>

        <Box p={3}>
          {company.roles && company.roles.length > 0 ? (
            <Box display="flex" flexWrap="wrap" gap={1.5}>
              {company.roles.map((role) => (
                <Chip
                  key={role.id}
                  label={role.name}
                  sx={{
                    backgroundColor: "#F0F7FF",
                    color: "#3B7CED",
                    fontSize: "0.875rem",
                    px: 1.5,
                    py: 1.5,
                    borderRadius: "10px",
                  }}
                />
              ))}
            </Box>
          ) : (
            <Typography color="#8C9AA8" fontStyle="italic">
              No roles defined
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default CompanyInfo;
