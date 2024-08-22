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

const getStatusColor = (status) => {
  switch (status) {
    case "Vendor selected":
      return "#2ba24c";
    case "Awaiting vendor selection":
      return "#f0b501";
    case "Cancelled":
      return "#e43e2b";
    default:
      return "#7a8a98";
  }
};

const RListView = ({ items = [], onCardClick }) => {
  const [selected, setSelected] = React.useState([]);

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const newSelected = items.map((item) => item.id);
      setSelected(newSelected);
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
    return <p>No items available. Please fill the form to add items.</p>;
  }

  return (
    <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
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
            <TableCell>Request ID</TableCell>
            <TableCell>Product Name</TableCell>
            <TableCell>Qty</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Requester</TableCell>
            <TableCell>Department</TableCell>
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
              onClick={() => onCardClick(item)}
            >
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  checked={selected.indexOf(item.id) !== -1}
                  onChange={(event) => handleSelect(event, item.id)}
                />
              </TableCell>
              <TableCell>{item.id}</TableCell>
              <TableCell sx={{ color: "#7a8a98", fontSize: "12px" }}>
                {Array.isArray(item.productName) ? (
                  <div className="multi-cell">
                    {item.productName[0]}
                    {item.productName.length > 1 && (
                      <span className="more-items">
                        +{item.productName.length - 1} more
                      </span>
                    )}
                    <div className="dropdown-content">
                      {item.productName.join(", ")}
                    </div>
                  </div>
                ) : (
                  item.productName || "N/A"
                )}
              </TableCell>
              <TableCell sx={{ color: "#7a8a98", fontSize: "12px" }}>
                {Array.isArray(item.qty) ? (
                  <div className="multi-cell">
                    {item.qty[0]}
                    {item.qty.length > 1 && (
                      <span className="more-items">
                        +{item.qty.length - 1} more
                      </span>
                    )}
                    <div className="dropdown-content">
                      {item.qty.join(", ")}
                    </div>
                  </div>
                ) : (
                  item.qty || "N/A"
                )}
              </TableCell>
              <TableCell sx={{ color: "#7a8a98", fontSize: "12px" }}>
                {Array.isArray(item.amount) ? (
                  <div className="multi-cell">
                    {item.amount[0]}
                    {item.amount.length > 1 && (
                      <span className="more-items">
                        +{item.amount.length - 1} more
                      </span>
                    )}
                    <div className="dropdown-content">
                      {item.amount.join(", ")}
                    </div>
                  </div>
                ) : (
                  item.amount || "N/A"
                )}
              </TableCell>
              <TableCell sx={{ color: "#7a8a98", fontSize: "12px" }}>
                {item.requester || "N/A"}
              </TableCell>
              <TableCell sx={{ color: "#7a8a98", fontSize: "12px" }}>
                {item.department || "N/A"}
              </TableCell>
              <TableCell
                sx={{
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  color: getStatusColor(item.status),
                }}
              >
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: getStatusColor(item.status),
                    marginRight: "8px",
                  }}
                ></div>
                {item.status}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default RListView;
