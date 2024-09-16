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

const AccessListView = ({ AccessGroups }) => {
  const [selected, setSelected] = React.useState([]);

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const newSelected = AccessGroups.map((company) => company.id);
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

  if (AccessGroups.length === 0) {
    return <p style={{margin: "10px"}}>No accessgroups set. Please set some accessgroups.</p>;
  }

  return (
    <TableContainer component={Paper} sx={{ boxShadow: "none", }}>
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
                  selected.length > 0 && selected.length < AccessGroups.length
                }
                checked={
                  AccessGroups.length > 0 && selected.length === AccessGroups.length
                }
                onChange={handleSelectAll}
              />
            </TableCell>
            <TableCell>Company Name</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Application</TableCell>
            <TableCell>Email Address</TableCell>
            <TableCell>Phone Number</TableCell>
            <TableCell>Date of Creation</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {AccessGroups.map((user, index) => (
            <TableRow
              key={user.id}
              sx={{
                backgroundColor: index % 2 === 0 ? "#fff" : "#f2f2f2",
                "&:last-child td, &:last-child th": { border: 0 },
              }}
            >
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  checked={selected.indexOf(user.id) !== -1}
                  onChange={(event) => handleSelect(event, user.id)}
                />
              </TableCell>
              <TableCell
                sx={{
                  color: "#7a8a98",
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <img
                  src={user.logo || "default-logo-url"}  // Assuming logo is available
                  alt={user.companyName}
                  style={{
                    width: "30px",
                    height: "30px",
                    marginRight: "10px",
                    borderRadius: "50%",
                  }}
                />
                {user.companyName || "N/A"}
              </TableCell>
              <TableCell sx={{ color: "#7a8a98", fontSize: "12px" }}>
                {user.role || "N/A"}
              </TableCell>
              <TableCell sx={{ color: "#7a8a98", fontSize: "12px" }}>
                {user.application || "N/A"}
              </TableCell>
              <TableCell sx={{ color: "#7a8a98", fontSize: "12px" }}>
                {user.email || "N/A"}
              </TableCell>
              <TableCell sx={{ color: "#7a8a98", fontSize: "12px" }}>
                {user.phoneNumber || "N/A"}
              </TableCell>
              <TableCell sx={{ color: "#7a8a98", fontSize: "12px" }}>
                {new Date(user.dateOfCreation).toLocaleDateString() || "N/A"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer> 
  );
};

export default AccessListView;
