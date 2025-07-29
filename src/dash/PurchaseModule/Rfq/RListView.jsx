import React, { useCallback, useState, useMemo } from "react";
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
  Skeleton,
} from "@mui/material";
import PropTypes from "prop-types";
import { extractRFQID } from "../../../helper/helper";
import { Trash } from "lucide-react";

const cellStyle = (index) => ({
  backgroundColor: index % 2 === 0 ? "#f2f2f2" : "#fff",
  color: "#7a8a98",
  fontSize: "12px",
});

const statusCellStyle = (index, getStatusColor, status) => ({
  backgroundColor: index % 2 === 0 ? "#f2f2f2" : "#fff",
  fontSize: "12px",
  color: getStatusColor(status),
});

const RListView = ({
  items,
  onCardClick,
  getStatusColor,
  onDeleteSelected,
  loading = false,
}) => {
  const [selected, setSelected] = useState([]);

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

  const handleSelect = useCallback((event, id) => {
    event.stopPropagation();
    setSelected((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((selectedId) => selectedId !== id)
        : [...prevSelected, id]
    );
  }, []);

  const handleDeleteSelected = useCallback(() => {
    if (onDeleteSelected && selected.length > 0) {
      onDeleteSelected(selected);
      setSelected([]);
    }
  }, [onDeleteSelected, selected]);

  const renderedRows = useMemo(() => {
    if (loading) {
      return [...Array(5)].map((_, index) => (
        <TableRow key={index}>
          {[...Array(6)].map((__, i) => (
            <TableCell key={i}>
              <Skeleton variant="text" width="100%" height={20} />
            </TableCell>
          ))}
        </TableRow>
      ));
    }

    return items.map((item, index) => (
      <TableRow
        key={item.url}
        sx={{
          backgroundColor: index % 2 === 0 ? "#fff" : "#f2f2f2",
          cursor: "pointer",
          "&:last-child td, &:last-child th": { border: 0 },
        }}
        onClick={() => onCardClick?.(item?.id)}
      >
        <TableCell sx={cellStyle(index)} padding="checkbox">
          <Checkbox
            color="primary"
            checked={selected.includes(item.url)}
            onClick={(event) => event.stopPropagation()}
            onChange={(event) => handleSelect(event, item.url)}
          />
        </TableCell>
        <TableCell sx={cellStyle(index)}>
          {extractRFQID(item.purchase_request)}
        </TableCell>
        <TableCell sx={cellStyle(index)}>{extractRFQID(item.id)}</TableCell>
        <TableCell sx={cellStyle(index)}>
          {item?.vendor_details?.company_name || "N/A"}
        </TableCell>
        <TableCell sx={cellStyle(index)}>
          {item?.rfq_total_price?.toLocaleString() || ""}
        </TableCell>
        <TableCell sx={statusCellStyle(index, getStatusColor, item.status)}>
          <Box display="flex" alignItems="center">
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                backgroundColor: getStatusColor(item.status),
                mr: 1,
              }}
            />
            <span style={{ textTransform: "capitalize" }}>
              {item.status || "Unknown"}
            </span>
          </Box>
        </TableCell>
      </TableRow>
    ));
  }, [items, selected, handleSelect, onCardClick, getStatusColor, loading]);

  return (
    <Box sx={{ width: "100%", mt: 3 }}>
      {!loading && selected.length > 0 && (
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
          stickyHeader
          sx={{
            "&.MuiTable-root": { border: "none" },
            "& .MuiTableCell-root": { border: "none" },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                {!loading && (
                  <Checkbox
                    color="primary"
                    indeterminate={
                      selected.length > 0 && selected.length < items.length
                    }
                    checked={
                      items.length > 0 && selected.length === items.length
                    }
                    onChange={handleSelectAll}
                  />
                )}
              </TableCell>
              <TableCell>PR ID</TableCell>
              <TableCell>RPQ ID</TableCell>
              <TableCell>Vendor</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {renderedRows}
            {!loading && items.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                    py={2}
                  >
                    No items available. Please fill the form to add items.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

RListView.propTypes = {
  items: PropTypes.array.isRequired,
  onCardClick: PropTypes.func,
  getStatusColor: PropTypes.func.isRequired,
  onDeleteSelected: PropTypes.func,
  loading: PropTypes.bool,
};

export default RListView;
