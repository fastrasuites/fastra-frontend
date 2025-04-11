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
    requestId: "LAGIN001",
    partner: "Supplier",
    sourceLocation: "Source Location",
    destinationLocation: "Destination Location",
    dateCreated: "4 Apr 2024 - 4:48PM",
    status: "Validate",
  },
  {
    requestId: "LAGIN002",
    partner: "Customer",
    sourceLocation: "Source Location",
    destinationLocation: "Destination Location",
    dateCreated: "4 Apr 2024 - 4:48PM",
    status: "Draft",
  },
  {
    requestId: "LAGIN003",
    partner: "Supplier",
    sourceLocation: "Source Location",
    destinationLocation: "Destination Location",
    dateCreated: "4 Apr 2024 - 4:48PM",
    status: "Cancelled",
  },
];
const getStatusColor = (status) => {
  switch (status) {
    case "Validate":
    case "Validated":
      return "#2ba24c"; // Green
    case "Drafted":
      return "#158fec"; //blue
    case "Cancelled":
    case "Cancel":
      return "#e43e2b"; // Red
    default:
      return "#158fec"; // Draft Blue
  }
};

const IncomingProductManualListview = () => {
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Handle individual row selection
  const handleRowSelect = (requestId) => {
    setSelectedRows((prev) =>
      prev.includes(requestId)
        ? prev.filter((id) => id !== requestId)
        : [...prev, requestId]
    );
  };

  // Handle select all rows
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(mockData.map((row) => row.requestId));
    }
    setSelectAll(!selectAll);
  };

  return (
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
              Request ID
            </TableCell>
            <TableCell style={{ color: "#7A8A98", fontSize: "14px" }}>
              Partner
            </TableCell>
            <TableCell style={{ color: "#7A8A98", fontSize: "14px" }}>
              Source Location
            </TableCell>
            <TableCell style={{ color: "#7A8A98", fontSize: "14px" }}>
              Destination Location
            </TableCell>
            <TableCell style={{ color: "#7A8A98", fontSize: "14px" }}>
              Date Created
            </TableCell>
            <TableCell style={{ color: "#7A8A98", fontSize: "14px" }}>
              Status
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {mockData.map((row, index) => (
            <TableRow
              key={row.requestId}
              style={{
                backgroundColor: index % 2 === 0 ? "#f5f5f5" : "#F2F2F2",
              }}
            >
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedRows.includes(row.requestId)}
                  onChange={() => handleRowSelect(row.requestId)}
                  color="primary"
                />
              </TableCell>
              <TableCell style={{ color: "#1A1A1A" }}>
                {row.requestId}
              </TableCell>
              <TableCell style={{ color: "#7A8A98", fontSize: "14px" }}>
                {row.partner}
              </TableCell>
              <TableCell style={{ color: "#7A8A98", fontSize: "14px" }}>
                {row.sourceLocation}
              </TableCell>
              <TableCell style={{ color: "#7A8A98", fontSize: "14px" }}>
                {row.destinationLocation}
              </TableCell>
              <TableCell style={{ color: "#7A8A98", fontSize: "14px" }}>
                {row.dateCreated}
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
  );
};

export default IncomingProductManualListview;
