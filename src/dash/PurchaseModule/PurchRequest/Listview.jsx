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
  Skeleton,
} from "@mui/material";
import PropTypes from "prop-types";
import { extractRFQID, formatDate } from "../../../helper/helper";
import { Trash } from "lucide-react";

const getCellStyle = (index) => ({
  backgroundColor: index % 2 === 0 ? "#f2f2f2" : "#fff",
  color: "#7a8a98",
  fontSize: "12px",
});

const getStatusCellStyle = (index, getStatusColor, status) => ({
  backgroundColor: index % 2 === 0 ? "#f2f2f2" : "#fff",
  fontSize: "12px",
  color: getStatusColor(status),
});

const renderSkeletonRows = (count = 5) =>
  Array.from({ length: count }).map((_, index) => (
    <TableRow key={index}>
      {Array.from({ length: 7 }).map((__, i) => (
        <TableCell key={i}>
          <Skeleton variant="text" width={`${60 + i * 5}%`} />
        </TableCell>
      ))}
    </TableRow>
  ));

const ListView = ({
  items,
  onCardClick,
  getStatusColor,
  onDeleteSelected,
  loading,
}) => {
  const [selected, setSelected] = useState([]);

  const handleSelectAll = useCallback(
    (event) => {
      setSelected(event.target.checked ? items.map((item) => item.url) : []);
    },
    [items]
  );

  const handleSelect = useCallback((event, id) => {
    event.stopPropagation();
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const handleDeleteSelected = useCallback(() => {
    if (onDeleteSelected && selected.length) {
      onDeleteSelected(selected);
      setSelected([]);
    }
  }, [onDeleteSelected, selected]);

  const renderedRows = useMemo(
    () =>
      items.map((item, index) => {
        const {
          url,
          id,
          date_created,
          pr_total_price,
          status,
          vendor_details,
          requester_details,
        } = item;

        const requester =
          requester_details?.user?.first_name &&
          requester_details?.user?.last_name
            ? `${requester_details.user.first_name} ${requester_details.user.last_name}`
            : requester_details?.user?.username;

        return (
          <TableRow
            key={url}
            onClick={() => onCardClick?.(item)}
            sx={{
              backgroundColor: index % 2 === 0 ? "#fff" : "#f2f2f2",
              cursor: "pointer",
              "&:last-child td, &:last-child th": { border: 0 },
            }}
          >
            <TableCell sx={getCellStyle(index)} padding="checkbox">
              <Checkbox
                color="primary"
                checked={selected.includes(url)}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => handleSelect(e, url)}
              />
            </TableCell>
            <TableCell sx={getCellStyle(index)}>
              {formatDate(date_created)}
            </TableCell>
            <TableCell sx={getCellStyle(index)}>{extractRFQID(id)}</TableCell>
            <TableCell sx={getCellStyle(index)}>{requester}</TableCell>
            <TableCell sx={getCellStyle(index)}>
              {vendor_details?.company_name}
            </TableCell>
            <TableCell sx={getCellStyle(index)}>{pr_total_price}</TableCell>
            <TableCell sx={getStatusCellStyle(index, getStatusColor, status)}>
              <Box display="flex" alignItems="center">
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    backgroundColor: getStatusColor(status),
                    mr: 1,
                  }}
                />
                <span style={{ textTransform: "capitalize" }}>{status}</span>
              </Box>
            </TableCell>
          </TableRow>
        );
      }),
    [items, selected, handleSelect, onCardClick, getStatusColor]
  );

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
          stickyHeader
          sx={{
            "&.MuiTable-root": { border: "none" },
            "& .MuiTableCell-root": { border: "none" },
          }}
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
              <TableCell>Date</TableCell>
              <TableCell>PR ID</TableCell>
              <TableCell>Created By</TableCell>
              <TableCell>Vendor</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              renderSkeletonRows()
            ) : items.length > 0 ? (
              renderedRows
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No purchase request available. Please fill the form to add a
                  purchase request.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

ListView.propTypes = {
  items: PropTypes.array.isRequired,
  onCardClick: PropTypes.func,
  getStatusColor: PropTypes.func.isRequired,
  onDeleteSelected: PropTypes.func,
  loading: PropTypes.bool,
};

export default ListView;
