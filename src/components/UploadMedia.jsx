import React, { useState } from "react";
import "./UploadMedia.css";
import { CloseRounded } from "@mui/icons-material";
import uploadIcon from "../image/upload.svg";
import { Divider } from "@mui/material";
import ExcelFileIcon from "../image/Excel-file-icon.svg";
import ExcelFile from "../ExcelFile.xlsx";
import axios from "axios";
import ErrorIcon from "../image/error-icon.svg";

const UploadMedia = ({ onClose }) => {
  const [file, setFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      const url = "http://placeholder-url.com/upload"; // Replace with actual endpoint

      axios
        .post(url, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((response) => {
          setFile(null); // Clear file after successful upload
          onClose(); // Close the upload modal
        })
        .catch((error) => {
          setErrorMessage("Failed to upload the file.");
          setShowErrorPopup(true); // Show the error popup on error
        });
    }
  };

  const handleTryAgain = () => {
    setShowErrorPopup(false);
    setErrorMessage("");
  };

  return (
    <div className="upload-wrapper">
      {showErrorPopup ? (
        <div className="error-popup">
          <span style={{ alignSelf: "center" }}>
            <img src={ErrorIcon} alt="File upload failed" />
          </span>
          <h3
            style={{
              color: "#F21E1EED",
              fontSize: "22.32px",
              lineHeight: "26.16px",
              fontWeight: "700",
              textAlign: "center",
            }}
          >
            ERROR! <span> {errorMessage}</span>
          </h3>
          <p
            style={{
              color: "#4A4A4A",
              fontSize: "18.09px",
              lineHeight: "21.94px",
              fontWeight: "500",
              textAlign: "center",
              maxWidth: "480px",
            }}
          >
            Click here to{" "}
            <a href={ExcelFile} download={ExcelFile} style={{ color: "red" }}>
              download the acceptable format,
            </a>{" "}
            edit respectively and upload format to continue.{" "}
          </p>
          <p
            style={{
              color: "#a7a7a7",
              fontSize: "18.09px",
              lineHeight: "30.24px",
              fontWeight: "250",
              textAlign: "center",
            }}
          >
            Please try again to complete the request
          </p>
          <button className="try-again-btn" onClick={handleTryAgain}>
            Try Again
          </button>
        </div>
      ) : (
        <form className="upload-box" onSubmit={handleSubmit}>
          <div className="upload-header">
            <div>
              <h6>Media Upload</h6>
              <p>
                Add your documents here,{" "}
                <a href={ExcelFile} download={ExcelFile}>
                  download&nbsp;acceptable&nbsp;format&nbsp;here
                </a>
              </p>
            </div>
            <CloseRounded onClick={onClose} style={{ cursor: "pointer" }} />
          </div>

          <section
            className={`drop-file-container ${isDragging ? "dragging" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <span>
              <img src={uploadIcon} alt="upload icon" />
            </span>
            <p>Drag your file to start uploading</p>
            <div className="or-divider">
              <Divider style={{ width: "80px" }} />
              <span>OR</span>
              <Divider style={{ width: "80px" }} />
            </div>
            <button
              type="button"
              className="browse-file-btn"
              onClick={handleBrowseClick}
            >
              Browse files
            </button>
            <input
              type="file"
              id="file-input"
              style={{ display: "none" }}
              onChange={handleFileChange}
              accept=".xls,.csv,.xlsx"
            />
          </section>

          <p className="support-info">
            Only supports .xls and .csv files under 5MB.
          </p>
          {errorMessage && <p className="error-message">{errorMessage}</p>}

          {file && (
            <div className="file-loaded-indicator">
              <div className="file-details">
                <span>
                  <img
                    src={ExcelFileIcon}
                    alt="Excel file icon"
                    width={36}
                    height={36}
                  />
                </span>
                <span>
                  <p className="file-title">{file.name}</p>
                  <p className="file-size">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </span>
              </div>
              <CloseRounded
                onClick={() => setFile(null)}
                style={{
                  cursor: "pointer",
                  border: "solid 2px",
                  borderRadius: "50%",
                  color: "#858585",
                }}
              />
            </div>
          )}

          <div className="button-group">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="next-btn" disabled={!file}>
              Next
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default UploadMedia;
