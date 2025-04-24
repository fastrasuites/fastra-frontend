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
} from "@mui/material";
import "./StockAdjustment.css";
import { useTenant } from "../../../../context/TenantContext";

const stocks = [
  { name: "Laptop", proQty: "4", adjQty: "4", status: "Done" },
  { name: "iPhone 11x", proQty: "2", adjQty: "2", status: "Draft" },
];

function StockAdjustment() {
  const { tenantData } = useTenant();
  const tenant_schema_name = tenantData?.tenant_schema_name;
  return (
    <div className="stock-contain">
      <div style={{ padding: "20px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <Link
            to={`/${tenant_schema_name}/inventory/stock/create-stock-adjustment`}
          >
            <button className="create-stock">New stock Adjustment</button>
          </Link>

          <TextField
            variant="outlined"
            placeholder="Search"
            size="small"
            style={{ width: "200px" }}
          />
        </div>

        {/* stocks Table */}
        <TableContainer component={Paper} style={{ marginTop: "20px" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox color="primary" />
                </TableCell>
                <TableCell>Product Name</TableCell>
                <TableCell>Current QTY</TableCell>
                <TableCell>Adjusted QTY</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stocks.map((stock, index) => (
                <TableRow
                  key={stock.id}
                  style={{
                    backgroundColor: index % 2 === 0 ? "#f2f2f2" : "white",
                  }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox color="primary" />
                  </TableCell>
                  <TableCell
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    {stock.name}
                  </TableCell>
                  <TableCell>{stock.proQty}</TableCell>
                  <TableCell>{stock.adjQty}</TableCell>
                  <TableCell
                    style={{
                      color:
                        stock.status === "Done"
                          ? "#2BA24D"
                          : stock.status === "Draft"
                          ? "#3b7ced"
                          : "black",
                      fontWeight: "bold",
                    }}
                  >
                    {stock.status}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
}

export default StockAdjustment;
