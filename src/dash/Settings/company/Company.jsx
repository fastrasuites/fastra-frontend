import React, { memo, useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
  Alert,
} from "@mui/material";

import { ListToolbar } from "../../../components/ListToolbar/ListToolbar";
import { useTenant } from "../../../context/TenantContext";
import { useCompany } from "../../../context/Settings/CompanyContext";
import { ViewToggle } from "../../../components/ViewToggle/ViewToggle";

function Company() {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

  const { tenantData: tenant } = useTenant();
  const { company, getCompany } = useCompany();

  const [gridView, setGridView] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
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
    }
    fetchData();
  }, [getCompany]);

  // --- Render helpers ---
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
            {tenant?.tenant_company_name || "—"}
          </Typography>
          <Typography variant="caption" textTransform="uppercase" noWrap>
            {company?.registration_number || "—"}
          </Typography>
          <Typography variant="body2" noWrap>
            {tenant?.user?.email || "—"}
          </Typography>
          <Typography variant="body2" noWrap>
            {company?.phone || "—"}
          </Typography>
        </Card>
      </Grid>
    </Grid>
  );

  const renderTable = () => (
    <TableContainer sx={{ border: "1px solid #E2E6E9" }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox disabled sx={{ color: "#C6CCD2" }} />
            </TableCell>
            {[
              "Full Name",
              "Registration Number",
              "Email",
              "Phone",
              "Website",
            ].map((label) => (
              <TableCell
                key={label}
                sx={{
                  p: 2,
                  color: "#7A8A98",
                  textTransform: label === "Website" ? "uppercase" : "none",
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
            sx={{ cursor: "default", "& td, & th": { borderBottom: "none" } }}
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
              {tenant?.tenant_company_name || "—"}
            </TableCell>
            <TableCell>{company?.registration_number || "—"}</TableCell>
            <TableCell>{tenant?.user?.email || "—"}</TableCell>
            <TableCell>{company?.phone || "—"}</TableCell>
            <TableCell>{company?.website || "—"}</TableCell>
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
          <Link to={`/${tenant?.tenant_schema_name}/settings/company/new`}>
            <Button fullWidth={isXs} variant="contained">
              Update Company
            </Button>
          </Link>
        }
        rightActions={<ViewToggle gridView={gridView} onToggle={setGridView} />}
      />

      {loading && (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Box mt={4}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}

      {!loading && !error && (gridView ? renderGrid() : renderTable())}
    </Box>
  );
}

export default memo(Company);
