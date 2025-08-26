import React, { useState } from "react";
import {
  Box,
  Button,
  Divider,
  Modal,
  Typography,
  IconButton,
} from "@mui/material";
import { CloseRounded } from "@mui/icons-material";
import uploadIcon from "../image/upload.svg";
import ExcelFileIcon from "../image/Excel-file-icon.svg";
import ErrorIcon from "../image/error-icon.svg";
import { usePurchase } from "../context/PurchaseContext";
import Swal from "sweetalert2";
import { useTenant } from "../context/TenantContext";
import { useHistory } from "react-router-dom";

const UploadMedia = ({ onClose, endpoint, uploadfileEndpoint }) => {
  const { uploadFile, downloadExcelTemplate } = usePurchase();
  const [file, setFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const history = useHistory();
  const { tenantData } = useTenant();
  const tenant_schema_name = tenantData?.tenant_schema_name;

  const validTypes = [
    "application/vnd.ms-excel",
    "text/csv",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateFile(selectedFile);
  };

  const handleBrowseClick = () => {
    document.getElementById("file-input").click();
  };

  const validateFile = (file) => {
    if (
      file &&
      validTypes.includes(file.type) &&
      file.size <= 5 * 1024 * 1024
    ) {
      setFile(file);
      setErrorMessage("");
    } else {
      setErrorMessage(
        "Please upload a valid .xls, .csv, or .xlsx file under 5MB."
      );
      setFile(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    validateFile(droppedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (file) {
      setIsUploading(true); // Start loading
      try {
        await uploadFile(file, uploadfileEndpoint);
        onClose();
        Swal.fire({
          icon: "success",
          title: "Successful",
          text: "Items uploaded successfully",
        });

        setFile(null);
      } catch (error) {
        console.error("Upload failed:", error);

        const responseData = error.response?.data;
        const message = responseData?.message || "Failed to upload the file.";
        const errorDetails = responseData?.errors;

        const formattedErrors = Array.isArray(errorDetails)
          ? errorDetails
              .map((errObj) => {
                const row = errObj.row ?? "Unknown row";
                const errors = Array.isArray(errObj.errors)
                  ? errObj.errors.join("; ")
                  : String(errObj.errors);
                return `Row ${row}: ${errors}`;
              })
              .join("\n")
          : "";

        const fullMessage = formattedErrors
          ? `${message}\n\n${formattedErrors}`
          : message;

        setErrorMessage(fullMessage);
        setShowErrorPopup(true);
      } finally {
        setIsUploading(false); // Always stop loading
      }
    }
  };

  const handleTryAgain = () => {
    setShowErrorPopup(false);
    setErrorMessage("");
  };

  const handleDownloadTemplate = async () => {
    try {
      await downloadExcelTemplate(endpoint);
    } catch (error) {
      console.error("Error downloading template:", error);
      setErrorMessage("Failed to download the template. Please try again.");
      setShowErrorPopup(true);
    }
  };

  return (
    <Modal open onClose={onClose}>
      <Box
        className="upload-wrapper"
        sx={{
          maxWidth: 600,
          margin: "10vh auto",
          bgcolor: "white",
          borderRadius: 2,
          p: 3,
          position: "relative",
        }}
      >
        {showErrorPopup ? (
          <Box textAlign="center">
            {/* header */}
            <Box mb={2} display="flex" justifyContent="center">
              <img src={ErrorIcon} alt="File upload failed" width={40} />
            </Box>

            <Typography variant="h6" color="error" gutterBottom>
              Upload Failed
            </Typography>

            {/* scrollable error list */}
            <Box
              sx={{
                maxHeight: 220, // 👈 tune for your modal height
                overflowY: "auto",
                border: "1px solid #f3dede",
                borderRadius: 1,
                p: 1.5,
                mb: 2,
                textAlign: "left",
                bgcolor: "#fff7f7",
                "&::-webkit-scrollbar": { width: 6 },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "#e57373",
                  borderRadius: 3,
                },
              }}
            >
              {errorMessage.split("\n").map((line, idx) => (
                <Typography
                  key={idx}
                  variant="body2"
                  sx={{
                    fontFamily: "monospace",
                    whiteSpace: "pre-wrap",
                    borderLeft: "3px solid #e57373",
                    pl: 1,
                    mb: 0.5,
                  }}
                >
                  {line}
                </Typography>
              ))}
            </Box>

            {/* helper text + actions */}
            <Typography variant="body2" mb={2}>
              Download the&nbsp;
              <Box
                component="span"
                sx={{ color: "primary.main", cursor: "pointer" }}
                onClick={handleDownloadTemplate}
              >
                correct template
              </Box>
              , fix the highlighted rows, and try again.
            </Typography>

            <Button variant="contained" color="error" onClick={handleTryAgain}>
              Try Again
            </Button>
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Box>
                <Typography variant="h6">Media Upload</Typography>
                <Typography variant="body2">
                  Add your documents here.{" "}
                  <a
                    href="#"
                    onClick={handleDownloadTemplate}
                    style={{ color: "red" }}
                  >
                    Download acceptable format
                  </a>
                </Typography>
              </Box>
              <IconButton onClick={onClose}>
                <CloseRounded />
              </IconButton>
            </Box>

            <Box
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              sx={{
                border: "2px dashed",
                borderColor: isDragging ? "#1976d2" : "#ccc",
                backgroundColor: isDragging ? "#e3f2fd" : "#fafafa",
                borderRadius: 2,
                p: 3,
                textAlign: "center",
                mb: 2,
                transition: "all 0.3s ease",
                position: "relative",
              }}
            >
              <Box mb={1} display="flex" justifyContent="center">
                <img src={uploadIcon} alt="upload" />
              </Box>

              <Typography>
                {isDragging
                  ? "Drop file here to upload"
                  : "Drag your file to start uploading"}
              </Typography>

              <Box
                my={2}
                display="flex"
                alignItems="center"
                justifyContent="center"
                gap={1}
              >
                <Divider sx={{ flex: 1 }} />
                <Typography variant="body2">OR</Typography>
                <Divider sx={{ flex: 1 }} />
              </Box>

              <Button variant="outlined" onClick={handleBrowseClick}>
                Browse Files
              </Button>

              <input
                type="file"
                id="file-input"
                hidden
                onChange={handleFileChange}
                accept=".xls,.csv,.xlsx"
              />
            </Box>

            <Typography variant="body2" color="text.secondary" mb={1}>
              Only supports .xlsx and .csv files under 5MB.
            </Typography>
            {errorMessage && (
              <Typography color="error" mb={1}>
                {errorMessage}
              </Typography>
            )}

            {file && (
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                p={1}
                border="1px solid #ccc"
                borderRadius={2}
                mb={2}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <img
                    src={ExcelFileIcon}
                    alt="Excel File"
                    width={36}
                    height={36}
                  />
                  <Box>
                    <Typography>{file.name}</Typography>
                    <Typography variant="caption">
                      {(file.size / 1024).toFixed(2)} KB
                    </Typography>
                  </Box>
                </Box>
                <IconButton onClick={() => setFile(null)}>
                  <CloseRounded />
                </IconButton>
              </Box>
            )}

            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Button onClick={onClose} variant="outlined">
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={!file || isUploading}
              >
                {isUploading ? "Uploading..." : "Next"}
              </Button>
            </Box>
          </form>
        )}
      </Box>
    </Modal>
  );
};

export default UploadMedia;
