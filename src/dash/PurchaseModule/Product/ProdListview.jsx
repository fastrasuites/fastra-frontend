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
import { useTenant } from "../../../context/TenantContext";
import { useHistory } from "react-router-dom";
import { transformProductCategory } from "../../../helper/helper";

const ProdListview = ({ items, loading = false }) => {
  const [selected, setSelected] = React.useState([]);
  const tenant = useTenant().tenantData.tenant_schema_name;
  const history = useHistory();

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const newSelected = items.map((item) => item.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };
  React.useEffect(() => {
    console.log("Product items:", items);
  }, [items]);

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

  const renderSkeletonRows = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <TableRow key={index}>
        <TableCell padding="checkbox">
          <Skeleton variant="rectangular" width={24} height={24} />
        </TableCell>
        <TableCell>
          <Skeleton variant="text" width="80%" />
        </TableCell>
        <TableCell>
          <Skeleton variant="text" width="60%" />
        </TableCell>
        <TableCell>
          <Skeleton variant="text" width="40%" />
        </TableCell>
        <TableCell>
          <Skeleton variant="text" width="70%" />
        </TableCell>
        <TableCell>
          <Skeleton variant="text" width="30%" />
        </TableCell>
      </TableRow>
    ));
  };

  if (!loading && items.length === 0) {
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
            {/*<TableCell>Unit of Measure</TableCell>*/}
            <TableCell>Product Description</TableCell>
            <TableCell>Quantity Purchased</TableCell>
            {/* <TableCell>Type</TableCell> */}
          </TableRow>
        </TableHead>
        <TableBody>
          {loading
            ? renderSkeletonRows()
            : items.map((item) => (
                <TableRow
                  key={item.id}
                  onClick={() =>
                    history.push(`/${tenant}/purchase/product/${item.id}`)
                  }
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
                    {item.product_name}
                  </TableCell>
                  <TableCell>
                    {transformProductCategory(item.product_category)}
                  </TableCell>
                  <TableCell>{item.available_product_quantity}</TableCell>
                  <TableCell sx={{ color: "#3b7ced" }}>
                    {item.product_description}
                  </TableCell>
                  <TableCell>{item.total_quantity_purchased}</TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ProdListview;
