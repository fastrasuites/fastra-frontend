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
  Skeleton,
} from "@mui/material";

const ListView = ({ items, onItemClick, loading }) => {
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

  const skeletonRows = Array.from({ length: 5 });

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
            <TableCell>Vendor Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Address</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading
            ? skeletonRows.map((_, index) => (
                <TableRow key={index}>
                  <TableCell padding="checkbox">
                    <Skeleton variant="rectangular" width={20} height={20} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width="80%" />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width="70%" />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width="60%" />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width="90%" />
                  </TableCell>
                </TableRow>
              ))
            : items.length > 0
            ? items.map((item, index) => (
                <TableRow
                  key={item.id}
                  onClick={() => onItemClick(item)}
                  sx={{
                    backgroundColor: index % 2 === 0 ? "#fff" : "#f2f2f2",
                    "&:last-child td, &:last-child th": { border: 0 },
                    cursor: "pointer",
                    "&:hover": { backgroundColor: "#f5f5f5" },
                  }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      checked={selected.indexOf(item.id) !== -1}
                      onChange={(event) => handleSelect(event, item.id)}
                    />
                  </TableCell>
                  <TableCell>{item.company_name}</TableCell>
                  <TableCell>{item.email}</TableCell>
                  <TableCell>{item.phone_number}</TableCell>
                  <TableCell>{item.address}</TableCell>
                </TableRow>
              ))
            : !loading && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No vendors available. Please fill the form to add vendors.
                  </TableCell>
                </TableRow>
              )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ListView;
