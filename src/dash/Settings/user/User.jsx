import React, { memo, useEffect, useMemo, useState } from "react";
import {
  useTheme,
  useMediaQuery,
  Box,
  Typography,
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
import Avatar from "../../../assets/images/avatars/userAvatar.png";
import { Link } from "react-router-dom";

import { formatDate } from "../../../helper/helper";
import { useList } from "../../../hooks/useList";
import { SearchField } from "../../../components/SearchField/SearchField";
import { ViewToggle } from "../../../components/ViewToggle/ViewToggle";
import { PaginationControls } from "../../../components/PaginationControls/PaginationControls";
import { ListToolbar } from "../../../components/ListToolbar/ListToolbar";
import { useTenant } from "../../../context/TenantContext";
import { useUser } from "../../../context/Settings/UserContext";

// Role lookup (adjust as needed)
const ROLE_LABELS = {
  1: "User",
  2: "Admin",
  // add other role mappings here
};

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
            justifyContent: `${showArchiveBtn ? "space-between" : "start"}`,
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
                "&:hover": { opacity: 0.9, bgcolor: "#FF9500" },
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
  const { tenantData } = useTenant();
  const schema = tenantData?.tenant_schema_name;
  const { getUserList, userList: rawUsers } = useUser();
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const [showArchiveBtn, setShowArchiveBtn] = useState(false);

  console.log(rawUsers);

  useEffect(() => {
    getUserList();
  }, [getUserList]);

  // Map API data to UI model
  const users = useMemo(
    () =>
      rawUsers.map((u) => ({
        id: u.id,
        avatar: Avatar,
        fullName: `${u.first_name} ${u.last_name}`,
        email: u.email,
        phone: u.phone_number?.trim() || "–",
        role: ROLE_LABELS[u.role] || `Role #${u.role}`,
      })),
    [rawUsers]
  );

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
  } = useList(users, {
    pageSize: 5,
    filterFn: (user, term) =>
      user.fullName.toLowerCase().includes(term.toLowerCase()) ||
      user.role.toLowerCase().includes(term.toLowerCase()) ||
      user.email.toLowerCase().includes(term.toLowerCase()) ||
      user.phone.includes(term),
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
            <Link to={`/${schema}/settings/user/new`}>
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
              {paginated.map((user, idx) => (
                <UserRow
                  key={user.id}
                  user={user}
                  index={idx}
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
