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

const ProdListview = ({ items, onItemClick }) => {
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
    return <p>No products available. Please fill the form to add products.</p>;
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
                inputProps={{
                  "aria-label": "select all products",
                }}
              />
            </TableCell>
            <TableCell>Product Name</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Quantity</TableCell>
            {/* <TableCell>Unit of Measure</TableCell> */}
            {/* <TableCell>Selling Price</TableCell> */}
            {/* <TableCell>Cost Price</TableCell> */}
            {/* <TableCell>Type</TableCell> */}
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => (
            <TableRow
              key={item.id}
              onClick={() => onItemClick(item)}
              sx={{
                cursor: "pointer",
                "&:hover": { backgroundColor: "#f5f5f5" },
              }}
            >
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  checked={selected.indexOf(item.id) !== -1}
                  onChange={(event) => handleSelect(event, item.id)}
                  inputProps={{
                    "aria-labelledby": `product-list-label-${item.id}`,
                  }}
                />
              </TableCell>
              <TableCell
                component="th"
                scope="row"
                id={`product-list-label-${item.id}`}
              >
                {item.name}
              </TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell>{item.availableProductQty}</TableCell>
              {/* <TableCell sx={{ color: "#3b7ced" }}>{item.sp}</TableCell> */}
              {/* <TableCell sx={{ color: "#3b7ced" }}>{item.cp}</TableCell> */}
              {/* <TableCell>{item.type}</TableCell> */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ProdListview;
