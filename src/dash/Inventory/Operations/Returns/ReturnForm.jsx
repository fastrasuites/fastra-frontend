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
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const ReturnIncomingProductForm = () => {
  const [formData, setFormData] = useState({
    order_id: "",
    source_location: "",
    date_created: "",
    reason_for_return: "",
    items: [],
  });

  const { tenantData } = useTenant() || {};
  const { tenant_schema_name } = tenantData;
  const history = useHistory();
  const { IP_ID } = useParams();

  const [incoming, setIncoming] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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

  const generatePDF = (payload) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Return Incoming Product Report", pageWidth / 2, 18, {
        align: "center",
      });

      const meta = [
        ["Order ID", payload.source_document || "N/A"],
        ["Source Location", formData.source_location || "N/A"],
        ["Date Created", formData.date_created || formatDate(Date.now())],
        ["Reason for Return", payload.reason_for_return || "N/A"],
        ["Returned Date", formatDate(Date.now())],
      ];

      autoTable(doc, {
        startY: 28,
        head: [["Field", "Value"]],
        body: meta,
        theme: "grid",
        headStyles: { fillColor: [240, 240, 240], textColor: 0 },
        styles: { fontSize: 10, cellPadding: 2 },
        columnStyles: { 0: { fontStyle: "bold" } },
      });

      const itemsRows =
        payload.return_incoming_product_items?.map((it) => [
          String(it.product ?? ""),
          String(it.quantity_received ?? ""),
          String(it.unit_of_measure ?? ""),
          String(it.quantity_to_be_returned ?? ""),
        ]) || [];

      const itemsStartY =
        doc.lastAutoTable && doc.lastAutoTable.finalY
          ? doc.lastAutoTable.finalY + 6
          : 40;

      autoTable(doc, {
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

      const filename = `Return_${payload.source_document || "Order"}.pdf`;
      return { doc, filename };
    } catch (err) {
      console.error("PDF generation failed:", err);
      return { doc: null, filename: null };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

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

    setSubmitting(true);

    try {
      const isoReturnedDate = new Date(Date.now()).toISOString().split("T")[0];

      const payload = {
        source_document: formData.order_id,
        reason_for_return: formData.reason_for_return,
        returned_date: isoReturnedDate,
        return_incoming_product_items: formData.items.map((item) => ({
          product: item.product_id,
          quantity_received: Number(item.initial_quantity),
          quantity_to_be_returned: Number(item.return_quantity || 0),
        })),
        email_subject: `Return Document for ${formData.order_id}`,
        email_body: "Please find the attached return document.",
        supplier_email:
          incoming?.source_document_details?.supplier_details?.email ||
          incoming?.supplier_details?.email ||
          "",
      };

      // Generate PDF
      const { doc, filename } = generatePDF(payload);
      if (!doc) {
        showAlert("error", "PDF Error", "Could not generate the PDF.");
        setSubmitting(false);
        return;
      }

      const pdfBlob = doc.output("blob");
      const pdfFile = new File([pdfBlob], filename, {
        type: "application/pdf",
      });

      // Build FormData (multipart)
      const fd = new FormData();
      fd.append("source_document", payload.source_document);
      fd.append("reason_for_return", payload.reason_for_return);
      fd.append("returned_date", payload.returned_date); // YYYY-MM-DD
      fd.append(
        "return_incoming_product_items",
        JSON.stringify(payload.return_incoming_product_items)
      );
      fd.append("email_subject", payload.email_subject);
      fd.append("email_body", payload.email_body);
      fd.append("email_attachment", pdfFile); // single file
      fd.append("supplier_email", payload.supplier_email);

      // DEBUG: log form keys to confirm file presence (File object will appear)
      // Remove or comment out in production
      // eslint-disable-next-line no-console
      for (const pair of fd.entries()) {
        console.log("FormData key:", pair[0], "value:", pair[1]);
      }

      // send using wrapper (await it)
      const resp = await createIncomingProductReturns(fd);

      // wrapper returns { success: true, data } on success
      if (resp && resp.success) {
        showAlert("success", "Submitted", "Return submitted successfully.");
        history.push(
          `/${tenant_schema_name}/inventory/operations/incoming-product/return`
        );
      } else {
        // if wrapper doesn't throw but returns other shape
        throw new Error("Unexpected response from server");
      }
    } catch (err) {
      console.error("Submit error:", err);
      showAlert("error", "Error", err.message || "Failed to submit return.");
    } finally {
      setSubmitting(false);
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
            <p>{formatDate(Date.now())}</p>
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
              required
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
            <Button
              variant="contained"
              disableElevation
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Save & Submit"}
            </Button>
          </Box>
        </div>
      </form>
    </div>
  );
};

export default ReturnIncomingProductForm;
