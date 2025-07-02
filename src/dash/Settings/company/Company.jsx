import { useTheme, useMediaQuery } from "@mui/material";
import Avatar from "../../../assets/images/avatars/userAvatar.png";

const USERS = [
  {
    id: 1,
    avatar: Avatar,
    company_name: "BigFix Technologies",
    email: "info.bigfix@gmail.com",
    phone: "+234 0801 234 5679",
    registration_number: "BF12345678",
    website: "www.bigfixtech.com",
  },
  {
    id: 2,
    avatar: Avatar,
    company_name: "Steadfast Solutions",
    email: "info.steadfast@example.com",
    phone: "+234 0812 345 6789",
    registration_number: "SS98765432",
    website: "www.steadfastsolutions.com",
  },
  {
    id: 3,
    avatar: Avatar,
    company_name: "EBIS",
    email: "ebis@example.com",
    phone: "+234 0902 456 7890",
    registration_number: "EBIS123456",
    website: "www.ebis.com",
  },
];

import { Box, Typography } from "@mui/material";

import { memo, useEffect } from "react";
import {
  Button,
  Card,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Skeleton,
} from "@mui/material";

import { useList } from "../../../hooks/useList";
import { SearchField } from "../../../components/SearchField/SearchField";
import { ViewToggle } from "../../../components/ViewToggle/ViewToggle";
import { PaginationControls } from "../../../components/PaginationControls/PaginationControls";
import { ListToolbar } from "../../../components/ListToolbar/ListToolbar";
import { Link } from "react-router-dom";
import { useTenant } from "../../../context/TenantContext";
import { useCompany } from "../../../context/Settings/CompanyContext";

const Company = () => {
  const tenant_schema = useTenant().tenantData;
  const { company, getCompany } = useCompany();

  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    getCompany();
  }, [getCompany]);

  console.log(tenant_schema, company);
  const {
    page,
    totalPages,
    allSelected,
    gridView,
    handleSearch,
    handlePrev,
    handleNext,
    handleSelectAll,
    setGridView,
  } = useList(USERS, {
    pageSize: 5,
    filterFn: (user, term) =>
      user.company_name.toLowerCase().includes(term.toLowerCase()) ||
      user.registration_number.toLowerCase().includes(term.toLowerCase()) ||
      user.email.toLowerCase().includes(term.toLowerCase()) ||
      user.phone.toLowerCase().includes(term.toLowerCase()),
  });

  // const renderSkeletons = () =>
  //   Array.from({ length: 5 }).map((_, i) => (
  //     <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
  //       <Card variant="outlined" sx={{ p: 2 }}>
  //         <Skeleton variant="circular" width={80} height={80} />
  //         <Skeleton width="60%" />
  //         <Skeleton width="40%" />
  //         <Skeleton width="80%" />
  //         <Skeleton width="80%" />
  //       </Card>
  //     </Grid>
  //   ));

  return (
    <Box p={{ xs: 2, sm: 4, md: 6 }}>
      <ListToolbar
        isXs={isXs}
        leftActions={
          <>
            <Link
              to={`/${tenant_schema?.tenant_schema_name}/settings/company/new`}
            >
              <Button fullWidth={isXs} variant="contained">
                New Company
              </Button>
            </Link>

            <SearchField onSearch={handleSearch} />
          </>
        }
        rightActions={
          <>
            <PaginationControls
              page={page}
              totalPages={totalPages}
              onPrev={handlePrev}
              onNext={handleNext}
            />
            <ViewToggle gridView={gridView} onToggle={setGridView} />
          </>
        }
      />

      {/* Content Area */}
      {gridView ? (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <Card
              variant="outlined"
              sx={{
                width: "100%",
                maxWidth: { md: 280 },
                p: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
                color: "text.secondary",
                fontSize: "0.75rem",
              }}
            >
              <img
                src={`data:image/png;base64,${company?.logo}`}
                alt="avatar"
                sx={{ borderRadius: "50%", width: 80, height: 80 }}
              />
              <Typography variant="subtitle1" color="text.primary" noWrap>
                {tenant_schema?.tenant_company_name?.company_name}
              </Typography>
              <Typography variant="caption" textTransform="uppercase" noWrap>
                {company.registration_number}
              </Typography>
              <Typography variant="body2" noWrap>
                {tenant_schema?.user?.email}
              </Typography>
              <Typography variant="body2" noWrap>
                {company?.phone}
              </Typography>
            </Card>
          </Grid>
        </Grid>
      ) : (
        <TableContainer sx={{ border: "1px solid #E2E6E9" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={allSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    sx={{ color: "#C6CCD2" }}
                  />
                </TableCell>
                <TableCell sx={{ p: 3, color: "#7A8A98" }}>Full Name</TableCell>
                <TableCell sx={{ p: 3, typography: "body2", color: "#7A8A98" }}>
                  Registration Number
                </TableCell>
                <TableCell
                  sx={{ p: 3, typography: "body2", color: "#7A8A98" }}
                  noWrap
                >
                  Email
                </TableCell>
                <TableCell
                  sx={{ p: 1, typography: "body2", color: "#7A8A98" }}
                  noWrap
                >
                  Phone
                </TableCell>
                <TableCell
                  sx={{
                    p: 1,
                    typography: "caption",
                    textTransform: "uppercase",
                    color: "#7A8A98",
                    minWidth: "300px",
                  }}
                >
                  Website
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow
                hover
                // onClick={onClick}
                sx={{
                  cursor: "pointer",
                  backgroundColor: "#FFFFFF",
                  "& td, & th": { borderBottom: "none" },
                }}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    // checked={selected}
                    onChange={(e) => {
                      e.stopPropagation();
                      // onSelect(user.id, e.target.checked);
                    }}
                    sx={{ color: "#C6CCD2" }}
                  />
                </TableCell>
                <TableCell sx={{ p: 2, display: "flex", alignItems: "center" }}>
                  <Box
                    component="img"
                    src={`data:image/png;base64,${company?.logo}`}
                    // alt={user.company_name}
                    sx={{ width: 40, height: 40, borderRadius: "50%" }}
                  />
                  {tenant_schema?.tenant_company_name}
                </TableCell>
                <TableCell sx={{ p: 2, typography: "body2", color: "#7A8A98" }}>
                  {company?.registration_number}
                </TableCell>
                <TableCell
                  sx={{ p: 2, typography: "body2", color: "#7A8A98" }}
                  noWrap
                >
                  {tenant_schema?.user?.email}
                </TableCell>
                <TableCell
                  sx={{ p: 2, typography: "body2", color: "#7A8A98" }}
                  noWrap
                >
                  {company?.phone}
                </TableCell>
                <TableCell
                  sx={{
                    p: 1,
                    typography: "caption",
                    textTransform: "uppercase",
                    color: "#7A8A98",
                  }}
                >
                  {company?.website}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default memo(Company);
