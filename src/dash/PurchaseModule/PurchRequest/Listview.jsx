import React, { useState, useEffect } from "react";
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
import { usePurchase } from "../../../context/PurchaseContext";

// Function to get status color
const getStatusColor = (status) => {
  switch (status) {
    case "approved":
      return "#2ba24c";
    case "pending":
      return "#f0b501";
    case "rejected":
      return "#e43e2b";
    case "draft":
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

  const [selected, setSelected] = useState([]);
  const { fetchPurchaseRequests, purchaseRequests } = usePurchase();

  useEffect(() => {
    fetchPurchaseRequests();
  }, []);

  // console.log(purchaseRequests);

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const newSelected = items.map((item) => item.url);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleSelect = (event, url) => {
    const selectedIndex = selected.indexOf(url);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, url);
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

  if (!items || items.length === 0) {
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
            <TableCell>Date</TableCell>
            <TableCell>PR ID</TableCell>
            <TableCell>Created By</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item, index) => (
            <TableRow
              key={item.url}
              sx={{
                backgroundColor: index % 2 === 0 ? "#fff" : "#f2f2f2",
                "&:last-child td, &:last-child th": { border: 0 },
              }}
              onClick={() => onItemClick(item.url)}
              style={{ cursor: "pointer" }}
            >
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  checked={selected.indexOf(item.url) !== -1}
                  onChange={(event) => handleSelect(event, item.url)}
                />
              </TableCell>
              <TableCell>{item.date_created}</TableCell>

              {/* Displaying productName correctly */}
              <TableCell sx={{ color: "#7a8a98", fontSize: "12px" }}>
                {Array.isArray(item.name) ? item.productNames.join(", ") : ""}
              </TableCell>

              {/* Displaying qty correctly */}
              <TableCell sx={{ color: "#7a8a98", fontSize: "12px" }}>
                {/* {item.rows.map((product) => product.qty).join(", ")} */}
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
