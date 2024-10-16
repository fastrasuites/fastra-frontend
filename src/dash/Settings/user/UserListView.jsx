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

const UserListView = ({ users }) => {
  const [selected, setSelected] = React.useState([]);

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const newSelected = users.map((company) => company.id);
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

  if (users.length === 0) {
    return <p style={{margin: "21px"}}>No companies available. Please add some companies.</p>;
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
                  selected.length > 0 && selected.length < users.length
                }
                checked={
                  users.length > 0 && selected.length === users.length
                }
                onChange={handleSelectAll}
              />
            </TableCell>
            <TableCell>Company Name</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Email Address</TableCell>
            <TableCell>Phone Number</TableCell>
            <TableCell>Last login date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user, index) => (
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
                  src={user.image || "default-image-url"}
                  alt={user.name}
                  style={{
                    width: "30px",
                    height: "30px",
                    marginRight: "10px",
                    borderRadius: "50%",
                  }}
                />
                {user.name || "N/A"}
              </TableCell>
              <TableCell sx={{ color: "#7a8a98", fontSize: "12px" }}>
                {user.role || "N/A"}
              </TableCell>
              <TableCell sx={{ color: "#7a8a98", fontSize: "12px" }}>
                {user.mail || "N/A"}
              </TableCell>
              <TableCell sx={{ color: "#7a8a98", fontSize: "12px" }}>
                {user.number || "N/A"}
              </TableCell>
              {/* <TableCell sx={{ color: "#7a8a98", fontSize: "12px" }}>
                {company.registrationNumber || "N/A"}
              </TableCell> */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UserListView;
