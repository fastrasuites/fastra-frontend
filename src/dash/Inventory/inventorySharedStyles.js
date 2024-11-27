import { fontSize, lineHeight } from "@mui/system";

// Inventory shared styles
const inventoryShareStyle = {
  operationWrapper: (theme) => ({
    marginInline: "32px",
    [theme.breakpoints.down("md")]: {
      marginInline: "24px",
    },
    [theme.breakpoints.down("sm")]: {
      marginInline: "16px",
    },
  }),
  pageBoldTitle: (theme) => ({
    fontSize: "24px",
    fontWeight: "500",
    lineHeight: "29.11px",
    color: "#1A1A1A",
    [theme.breakpoints.down("md")]: {
      fontSize: "20px",
    },
    [theme.breakpoints.down("sm")]: {
      fontSize: "16px",
      lineHeight: "19.2px",
    },
  }),

  formWrapper: (theme) => ({
    marginBottom: "200px",
    padding: "24px",
    backgroundColor: "#FFFFFF",
    border: "solid 2px #e2e6e9",
    borderRadius: "4px",
    display: "flex",
    flexDirection: "column",
    flexWrap: "wrap",
    gap: "32px",
    [theme.breakpoints.down("md")]: {
      padding: "16px",
      gap: "24px",
    },
    [theme.breakpoints.down("sm")]: {
      padding: "12px 6px",
      gap: "16px",
    },
  }),
  formHeaderTitle: (theme) => ({
    fontSize: "20px",
    fontWeight: "500",
    lineHeight: "24.26px",
    color: "#3b7ced",
    [theme.breakpoints.down("md")]: {
      fontSize: "16px",
    },
    [theme.breakpoints.down("sm")]: {
      fontSize: "14px",
      lineHeight: "17.2px",
    },
  }),
  buttonStyles: (theme) => ({
    padding: "8px 24px",
    borderRadius: "4px",
    fontSize: "16px",
    fontWeight: 400,
    lineHeight: "19.41px",
    cursor: "pointer",
    border: "none",
    backgroundColor: "#3B7CED",
    color: "#FFFFFF",
    textTransform: "inherit",
    "&:hover": {
      opacity: "0.9",
      backgroundColor: "#3B7CED",
    },
    [theme.breakpoints.down("md")]: {
      padding: "8px 16px",
    },
    [theme.breakpoints.down("sm")]: {
      padding: "8px 8px",
      fontSize: "14px",
    },
  }),
  WidthFullFlexSpaceBetween: (theme) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
    width: "100%",
    [theme.breakpoints.down("sm")]: {
      gap: "8px",
    },
  }),
  textFieldStyles: () => ({
    "& .MuiInputLabel-root": {
      color: "#1A1A1A", // Label color
      fontSize: "16px",
    },
    "& .MuiInputBase-input": {
      color: "#8C9AA6", // Input field text color
      fontSize: "16px",
    },
  }),
};

export default inventoryShareStyle;


