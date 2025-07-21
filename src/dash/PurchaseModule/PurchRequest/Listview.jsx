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
} from "@mui/material";
import PropTypes from "prop-types";
import { extractRFQID } from "../../../helper/helper";
import { Trash } from "lucide-react";
import { formatDate } from "../../../helper/helper";

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

const ListView = ({ items, onCardClick, getStatusColor, onDeleteSelected }) => {
  const [selected, setSelected] = useState([]);
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
  // Memoize the rendered rows for performance.
  const renderedRows = React.useMemo(() => {
    return items.map((item, index) => {
      const requester =
        item?.requester_details?.user?.first_name &&
        item?.requester_details?.user?.last_name
          ? `${item?.requester_details?.user?.first_name} ${item?.requester_details?.user?.last_name}`
          : item?.requester_details?.user?.username;
      return (
        <TableRow
          key={item.url}
          sx={{
            backgroundColor: index % 2 === 0 ? "#fff" : "#f2f2f2",
            cursor: "pointer",
            "&:last-child td, &:last-child th": { border: 0 },
          }}
          onClick={() => onCardClick && onCardClick(item)}
        >
          <TableCell sx={cellStyle(index)} padding="checkbox">
            <Checkbox
              color="primary"
              checked={selected.includes(item.url)}
              onClick={(event) => event.stopPropagation()}
              onChange={(event) => handleSelect(event, item.url)}
            />
          </TableCell>
          {/* // purchase request date */}
          <TableCell sx={cellStyle(index)}>
            {formatDate(item?.date_created)}
          </TableCell>
          <TableCell sx={cellStyle(index)}>{extractRFQID(item.id)}</TableCell>
          <TableCell sx={cellStyle(index)}>{requester}</TableCell>
          <TableCell sx={cellStyle(index)}>
            {item?.vendor_details.company_name}
          </TableCell>
          <TableCell sx={cellStyle(index)}>{item?.total_price}</TableCell>
          <TableCell sx={statusCellStyle(index, getStatusColor, item.status)}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: getStatusColor(item.status),
                  marginRight: "8px",
                  textTransform: "capitalize",
                }}
              />
              {item.status}
            </div>
          </TableCell>
        </TableRow>
      );
    });
  }, [items, selected, handleSelect, onCardClick, getStatusColor]);

  if (items.length === 0) {
    return <p>No items available. Please fill the form to add items.</p>;
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
              <TableCell>Date</TableCell>
              <TableCell>PR ID</TableCell>
              <TableCell>Created By</TableCell>
              <TableCell>Vendor</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              {/* <TableCell>Request ID</TableCell>
              <TableCell>Product Name</TableCell>
              <TableCell>Qty</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell> */}
            </TableRow>
          </TableHead>
          <TableBody>{renderedRows}</TableBody>
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
};

export default ListView;
