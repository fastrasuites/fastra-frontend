import { Box, Button, Typography } from "@mui/material";
import { useRef, useState } from "react";
import SignaturePad from "react-signature-canvas";
import Swal from "sweetalert2";

const IMAGE_MAX_SIZE = 1 * 1024 * 1024; // 1 MB
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg"];

const SignatureSection = ({ signature, onClear, onEnd, onUpload }) => {
  const sigPadRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!IMAGE_TYPES.includes(file.type) || file.size > IMAGE_MAX_SIZE) {
      Swal.fire({
        icon: "error",
        title: "Invalid Image",
        text: "Please upload a JPEG/PNG under 1 MB.",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      onUpload(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleMouseDown = () => {
    setIsDrawing(true);
  };

  const handleMouseUp = () => {
    if (isDrawing) {
      handleEndDrawing();
      setIsDrawing(false);
    }
  };

  const handleEndDrawing = () => {
    if (sigPadRef.current && !sigPadRef.current.isEmpty()) {
      const dataURL = sigPadRef.current.toDataURL("image/png");
      onEnd(dataURL);
    }
  };

  const handleInternalClear = () => {
    if (sigPadRef.current) {
      sigPadRef.current.clear();
    }
    onClear();
  };

  return (
    <Box pb={3}>
      <Typography color="#3B7CED" fontSize="20px" mb={3}>
        Signature
      </Typography>
      <Box display="flex" alignItems="end" gap={6}>
        {signature ? (
          <img
            src={signature}
            alt="Signature"
            style={{
              border: "1px solid #ccc",
              borderRadius: "4px",
              backgroundColor: "white",
              width: 400,
              height: 150,
              objectFit: "contain",
            }}
          />
        ) : (
          <Box
            sx={{
              border: "1px solid #ccc",
              borderRadius: "4px",
              backgroundColor: "white",
              width: 400,
              height: 150,
            }}
          >
            <SignaturePad
              ref={sigPadRef}
              canvasProps={{
                width: 400,
                height: 150,
                className: "sigCanvas",
              }}
              onEnd={handleEndDrawing}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onTouchStart={handleMouseDown}
              onTouchEnd={handleMouseUp}
            />
          </Box>
        )}

        <input
          type="file"
          accept=".png,.jpg,.jpeg"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
        />

        <Button
          variant="contained"
          disableElevation
          size="large"
          onClick={handleUploadClick}
        >
          Upload Signature
        </Button>
      </Box>
      <Button onClick={handleInternalClear} sx={{ mt: 1 }}>
        Clear Signature
      </Button>
    </Box>
  );
};

export default SignatureSection;
