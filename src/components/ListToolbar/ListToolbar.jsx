import { Box } from "@mui/material";

export const ListToolbar = ({ leftActions, rightActions }) => (
  <Box
    display="flex"
    flexDirection={{ xs: "column", sm: "row" }}
    justifyContent="space-between"
    alignItems={{ xs: "stretch", sm: "center" }}
    mb={4}
    gap={2}
  >
    <Box
      display="flex"
      flexDirection={{ xs: "column", sm: "row" }}
      gap={1}
      width="100%"
    >
      {leftActions}
    </Box>
    <Box
      display="flex"
      alignItems="center"
      justifyContent="flex-end"
      gap={2}
      width="100%"
    >
      {rightActions}
    </Box>
  </Box>
);
