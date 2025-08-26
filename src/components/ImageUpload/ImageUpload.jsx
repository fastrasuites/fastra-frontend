import vendorLogo from "../../image/vendor-logo.svg";
import UserIcon from "../../assets/images/user.png";
import { Box, Typography } from "@mui/material";

const ImageUpload = ({ imagePreview, onImageUpload, isAccessRight }) => {
  const isFile = imagePreview instanceof Blob || imagePreview instanceof File;
  const isCanvasDataUrl =
    (typeof imagePreview === "string" &&
      imagePreview.startsWith("data:image/")) ||
    imagePreview.startsWith("blob:http:/");

  const previewedImage = isFile
    ? URL.createObjectURL(imagePreview)
    : isCanvasDataUrl
    ? imagePreview
    : imagePreview
    ? `data:image/png;base64,${imagePreview}`
    : null;

  return (
    <>
      <Box
        onClick={() => document.getElementById("imageInput").click()}
        sx={{
          width: isAccessRight ? 164 : 98,
          height: isAccessRight ? 148 : 98,
          cursor: "pointer",
          borderColor: "grey.400",
          borderRadius: isAccessRight ? "24px" : "50%",
          overflow: "hidden",
          backgroundColor: isAccessRight ? "#3B7CED" : "#E2E6E9",
        }}
      >
        <input
          type="file"
          accept=".png,.jpg,.jpeg"
          id="imageInput"
          name="imageFile"
          onChange={onImageUpload}
          style={{ display: "none" }}
        />
        {previewedImage ? (
          <img
            src={previewedImage}
            alt="Preview"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            height="100%"
          >
            <img src={isAccessRight ? UserIcon : vendorLogo} alt="Upload" />
          </Box>
        )}
      </Box>
      <Typography variant="caption">Max size: 1 MB</Typography>
    </>
  );
};

export default ImageUpload;
