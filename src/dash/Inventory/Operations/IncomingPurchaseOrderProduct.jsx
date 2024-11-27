import React, { useState } from "react";
import {
  Box,
  useTheme,
  Button,
  Typography,
  FormControl,
  TextField,
  Grid,
  Divider,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  Paper,
  TableCell,
  useMediaQuery,
} from "@mui/material";
import autosave from "../../../image/autosave-text.svg";
import inventoryShareStyles from "../inventorySharedStyles.js";

const IncomingPurchaseOrderProduct = () => {
  const theme = useTheme();
  const [receivedQty, setReceivedQty] = useState(0);
  const isSmallScreen = useMediaQuery("(max-width:600px)");
  return (
    <>
      <Box
        sx={{
          ...inventoryShareStyles.WidthFullFlexSpaceBetween(theme),
          justifyContent: "flex-start",
          marginTop: "32px",
          marginBottom: "24px",
          gap: "72px",
        }}
      >
        <Typography sx={inventoryShareStyles.pageBoldTitle(theme)}>
          Incoming Purchase Order
        </Typography>

        <img src={autosave} alt="autosave" />
      </Box>

      <form>
        <Box
          sx={{
            ...inventoryShareStyles.formWrapper(theme),
          }}
        >
          {/* form heading and cancel button */}
          <Box sx={inventoryShareStyles.WidthFullFlexSpaceBetween}>
            <Typography sx={inventoryShareStyles.formHeaderTitle(theme)}>
              Product Information
            </Typography>

            <Button
              sx={{
                ...inventoryShareStyles.buttonStyles(theme),
                color: "#3B7CED",
                backgroundColor: "#FFFFFF",
                "&:hover": {
                  backgroundColor: "transparent",
                  outline: "solid 1px #3B7CED",
                },
              }}
            >
              Cancel
            </Button>
          </Box>
          {/* form detail - first section  */}

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3} lg={2} xl={2} sx={{ flexGrow: 1 }}>
              <FormControl fullWidth>
                <TextField
                  label="ID"
                  value="PO00001"
                  variant="standard"
                  InputProps={{
                    readOnly: true,
                    disableUnderline: true,
                  }}
                  sx={{
                    ...inventoryShareStyles.textFieldStyles(),
                    "& .MuiInputBase-input": {
                      color: "#E43D2B",
                      textDecoration: "underline",
                      textUnderlineOffset: "3px",
                      fontStyle: "italic",
                    },
                  }}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3} lg={3} xl={2} sx={{ flexGrow: 1 }}>
              <FormControl fullWidth>
                <TextField
                  label="Vendor"
                  value="Vendor's name"
                  variant="standard"
                  InputProps={{
                    readOnly: true,
                    disableUnderline: true,
                  }}
                  sx={{
                    ...inventoryShareStyles.textFieldStyles(),
                  }}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3} lg={2} xl={2} sx={{ flexGrow: 1 }}>
              <FormControl fullWidth>
                <TextField
                  label="Receipt Date"
                  value="4 Apr 2024 - 4.48PM"
                  variant="standard"
                  InputProps={{
                    readOnly: true,
                    disableUnderline: true,
                  }}
                  sx={{
                    ...inventoryShareStyles.textFieldStyles(),
                  }}
                />
              </FormControl>
            </Grid>
          </Grid>

          <Divider />

          <TableContainer
            component={Paper}
            style={{ margin: "0 auto", maxWidth: "100%" }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Expected Qty</TableCell>
                  <TableCell>Qty Received</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow sx={{ backgroundColor: "#F2F2F2" }}>
                  {/* Product Name */}
                  <TableCell>
                    <TextField
                      value="Cement"
                      placeholder="Enter a product name"
                      variant="standard"
                      InputProps={{
                        disableUnderline: true,
                        readOnly: true,
                        style: { fontSize: "14px", color: "#A9B3BC" },
                      }}
                    />
                  </TableCell>

                  {/* Product Description */}
                  <TableCell>
                    <TextField
                      value="Laptop and Mouse"
                      placeholder="Product description"
                      variant="standard"
                      InputProps={{
                        disableUnderline: true,
                        readOnly: true,
                        style: { fontSize: "14px", color: "#A9B3BC" },
                      }}
                    />
                  </TableCell>

                  {/* Expected Quantity */}
                  <TableCell>
                    <TextField
                      value="4"
                      variant="standard"
                      type="number"
                      InputProps={{
                        readOnly: true,
                        disableUnderline: true,
                        style: { fontSize: "14px", color: "#A9B3BC" },
                      }}
                    />
                  </TableCell>

                  {/* Received Quantity */}
                  <TableCell>
                    <TextField
                      value={receivedQty}
                      onChange={(e) => setReceivedQty(e.target.value)}
                      variant="standard"
                      type="number"
                      InputProps={{
                        // readOnly: true,
                        // disableUnderline: true,
                        style: { fontSize: "14px", color: "#A9B3BC" },
                      }}
                    />
                  </TableCell>
                </TableRow>
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

          <Box
            sx={{
              ...inventoryShareStyles.WidthFullFlexSpaceBetween(theme),
              justifyContent: "flex-end",
            }}
          >
            <Button sx={inventoryShareStyles.buttonStyles(theme)}>Done</Button>
          </Box>
        </Box>
      </form>
    </>
  );
};

export default IncomingPurchaseOrderProduct;
