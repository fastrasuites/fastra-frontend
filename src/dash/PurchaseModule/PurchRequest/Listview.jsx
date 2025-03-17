import React, { useState } from 'react';
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
import { useLocation } from "react-router-dom";

// Function to get status color
const getStatusColor = (status) => {
  switch (status) {
    case "Approved":
      return "#2ba24c";
    case "Pending":
      return "#f0b501";
    case "Rejected":
      return "#e43e2b";
    case "Draft":
      return "#3b7ded";
    default:
      return "#7a8a98";
  }
};

const ListView = ({ items, onItemClick }) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const userName = queryParams.get("name");
  const userRole = queryParams.get("role");

  const [selected, setSelected] = React.useState([]);

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const newSelected = items.map((item) => item.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  React.useEffect(() => {
    // console.log("Product items:", items);
  }, [items]);
  const [selectedUser, setSelectedUser] = useState({});

  const handleUserSelect = (user) => {
    setSelectedUser(user);
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
    return <p>No items available. Please fill the form to add items.</p>;
  }

  return (
    <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
      <Table
        sx={{
          "&.MuiTable-root": { border: "none" },
          "& .MuiTableCell-root": { border: "none" },
          "& .MuiTableCell-head": { border: "none" },
          "& .MuiTableCell-body": { border: "none" },
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
            <TableCell>Requester</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item, index) => (
            <TableRow
              key={item.id}
              sx={{
                backgroundColor: index % 2 === 0 ? "#fff" : "#f2f2f2",
                "&:last-child td, &:last-child th": { border: 0 },
              }}
              onClick={() => onItemClick(item)}
              style={{ cursor: "pointer" }}
            >
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  checked={selected.indexOf(item.id) !== -1}
                  onChange={(event) => handleSelect(event, item.id)}
                />
              </TableCell>
              <TableCell>{item.id}</TableCell>

              {/* Displaying productName correctly */}
              <TableCell sx={{ color: "#7a8a98", fontSize: "12px" }}>
              {Array.isArray(item.name)
                  ? item.productNames.join(", ")
                  : ""}
              </TableCell>

              {/* Displaying qty correctly */}
              <TableCell sx={{ color: "#7a8a98", fontSize: "12px" }}>
                {item.rows.map((product) => product.qty).join(", ")}
              </TableCell>

              <TableCell sx={{ color: "#7a8a98", fontSize: "12px" }}>
                {item.amount}
              </TableCell>

              {/* Displaying Requester Name correctly */}
              <TableCell sx={{ color: "#7a8a98", fontSize: "12px" }}>
              {item.user?.name || "N/A"} 
              </TableCell>

              <TableCell
                sx={{
                  color: getStatusColor(item.status),
                  fontWeight: "bold",
                }}
              >
                {item.status}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ListView;
