import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Paper,
  Box,
} from "@mui/material";

// Mock data
const mockData = [
  {
    id: "MC0001",
    location: "Location 1",
    dateClosed: "4 Apr 2024 - 4:48PM",
    status: "Closed",
  },
  {
    id: "MC0002",
    location: "Location 2",
    dateClosed: "4 Apr 2024 - 4:48PM",
    status: "Draft",
  },
  {
    id: "MC0003",
    location: "Location 3",
    dateClosed: "4 Apr 2024 - 4:48PM",
    status: "Ongoing",
  },
];
const getStatusColor = (status) => {
  switch (status) {
    case "Closed":
      return "#2ba24c"; // Green
    case "Ongoing":
      return "#8D590B"; // Gold-yellow
    default:
      return "#158fec"; // Draft Blue
  }
};
const MaterialConsumptionListview = () => {
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Handle individual row selection
  const handleRowSelect = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id)
        ? prev.filter((productId) => productId !== id)
        : [...prev, id]
    );
  };

  // Handle select all rows
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(mockData.map((row) => row.id));
    }
    setSelectAll(!selectAll);
  };

  return (
    <div>
      <TableContainer component={Paper}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectAll}
                  onChange={handleSelectAll}
                  color="primary"
                />
              </TableCell>
              <TableCell style={{ color: "#7A8A98", fontSize: "14px" }}>
                ID
              </TableCell>
              <TableCell style={{ color: "#7A8A98", fontSize: "14px" }}>
                Location
              </TableCell>
              <TableCell style={{ color: "#7A8A98", fontSize: "14px" }}>
                Date Closed
              </TableCell>
              <TableCell style={{ color: "#7A8A98", fontSize: "14px" }}>
                Status
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockData.map((row, index) => (
              <TableRow
                key={row.id}
                style={{
                  backgroundColor: index % 2 === 0 ? "#f5f5f5" : "inherit",
                }}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedRows.includes(row.id)}
                    onChange={() => handleRowSelect(row.id)}
                    color="primary"
                  />
                </TableCell>
                <TableCell style={{ color: "#1A1A1A" }}>{row.id}</TableCell>
                <TableCell style={{ color: "#7A8A98", fontSize: "14px" }}>
                  {row.location}
                </TableCell>
                <TableCell style={{ color: "#7A8A98", fontSize: "14px" }}>
                  {row.dateClosed}
                </TableCell>
                <TableCell
                  style={{
                    display: "flex",
                    alignItems: "center",
                    color: getStatusColor(row.status),
                    fontSize: "14px",
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: getStatusColor(row.status),
                      marginRight: 1,
                    }}
                  />
                  {row.status}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default MaterialConsumptionListview;
