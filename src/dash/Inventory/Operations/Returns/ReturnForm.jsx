// ReturnIncomingProductForm.jsx
import React, { useState, useCallback, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import Swal from "sweetalert2";
import autosave from "../../../../image/autosave-text.svg";
import "./ReturnForm.css";
import Asterisk from "../../../../components/Asterisk";
import { useHistory, useParams } from "react-router-dom";
import { useTenant } from "../../../../context/TenantContext";
import { useIncomingProduct } from "../../../../context/Inventory/IncomingProduct";
import { formatDate } from "../../../../helper/helper";
import jsPDF from "jspdf";
import "jspdf-autotable";

const ReturnIncomingProductForm = () => {
  const [formData, setFormData] = useState({
    order_id: "",
    source_location: "",
    date_created: "",
    reason_for_return: "",
    items: [],
  });

  const { tenant_schema_name } = useTenant().tenantData || {};
  const history = useHistory();
  const { IP_ID } = useParams();

  const [incoming, setIncoming] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [returnData, setReturnData] = useState(null);

  const { getSingleIncomingProduct, createIncomingProductReturns } =
    useIncomingProduct();

  const showAlert = useCallback((icon, title, text, timer = null) => {
    Swal.fire({
      icon,
      title,
      text,
      timer: timer ?? (icon === "error" ? 3000 : 2000),
      ...(icon !== "error" && { showConfirmButton: false }),
    });
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await getSingleIncomingProduct(IP_ID);
      setIncoming(data);

      setFormData({
        order_id: data.incoming_product_id,
        source_location: data.source_location_details?.location_name || "",
        date_created: formatDate(data.created_on),
        reason_for_return: "",
        items:
          data.incoming_product_items?.map((item) => ({
            product_id: item.product_details?.id,
            product_name: item.product_details?.product_name || "",
            initial_quantity: Number(item.quantity_received) || 0,
            unit_of_measure:
              item.product_details?.unit_of_measure_details?.unit_name || "",
            return_quantity: "",
          })) || [],
      });
    } catch (e) {
      const errorMsg =
        e?.response?.data?.detail || "Failed to load incoming product";
      setError(errorMsg);
      showAlert("error", "Error", errorMsg);
    } finally {
      setLoading(false);
    }
  }, [IP_ID, getSingleIncomingProduct, showAlert]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRowChange = (index, field, rawValue) => {
    setFormData((prev) => {
      const updatedItems = [...prev.items];
      let value = rawValue;

      if (field === "return_quantity") {
        if (rawValue === "" || rawValue === null) {
          value = "";
        } else {
          const parsed = Number(rawValue);
          value = Number.isFinite(parsed) ? parsed : "";
        }
      }

      updatedItems[index] = { ...updatedItems[index], [field]: value };
      return { ...prev, items: updatedItems };
    });
  };

  const generatePDF = (returnData) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Title centered
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Return Incoming Product Report", pageWidth / 2, 18, {
        align: "center",
      });

      // Meta info
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      const meta = [
        [
          "Record ID",
          returnData?.unique_record_id ??
            returnData?.id ??
            formData.order_id ??
            incoming?.incoming_product_id ??
            "N/A",
        ],
        ["Order ID", returnData?.source_document ?? formData.order_id ?? "N/A"],
        [
          "Source Location",
          returnData?.source_location ??
            formData.source_location ??
            incoming?.source_location_details?.location_name ??
            "N/A",
        ],
        [
          "Date Created",
          returnData?.date_created ??
            formData.date_created ??
            formatDate(incoming?.created_on) ??
            "N/A",
        ],
        [
          "Reason for Return",
          returnData?.reason_for_return ?? formData.reason_for_return ?? "N/A",
        ],
      ];

      const startY = 28;
      doc.autoTable({
        startY,
        head: [["Field", "Value"]],
        body: meta,
        theme: "grid",
        headStyles: { fillColor: [240, 240, 240], textColor: 0 },
        styles: { fontSize: 10, cellPadding: 2 },
        columnStyles: { 0: { fontStyle: "bold" } },
      });

      const itemsRows = returnData?.return_incoming_product_items?.map((it) => [
        String(it.returned_product_item ?? it.product ?? ""),
        String(it.initial_quantity ?? ""),
        String(it.unit_of_measure ?? ""),
        String(it.returned_quantity ?? it.quantity_to_be_returned ?? ""),
      ]);

      const itemsStartY = doc.lastAutoTable.finalY + 6;

      doc.autoTable({
        startY: itemsStartY,
        head: [["Product ID", "Initial Qty", "Unit", "Return Qty"]],
        body: itemsRows,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [240, 240, 240], textColor: 0 },
        columnStyles: { 1: { halign: "right" }, 3: { halign: "right" } },
      });

      const footerY = doc.internal.pageSize.getHeight() - 10;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(
        "Generated by Inventory Management System",
        pageWidth / 2,
        footerY,
        { align: "center" }
      );

      const filename = `Return_${
        returnData?.unique_record_id ??
        returnData?.id ??
        formData.order_id ??
        "Order"
      }.pdf`;

      return { doc, filename };
    } catch (err) {
      console.error("PDF generation failed:", err);
      return { doc: null, filename: null };
    }
  };

  const autoDownloadPDF = (doc, filename) => {
    try {
      const pdfBlob = doc.output("blob");
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      return true;
    } catch (err) {
      console.warn("Auto-download via blob failed, trying doc.save()", err);
      try {
        doc.save(filename); // fallback
        return true;
      } catch (err2) {
        console.error("Both download methods failed", err2);
        return false;
      }
    }
  };

  const handleSendEmail = () => {
    try {
      // Get supplier email from API response
      const supplierEmail =
        returnData?.source_document_details?.supplier_details?.email || "";

      if (!supplierEmail) {
        showAlert(
          "error",
          "Email Not Found",
          "Supplier email address is missing in the response"
        );
        return;
      }

      // Get unique identifier for subject line
      const uniqueId =
        returnData?.unique_record_id ||
        returnData?.id ||
        formData.order_id ||
        "Order";

      // Create mailto link
      const subject = `Return Document for ${uniqueId}`;
      const body = "Hello, please find the return document attached.";
      const mailtoUrl = `mailto:${supplierEmail}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`;

      // Open default mail client
      window.location.href = mailtoUrl;

      // Close modal after opening email client
      setShowEmailModal(false);
    } catch (error) {
      console.error("Failed to open email client:", error);
      showAlert(
        "error",
        "Email Error",
        "Could not open email client. Please try manually."
      );
    }
  };

  const afterSuccessFlow = (responseData) => {
    setReturnData(responseData);

    // Generate PDF
    const { doc, filename } = generatePDF(responseData);

    if (!doc || !filename) {
      showAlert(
        "warning",
        "PDF Error",
        "Could not generate the PDF. The return was created though."
      );
      return;
    }

    // Auto-download PDF
    const downloadSuccess = autoDownloadPDF(doc, filename);

    if (!downloadSuccess) {
      showAlert(
        "warning",
        "Download Failed",
        "Automatic download failed. You can generate the PDF again from the page."
      );
    }

    // Show email modal after download
    setShowEmailModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const invalidItem = formData.items.find((it) => {
      const rq = Number(it.return_quantity);
      return !Number.isFinite(rq) || rq < 0 || rq > Number(it.initial_quantity);
    });
    if (invalidItem) {
      showAlert(
        "warning",
        "Invalid quantities",
        "Please ensure return quantities are numbers between 0 and the initial quantity."
      );
      return;
    }

    const payload = {
      return_incoming_product_items: formData.items.map((item) => ({
        product: item.product_id,
        quantity_received: Number(item.initial_quantity),
        quantity_to_be_returned: Number(item.return_quantity || 0),
      })),
      source_document: formData.order_id,
      reason_for_return: formData.reason_for_return,
      returned_date: new Date().toISOString().split("T")[0],
    };

    let resp;
    try {
      resp = await createIncomingProductReturns(payload);
    } catch (apiErr) {
      const msg =
        apiErr?.response?.data?.detail ||
        apiErr?.message ||
        "Failed to create return";
      showAlert("error", "Error", msg);
      return;
    }

    try {
      const respData = resp?.data || resp;
      afterSuccessFlow(respData);
    } catch (postErr) {
      console.error("Post-success flow failed:", postErr);
      showAlert(
        "warning",
        "Return created",
        "The return was created, but there was an issue preparing the email/PDF. You can retry from the page."
      );
    }
  };

  return (
    <div className="common-form">
      <header className="common-form-header">
        <h1>Return Incoming Product</h1>
        <img
          src={autosave}
          alt="autosave"
          className="common-form-autosave-img"
        />
      </header>

      <form className="common-form-body" onSubmit={handleSubmit}>
        <div className="common-form-title-section">
          <h1 className="common-form-title">Return Basic Information</h1>
          <Button
            className="common-form-close-btn"
            sx={{ p: "8px 24px", borderRadius: "4px" }}
            onClick={() => window.history.back()}
          >
            Close
          </Button>
        </div>

        <Box
          className="common-form-inputs"
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 4,
          }}
        >
          <div className="formLabelAndValue">
            <label style={{ marginBottom: 6, display: "flex" }}>
              Order Unique ID <Asterisk />
            </label>
            <p>{formData.order_id}</p>
          </div>
          <div className="formLabelAndValue">
            <label style={{ marginBottom: 6, display: "flex" }}>
              Source Location <Asterisk />
            </label>
            <p>{formData.source_location}</p>
          </div>
          <div className="formLabelAndValue">
            <label style={{ marginBottom: 6, display: "flex" }}>
              Date Created <Asterisk />
            </label>
            <p>{formData.date_created}</p>
          </div>
          <Box>
            <label style={{ marginBottom: 6, display: "flex" }}>
              Reason For Return <Asterisk />
            </label>
            <TextField
              variant="outlined"
              value={formData.reason_for_return}
              onChange={(e) =>
                handleInputChange("reason_for_return", e.target.value)
              }
              sx={{ width: "100%" }}
            />
          </Box>
        </Box>

        <div className="common-form-items-table" style={{ marginTop: "24px" }}>
          <Paper sx={{ boxShadow: "none", borderRadius: "10px" }}>
            <Table sx={{ "& .MuiTableCell-root": { border: "none" } }}>
              <TableHead sx={{ backgroundColor: "#f2f2f2" }}>
                <TableRow>
                  {[
                    "Product Name",
                    "Initial Quantity",
                    "Unit of Measure",
                    "Return Quantity",
                  ].map((header, i) => (
                    <TableCell
                      key={i}
                      sx={{
                        color: "#7a8a98",
                        fontSize: "14px",
                        fontWeight: 500,
                        p: 1,
                      }}
                    >
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {formData.items.length > 0 ? (
                  formData.items.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell
                        sx={{
                          backgroundColor: index % 2 === 0 ? "#f2f2f2" : "#fff",
                        }}
                      >
                        {row.product_name}
                      </TableCell>
                      <TableCell
                        sx={{
                          backgroundColor: index % 2 === 0 ? "#f2f2f2" : "#fff",
                        }}
                      >
                        {row.initial_quantity}
                      </TableCell>
                      <TableCell
                        sx={{
                          backgroundColor: index % 2 === 0 ? "#f2f2f2" : "#fff",
                        }}
                      >
                        {row.unit_of_measure}
                      </TableCell>
                      <TableCell
                        sx={{
                          backgroundColor: index % 2 === 0 ? "#f2f2f2" : "#fff",
                        }}
                      >
                        <TextField
                          type="number"
                          variant="standard"
                          value={row.return_quantity}
                          onChange={(e) => {
                            const v = e.target.value;
                            const parsed = v === "" ? "" : Number(v);
                            if (parsed !== "" && Number.isFinite(parsed)) {
                              if (parsed > row.initial_quantity) {
                                Swal.fire({
                                  icon: "warning",
                                  title: "Limit Exceeded",
                                  text: `You cannot return more than ${row.initial_quantity}.`,
                                  confirmButtonColor: "#3085d6",
                                });
                                return;
                              }
                            }
                            handleRowChange(index, "return_quantity", v);
                          }}
                          inputProps={{ min: 0 }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      align="center"
                      sx={{ color: "#7a8a98", fontSize: "12px" }}
                    >
                      No items available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button variant="contained" disableElevation type="submit">
              Save
            </Button>
          </Box>
        </div>
      </form>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="email-modal">
          <div className="email-modal-content">
            <h3>Return Created Successfully</h3>
            <p>The return document has been downloaded to your device.</p>
            <p>Would you like to email it to the supplier?</p>

            <div className="email-modal-buttons">
              <Button
                variant="contained"
                onClick={handleSendEmail}
                sx={{ mr: 2 }}
              >
                Send Me
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setShowEmailModal(false);
                  history.goBack();
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReturnIncomingProductForm;
