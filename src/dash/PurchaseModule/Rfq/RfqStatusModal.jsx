import React, { useMemo, useState } from "react";
import PurchaseHeader from "../PurchaseHeader";
import autosave from "../../../image/autosave.svg";
import approved from "../../../../src/image/icons/approved-rfq.svg";
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import "./RfqStatusModal.css";
import RfqForm from "./RfqForm/RfqForm";

// Shared cell style helper function to avoid repetition
const cellStyle = (index) => ({
  backgroundColor: index % 2 === 0 ? "#f2f2f2" : "#fff",
  color: "#7a8a98",
  fontSize: "12px",
});

const RfqStatusModal = ({
  item = {},
  formatDate,
  statusColor,
  onEdit,
  onCancel,
  onNewRfq,
}) => {
  const [edit, setEdit] = useState(false);
  const {
    items = [],
    status = "pending",
    purchase_request,
    currency,
    expiry_date,
  } = item;

  const handleEdit = () => {
    setEdit(true);
    onEdit(item);
  };

  const handleEditClose = () => {
    setEdit(false)
    onEdit(null)
    console.log("hello")
  } 

  const renderedRows = useMemo(() => {
    if (Array.isArray(items) && items.length > 0) {
      return items.map((row, index) => (
        <TableRow
          key={row.url || index}
          sx={{
            cursor: "pointer",
            "&:last-child td, &:last-child th": { border: 0 },
          }}
        >
          <TableCell sx={cellStyle(index)}>{row?.product || "N/A"}</TableCell>
          <TableCell sx={cellStyle(index)}>
            {row?.description || "N/A"}
          </TableCell>
          <TableCell sx={cellStyle(index)}>{row?.qty || "N/A"}</TableCell>
          <TableCell sx={cellStyle(index)}>
            {row?.unit_of_measure || "N/A"}
          </TableCell>
          <TableCell sx={cellStyle(index)}>
            {row?.estimated_unit_price || "N/A"}
          </TableCell>
          <TableCell sx={cellStyle(index)}>
            {row?.get_total_price || "N/A"}
          </TableCell>
        </TableRow>
      ));
    }
    return (
      <TableRow>
        <TableCell
          colSpan={6}
          align="center"
          sx={{ color: "#7a8a98", fontSize: "12px" }}
        >
          No items available
        </TableCell>
      </TableRow>
    );
  }, [items]);

  console.log(edit);
  return (
    <div className="rfqStatus">
      <PurchaseHeader />
      <div className="rfqHeader">
        <div className="rfqHeaderLeft">
          <Button
            variant="contained"
            className="newRfqBtn"
            disableElevation
            onClick={onNewRfq}
          >
            New RFQ
          </Button>
          <div className="rfqAutosave">
            <p>Autosave</p>
            <img src={autosave} alt="Autosave icon" />
          </div>
        </div>
      </div>

      <div className="rfqStatusContent">
        {/* Basic Information Section */}
        <div className="rfqBasicInfo">
          <h2>Basic Information</h2>
          <div className="editCancel">
            <Button
              className="edit"
              onClick={handleEdit}
              style={{
                display:
                  status === "approved" || status === "cancelled"
                    ? "none"
                    : "block",
              }}
            >
              Edit
            </Button>
            <Button variant="outlined" className="cancel" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>

        {/* Status Section */}
        <div className="rfqStatusInfo">
          <p>Status</p>
          <p
            style={{
              color: statusColor ? statusColor(status) : "#000",
              textTransform: "capitalize",
            }}
          >
            {status}
          </p>
        </div>

        {/* Request Information Section */}
        <div className="rfqRequestInfo">
          <TableContainer
            component={Paper}
            sx={{
              maxWidth: "1000px",
              boxShadow: "none",
              borderTop: "none",
              borderLeft: "none",
              borderRight: "none",
            }}
          >
            <Table
              sx={{
                "&.MuiTable-root": { border: "none" },
                "& .MuiTableCell-root": { border: "none" },
              }}
            >
              <TableHead
                sx={{
                  backgroundColor: "#f2f2f2",
                  padding: 0,
                  margin: 0,
                  lineHeight: 0,
                }}
              >
                <TableRow>
                  <TableCell sx={{ paddingButtom: 0 }}>ID</TableCell>
                  <TableCell sx={{ paddingButtom: 0 }}>Date Opened</TableCell>
                  <TableCell sx={{ paddingButtom: 0 }}>Currency Type</TableCell>
                  <TableCell sx={{ paddingButtom: 0 }}>Expiry Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow
                  sx={{
                    cursor: "pointer",
                    "&:last-child td, &:last-child th": { border: 0 },
                  }}
                >
                  <TableCell
                    sx={{
                      backgroundColor: "#fff",
                      color: "#7a8a98",
                      fontSize: "12px",
                    }}
                  >
                    {purchase_request || "N/A"}
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#fff",
                      color: "#7a8a98",
                      fontSize: "12px",
                    }}
                  >
                    {formatDate(Date.now()) || "N/A"}
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#fff",
                      color: "#7a8a98",
                      fontSize: "12px",
                    }}
                  >
                    {currency || "N/A"}
                  </TableCell>
                  <TableCell
                    sx={{
                      backgroundColor: "#fff",
                      color: "#7a8a98",
                      fontSize: "12px",
                    }}
                  >
                    {formatDate(expiry_date) || "N/A"}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </div>

        <p className="rfqContent">RFQ Content</p>

        {/* RFQ Items Table Section */}
        <div className="rfqStatusTable">
          <TableContainer
            component={Paper}
            sx={{ boxShadow: "none", borderRadius: "10px" }}
          >
            <Table
              sx={{
                "&.MuiTable-root": { border: "none" },
                "& .MuiTableCell-root": { border: "none" },
              }}
            >
              <TableHead sx={{ backgroundColor: "#f2f2f2" }}>
                <TableRow>
                  <TableCell>Product Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Qty</TableCell>
                  <TableCell>Unit of Measure</TableCell>
                  <TableCell>Estimated Unit Price</TableCell>
                  <TableCell>Total Price</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>{renderedRows}</TableBody>
            </Table>
          </TableContainer>
        </div>

        {/* Footer Section */}
        {status === "approved" && (
          <div className="rfqStatusFooter">
            <div className="approvedIcon">
              <img src={approved} alt="approved" />
              <p
                style={{
                  color: statusColor ? statusColor(status) : "#000",
                  textTransform: "capitalize",
                }}
              >
                Successfully Sent
              </p>
            </div>

            <Button
              variant="contained"
              className="newRfqBtn"
              disableElevation
              onClick={onNewRfq}
            >
              Convert to PO
            </Button>
          </div>
        )}

        {status === "draft" && (
          <div className="rfqStatusFooter">
            <div className="approvedIcon">
              <p
                style={{
                  color: statusColor ? statusColor(status) : "#000",
                  textTransform: "capitalize",
                }}
              >
                Drafted
              </p>
            </div>

            <Button
              variant="contained"
              className="newRfqBtn"
              disableElevation
              onClick={onNewRfq}
            >
              Share
            </Button>
          </div>
        )}

        {status === "pending" && (
          <div className="rfqStatusFooter">
            <p
              style={{
                color: statusColor ? statusColor(status) : "#000",
                textTransform: "capitalize",
              }}
            >
              pending
            </p>
          </div>
        )}

        {status === "cancelled" && (
          <div className="rfqStatusFooter">
            <p
              style={{
                color: statusColor ? statusColor(status) : "#000",
                textTransform: "capitalize",
              }}
            >
              Rejected
            </p>
          </div>
        )}
      </div>

      {edit && (
        <div className="overlay">
          <RfqForm
            open={edit}
            onCancel={handleEditClose}
            quotation={item}
            formUse={"Edit RFQ"}
            // onSave={handleEditSave}
          />
        </div>
      )}
    </div>
  );
};

export default RfqStatusModal;
