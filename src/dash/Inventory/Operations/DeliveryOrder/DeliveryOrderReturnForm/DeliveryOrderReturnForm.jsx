import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDeliveryOrder } from "../../../../../context/Inventory/DeliveryOrderContext";
import {
  Box,
  Button,
  Divider,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import autosave from "../../../../../image/autosave-text.svg";
import { Cancel } from "@mui/icons-material";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./DeliveryOrderReturnForm.css";

const DeliveryOrderReturnForm = () => {
  const { id } = useParams();
  const {
    getSingleDeliveryOrder,
    createDeliveryOrderReturn,
    singleDeliveryOrder,
    isLoading,
    error,
  } = useDeliveryOrder();

  const [formData, setFormData] = useState({
    date_of_return: new Date().toISOString().split("T")[0],
    reason_for_return: "",
    return_warehouse_location: "",
    items: [],
  });

  // Fetch delivery order and initialize form
  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        await getSingleDeliveryOrder(id);
      }
    };
    fetchData();
  }, [id, getSingleDeliveryOrder]);

  // Initialize form when delivery order data is available
  useEffect(() => {
    if (singleDeliveryOrder && singleDeliveryOrder.id === parseInt(id)) {
      const initialItems = singleDeliveryOrder.delivery_order_items.map(
        (item) => ({
          productId: item.product_details.id,
          productName: item.product_details.product_name,
          initialQuantity: item.quantity_to_deliver,
          returnedQuantity: "",
          deliveryOrderItemId: item.id,
        })
      );

      setFormData((prev) => ({
        ...prev,
        items: initialItems,
        // Set source_location from delivery order
        source_location: singleDeliveryOrder.delivery_address,
        source_document: singleDeliveryOrder.order_unique_id,
        return_warehouse_location: singleDeliveryOrder.source_location,
      }));
    }
  }, [singleDeliveryOrder, id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, value) => {
    setFormData((prev) => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], returnedQuantity: value };
      return { ...prev, items: newItems };
    });
  };

  const handleRemoveItem = (index) => {
    setFormData((prev) => {
      const newItems = [...prev.items];
      newItems.splice(index, 1);
      return { ...prev, items: newItems };
    });
  };

  // Handle loading state
  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    console.log(error);
    return (
      <Box p={4}>
        <Typography marginBlock={2} color="error">
          Error: {error.message}
        </Typography>

        <Button variant="contained" onClick={() => window.history.back()}>
          Previous page
        </Button>
      </Box>
    );
  }

  if (!singleDeliveryOrder) return <div>No delivery order data found</div>;

  // Function to generate PDF
  const generatePDF = (returnData) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("RETURN DOCUMENT", pageWidth / 2, 15, { align: "center" });

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`ID: ${returnData.unique_record_id}`, pageWidth / 2, 25, {
      align: "center",
    });

    // Return Information
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Return Information", 15, 40);

    const details = [
      ["Source Document", returnData.source_document],
      ["Date of Return", returnData.date_of_return],
      ["Source Location", returnData.source_location],
      ["Return Warehouse", returnData.return_warehouse_location],
      ["Reason", returnData.reason_for_return],
    ];

    // Use autoTable directly instead of doc.autoTable
    autoTable(doc, {
      startY: 45,
      head: [["Field", "Value"]],
      body: details,
      theme: "grid",
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
      },
      styles: {
        fontSize: 10,
        cellPadding: 2,
      },
      columnStyles: {
        0: { fontStyle: "bold" },
      },
    });

    // Items Table
    const tableY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Returned Items", 15, tableY);

    const items = returnData.delivery_order_return_items.map((item) => [
      item.returned_product_item,
      item.initial_quantity,
      item.returned_quantity,
    ]);

    autoTable(doc, {
      startY: tableY + 5,
      head: [["Product ID", "Initial Qty", "Returned Qty"]],
      body: items,
      theme: "grid",
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
      },
      styles: {
        fontSize: 10,
        cellPadding: 2,
      },
      columnStyles: {
        1: { halign: "right" },
        2: { halign: "right" },
      },
    });

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 10;
    doc.setFontSize(10);
    doc.text(
      "Generated by Inventory Management System",
      pageWidth / 2,
      footerY,
      { align: "center" }
    );

    return doc;
  };

  // Function to open email client
  const openEmailClient = (recordId, fileName, pdf) => {
    // Download PDF first
    pdf.save(fileName);

    // Prepare email content
    const mailSubject = `Return Document: ${fileName}`;
    const mailBody = `Dear recipient,

Please find the return document for your records.

Document ID: ${recordId}

Note: If the file is not attached automatically, kindly attach the downloaded file (${fileName}) manually before sending this email.

Thank you.`;

    // Open email client
    const mailtoLink = `mailto:?subject=${encodeURIComponent(
      mailSubject
    )}&body=${encodeURIComponent(mailBody)}`;

    window.location.href = mailtoLink;

    showSuccessAlert(recordId, fileName, "email");
  };

  // Unified success alert
  const showSuccessAlert = (recordId, fileName, method) => {
    const messages = {
      shared: "Your return document has been shared successfully!",
      email:
        "Your return document has been generated and your email client has been opened.",
      download: "Your return document has been downloaded.",
    };

    const description = {
      shared: "The document has been shared via your device's sharing options.",
      email: `Please attach the downloaded file (${fileName}) to your email before sending.`,
      download: `Please manually attach the file to your email: ${fileName}`,
    };

    Swal.fire({
      title: "Return Created Successfully!",
      icon: "success",
      html: `
      <div>
        <p>${messages[method]}</p>
        <p style="margin-top: 1.5rem; padding: 1rem; background-color: #f0f7ff; border-radius: 4px;">
          ${description[method]}
        </p>
      </div>
    `,
      showConfirmButton: true,
      confirmButtonText: "OK",
      width: "600px",
    });
  };

  // Updated handleSubmit function
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare payload
    const payload = {
      source_document: singleDeliveryOrder.order_unique_id,
      date_of_return: formData.date_of_return,
      source_location: singleDeliveryOrder.delivery_address,
      return_warehouse_location: singleDeliveryOrder.source_location,
      reason_for_return: formData.reason_for_return,
      delivery_order_return_items: formData.items
        .filter((item) => item.returnedQuantity !== "")
        .map((item) => ({
          returned_product_item: item.productId,
          initial_quantity: item.initialQuantity,
          returned_quantity: Number(item.returnedQuantity),
        })),
    };

    console.log("Payload for return order:", payload);

    try {
      const response = await createDeliveryOrderReturn(payload);

      if (response.success) {
        // Generate PDF
        const pdf = generatePDF(response.data);
        const fileName = `Return_${response.data.unique_record_id}.pdf`;

        // Create PDF blob
        const pdfBlob = pdf.output("blob");
        const pdfFile = new File([pdfBlob], fileName, {
          type: "application/pdf",
        });

        // Prepare share data
        const shareData = {
          title: `Return Document: ${fileName}`,
          text: `Please find attached the return document for your records.\n\nDocument ID: ${response.data.unique_record_id}\n\nIf the file is not attached automatically, kindly attach the downloaded PDF file manually before sending.`,
          files: [pdfFile],
        };

        // Try using Web Share API first
        if (navigator.share && navigator.canShare(shareData)) {
          try {
            // Download PDF first
            pdf.save(fileName);
            await navigator.share(shareData);
            showSuccessAlert(
              response.data.unique_record_id,
              fileName,
              "shared"
            );
          } catch (shareError) {
            console.log("Sharing cancelled or failed", shareError);
            // Fall back to email if sharing fails
            openEmailClient(response.data.unique_record_id, fileName, pdf);
          }
        } else {
          // Fall back to email for browsers without share support
          openEmailClient(response.data.unique_record_id, fileName, pdf);
        }
      }
    } catch (err) {
      console.error("Return creation failed:", err);
      Swal.fire({
        title: "Error",
        icon: "error",
        text: "Return order could not be created",
      });
    }
  };

  return (
    <Box p={4} display="grid" gap={4}>
      <Box display="flex" gap={3}>
        <Typography fontSize={25} fontWeight={6}>
          Return
        </Typography>
        <img src={autosave} alt="autosave" />
      </Box>
      <Box
        p={2}
        bgcolor="white"
        border="1px solid #E2E6E9"
        display="grid"
        gap={2}
      >
        {/* details header */}
        <Box display="flex" justifyContent="space-between">
          <Typography
            variant="h6"
            color="#3B7CED"
            fontSize={20}
            fontWeight={500}
          >
            Return Product Information
          </Typography>
          <Box display="flex" gap={2}>
            <Button
              variant="text"
              size="large"
              disableElevation
              onClick={() => window.history.back()}
            >
              Close
            </Button>
          </Box>
        </Box>
        <form onSubmit={handleSubmit}>
          {/* main details */}
          <Box display="flex" flexDirection="column" gap={3}>
            {/* First group */}
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} lg={3}>
                <label
                  style={{
                    marginBottom: "6px",
                    fontSize: "16px",
                    fontWeight: "600",
                  }}
                >
                  Source Document
                </label>
                <Typography>{singleDeliveryOrder.order_unique_id}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <label
                  style={{
                    marginBottom: "6px",
                    fontSize: "16px",
                    fontWeight: "600",
                  }}
                >
                  {" "}
                  Source Location
                </label>
                <Typography>{formData.source_location}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <label
                  style={{
                    marginBottom: "6px",
                    fontSize: "16px",
                    fontWeight: "600",
                  }}
                >
                  Return Warehouse Location
                </label>
                <Typography>{formData.return_warehouse_location}</Typography>
              </Grid>
            </Grid>
            <Divider />
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} lg={3}>
                <label
                  style={{
                    marginBottom: "6px",
                    fontSize: "16px",
                    fontWeight: "600",
                  }}
                >
                  Date of return
                </label>
                <span
                  style={{
                    color: "red",
                    fontWeight: "600",
                    fontSize: "20px",
                    marginLeft: "8px",
                  }}
                >
                  *
                </span>
                <TextField
                  type="date"
                  name="date_of_return"
                  value={formData.date_of_return}
                  onChange={handleInputChange}
                  required
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <label
                  style={{
                    marginBottom: "6px",
                    fontSize: "16px",
                    fontWeight: "600",
                  }}
                >
                  Reason for Return
                </label>
                <span
                  style={{
                    color: "red",
                    fontWeight: "600",
                    fontSize: "20px",
                    marginLeft: "8px",
                  }}
                >
                  *
                </span>
                <TextField
                  type="text"
                  name="reason_for_return"
                  value={formData.reason_for_return}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter return reason"
                  fullWidth
                  size="small"
                />
              </Grid>
            </Grid>
            <Divider />
            <TableContainer
              sx={{
                borderRadius: 2,
                border: "1px solid #E2E6E9",
                bgcolor: "#fff",
              }}
            >
              {/* Items Table */}

              <Table stickyHeader>
                <TableHead>
                  <TableRow
                    sx={{
                      fontWeight: 600,
                      color: "#7A8A98",
                      fontSize: "16px",
                      p: 2,
                    }}
                  >
                    <TableCell>Product Name</TableCell>
                    <TableCell>Initial Quantity</TableCell>
                    <TableCell>Returned Quantity</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formData.items.map((item, index) => (
                    <TableRow
                      key={`${item.productId}-${index}`}
                      hover
                      sx={{
                        "&:nth-of-type(odd)": {
                          bgcolor: "#f1f1f1",
                          color: "#7A8A98",
                        },
                      }}
                    >
                      <TableCell>{item.productName}</TableCell>
                      <TableCell>{item.initialQuantity}</TableCell>

                      <TableCell>
                        <input
                          type="number"
                          min={0}
                          max={item.initialQuantity}
                          value={item.returnedQuantity}
                          onChange={(e) =>
                            handleItemChange(index, e.target.value)
                          }
                          required
                          variant="standard"
                          placeholder="Enter qty in figure"
                          style={{
                            borderBlock: 0,
                            outline: "none",
                            borderBottom: " 1px solid",
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Button onClick={() => handleRemoveItem(index)}>
                          <Cancel style={{ color: "red" }} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box display="flex" justifyContent="right">
              <Button type="submit" disabled={isLoading} variant="contained">
                {isLoading ? "Submitting..." : "Send"}
              </Button>
            </Box>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default DeliveryOrderReturnForm;
