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
import ReactDOM from "react-dom";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import IncomingProductReturnPdf from "../../../../components/PDFTemplate/IncomingProductReturnPdf";

const ReturnIncomingProductForm = () => {
  const [formData, setFormData] = useState({
    order_id: "",
    source_location: "",
    date_created: "",
    reason_for_return: "",
    items: [],
  });

  const { tenantData } = useTenant() || {};
  const { tenant_schema_name } = tenantData || {};
  const history = useHistory();
  const { IP_ID } = useParams();

  const [incoming, setIncoming] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);

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

  /**
   * generatePDF (unchanged)
   * - Renders IncomingProductReturnPdf into an off-screen container
   * - Waits briefly for images/fonts to load
   * - Captures with html2canvas
   * - Splits the canvas into A4 pages and builds a jsPDF document
   * - Returns a File object ready for FormData
   */
  const waitForImagesAndFonts = async (container, timeout = 3000) => {
    if (document.fonts && document.fonts.ready) {
      try {
        await document.fonts.ready;
      } catch (e) {
        // ignore
      }
    }

    const imgs = Array.from(container.querySelectorAll("img"));
    const loads = imgs.map(
      (img) =>
        new Promise((res) => {
          if (img.complete && img.naturalWidth !== 0) return res();
          const onDone = () => {
            img.removeEventListener("load", onDone);
            img.removeEventListener("error", onDone);
            res();
          };
          img.addEventListener("load", onDone);
          img.addEventListener("error", onDone);
        })
    );

    await Promise.race([
      Promise.all(loads),
      new Promise((r) => setTimeout(r, timeout)),
    ]);
  };

  const generatePDF = async (
    payload,
    formDataParam,
    opts = {
      scale: 1.5,
      jpegQuality: 0.92,
      downscaleFactor: 1.0,
      waitFor: 700,
    }
  ) => {
    try {
      const { scale, jpegQuality, downscaleFactor, waitFor } = opts;

      const container = document.createElement("div");
      container.style.position = "fixed";
      container.style.left = "-10000px";
      container.style.top = "0";
      container.style.width = "210mm";
      container.style.background = "#fff";
      document.body.appendChild(container);

      let rootInstance = null;
      try {
        const client = await import("react-dom/client");
        if (client && typeof client.createRoot === "function") {
          rootInstance = client.createRoot(container);
          rootInstance.render(
            <IncomingProductReturnPdf
              payload={payload}
              formData={formDataParam}
            />
          );
        } else {
          ReactDOM.render(
            <IncomingProductReturnPdf
              payload={payload}
              formData={formDataParam}
            />,
            container
          );
        }
      } catch (err) {
        ReactDOM.render(
          <IncomingProductReturnPdf
            payload={payload}
            formData={formDataParam}
          />,
          container
        );
      }

      await waitForImagesAndFonts(container, 4000);
      await new Promise((r) => setTimeout(r, waitFor));

      const canvas = await html2canvas(container, {
        scale: scale,
        useCORS: true,
        allowTaint: false,
        logging: false,
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const sliceHeightPx = Math.floor((pdfHeight * canvas.width) / pdfWidth);

      let y = 0;
      let pageCount = 0;
      while (y < canvas.height) {
        const sliceHeightActual = Math.min(sliceHeightPx, canvas.height - y);

        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = sliceHeightActual;
        const ctx = sliceCanvas.getContext("2d");
        ctx.drawImage(
          canvas,
          0,
          y,
          canvas.width,
          sliceHeightActual,
          0,
          0,
          canvas.width,
          sliceHeightActual
        );

        let finalCanvas = sliceCanvas;
        if (downscaleFactor && downscaleFactor < 1) {
          const downW = Math.floor(sliceCanvas.width * downscaleFactor);
          const downH = Math.floor(sliceCanvas.height * downscaleFactor);
          const downCanvas = document.createElement("canvas");
          downCanvas.width = downW;
          downCanvas.height = downH;
          const dctx = downCanvas.getContext("2d");
          dctx.imageSmoothingEnabled = true;
          dctx.imageSmoothingQuality = "high";
          dctx.drawImage(
            sliceCanvas,
            0,
            0,
            sliceCanvas.width,
            sliceCanvas.height,
            0,
            0,
            downW,
            downH
          );
          finalCanvas = downCanvas;
        }

        const imgData = finalCanvas.toDataURL("image/jpeg", jpegQuality);

        const imgHeightInPdfUnits =
          (finalCanvas.height * pdfWidth) / finalCanvas.width;

        if (pageCount > 0) pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, imgHeightInPdfUnits);

        y += sliceHeightActual;
        pageCount += 1;
      }

      try {
        if (rootInstance && typeof rootInstance.unmount === "function") {
          rootInstance.unmount();
        } else {
          ReactDOM.unmountComponentAtNode(container);
        }
      } catch (err) {
        console.warn("cleanup render failed", err);
      }
      document.body.removeChild(container);

      const blob = pdf.output("blob");
      const filename = `Return_${payload.source_document || "Order"}.pdf`;
      return new File([blob], filename, { type: "application/pdf" });
    } catch (err) {
      console.error("generatePDF error:", err);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    // Validation
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

      // SANITIZE/MAP ITEMS FOR THE SERVER
      const mapItemForServer = (item) => ({
        product: item.product_id,
        quantity_received: Number(item.initial_quantity) || 0,
        quantity_to_be_returned: Number(item.return_quantity || 0),
      });

      const payload = {
        source_document: formData.order_id,
        reason_for_return: formData.reason_for_return,
        returned_date: isoReturnedDate,
        return_incoming_product_items: formData.items.map(mapItemForServer),
        email_subject: `Return Document for ${formData.order_id}`,
        email_body: "Please find the attached return document.",
        supplier_email:
          incoming?.source_document_details?.supplier_details?.email ||
          incoming?.supplier_details?.email ||
          "",
      };

      console.log(
        "Mapped items for server:",
        JSON.stringify(payload.return_incoming_product_items, null, 2)
      );

      // IMPORTANT: await the async generatePDF which now returns a File
      const pdfFile = await generatePDF(payload, formData);
      if (!pdfFile) {
        showAlert("error", "PDF Error", "Could not generate the PDF.");
        setSubmitting(false);
        return;
      }

      // pdfFile is a File object; use it directly
      console.log("PDF to upload:", {
        name: pdfFile.name,
        size: pdfFile.size,
        type: pdfFile.type,
      });

      const fd = new FormData();
      fd.append("source_document", payload.source_document);
      fd.append("reason_for_return", payload.reason_for_return);
      fd.append("returned_date", payload.returned_date);
      fd.append(
        "return_incoming_product_items",
        JSON.stringify(payload.return_incoming_product_items)
      );
      fd.append("email_subject", payload.email_subject);
      fd.append("email_body", payload.email_body);

      // Append the File directly (with filename)
      fd.append("email_attachment", pdfFile, pdfFile.name);

      fd.append("supplier_email", payload.supplier_email);
      // recipient_list
      // Debug: enumerate FormData keys and file info
      for (const pair of fd.entries()) {
        if (pair[1] instanceof File || pair[1] instanceof Blob) {
          const f = pair[1];
          console.log("FormData file:", pair[0], {
            name: f.name || pdfFile.name,
            size: f.size,
            type: f.type,
          });
        } else {
          console.log("FormData field:", pair[0], pair[1]);
        }
      }

      // Send using wrapper (make sure wrapper DOES NOT set Content-Type manually)
      const resp = await createIncomingProductReturns(fd);

      if (resp && resp.success) {
        showAlert("success", "Submitted", "Return submitted successfully.");
        history.push(
          `/${tenant_schema_name}/inventory/operations/incoming-product/return`
        );
      } else {
        throw new Error("Unexpected response from server");
      }
    } catch (err) {
      console.error("Submit error:", err);

      const serverMsg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        (typeof err?.response === "string" ? err.response : null);

      showAlert(
        "error",
        "Error",
        serverMsg || err.message || "Failed to submit return."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = async () => {
    if (pdfGenerating) return;

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

    setPdfGenerating(true);
    try {
      const isoReturnedDate = new Date(Date.now()).toISOString().split("T")[0];

      const payload = {
        source_document: formData.order_id,
        reason_for_return: formData.reason_for_return,
        returned_date: isoReturnedDate,
        return_incoming_product_items: formData.items.map((item) => ({
          product: item.product_id,
          product_name: item.product_name,
          quantity_received: Number(item.initial_quantity),
          unit_of_measure: item.unit_of_measure,
          quantity_to_be_returned: Number(item.return_quantity || 0),
        })),
        email_subject: `Return Document for ${formData.order_id}`,
        email_body: "Please find the attached return document.",
        supplier_email:
          incoming?.source_document_details?.supplier_details?.email ||
          incoming?.supplier_details?.email ||
          "",
      };

      const pdfFile = await generatePDF(payload, formData);
      if (!pdfFile) {
        showAlert("error", "PDF Error", "Could not generate the PDF.");
        setPdfGenerating(false);
        return;
      }

      const url = URL.createObjectURL(pdfFile);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        pdfFile.name || `Return_${payload.source_document || "Order"}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      showAlert("success", "Downloaded", "PDF was downloaded to your device.");
    } catch (err) {
      console.error("Download error:", err);
      showAlert("error", "Error", "Failed to generate or download the PDF.");
    } finally {
      setPdfGenerating(false);
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

          <Box
            sx={{ display: "flex", justifyContent: "flex-end", mt: 2, gap: 2 }}
          >
            <Button
              variant="outlined"
              disableElevation
              onClick={handleDownload}
              disabled={pdfGenerating || submitting}
            >
              {pdfGenerating ? "Generating PDF..." : "Download PDF"}
            </Button>

            <Button
              variant="contained"
              disableElevation
              type="submit"
              disabled={submitting || pdfGenerating}
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
