import React, { useCallback, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Button,
  Box,
  Typography,
} from "@mui/material";
import PropTypes from "prop-types";
import { extractRFQID, formatDate } from "../../../helper/helper";
import { Trash } from "lucide-react";

const cellStyle = (index) => ({
  backgroundColor: index % 2 === 0 ? "#f2f2f2" : "#fff",
  color: "#7a8a98",
  fontSize: "12px",
});

const statusCellStyle = (index, getStatusColor, status) => ({
  backgroundColor: index % 2 === 0 ? "#f2f2f2" : "#fff",
  fontSize: "12px",
  alignItems: "center",
  color: getStatusColor(status),
});

const Orderlistview = ({
  items,
  onCardClick,
  getStatusColor,
  onDeleteSelected,
  error,
  isLoading,
}) => {
  const [selected, setSelected] = useState([]);

  const isForbidden = error?.message === "Request failed with status code 403";
  const showEmpty = !isLoading && !error && items.length === 0;
  const showError = !isLoading && error && !isForbidden;

  console.log(error);

  // Handler to select/deselect all items.
  const handleSelectAll = useCallback(
    (event) => {
      if (event.target.checked) {
        setSelected(items.map((item) => item.url));
      } else {
        setSelected([]);
      }
    },
    [items]
  );

  // Toggle selection for an individual item.
  const handleSelect = useCallback((event, id) => {
    event.stopPropagation();
    setSelected((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((selectedId) => selectedId !== id)
        : [...prevSelected, id]
    );
  }, []);

  // Delete logic: call the external onDeleteSelected callback and reset selection.
  const handleDeleteSelected = useCallback(() => {
    if (onDeleteSelected && selected.length > 0) {
      onDeleteSelected(selected);
      setSelected([]);
    }
  }, [onDeleteSelected, selected]);

  // Memoize the rendered rows for performance.
  const renderedRows = React.useMemo(() => {
    return items.map((item, index) => (
      <TableRow
        key={item.url}
        sx={{
          backgroundColor: index % 2 === 0 ? "#fff" : "#f2f2f2",
          cursor: "pointer",
          "&:last-child td, &:last-child th": { border: 0 },
        }}
        onClick={() => onCardClick && onCardClick(item?.id)}
      >
        <TableCell sx={cellStyle(index)} padding="checkbox">
          <Checkbox
            color="primary"
            checked={selected.includes(item.url)}
            onClick={(event) => event.stopPropagation()}
            onChange={(event) => handleSelect(event, item.url)}
          />
        </TableCell>
        <TableCell sx={cellStyle(index)}>{extractRFQID(item?.url)}</TableCell>
        <TableCell sx={cellStyle(index)}>
          {extractRFQID(item?.related_rfq)}
        </TableCell>

        <TableCell sx={cellStyle(index)}>
          {formatDate(item?.date_created)}
        </TableCell>
        <TableCell sx={cellStyle(index)}>
          {item?.vendor_details?.company_name}
        </TableCell>
        <TableCell sx={statusCellStyle(index, getStatusColor, item.status)}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: getStatusColor(item.status),
                marginRight: "8px",
              }}
            />
            {item.status === "cancelled"
              ? "Rejected"
              : item.status === "awaiting"
              ? "Pending"
              : item.status === "completed"
              ? "Approved"
              : "Draft"}
          </div>
        </TableCell>
      </TableRow>
    ));
  }, [items, selected, handleSelect, onCardClick, getStatusColor]);

  if (isForbidden) {
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" color="error" align="center">
          You do not have permission to view this page. <br />
          <strong>Request access from an administrator.</strong>
        </Typography>
      </Box>
    );
  }

  if (showError) {
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" color="error" align="center">
          An unexpected error occurred. Please try again later.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", mt: 3 }}>
      {selected.length > 0 && (
        <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            color="error"
            startIcon={<Trash />}
            onClick={handleDeleteSelected}
          >
            Delete Selected
          </Button>
        </Box>
      )}
      <TableContainer
        component={Paper}
        className="scroll-container"
        sx={{ boxShadow: "none", maxHeight: "70vh" }}
      >
        <Table
          sx={{
            "&.MuiTable-root": { border: "none" },
            "& .MuiTableCell-root": { border: "none" },
          }}
          stickyHeader
        >
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  indeterminate={
                    selected.length > 0 && selected.length < items.length
                  }
                  checked={items.length > 0 && selected.length === items.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>Purchase Order ID</TableCell>
              <TableCell>RRF ID</TableCell>
              <TableCell>Date Created</TableCell>
              <TableCell>Vendor</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{renderedRows}</TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Orderlistview;
