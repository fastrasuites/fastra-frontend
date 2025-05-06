import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import React from "react";
import { Link, useParams } from "react-router-dom";
import { mockData } from "../../../data/incomingProductData";

const IncomingProductInfo = () => {
  const { id } = new useParams();
  const incomingProduct = mockData.find(
    (value) => value.requestId === id.toUpperCase()
  );
  const getStatusColor = (status) => {
    switch (status) {
      case "Validate":
      case "Validated":
        return "#2ba24c";
      case "Draft":
      case "Drafted":
        return "#158fec";
      case "Cancelled":
      case "Cancel":
        return "#e43e2b";
      default:
        return "#9e9e9e";
    }
  };

  console.log(incomingProduct);
  return (
    <Box padding={"30px"} display={"grid"} gap="32px">
      <Link>
        <Button variant="contained" size="lg" disableElevation>
          New Incoming Product
        </Button>
      </Link>

      <Box
        padding={"24px"}
        display={"grid"}
        gap="32px"
        border="1px solid #E2E6E9"
        sx={{ backgroundColor: "#FFFFFF" }}
      >
        <Typography variant="h6" color="#3B7CED" fontSize={20} fontWeight={500}>
          Product Information
        </Typography>

        <Box>
          <Typography>Status</Typography>
          <Typography color={getStatusColor(incomingProduct?.status)}>
            {incomingProduct?.status}
          </Typography>
        </Box>

        <Box
          display={"flex"}
          gap={"170px"}
          borderBottom={"1px solid #E2E6E9"}
          paddingBottom={"24px"}
        >
          <Box>
            <Typography>Receipt Type</Typography>
            <Typography color="#7A8A98">Goods Receipt</Typography>
          </Box>
          <Box>
            <Typography>Receipt Number</Typography>
            <Typography color="#7A8A98">ROOO001</Typography>
          </Box>

          <Box>
            <Typography>Receipt Date</Typography>
            <Typography color="#7A8A98">4 Apr 2024 - 4:48 PM</Typography>
          </Box>

          <Box>
            <Typography>Location</Typography>
            <Typography color="#7A8A98">xdx Stores</Typography>
          </Box>
          <Box>
            <Typography>Name of Supplier</Typography>
            <Typography color="#7A8A98">Abc Stores</Typography>
          </Box>
        </Box>

        <Box borderBottom={"1px solid #E2E6E9"} />

        <TableContainer
          backgroundColor="#ffffff"
          component={Paper}
          elevation={0}
          sx={{ borderRadius: "8px", border: "1px solid #E2E6E9" }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: 500,
                    color: "#7A8A98",
                    fontSize: "14px",
                    padding: "24px",
                  }}
                >
                  Product Name
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 500, color: "#7A8A98", fontSize: "14px" }}
                >
                  Description
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 500, color: "#7A8A98", fontSize: "14px" }}
                >
                  Description
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 500, color: "#7A8A98", fontSize: "14px" }}
                >
                  QTY Received
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {incomingProduct.items.map((row, index) => (
                <TableRow
                  key={index}
                  hover
                  sx={{ "&:nth-of-type(odd)": { backgroundColor: "#f5f5f5" } }}
                >
                  <TableCell
                    sx={{
                      fontSize: "14px",
                      color: "#7A8A98",
                      fontWeight: 400,
                      padding: "24px",
                    }}
                  >
                    {row?.product}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: "14px",
                      color: "#7A8A98",
                      fontWeight: 400,
                    }}
                  >
                    Product Description
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: "14px",
                      color: "#7A8A98",
                      fontWeight: 400,
                    }}
                  >
                    5
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: "14px",
                      color: "#7A8A98",
                      fontWeight: 400,
                    }}
                  >
                    {row?.product}
                    <Box borderBottom={"1px solid #E2E6E9"} marginTop={"8px"} />
                  </TableCell>
                </TableRow>
              ))}
              <TableRow
                hover
                sx={{ "&:nth-of-type(odd)": { backgroundColor: "#f5f5f5" } }}
              >
                <TableCell
                  sx={{
                    fontSize: "14px",
                    color: "#7A8A98",
                    fontWeight: 400,
                    padding: "24px",
                  }}
                ></TableCell>
                <TableCell
                  sx={{
                    fontSize: "14px",
                    color: "#7A8A98",
                    fontWeight: 400,
                  }}
                ></TableCell>
                <TableCell
                  sx={{
                    fontSize: "14px",
                    color: "#7A8A98",
                    fontWeight: 400,
                  }}
                ></TableCell>
                <TableCell
                  sx={{
                    fontSize: "14px",
                    color: "#7A8A98",
                    fontWeight: 400,
                  }}
                ></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Box display="flex" justifyContent="space-between" marginRight={"34px"}>
        <Typography
          variant="paragraph"
          color={getStatusColor(incomingProduct?.status)}
        >
          {incomingProduct?.status}
        </Typography>

        {incomingProduct?.status === "Draft" && (
          <Button variant="contained" size="lg" disableElevation>
            Validate
          </Button>
        )}
      </Box>

      
    </Box>
  );
};

export default IncomingProductInfo;
