import React, { useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
} from "@mui/material";
import PropTypes from "prop-types";

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
const RListView = ({ items, onCardClick, getStatusColor }) => {
  // const quantity = items.reduce((total, item) => total + item.quantity, 0);

  const [selected, setSelected] = React.useState([]);

  // Handler to select or deselect all items
  const handleSelectAll = React.useCallback(
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
    // Prevent row click from firing.
    event.stopPropagation();

    setSelected((prevSelected) => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter((selectedId) => selectedId !== id);
      } else {
        return [...prevSelected, id];
      }
    });
  }, []);

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
        <TableCell sx={cellStyle(index)}>{item.purchase_request}</TableCell>
        <TableCell sx={cellStyle(index)}>
          {item?.items.map((item) => (
            <p>{item.product}</p>
          ))}
        </TableCell>
        <TableCell sx={cellStyle(index)}>
          {item?.items.map((item) => (
            <p>{item.qty}</p>
          ))}
        </TableCell>
        <TableCell sx={cellStyle(index)}>{item.rfq_total_price}</TableCell>
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
            {item.status}
          </div>
        </TableCell>
      </TableRow>
    ));
  }, [items, selected, handleSelect, onCardClick]);

  if (items.length === 0) {
    return <p>No items available. Please fill the form to add items.</p>;
  }

  return (
    <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
      <Table
        sx={{
          "&.MuiTable-root": { border: "none" },
          "& .MuiTableCell-root": { border: "none" },
        }}
      >
        <TableHead sx={{ backgroundColor: "#f2f2f2" }}>
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
            <TableCell>Request ID</TableCell>
            <TableCell>Product Name</TableCell>
            <TableCell>Qty</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{renderedRows}</TableBody>
      </Table>
    </TableContainer>
  );
};

RListView.propTypes = {
  items: PropTypes.array,
  onCardClick: PropTypes.func,
};

export default RListView;
