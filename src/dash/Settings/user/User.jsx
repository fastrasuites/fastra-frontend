import React, { memo, useEffect, useMemo, useState, useCallback } from "react";
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
import { Link, useHistory } from "react-router-dom";

import AvatarPlaceholder from "../../../assets/images/avatars/userAvatar.png";
import { formatDate } from "../../../helper/helper";
import { useList } from "../../../hooks/useList";
import { SearchField } from "../../../components/SearchField/SearchField";
import { ViewToggle } from "../../../components/ViewToggle/ViewToggle";
import { PaginationControls } from "../../../components/PaginationControls/PaginationControls";
import { ListToolbar } from "../../../components/ListToolbar/ListToolbar";
import { useTenant } from "../../../context/TenantContext";
import { useUser } from "../../../context/Settings/UserContext";

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
      src={user.avatar || AvatarPlaceholder}
      alt={user.fullName}
      sx={{ borderRadius: "50%", width: 80, height: 80 }}
    />
    <Typography variant="subtitle1" color="text.primary" noWrap>
      {user.fullName}
    </Typography>
    <Typography variant="caption" textTransform="uppercase" noWrap>
      {user.role || "—"}
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
const UserRow = memo(({ user, selected, onSelect, onClick, showArchive }) => (
  <TableRow
    hover
    onClick={onClick}
    sx={{
      cursor: "pointer",
      backgroundColor: selected ? "action.selected" : "transparent",
      "&:nth-of-type(odd)": { backgroundColor: "#F9F9F9" },
      "& td, & th": { borderBottom: "none" },
    }}
  >
    <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
      <Checkbox
        checked={selected}
        onChange={(e) => onSelect(user.id, e.target.checked)}
        sx={{ color: "#C6CCD2" }}
      />
    </TableCell>
    <TableCell sx={{ p: 2, display: "flex", alignItems: "center" }}>
      <Box
        component="img"
        src={user.avatar || AvatarPlaceholder}
        alt={user.fullName}
        sx={{ width: 40, height: 40, borderRadius: "50%", mr: 1 }}
      />
      <Typography variant="body1" noWrap>
        {user.fullName}
      </Typography>
    </TableCell>
    <TableCell sx={{ p: 2, typography: "body2", color: "#7A8A98" }} noWrap>
      {user.role || "—"}
    </TableCell>
    <TableCell sx={{ p: 2, typography: "body2", color: "#7A8A98" }} noWrap>
      {user.email}
    </TableCell>
    <TableCell sx={{ p: 2, typography: "body2", color: "#7A8A98" }} noWrap>
      {user.phone}
    </TableCell>
    <TableCell
      sx={{ p: 2, typography: "caption", color: "#7A8A98", minWidth: 200 }}
      noWrap
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {formatDate(user.last_login || user.date_created || Date.now())}
        {showArchive && (
          <Button
            disableElevation
            variant="contained"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              // handle archive action
            }}
            sx={{ backgroundColor: "#FF9500", "&:hover": { opacity: 0.9 } }}
          >
            Archive
          </Button>
        )}
      </Box>
    </TableCell>
  </TableRow>
));

const UserList = () => {
  const history = useHistory();
  const { tenantData } = useTenant();
  const schema = tenantData?.tenant_schema_name;
  const { getUserList, userList = [], loading } = useUser();
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const [showArchive, setShowArchive] = useState(false);

  useEffect(() => {
    getUserList();
  }, [getUserList]);

  const users = useMemo(
    () =>
      userList.map((u) => ({
        id: u.id,
        avatar: AvatarPlaceholder,
        fullName: `${u.first_name} ${u.last_name}`,
        email: u.email,
        phone: u.phone_number?.trim() || "—",
        role: u.company_role_details?.name || "—",
        last_login: u.last_login,
        date_created: u.date_created,
      })),
    [userList]
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
    pageSize: 10,
    filterFn: (user, term) =>
      [user.fullName, user.role, user.email, user.phone].some((field) =>
        field.toLowerCase().includes(term.toLowerCase())
      ),
  });

  const handleRowClick = useCallback(
    (id) => history.push(`/${schema}/settings/user/${id}`),
    [history, schema]
  );

  const renderSkeletons = () =>
    Array.from({ length: 6 }).map((_, i) => (
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

  console.log(userList);
  return (
    <Box p={{ xs: 2, sm: 4, md: 6 }}>
      <ListToolbar
        isXs={isXs}
        leftActions={
          <>
            <Button
              fullWidth={isXs}
              variant="contained"
              component={Link}
              to={`/${schema}/settings/user/new`}
            >
              New User
            </Button>
            <Button
              fullWidth={isXs}
              variant="outlined"
              onClick={() => setShowArchive((prev) => !prev)}
            >
              {showArchive ? "Hide Archive" : "Archive User"}
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

      {loading && gridView ? (
        <Grid container spacing={2}>
          {renderSkeletons()}
        </Grid>
      ) : gridView ? (
        <Grid container spacing={2}>
          {paginated.map((user) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={user.id}>
              <UserCard user={user} />
            </Grid>
          ))}
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
                <TableCell>Full Name</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Last Login</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  selected={selectedIds.includes(user.id)}
                  onSelect={handleSelect}
                  onClick={() => handleRowClick(user.id)}
                  showArchive={showArchive}
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
