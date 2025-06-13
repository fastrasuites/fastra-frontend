import { Box, IconButton } from "@mui/material";
import { FaBars } from "react-icons/fa";
import { IoGrid } from "react-icons/io5";

export const ViewToggle = ({ gridView, onToggle }) => (
  <Box border={1} borderColor="divider" borderRadius={1} display="flex">
    <IconButton
      onClick={() => onToggle(true)}
      color={gridView ? "primary" : "default"}
      size="small"
    >
      <IoGrid />
    </IconButton>
    <IconButton
      onClick={() => onToggle(false)}
      color={!gridView ? "primary" : "default"}
      size="small"
    >
      <FaBars />
    </IconButton>
  </Box>
);
