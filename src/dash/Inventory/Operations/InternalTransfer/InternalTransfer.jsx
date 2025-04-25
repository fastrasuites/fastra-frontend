import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Button,
  Stack,
} from "@mui/material";
import { useTenant } from "../../../../context/TenantContext";

// Sample data
const internalTransferData = [
  {
    id: "IT001",
    sourceLocation: "xsx Stores",
    productName: "Laptop Keyboard",
    quantity: 4,
    unitOfMeasure: "kg",
    status: "Done",
  },
  {
    id: "IT002",
    sourceLocation: "xsx Stores",
    productName: "Laptop",
    quantity: 4,
    unitOfMeasure: "kg",
    status: "Done",
  },
  {
    id: "IT003",
    sourceLocation: "xsx Stores",
    productName: "Keyboard & Mouse",
    quantity: 4,
    unitOfMeasure: "kg",
    status: "Done",
  },
  {
    id: "IT004",
    sourceLocation: "xsx Stores",
    productName: "Laptop Keyboard",
    quantity: 4,
    unitOfMeasure: "kg",
    status: "Draft",
  },
];

export default function InternalTransfer() {
  const { tenantData } = useTenant();
  const tenant_schema_name = tenantData?.tenant_schema_name || "";
  const [searchTerm, setSearchTerm] = useState("");

  // Filter data based on search input (ID, source location, or product name)
  const filteredData = internalTransferData.filter(
    ({ id, sourceLocation, productName }) =>
      id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sourceLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Paper sx={{ p: 3 }}>
      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
        <Button
          component={Link}
          to={`/${tenant_schema_name}/inventory/operations/create-internal-transfer`}
          variant="contained"
        >
          New Transfer Order
        </Button>
        <TextField
          variant="outlined"
          placeholder="Search by ID, Location or Product"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: 300 }}
        />
      </Stack>

      <TableContainer component={Paper}>
        <Table aria-label="internal transfer table">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox color="primary" />
              </TableCell>
              <TableCell>Source Location</TableCell>
              <TableCell>Product Name</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Unit of Measure</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.map((item, index) => (
              <TableRow
                key={item.id}
                sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}
              >
                <TableCell padding="checkbox">
                  <Checkbox color="primary" />
                </TableCell>
                <TableCell>{item.sourceLocation}</TableCell>
                <TableCell>{item.productName}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{item.unitOfMeasure}</TableCell>
                <TableCell
                  sx={{
                    color:
                      item.status === "Done"
                        ? 'success.main'
                        : item.status === "Draft"
                        ? 'info.main'
                        : 'text.primary',
                    fontWeight: 'bold',
                  }}
                >
                  {item.status}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
