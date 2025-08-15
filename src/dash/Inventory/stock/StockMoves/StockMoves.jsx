import React, { useState, useMemo, useEffect } from "react";
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
import { useStockMove } from "../../../../context/Inventory/stockMoveContext";

export default function StockMoves() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState("list");

  const { stockMoveList, getStockMoveList, isLoading, error } = useStockMove();

  // Fetch stock moves on mount
  useEffect(() => {
    getStockMoveList();
  }, [getStockMoveList]);

  // Transform API data to UI-friendly shape
  const stockMoves = useMemo(
    () =>
      stockMoveList.map((item) => ({
        productName: item.product?.product_name || "",
        qty: item.quantity,
        unitOfMeasure: item.product?.unit_of_measure || "",
        sourceId: item.id,
        dateCreated: new Date(item.date_created).toLocaleString(),
        sourceLocation:
          (item.source_location?.location_name ||
            item.source_location?.name ||
            item.source_location ||
            "") ??
          "",
        destinationLocation:
          (item.destination_location?.location_name ||
            item.destination_location?.name ||
            item.destination_location ||
            "") ??
          "",
      })),
    [stockMoveList]
  );

  const rowsPerPage = 20;

  // Filtered & paginated rows
  const filteredRows = useMemo(
    () =>
      stockMoves.filter((r) =>
        Object.values(r).join(" ").toLowerCase().includes(search.toLowerCase())
      ),
    [search, stockMoves]
  );

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
  const pagedRows = useMemo(
    () => filteredRows.slice((page - 1) * rowsPerPage, page * rowsPerPage),
    [filteredRows, page]
  );

  const allOnPageSelected =
    pagedRows.length > 0 &&
    pagedRows.every((r) => selected.includes(r.sourceId));

  const toggleSelectAll = () => {
    if (allOnPageSelected) {
      setSelected((prev) =>
        prev.filter((id) => !pagedRows.some((r) => r.sourceId === id))
      );
    } else {
      setSelected((prev) => [
        ...new Set([...prev, ...pagedRows.map((r) => r.sourceId)]),
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

  const headers = [
    { key: "productName", label: "Product Name" },
    { key: "qty", label: "QTY" },
    { key: "unitOfMeasure", label: "Unit of Measure" },
    { key: "sourceId", label: "Source ID" },
    { key: "dateCreated", label: "Date Created" },
    { key: "sourceLocation", label: "Source Location" },
    { key: "destinationLocation", label: "Destination Location" },
  ];

  const headerSx = { fontWeight: 500, color: "#7A8A98", fontSize: "14px" };
  const cellSx = (isFirst = false) => ({
    fontSize: "14px",
    color: isFirst ? "#000" : "#7A8A98",
    fontWeight: 400,
  });

  if (isLoading) return <Typography>Loading stock moves...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box p={3} mr={3}>
      {/* Toolbar */}
      <Box
        display="flex"
        justifyContent="space-between"
        mb={2}
        flexWrap="wrap"
        gap={2}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="h6" fontSize="24px" fontWeight={500}>
            Stock Moves
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

      {/* Table / Grid */}
      {viewMode === "list" ? (
        <TableContainer
          component={Paper}
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
                  key={row.sourceId}
                  hover
                  sx={{ "&:nth-of-type(odd)": { backgroundColor: "#f5f5f5" } }}
                  onClick={() => handleRowClick(row)}
                >
                  <TableCell
                    padding="checkbox"
                    onClick={(e) => e.stopPropagation()}
                    sx={{ p: 2 }}
                  >
                    <Checkbox
                      sx={{ color: "#7A8A98" }}
                      checked={selected.includes(row.sourceId)}
                      onChange={() => toggleSelectOne(row.sourceId)}
                    />
                  </TableCell>
                  <TableCell sx={cellSx(true)}>{row.productName}</TableCell>
                  <TableCell sx={cellSx()}>{row.qty}</TableCell>
                  <TableCell sx={cellSx()}>{row.unitOfMeasure}</TableCell>
                  <TableCell sx={cellSx()}>{row.sourceId}</TableCell>
                  <TableCell sx={cellSx()}>{row.dateCreated}</TableCell>
                  <TableCell sx={cellSx()}>{row.sourceLocation}</TableCell>
                  <TableCell sx={cellSx()}>{row.destinationLocation}</TableCell>
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
              key={item.sourceId}
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
              <Typography variant="subtitle2">{item.productName}</Typography>
              <Typography variant="body2" color="textSecondary" fontSize={12}>
                {item.qty} {item.unitOfMeasure}
              </Typography>
              <Typography variant="body2" color="textSecondary" fontSize={12}>
                ID: {item.sourceId}
              </Typography>
              <Typography variant="body2" color="textSecondary" fontSize={12}>
                From: {item.sourceLocation}
              </Typography>
              <Typography variant="body2" color="textSecondary" fontSize={12}>
                To: {item.destinationLocation}
              </Typography>
              <Typography variant="body2" color="textSecondary" fontSize={12}>
                {item.dateCreated}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
