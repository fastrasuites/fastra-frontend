import React from "react";
import {
  Box,
  Button,
  Checkbox,
  IconButton,
  InputAdornment,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import { FaCaretLeft, FaCaretRight, FaBars } from "react-icons/fa";
import { IoGrid } from "react-icons/io5";
import { Link, useHistory } from "react-router-dom";

const CommonTable = ({
  // Data & Configuration
  columns = [],
  rows = [],
  rowKey = "id",
  gridRenderItem,

  // Selection
  selectable = false,
  selectedRows = [],
  onSelectAll,
  onRowSelect,

  // Search
  searchable = false,
  searchQuery = "",
  onSearchChange,

  // Pagination
  paginated = false,
  page = 1,
  totalPages = 1,
  onPageChange,

  // View Mode
  viewModes = ["list"],
  viewMode = "list",
  onViewModeChange,

  // Actions
  actionButton,

  path = "",
  isLoading,
}) => {
  const showPagination = paginated && rows.length > 0;
  const showViewToggles = viewModes.length > 1;
  const allSelected = selectedRows.length === rows.length && rows.length > 0;
  const history = useHistory();

  const handleRowClick = (row, event, path) => {
    // Prevent navigation if clicking selectable elements
    if (event.target.closest('input[type="checkbox"]')) return;
    const id = row[rowKey];
    history.push(`${path}/${id}`);
  };


  const renderListSkeleton = () => {
    return Array.from({ length: 5 }).map((_, idx) => (
      <TableRow key={`skeleton-${idx}`}>
        {columns.map((col) => (
          <TableCell key={col.id}>
            <Skeleton variant="text" width="80%" />
          </TableCell>
        ))}
        <TableCell>
            <Skeleton variant="text" width="80%" />
          </TableCell>
      </TableRow>
    ));
  };

  return (
    <Box>
      {/* Toolbar */}
      <Box
        display="flex"
        flexWrap="wrap"
        justifyContent="space-between"
        gap={2}
        mb={2}
      >
        <Box display="flex" alignItems="center" gap={2}>
          {actionButton && (
            <Button
              variant="contained"
              component={actionButton.link ? Link : Button}
              to={actionButton.link}
              onClick={actionButton.onClick}
              disableElevation
            >
              {actionButton.text}
            </Button>
          )}

          {searchable && (
            <TextField
              size="small"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 240 }}
            />
          )}
        </Box>

        {/* Controls */}
        <Box display="flex" alignItems="center" gap={2}>
          {showPagination && (
            <Typography variant="body2">
              Page {page} of {totalPages}
            </Typography>
          )}

          <Box display="flex" alignItems="center" gap={1}>
            {showPagination && (
              <Box border={"1px solid #E2E6E9"} borderRadius={1}>
                <IconButton
                  onClick={() => onPageChange?.(page - 1)}
                  disabled={page <= 1}
                >
                  <FaCaretLeft />
                </IconButton>
                <Box display={"inline"} borderLeft="1px solid #E2E6E9">
                  <IconButton
                    onClick={() => onPageChange?.(page + 1)}
                    disabled={page >= totalPages}
                  >
                    <FaCaretRight />
                  </IconButton>
                </Box>
              </Box>
            )}

            {showViewToggles && (
              <Box border="1px solid #E2E6E9" borderRadius={1}>
                {viewModes.includes("grid") && (
                  <IconButton
                    onClick={() => onViewModeChange?.("grid")}
                    color={viewMode === "grid" ? "primary" : "default"}
                    sx={{ backgroundColor: "#ffffff" }}
                  >
                    <IoGrid />
                  </IconButton>
                )}
                {viewModes.includes("list") && (
                  <Box display={"inline"} borderLeft="1px solid #E2E6E9">
                    {" "}
                    <IconButton
                      onClick={() => onViewModeChange?.("list")}
                      color={viewMode === "list" ? "primary" : "default"}
                    >
                      <FaBars />
                    </IconButton>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Content */}
      {viewMode === "list" ? (
        <TableContainer
          backgroundColor="#ffffff"
          component={Paper}
          elevation={0}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {selectable && (
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={allSelected}
                      indeterminate={!allSelected && selectedRows.length > 0}
                      onChange={onSelectAll}
                    />
                  </TableCell>
                )}
                {columns.map((col) => (
                  <TableCell
                    key={col.id}
                    sx={{ fontWeight: 500, color: "#7A8A98", fontSize: "14px" }}
                  >
                    {col.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            {isLoading ? (
              <TableBody>{renderListSkeleton()}</TableBody>
            ) : (
              <TableBody>
                {rows.map((row) => (
                  <TableRow
                    key={row[rowKey]}
                    hover
                    sx={{
                      "&:nth-of-type(odd)": { backgroundColor: "#f5f5f5" },
                    }}
                    onClick={(event) => handleRowClick(row, event, path)}
                  >
                    {selectable && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedRows.includes(row[rowKey])}
                          onChange={() => onRowSelect?.(row[rowKey])}
                        />
                      </TableCell>
                    )}
                    {columns.map((col, idx) => (
                      <TableCell
                        key={`${row[rowKey]}-${col.id}`}
                        sx={{
                          fontSize: "14px",
                          color: idx === 0 ? "#000" : "#7A8A98",
                          fontWeight: 400,
                        }}
                        onClick={() => {
                          // handleClickCol(row[col.id]);
                          // console.log("row[col.id]", col);
                        }}
                        component={col.onClick ? "button" : "td"}
                      >
                        {col.render ? col.render(row) : row[col.id]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            )}
          </Table>
        </TableContainer>
      ) : (
        // Grid View
        <Box
          display="grid"
          gridTemplateColumns="repeat(auto-fill, minmax(300px, 1fr))"
          gap={2}
        >
          {rows.map((row) => gridRenderItem?.(row))}
        </Box>
      )}
    </Box>
  );
};

export default CommonTable;
