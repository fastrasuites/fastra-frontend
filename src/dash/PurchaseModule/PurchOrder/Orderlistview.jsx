import * as React from "react";
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

const Orderlistview = ({ items, onItemClick }) => {
  const [selected, setSelected] = React.useState([]);
  console.log("checking contents the items: ", items);

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const newSelected = items.map((item) => item.id);
      setSelected(newSelected);
      console.log(selected);
      return;
    }
    setSelected([]);
  };

  const handleSelect = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  if (items.length === 0) {
    return <p>No purchase orders available.</p>;
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "#2ba24c"; // Green
      case "Pending":
        return "#f0b501"; // Yellow
      case "Draft":
        return "#158fec"; //blue
      case "Cancelled":
      case "Rejected":
        return "#e43e2b"; // Red
      default:
        return "#7a8a98"; // Gray
    }
  };

  return (
    <TableContainer component={Paper} sx={{ boxShadow: "none", width: "100%" }}>
      <Table
        sx={{
          "&.MuiTable-root": {
            border: "none",
          },
          "& .MuiTableCell-root": {
            border: "none",
          },
          "& .MuiTableCell-head": {
            border: "none",
          },
          "& .MuiTableCell-body": {
            border: "none",
          },
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
            <TableCell>Purchase Order ID</TableCell>
            <TableCell>Product Name</TableCell>
            <TableCell>QTY</TableCell>
            <TableCell>Date Created</TableCell>
            <TableCell>Vendor Name</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody style={{ fontSize: "16px" }}>
          {items.map((item, index) => (
            <TableRow
              key={item.id}
              onClick={() => onItemClick(item)}
              sx={{
                backgroundColor: index % 2 === 0 ? "#fff" : "#f2f2f2",
                "&:last-child td, &:last-child th": { border: 0 },
              }}
            >
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  checked={selected.indexOf(item.id) !== -1}
                  onChange={(event) => handleSelect(event, item.id)}
                />
              </TableCell>
              <TableCell>{item.id}</TableCell>
              <TableCell>
                {item.rows.map((item, index) => item.productName)}
              </TableCell>
              <TableCell>{item.rows.map((item, index) => item.qty)}</TableCell>
              <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
              <TableCell>{item.vendor}</TableCell>
              <TableCell style={{ color: getStatusColor(item.status) }}>
                {item.status}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default Orderlistview;
