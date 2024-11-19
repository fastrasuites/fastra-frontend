import React, { useEffect, useState } from "react";
import autosave from "../../../image/autosave-text.svg";
import "./IncomingProductForm.css";
import {
  ButtonGroup,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import { useMediaQuery, Typography } from "@mui/material";

const IncomingProductForm = () => {
  const [selectedReceiptType, setSelectedReceiptType] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [products, setProducts] = useState([]);
  const [tableData, setTableData] = useState([
    {
      productName: "Keyboard",
      expectedQty: 10,
      unitOfMeasure: "kg",
      receivedQty: 12,
    },
    {
      productName: "Monitor",
      expectedQty: 5,
      unitOfMeasure: "pcs",
      receivedQty: 3,
    },
  ]);

  const [modalMessage, setModalMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const unitOfMeasureOptions = ["kg", "pcs", "liters"];

  const handleFieldChange = (index, field, value) => {
    const updatedData = [...tableData];
    updatedData[index][field] = value;
    setTableData(updatedData);
  };

  const handleValidate = (e) => {
    e.preventDefault();
    const result = tableData.map((row) => {
      if (row.expectedQty === row.receivedQty) {
        return `${row.productName}: Quantities are equal.`;
      } else if (row.expectedQty > row.receivedQty) {
        return `${row.productName}: Received less than expected.`;
      } else {
        return `${row.productName}: Received more than expected.`;
      }
    });
    setModalMessage(result.join("\n"));
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    const savedProducts = JSON.parse(localStorage.getItem("products")) || [];
    setProducts(savedProducts);
  }, []);

  const isSmallScreen = useMediaQuery("(max-width:600px)");
  // Handle input changes for the product name

  const handleChange = (e) => {
    setSelectedReceiptType(e.target.value);
  };

  const receiptTypes = ["Goods", "Manufacturing", "Internal Transfer"];

  return (
    <div>
      <header
        style={{
          display: "flex",
          gap: "40px",
          alignItems: "center",
          marginTop: "50px",
          marginBottom: "24px",
        }}
      >
        <h1
          style={{
            fontFamily: "Product Sans",
            fontSize: "24px",
            fontWeight: "500",
            lineHeight: "29.11px",
            textAlign: "left",
            textUnderlinePosition: "from-font",
            textDecorationSkipInk: "none",
            color: "#1A1A1A",
            marginRight: "42px",
          }}
        >
          New Incoming product
        </h1>
        <span>
          <img src={autosave} alt="autosave" />
        </span>
      </header>
      <div className="form-wrapper">
        <form style={{}}>
          {/* form heading and cancel button */}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h2
              style={{
                fontFamily: "Product Sans",
                fontSize: "20px",
                fontWeight: "500",
                lineHeight: "24.26px",
                textAlign: "left",
                textUnderlinePosition: "from-font",
                textDecorationSkipInk: "none",
                color: "#3B7CED",
              }}
            >
              Product Information
            </h2>
            <button
              style={{
                fontFamily: "Product Sans",
                fontSize: "16px",
                fontWeight: "400",
                lineHeight: "19.41px",
                textUnderlinePosition: "from-font",
                textDecorationSkipInk: "none",
                color: "#3B7CED",
                padding: "8px 24px",
                cursor: "pointer",
                background: "none",
                border: "none",
              }}
            >
              Cancel
            </button>
          </div>
          {/* form detail - first section  */}
          <div
            style={{
              display: "flex",
              rowGap: "16px",
              columnGap: "77px",
              flexWrap: "wrap",
            }}
          >
            <FormControl
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  width: "300px",
                  height: "48px",
                  padding: "0 24px",
                  fontFamily: "Product Sans",
                  fontSize: "14px",
                  fontWeight: "400",
                  borderRadius: "4px",
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#7A8A98",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#7A8A98",
                  },
                },
              }}
            >
              <label
                style={{
                  fontFamily: "Product Sans",
                  fontSize: "16px",
                  color: "#1A1A1A",
                  marginBottom: "8px",
                  display: "block",
                }}
              >
                Receipt Type
              </label>
              <Select
                value={selectedReceiptType}
                onChange={handleChange}
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Select Receipt Type
                </MenuItem>
                {receiptTypes.map((receipt, index) => (
                  <MenuItem key={index} value={receipt}>
                    {receipt}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="ID"
              variant="standard"
              value="LAGIN0001"
              InputProps={{ readOnly: true, disableUnderline: true }}
              sx={{
                width: "content",
                fontFamily: "Product Sans",
                fontSize: "14px",
              }}
            />

            <TextField
              label="Receipt Date"
              variant="standard"
              value="4 Apr 2024 - 4:48"
              InputProps={{ readOnly: true, disableUnderline: true }}
              sx={{
                width: "max-content",
                fontFamily: "Product Sans",
                fontSize: "14px",
              }}
            />

            <TextField
              label="Location"
              variant="standard"
              value="xds Store"
              InputProps={{ readOnly: true, disableUnderline: true }}
              sx={{
                width: "max-content",
                fontFamily: "Product Sans",
                fontSize: "14px",
              }}
            />
          </div>

          <Divider sx={{ marginY: "0px" }} />
          {/* second section */}
          <div>
            <label
              style={{
                fontFamily: "Product Sans",
                fontSize: "16px",
                color: "#1A1A1A",
                marginBottom: "8px",
                display: "block",
              }}
            >
              Name of Supplier
            </label>
            <TextField
              placeholder="Enter supplier's name"
              variant="outlined"
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              sx={{
                width: "300px",
                fontFamily: "Product Sans",
                fontSize: "14px",
                color: "#1A1A1A",
              }}
            />
          </div>
          <Divider sx={{ marginY: "0px" }} />

          {/* Product Table Section */}

          <div>
            <TableContainer
              component={Paper}
              style={{ margin: "0 auto", maxWidth: "100%" }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product Name</TableCell>
                    <TableCell>Expected Qty</TableCell>
                    <TableCell>Unit of Measure</TableCell>
                    <TableCell>Received Qty</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tableData.map((row, index) => (
                    <TableRow
                      key={index}
                      style={{
                        backgroundColor:
                          index % 2 === 0 ? "#F2F2F2" : "#FFFFFF", // Alternate background color
                      }}
                    >
                      {/* Editable Product Name */}
                      <TableCell>
                        <TextField
                          value={row.productName}
                          placeholder="Enter a product name"
                          onChange={(e) =>
                            handleFieldChange(
                              index,
                              "productName",
                              e.target.value
                            )
                          }
                          variant="standard"
                          InputProps={{
                            style: { fontSize: "14px", color: "#A9B3BC" },
                          }}
                        />
                      </TableCell>

                      {/* Editable Expected Quantity */}
                      <TableCell>
                        <TextField
                          value={row.expectedQty}
                          onChange={(e) =>
                            handleFieldChange(
                              index,
                              "expectedQty",
                              e.target.value
                            )
                          }
                          variant="standard"
                          type="number"
                          InputProps={{
                            style: { fontSize: "14px", color: "#A9B3BC" },
                          }}
                        />
                      </TableCell>

                      {/* Non-editable Unit of Measure (Dropdown) */}
                      <TableCell>
                        <Select
                          value={row.unitOfMeasure}
                          onChange={(e) =>
                            handleFieldChange(
                              index,
                              "unitOfMeasure",
                              e.target.value
                            )
                          }
                          variant="standard"
                          disableUnderline
                          InputProps={{
                            style: { fontSize: "14px", color: "#A9B3BC" },
                          }}
                        >
                          {unitOfMeasureOptions.map((option, i) => (
                            <MenuItem key={i} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                        </Select>
                      </TableCell>

                      {/* Editable Received Quantity */}
                      <TableCell>
                        <TextField
                          value={row.receivedQty}
                          onChange={(e) =>
                            handleFieldChange(
                              index,
                              "receivedQty",
                              e.target.value
                            )
                          }
                          variant="standard"
                          type="number"
                          InputProps={{
                            style: { fontSize: "14px", color: "#A9B3BC" },
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {isSmallScreen && (
                <Typography
                  variant="caption"
                  align="center"
                  style={{
                    display: "block",
                    marginTop: "10px",
                    fontStyle: "italic",
                  }}
                >
                  Swipe horizontally for a better view.
                </Typography>
              )}
            </TableContainer>
          </div>

          <ButtonGroup
            sx={{ display: "flex", justifyContent: "flex-end", gap: "32px" }}
          >
            <button className="validate-btn" onClick={handleValidate}>
              Validate
            </button>
            <button className="save-btn">Save</button>
          </ButtonGroup>
        </form>
      </div>
      <Dialog open={isModalOpen} onClose={handleCloseModal}>
        <DialogTitle>Validation Results</DialogTitle>
        <DialogContent>
          <Typography>{modalMessage}</Typography>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IncomingProductForm;

// import React, { useState } from "react";
// import {
//   FormControl,
//   MenuItem,
//   Select,
//   TextField,
//   Button,
// } from "@mui/material";

// const IncomingProductForm = ({ onCancel, onSave }) => {
//   const [receiptType, setReceiptType] = useState("");
//   const [supplierName, setSupplierName] = useState("");
//   const [destinationLocation, setDestinationLocation] = useState("");
//   const [products, setProducts] = useState([{ productName: "", quantity: 0 }]);

//   const handleProductChange = (index, field, value) => {
//     const updatedProducts = [...products];
//     updatedProducts[index][field] = value;
//     setProducts(updatedProducts);
//   };

//   const addProductLine = () => {
//     setProducts([...products, { productName: "", quantity: 0 }]);
//   };

//   const saveForm = () => {
//     if (!receiptType || !supplierName || products.length === 0) {
//       alert("Please fill all required fields.");
//       return;
//     }
//     const newReceipt = {
//       receiptType,
//       supplierName,
//       destinationLocation: destinationLocation || "Default Location",
//       products,
//       receiptDate: new Date().toISOString(),
//       status: "Draft",
//     };
//     onSave(newReceipt);
//     onCancel();
//   };

//   return (
//     <div>
//       <header style={{ display: "flex", justifyContent: "space-between" }}>
//         <h1>New Incoming Product</h1>
//         <Button onClick={onCancel}>Cancel</Button>
//       </header>

//       <FormControl fullWidth style={{ marginBottom: "16px" }}>
//         <Select
//           value={receiptType}
//           onChange={(e) => setReceiptType(e.target.value)}
//         >
//           {[
//             "Vendor Receipt",
//             "Manufacturing",
//             "Internal Transfer",
//             "Returns",
//           ].map((type) => (
//             <MenuItem key={type} value={type}>
//               {type}
//             </MenuItem>
//           ))}
//         </Select>
//       </FormControl>

//       <TextField
//         label="Supplier Name"
//         fullWidth
//         value={supplierName}
//         onChange={(e) => setSupplierName(e.target.value)}
//         style={{ marginBottom: "16px" }}
//       />

//       {products.map((product, index) => (
//         <div
//           key={index}
//           style={{ display: "flex", gap: "16px", marginBottom: "8px" }}
//         >
//           <TextField
//             label="Product Name"
//             value={product.productName}
//             onChange={(e) =>
//               handleProductChange(index, "productName", e.target.value)
//             }
//           />
//           <TextField
//             label="Quantity"
//             type="number"
//             value={product.quantity}
//             onChange={(e) =>
//               handleProductChange(index, "quantity", e.target.value)
//             }
//           />
//         </div>
//       ))}

//       <Button onClick={addProductLine}>Add Product Line</Button>
//       <Button onClick={saveForm} variant="contained" color="primary">
//         Save
//       </Button>
//     </div>
//   );
// };

// export default IncomingProductForm;
