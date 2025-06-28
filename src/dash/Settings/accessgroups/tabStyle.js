// Tab styling function (same as before)
export const tabStyles = (tabValue, activeTab) => ({
  borderRadius: "4px",
  border: "2px solid",
  borderColor: activeTab === tabValue ? "#976d2" : "grey.400",
  color: activeTab === tabValue ? "#1976d2" : "grey.600",
  fontWeight: activeTab === tabValue ? "bold" : "normal",
  textTransform: "none",
  backgroundColor:
    activeTab === tabValue ? "rgba(25, 118, 210, 0.08)" : "white",
  "&:hover": {
    color: "#1976d2",
    borderColor: "#1976d2",
    backgroundColor: "rgba(25, 118, 210, 0.04)",
  },
});
