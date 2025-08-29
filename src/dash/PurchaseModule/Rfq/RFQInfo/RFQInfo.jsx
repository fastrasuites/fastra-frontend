// src/dash/PurchaseModule/Rfq/RFQInfo.js
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Link, useHistory, useParams } from "react-router-dom";
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Box,
  IconButton,
  Tooltip,
} from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import autosaveIcon from "../../../../image/autosave.svg";
import approvedIcon from "../../../../../src/image/icons/approved-rfq.svg";
import { extractRFQID, formatDate } from "../../../../helper/helper";
import { useTenant } from "../../../../context/TenantContext";
import { useRFQ } from "../../../../context/RequestForQuotation";
import Can from "../../../../components/Access/Can";
import Swal from "sweetalert2";
import PdfTemplate from "../../../../components/PDFTemplate/RFQPDFTemplate";

// ---------- RFQInfo Component ----------
const cellStyle = (index) => ({
  backgroundColor: index % 2 === 0 ? "#f2f2f2" : "#fff",
  color: "#353536",
  fontSize: 12,
});
const statusColorMap = {
  approved: "#2ba24c",
  pending: "#f0b501",
  rejected: "#e43e2b",
  cancelled: "#e43e2b",
  default: "#3B7CED",
};
const statusColor = (s) => statusColorMap[s] || statusColorMap.default;

const RFQInfo = () => {
  const { tenantData } = useTenant();
  const tenantSchema = tenantData?.tenant_schema_name;
  const { id } = useParams();
  const history = useHistory();

  const { getRFQById, approveRFQ, rejectRFQ, pendingRFQ, sendRFQMail } =
    useRFQ();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [sendingMail, setSendingMail] = useState(false);

  const showError = useCallback((msg) => {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: msg,
    });
  }, []);

  const showSuccess = useCallback((msg) => {
    Swal.fire({
      icon: "success",
      title: "Success",
      text: msg,
      showConfirmButton: false,
      timer: 1700,
    });
  }, []);

  const loadRFQ = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getRFQById(id);
      if (res && res.success) {
        setItem(res.data);
      } else if (res && !res.success) {
        showError("Failed to load RFQ");
        history.push(`/${tenantSchema}/purchase/request-for-quotations`);
      } else {
        // fallback: if hook returns raw data
        setItem(res);
      }
    } catch (err) {
      if (err?.response?.status === 403) {
        setItem("FORBIDDEN");
      } else {
        showError(err?.response?.data?.detail || "Error loading RFQ details");
      }
    } finally {
      setLoading(false);
    }
  }, [getRFQById, id, showError, history, tenantSchema]);

  useEffect(() => {
    loadRFQ();
  }, [loadRFQ]);

  console.log(item);

  // Add this utility function to generate PDF from the PdfTemplate component
  const generatePDFBlob = async (item) => {
    // Create a temporary container
    const tempContainer = document.createElement("div");
    tempContainer.style.position = "absolute";
    tempContainer.style.left = "-9999px";
    tempContainer.style.top = "-9999px";
    document.body.appendChild(tempContainer);

    try {
      // Import React DOM for rendering
      const { createRoot } = await import("react-dom/client");

      // Create the PDF template element
      const PdfTemplateElement = React.createElement(PdfTemplate, { item });

      // Render the component
      const root = createRoot(tempContainer);
      root.render(PdfTemplateElement);

      // Wait for rendering to complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Use html2canvas and jsPDF to generate PDF
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).jsPDF;

      const canvas = await html2canvas(tempContainer.firstChild, {
        scale: 1.2, // Reduced from 2 to 1.2 for smaller file size
        useCORS: true,
        allowTaint: true,
        width: 794,
        height: tempContainer.firstChild.scrollHeight,
        backgroundColor: "#ffffff",
        removeContainer: true,
        imageTimeout: 15000,
        logging: false, // Disable logging for performance
      });

      const imgData = canvas.toDataURL("image/png", 0.7);
      const pdf = new jsPDF("p", "mm", "a4");

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Convert to blob
      const pdfBlob = pdf.output("blob");
      const fileSizeMB = pdfBlob.size / (1024 * 1024);
      console.log(`PDF size: ${fileSizeMB.toFixed(2)} MB`);

      if (fileSizeMB > 4.5) {
        // Leave some buffer below 5MB limit
        throw new Error(
          `PDF file too large (${fileSizeMB.toFixed(
            2
          )} MB). Please reduce content or contact support.`
        );
      }

      return pdfBlob;
    } finally {
      // Cleanup
      document.body.removeChild(tempContainer);
    }
  };

  // Updated handleManualSendMail function with PDF attachment
  const handleManualSendMail = useCallback(async () => {
    if (!item) {
      showError("No RFQ loaded to send");
      return;
    }
    const rfqId = extractRFQID(item.url);
    if (!rfqId) {
      showError("Invalid RFQ ID");
      return;
    }

    setSendingMail(true);
    try {
      // Validate that we have recipients
      const recipients = item?.vendor_details?.email || [];
      if (!recipients.length) {
        showError(
          "No supplier email addresses found. Please add suppliers to this RFQ first."
        );
        return;
      }

      // Generate PDF attachment
      const pdfBlob = await generatePDFBlob(item);

      // Create FormData for multipart/form-data request
      const formData = new FormData();
      formData.append("email_subject", `Request for Quotation - ${rfqId}`);
      formData.append(
        "email_body",
        `Dear Supplier,\n\nPlease find attached our Request for Quotation (${rfqId}).\n\nWe look forward to receiving your competitive quotation.\n\nBest regards,\nProcurement Team`
      );
      formData.append("recipient_list", [recipients]);

      // Add PDF attachment
      formData.append("email_attachment", pdfBlob, `RFQ-${rfqId}.pdf`);

      const res = await sendRFQMail(rfqId, formData);

      // support both shapes (hook returns { success: true } or raw Response)
      if (res && typeof res === "object" && "success" in res) {
        if (res.success === false) {
          throw new Error(res.message || "Failed to send email");
        }
      } else if (res && typeof res === "object" && "ok" in res) {
        // fetch Response case
        if (!res.ok) {
          throw new Error("Failed to send email");
        }
      }
      showSuccess("Email with PDF attachment sent successfully");
      await loadRFQ();
    } catch (err) {
      console.error("Manual send email error:", err);
      showError(err?.message || "Failed to send RFQ email");
    } finally {
      setSendingMail(false);
    }
  }, [item, sendRFQMail, showError, showSuccess, loadRFQ]);

  // Updated handleStatusChange function with PDF attachment for pending status
  const handleStatusChange = useCallback(
    async (newStatus) => {
      if (!item) return;

      setActionLoading(true);
      try {
        const rfqId = extractRFQID(item.url);
        if (!rfqId) {
          showError("Invalid RFQ ID");
          return;
        }

        const actionMap = {
          approve: approveRFQ,
          reject: rejectRFQ,
          pending: pendingRFQ,
        };

        const action = actionMap[newStatus];
        if (!action) {
          throw new Error(`Invalid status action: ${newStatus}`);
        }

        const payload = { status: newStatus };

        // perform status update
        await action(payload, rfqId);

        // when moved to pending, automatically send email with PDF attachment
        if (newStatus === "pending") {
          try {
            const recipients =
              item.suppliers?.map((s) => s.email).filter(Boolean) || [];

            if (recipients.length > 0) {
              // Generate PDF attachment
              const pdfBlob = await generatePDFBlob(item);

              // Create FormData for email with attachment
              const formData = new FormData();
              formData.append(
                "email_subject",
                `Request for Quotation - ${rfqId} (Pending Approval)`
              );
              formData.append(
                "email_body",
                `Dear Supplier,\n\nOur Request for Quotation (${rfqId}) is now pending approval.\n\nPlease find the details attached and provide your quotation at your earliest convenience.\n\nBest regards,\nProcurement Team`
              );

              // Add recipients
              recipients.forEach((email) => {
                formData.append("recipient_list", email);
              });

              // Add PDF attachment
              formData.append("attachment", pdfBlob, `RFQ-${rfqId}.pdf`);

              const mailRes = await sendRFQMail(rfqId, formData);
              if (
                mailRes &&
                typeof mailRes === "object" &&
                "success" in mailRes
              ) {
                if (mailRes.success === false) {
                  throw new Error(
                    mailRes.message || "Failed to send RFQ email"
                  );
                }
              } else if (
                mailRes &&
                typeof mailRes === "object" &&
                "ok" in mailRes
              ) {
                if (!mailRes.ok) {
                  throw new Error("Failed to send RFQ email");
                }
              }
            } else {
              // No suppliers to email, just show warning
              showError(
                "RFQ moved to pending but no supplier emails found for notification."
              );
              setActionLoading(false);
              return;
            }
          } catch (mailErr) {
            // status change succeeded; inform user about mail failure
            showError(
              mailErr?.message ||
                "RFQ moved to pending but failed to send notification email."
            );
            setActionLoading(false);
            return;
          }
        }

        showSuccess(
          `RFQ status updated to ${newStatus} ${
            newStatus === "pending"
              ? "and notification email with PDF sent"
              : ""
          }`.trim()
        );

        await loadRFQ();
      } catch (err) {
        console.error("Status change error:", err);
        showError(err?.message || `Failed to ${newStatus} RFQ`);
      } finally {
        setActionLoading(false);
      }
    },
    [
      item,
      approveRFQ,
      rejectRFQ,
      pendingRFQ,
      loadRFQ,
      showError,
      showSuccess,
      sendRFQMail,
    ]
  );
  // Status change handler
  // const handleStatusChange = useCallback(
  //   async (newStatus) => {
  //     if (!item) return;

  //     setActionLoading(true);
  //     try {
  //       const rfqId = extractRFQID(item.url);
  //       if (!rfqId) {
  //         showError("Invalid RFQ ID");
  //         return;
  //       }

  //       const actionMap = {
  //         approve: approveRFQ,
  //         reject: rejectRFQ,
  //         pending: pendingRFQ,
  //       };

  //       const action = actionMap[newStatus];
  //       if (!action) {
  //         throw new Error(`Invalid status action: ${newStatus}`);
  //       }

  //       const payload = { status: newStatus };

  //       // perform status update
  //       await action(payload, rfqId);

  //       // when moved to pending, automatically send email via hook
  //       if (newStatus === "pending") {
  //         try {
  //           const mailRes = await sendRFQMail(rfqId);
  //           if (
  //             mailRes &&
  //             typeof mailRes === "object" &&
  //             "success" in mailRes
  //           ) {
  //             if (mailRes.success === false) {
  //               throw new Error(mailRes.message || "Failed to send RFQ email");
  //             }
  //           } else if (
  //             mailRes &&
  //             typeof mailRes === "object" &&
  //             "ok" in mailRes
  //           ) {
  //             if (!mailRes.ok) {
  //               throw new Error("Failed to send RFQ email");
  //             }
  //           }
  //         } catch (mailErr) {
  //           // status change succeeded; inform user about mail failure
  //           showError(
  //             mailErr?.message ||
  //               "RFQ moved to pending but failed to send notification email."
  //           );
  //         }
  //       }

  //       showSuccess(
  //         `RFQ status updated to ${newStatus} ${
  //           newStatus === "pending" ? "and notification email sent" : ""
  //         }`.trim()
  //       );

  //       await loadRFQ();
  //     } catch (err) {
  //       console.error("Status change error:", err);
  //       showError(err?.message || `Failed to ${newStatus} RFQ`);
  //     } finally {
  //       setActionLoading(false);
  //     }
  //   },
  //   [
  //     item,
  //     approveRFQ,
  //     rejectRFQ,
  //     pendingRFQ,
  //     loadRFQ,
  //     showError,
  //     showSuccess,
  //     sendRFQMail,
  //   ]
  // );

  const handleConvertToPO = useCallback(() => {
    if (!item) return;

    history.push({
      pathname: `/${tenantSchema}/purchase/purchase-order/new`,
      state: {
        conversionRFQ: { item, rfq: item },
        ref: item,
        isConvertToPO: true,
      },
    });
  }, [history, tenantSchema, item]);

  const handleNavigate = useCallback(
    (id) => {
      if (!id) return;
      history.push(`/${tenantSchema}/purchase/request-for-quotations/${id}`);
    },
    [history, tenantSchema]
  );

  const renderedRows = useMemo(() => {
    if (!item?.items) return null;

    if (item.items.length === 0) {
      return (
        <TableRow>
          <TableCell
            colSpan={6}
            align="center"
            sx={{ py: 4, color: "#7a8a98", fontSize: 12 }}
          >
            No items available
          </TableCell>
        </TableRow>
      );
    }

    return item.items.map((row, idx) => {
      const price = parseFloat(row.estimated_unit_price || 0);
      const qty = parseInt(row.qty || 0, 10);
      const total = price * qty;

      return (
        <TableRow key={row.url || idx}>
          <TableCell sx={cellStyle(idx)}>
            {row.product_details?.product_name || "N/A"}
          </TableCell>
          <TableCell sx={cellStyle(idx)}>{row.description || "N/A"}</TableCell>
          <TableCell sx={cellStyle(idx)}>{qty || "N/A"}</TableCell>
          <TableCell sx={cellStyle(idx)}>
            {row.product_details?.unit_of_measure_details?.unit_name || "N/A"}
          </TableCell>
          <TableCell sx={cellStyle(idx)}>
            {price ? price.toFixed(2) : "N/A"}
          </TableCell>
          <TableCell sx={cellStyle(idx)}>
            {total ? total.toFixed(2) : "N/A"}
          </TableCell>
        </TableRow>
      );
    });
  }, [item]);

  const footerConfig = useMemo(() => {
    if (!item?.status) return null;

    const baseConfig = {
      icon:
        item.status === "approved" ? (
          <img src={approvedIcon} alt="approved" width={24} height={24} />
        ) : null,
      label:
        item.status === "approved"
          ? "Successfully Sent"
          : item.status.charAt(0).toUpperCase() + item.status.slice(1),
    };

    switch (item.status) {
      case "approved":
        return {
          ...baseConfig,
          actions: [
            {
              text: actionLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Convert to PO"
              ),
              onClick: handleConvertToPO,
              disabled: actionLoading,
              action: ["purchaseorder", "create"],
            },
          ],
        };
      case "pending":
        return {
          ...baseConfig,
          actions: [
            {
              text: actionLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Approve"
              ),
              onClick: () => handleStatusChange("approve"),
              color: "success",
              action: ["requestforquotation", "approve"],
            },
            {
              text: actionLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Reject"
              ),
              onClick: () => handleStatusChange("reject"),
              color: "error",
              action: ["requestforquotation", "reject"],
            },
          ],
        };
      case "draft":
        return {
          ...baseConfig,
          actions: [
            {
              text: actionLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Send to Approval"
              ),
              onClick: () => handleStatusChange("pending"),
              color: "primary",
              action: ["requestforquotation", "edit"],
            },
          ],
        };
      default:
        return baseConfig;
    }
  }, [item, handleConvertToPO, handleStatusChange, actionLoading]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 300,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (item === "FORBIDDEN") {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: 400,
          color: "red",
          fontWeight: "bold",
          fontSize: 24,
          textAlign: "center",
          px: 2,
        }}
      >
        You do not have permission to view this page.
        <br />
        Please request access from the admin.
      </Box>
    );
  }

  return (
    <div className="rfqStatus">
      {/* Header */}
      <div className="rfqHeader">
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          width="100%"
        >
          <Box display="flex" gap={4} alignItems="center">
            <Can app="purchase" module="requestforquotation" action="create">
              <Link to={`/${tenantSchema}/purchase/request-for-quotations/new`}>
                <Button variant="contained" disableElevation>
                  New RFQ
                </Button>
              </Link>
            </Can>

            <div className="rfqAutosave">
              <p>Autosave</p>
              <img src={autosaveIcon} alt="Autosave" width={20} height={20} />
            </div>

            {/* Manual send button */}
            <Can app="purchase" module="requestforquotation" action="edit">
              <Button
                variant="outlined"
                onClick={handleManualSendMail}
                disabled={!item || sendingMail || actionLoading}
                startIcon={sendingMail ? <CircularProgress size={16} /> : null}
              >
                {sendingMail ? "Sending..." : "Send RFQ Email"}
              </Button>
            </Can>
          </Box>

          <Box
            display="flex"
            alignItems="center"
            gap={1}
            bgcolor="white"
            border="1px solid #E2E6E9"
            borderRadius={1}
            py={0.5}
            px={1}
          >
            <Tooltip title="Previous RFQ">
              <span>
                <IconButton
                  onClick={() => handleNavigate(item?.prev_id)}
                  disabled={!item.prev_id}
                  size="small"
                >
                  <ArrowBackIosIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>

            <Box
              sx={{
                width: "2px",
                bgcolor: "#E2E6E9",
                alignSelf: "stretch",
                borderRadius: "1px",
              }}
            />

            <Tooltip title="Next RFQ">
              <span>
                <IconButton
                  onClick={() => handleNavigate(item.next_id)}
                  disabled={!item.next_id}
                  size="small"
                >
                  <ArrowForwardIosIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Box>
      </div>

      {/* Main content */}
      <div className="rfqStatusContent">
        <div className="rfqBasicInfo">
          <h2>Basic Information</h2>
          <div className="editCancel">
            {!["pending", "approved", "rejected", "cancelled"].includes(
              item.status
            ) && (
              <Can app="purchase" module="requestforquotation" action="edit">
                <Button
                  onClick={() =>
                    history.push({
                      pathname: `/${tenantSchema}/purchase/request-for-quotations/${extractRFQID(
                        item.url
                      )}/edit`,
                      state: { rfq: item, edit: true },
                    })
                  }
                  disabled={actionLoading}
                >
                  Edit
                </Button>
              </Can>
            )}
            <Link to={`/${tenantSchema}/purchase/request-for-quotations`}>
              <Button variant="outlined">Close</Button>
            </Link>
          </div>
        </div>

        <div className="rfqStatusInfo">
          <p>Status</p>
          <p
            style={{
              color: statusColor(item.status),
              textTransform: "capitalize",
            }}
          >
            {item.status}
          </p>
        </div>

        <Box width="80%">
          <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
            <Table sx={{ "& .MuiTableCell-root": { borderBottom: "none" } }}>
              <TableHead sx={{ bgcolor: "#f2f2f2" }}>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Date Opened</TableCell>
                  <TableCell>Currency</TableCell>
                  <TableCell>Expiry Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell sx={cellStyle(0)}>
                    {extractRFQID(item.url) || "N/A"}
                  </TableCell>
                  <TableCell sx={cellStyle(0)}>
                    {formatDate(item.date_created) || "N/A"}
                  </TableCell>
                  <TableCell sx={cellStyle(0)}>
                    {item.currency_details
                      ? `${item.currency_details.currency_name} (${item.currency_details.currency_symbol})`
                      : "N/A"}
                  </TableCell>
                  <TableCell sx={cellStyle(0)}>
                    {formatDate(item.expiry_date) || "N/A"}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Box borderBottom={1} borderColor="#f2f2f2" mt={-4} />

        <p className="rfqContent">RFQ Items</p>
        <TableContainer
          component={Paper}
          sx={{
            boxShadow: "none",
            borderRadius: 2,
            border: "1px solid #f2f2f2",
          }}
        >
          <Table>
            <TableHead sx={{ bgcolor: "#f2f2f2" }}>
              <TableRow>
                {[
                  "Product Name",
                  "Description",
                  "Qty",
                  "Unit of Measure",
                  "Estimated Unit Price",
                  "Total Price",
                ].map((head) => (
                  <TableCell key={head}>{head}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>{renderedRows}</TableBody>
          </Table>
        </TableContainer>

        {/* Footer actions */}
        {footerConfig && (
          <div className="rfqStatusFooter">
            <div className="approvedIcon">
              {footerConfig.icon}
              <p
                style={{
                  color: statusColor(item.status),
                  textTransform: "capitalize",
                  marginLeft: 8,
                }}
              >
                {footerConfig.label}
              </p>
            </div>
            <div className="rfqStatusDraftFooterBtns">
              {footerConfig.actions?.map((action, idx) => (
                <Can
                  key={idx}
                  app="purchase"
                  module={action.action[0]}
                  action={action.action[1]}
                >
                  <Button
                    variant="contained"
                    disableElevation
                    color={action.color}
                    onClick={action.onClick}
                    disabled={action.disabled}
                    sx={{ ml: 1, minWidth: 120 }}
                  >
                    {action.text}
                  </Button>
                </Can>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RFQInfo;
