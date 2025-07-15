import React, { memo, useEffect, useState, useCallback } from "react";
import { Link, useHistory } from "react-router-dom";
import Swal from "sweetalert2";
import {
  Box,
  Button,
  Card,
  Checkbox,
  CircularProgress,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import { ListToolbar } from "../../../components/ListToolbar/ListToolbar";
import { useTenant } from "../../../context/TenantContext";
import { useCompany } from "../../../context/Settings/CompanyContext";
import { ViewToggle } from "../../../components/ViewToggle/ViewToggle";

function Company() {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const history = useHistory();

  const { tenantData: tenant } = useTenant();
  const { company, getCompany } = useCompany();

  const [gridView, setGridView] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await getCompany();
    } catch (err) {
      console.error(err);
      setError("Unable to load company details.");
    } finally {
      setLoading(false);
    }
  }, [getCompany]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error,
      });
    }
  }, [error]);

  const renderGrid = () => (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <Card
          variant="outlined"
          sx={{
            p: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
            color: "text.secondary",
            fontSize: "0.75rem",
          }}
        >
          <Box
            component="img"
            src={
              company?.logo
                ? `data:image/png;base64,${company.logo}`
                : undefined
            }
            alt="Company Logo"
            sx={{ borderRadius: "50%", width: 80, height: 80 }}
          />
          <Typography variant="subtitle1" noWrap>
            {tenant?.tenant_company_name ?? "—"}
          </Typography>
          <Typography variant="caption" textTransform="uppercase" noWrap>
            {company?.registration_number ?? "—"}
          </Typography>
          <Typography variant="body2" noWrap>
            {tenant?.user?.email ?? "—"}
          </Typography>
          <Typography variant="body2" noWrap>
            {company?.phone ?? "—"}
          </Typography>
        </Card>
      </Grid>
    </Grid>
  );

  const headers = [
    "Full Name",
    "Registration Number",
    "Email",
    "Phone",
    "Website",
  ];

  const renderTable = () => (
    <TableContainer sx={{ border: 1, borderColor: "divider", borderRadius: 1 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox disabled sx={{ color: "#C6CCD2" }} />
            </TableCell>
            {headers.map((label) => (
              <TableCell
                key={label}
                sx={{
                  p: 2,
                  color: "text.secondary",
                  textTransform: label === "Website" ? "uppercase" : undefined,
                }}
              >
                {label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow
            hover
            onClick={() =>
              history.push(
                `/${tenant?.tenant_schema_name}/settings/company/company-details`
              )
            }
            sx={{ cursor: "pointer", "& td, & th": { borderBottom: "none" } }}
          >
            <TableCell padding="checkbox">
              <Checkbox disabled sx={{ color: "#C6CCD2" }} />
            </TableCell>
            <TableCell sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                component="img"
                src={
                  company?.logo
                    ? `data:image/png;base64,${company.logo}`
                    : undefined
                }
                alt="Logo"
                sx={{ width: 40, height: 40, borderRadius: "50%" }}
              />
              {tenant?.tenant_company_name ?? "—"}
            </TableCell>
            <TableCell>{company?.registration_number ?? "—"}</TableCell>
            <TableCell>{tenant?.user?.email ?? "—"}</TableCell>
            <TableCell>{company?.phone ?? "—"}</TableCell>
            <TableCell>{company?.website ?? "—"}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box p={{ xs: 2, sm: 4, md: 6 }}>
      <ListToolbar
        isXs={isXs}
        leftActions={
          <Button
            component={Link}
            to={`/${tenant?.tenant_schema_name}/settings/company/new`}
            fullWidth={isXs}
            variant="contained"
          >
            Update Company
          </Button>
        }
        rightActions={<ViewToggle gridView={gridView} onToggle={setGridView} />}
      />

      {loading && (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      )}

      {!loading && (gridView ? renderGrid() : renderTable())}
    </Box>
  );
}

export default memo(Company);
