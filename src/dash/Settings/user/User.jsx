import { useTheme, useMediaQuery } from "@mui/material";
import Avatar from "../../../assets/images/avatars/userAvatar.png";

const USERS = [
  {
    id: 1,
    avatar: Avatar,
    fullName: "Efemiaya Oghenetega",
    email: "efemiayafavour@gmail.com",
    phone: "+234 0801 234 5679",
    role: "Software Engineer",
  },
  {
    id: 2,
    avatar: Avatar,
    fullName: "Adebayo Michael",
    email: "adebayo.michael@example.com",
    phone: "+234 0812 345 6789",
    role: "HR Manager",
  },
  {
    id: 3,
    avatar: Avatar,
    fullName: "Chinonso Okoro",
    email: "chinonso.okoro@example.com",
    phone: "+234 0902 456 7890",
    role: "Accountant",
  },
  {
    id: 4,
    avatar: Avatar,
    fullName: "Fatima Yusuf",
    email: "fatima.yusuf@example.com",
    phone: "+234 0703 567 8901",
    role: "Administrator",
  },
  {
    id: 5,
    avatar: Avatar,
    fullName: "Ifeanyi Nwosu",
    email: "ifeanyi.nwosu@example.com",
    phone: "+234 0813 678 9012",
    role: "Product Manager",
  },
  {
    id: 6,
    avatar: Avatar,
    fullName: "Zainab Bello",
    email: "zainab.bello@example.com",
    phone: "+234 0904 789 0123",
    role: "Marketing Specialist",
  },
  {
    id: 7,
    avatar: Avatar,
    fullName: "Tunde Afolayan",
    email: "tunde.afolayan@example.com",
    phone: "+234 0805 890 1234",
    role: "Operations Lead",
  },
];

import { Box, Typography } from "@mui/material";

import { memo, useState } from "react";
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

import { formatDate } from "../../../helper/helper";
import { useList } from "../../../hooks/useList";
import { SearchField } from "../../../components/SearchField/SearchField";
import { ViewToggle } from "../../../components/ViewToggle/ViewToggle";
import { PaginationControls } from "../../../components/PaginationControls/PaginationControls";
import { ListToolbar } from "../../../components/ListToolbar/ListToolbar";
import { Link } from "react-router-dom";
import { useTenant } from "../../../context/TenantContext";

// -- CARD VIEW --
const UserCard = memo(({ user }) => (
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
    <Box
      component="img"
      src={user.avatar}
      alt="avatar"
      sx={{ borderRadius: "50%", width: 80, height: 80 }}
    />
    <Typography variant="subtitle1" color="text.primary" noWrap>
      {user.fullName}
    </Typography>
    <Typography variant="caption" textTransform="uppercase" noWrap>
      {user.role}
    </Typography>
    <Typography variant="body2" noWrap>
      {user.email}
    </Typography>
    <Typography variant="body2" noWrap>
      {user.phone}
    </Typography>
  </Card>
));

// -- ROW VIEW --
const UserRow = memo(
  ({ user, index, selected, onSelect, onClick, showArchiveBtn }) => (
    <TableRow
      hover
      onClick={onClick}
      sx={{
        cursor: "pointer",
        backgroundColor: index % 2 === 0 ? "#F2F2F2" : "#FFFFFF",
        "& td, & th": { borderBottom: "none" },
      }}
    >
      <TableCell padding="checkbox">
        <Checkbox
          checked={selected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect(user.id, e.target.checked);
          }}
          sx={{ color: "#C6CCD2" }}
        />
      </TableCell>
      <TableCell sx={{ p: 2, display: "flex", alignItems: "center" }}>
        <Box
          component="img"
          src={user.avatar}
          alt={user.fullName}
          sx={{ width: 40, height: 40, borderRadius: "50%" }}
        />
        {user.fullName}
      </TableCell>
      <TableCell sx={{ p: 2, typography: "body2", color: "#7A8A98" }}>
        {user.role}
      </TableCell>
      <TableCell sx={{ p: 2, typography: "body2", color: "#7A8A98" }} noWrap>
        {user.email}
      </TableCell>
      <TableCell sx={{ p: 2, typography: "body2", color: "#7A8A98" }} noWrap>
        {user.phone}
      </TableCell>
      <TableCell
        sx={{
          p: 1,
          typography: "caption",
          textTransform: "uppercase",
          color: "#7A8A98",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: `${showArchiveBtn ? "space-between" : "start"} `,
            alignItems: "center",
            pr: 4,
          }}
        >
          {formatDate(Date.now())}

          {showArchiveBtn && (
            <Button
              disableElevation
              variant="contained"
              sx={{
                backgroundColor: "#FF9500",
                "&:hover": {
                  opacity: 0.9,
                  bgcolor: "#FF9500",
                },
              }}
            >
              Archive
            </Button>
          )}
        </Box>
      </TableCell>
    </TableRow>
  )
);

const UserList = () => {
  const tenant_schema_name = useTenant().tenantData?.tenant_schema_name;

  const [showArchiveBtn, setShowArchiveBtn] = useState(false);
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

  const {
    page,
    totalPages,
    paginated,
    selectedIds,
    allSelected,
    gridView,
    handleSearch,
    handlePrev,
    handleNext,
    handleSelect,
    handleSelectAll,
    setGridView,
  } = useList(USERS, {
    pageSize: 5,
    filterFn: (user, term) =>
      user.fullName.toLowerCase().includes(term.toLowerCase()) ||
      user.role.toLowerCase().includes(term.toLowerCase()) ||
      user.email.toLowerCase().includes(term.toLowerCase()) ||
      user.phone.toLowerCase().includes(term.toLowerCase()),
  });

  const renderSkeletons = () =>
    Array.from({ length: 5 }).map((_, i) => (
      <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
        <Card variant="outlined" sx={{ p: 2 }}>
          <Skeleton variant="circular" width={80} height={80} />
          <Skeleton width="60%" />
          <Skeleton width="40%" />
          <Skeleton width="80%" />
          <Skeleton width="80%" />
        </Card>
      </Grid>
    ));

  return (
    <Box p={{ xs: 2, sm: 4, md: 6 }}>
      <ListToolbar
        isXs={isXs}
        leftActions={
          <>
            <Link to={`/${tenant_schema_name}/settings/user/new`}>
              <Button fullWidth={isXs} variant="contained">
                New User
              </Button>
            </Link>

            <Button
              fullWidth={isXs}
              variant="outlined"
              onClick={() => setShowArchiveBtn((prev) => !prev)}
            >
              Archive User
            </Button>
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
          {paginated.length > 0
            ? paginated.map((user) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={user.id}>
                  <UserCard user={user} />
                </Grid>
              ))
            : renderSkeletons()}
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
                  Role
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
                  Last Logic Date
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map((user, index) => (
                <UserRow
                  key={user.id}
                  user={user}
                  index={index}
                  selected={selectedIds.includes(user.id)}
                  onSelect={handleSelect}
                  showArchiveBtn={showArchiveBtn}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default memo(UserList);
