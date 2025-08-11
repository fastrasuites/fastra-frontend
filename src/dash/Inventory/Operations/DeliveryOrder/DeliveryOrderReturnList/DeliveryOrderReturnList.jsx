import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Box,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Typography,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { FaCaretLeft, FaCaretRight, FaBars } from "react-icons/fa";
import { IoGrid } from "react-icons/io5";
import { useDeliveryOrder } from "../../../../../context/Inventory/DeliveryOrderContext";

export default function DeliveryOrderReturnList() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState("list");

  const {
    getDeliveryOrderReturnList,
    deliveryOrderReturnList,
    error,
    isLoading,
  } = useDeliveryOrder();

  useEffect(() => {
    getDeliveryOrderReturnList();
  }, [getDeliveryOrderReturnList]);

  // Map API response to UI rows
  const rows = useMemo(
    () =>
      deliveryOrderReturnList.map((item) => ({
        id: item.unique_record_id,
        sourceDocument: item.source_document,
        dateOfReturn: new Date(item.date_of_return).toLocaleString(),
        sourceLocation: item.source_location,
        returnWarehouse: item?.return_warehouse_location_details.location_name,
        reason: item.reason_for_return,
        totalItems: item.delivery_order_return_items?.length || 0,
        items: item.delivery_order_return_items || [],
      })),
    [deliveryOrderReturnList]
  );

  const rowsPerPage = 5;

  // Search filter
  const filteredRows = useMemo(
    () =>
      rows.filter((r) =>
        Object.values(r).join(" ").toLowerCase().includes(search.toLowerCase())
      ),
    [search, rows]
  );

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));

  const pagedRows = useMemo(
    () => filteredRows.slice((page - 1) * rowsPerPage, page * rowsPerPage),
    [filteredRows, page]
  );

  // Selection logic
  const allOnPageSelected =
    pagedRows.length > 0 && pagedRows.every((r) => selected.includes(r.id));

  const toggleSelectAll = () => {
    if (allOnPageSelected) {
      setSelected((prev) =>
        prev.filter((id) => !pagedRows.some((r) => r.id === id))
      );
    } else {
      setSelected((prev) => [
        ...new Set([...prev, ...pagedRows.map((r) => r.id)]),
      ]);
    }
  };

  const toggleSelectOne = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const handleRowClick = (row) => {
    console.log("Clicked:", row);
  };

  // Table headers
  const headers = [
    { key: "id", label: "Record ID" },
    { key: "dateOfReturn", label: "Date of Return" },
    { key: "sourceLocation", label: "Source Location" },
    { key: "returnWarehouse", label: "Return Warehouse" },
    { key: "reason", label: "Reason for Return" },
    { key: "totalItems", label: "Items Returned" },
  ];

  // Styles
  const headerSx = { fontWeight: 500, color: "#7A8A98", fontSize: "14px" };
  const cellSx = (isFirst = false) => ({
    fontSize: "14px",
    color: isFirst ? "#000" : "#7A8A98",
    fontWeight: 400,
  });

  // Loading & error states
  if (isLoading) {
    return <Typography>Loading delivery order returns...</Typography>;
  }
  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  console.log(deliveryOrderReturnList);

  return (
    <Box p={3} mr={3}>
      {/* Toolbar */}
      <Box
        display="flex"
        flexWrap="wrap"
        justifyContent="space-between"
        gap={2}
        mb={2}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="h6" fontSize="24px" fontWeight={500}>
            Delivery Order Returns
          </Typography>

          <TextField
            size="small"
            placeholder="Search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 240 }}
          />
        </Box>

        {/* Pagination & View toggles */}
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="body2">
            Page {page} of {totalPages}
          </Typography>

          <Box
            display="flex"
            alignItems="center"
            border="1px solid #E2E6E9"
            borderRadius={1}
          >
            <IconButton
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <FaCaretLeft />
            </IconButton>
            <IconButton
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              <FaCaretRight />
            </IconButton>
          </Box>

          <Box
            display="flex"
            alignItems="center"
            border="1px solid #E2E6E9"
            borderRadius={1}
          >
            <IconButton
              onClick={() => setViewMode("grid")}
              color={viewMode === "grid" ? "primary" : "default"}
              sx={{ backgroundColor: "#ffffff" }}
            >
              <IoGrid />
            </IconButton>
            <IconButton
              onClick={() => setViewMode("list")}
              color={viewMode === "list" ? "primary" : "default"}
            >
              <FaBars />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Content */}
      {viewMode === "list" ? (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            backgroundColor: "#ffffff",
            borderRadius: 2,
            border: "1px solid #E2E6E9",
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={allOnPageSelected}
                    indeterminate={!allOnPageSelected && selected.length > 0}
                    onChange={toggleSelectAll}
                    sx={{ p: 3, color: "#7A8A98" }}
                  />
                </TableCell>
                {headers.map((h) => (
                  <TableCell key={h.key} sx={headerSx}>
                    {h.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {pagedRows.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  sx={{
                    "&:nth-of-type(odd)": { backgroundColor: "#f5f5f5" },
                    cursor: "pointer",
                  }}
                  onClick={() => handleRowClick(row)}
                >
                  <TableCell
                    padding="checkbox"
                    onClick={(e) => e.stopPropagation()}
                    sx={{ p: 2 }}
                  >
                    <Checkbox
                      sx={{ color: "#7A8A98" }}
                      checked={selected.includes(row.id)}
                      onChange={() => toggleSelectOne(row.id)}
                    />
                  </TableCell>

                  <TableCell sx={cellSx(true)}>{row.id}</TableCell>
                  <TableCell sx={cellSx()}>{row.dateOfReturn}</TableCell>
                  <TableCell sx={cellSx()}>{row.sourceLocation}</TableCell>
                  <TableCell sx={cellSx()}>{row.returnWarehouse}</TableCell>
                  <TableCell sx={cellSx()}>{row.reason}</TableCell>
                  <TableCell sx={cellSx()}>{row.totalItems}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box
          display="grid"
          gridTemplateColumns="repeat(auto-fill, minmax(300px, 1fr))"
          gap={2}
        >
          {pagedRows.map((item) => (
            <Box
              key={item.id}
              sx={{
                p: 3,
                cursor: "pointer",
                border: "1.2px solid #E2E6E9",
                borderRadius: 2,
                backgroundColor: "#fffffd",
              }}
              display="flex"
              flexDirection="column"
              alignItems="center"
              gap={1.5}
              onClick={() => handleRowClick(item)}
            >
              <Typography variant="subtitle2">{item.id}</Typography>
              <Typography variant="body2" color="textSecondary" fontSize={12}>
                Source Doc: {item.sourceDocument}
              </Typography>
              <Typography variant="body2" color="textSecondary" fontSize={12}>
                {item.dateOfReturn}
              </Typography>
              <Typography variant="body2" color="textSecondary" fontSize={12}>
                From: {item.sourceLocation}
              </Typography>
              <Typography variant="body2" color="textSecondary" fontSize={12}>
                To: {item.returnWarehouse}
              </Typography>
              <Typography variant="body2" color="textSecondary" fontSize={12}>
                Items: {item.totalItems}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
