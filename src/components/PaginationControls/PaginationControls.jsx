import { Box, IconButton, Typography } from "@mui/material";
import { FaCaretLeft, FaCaretRight } from "react-icons/fa";

export const PaginationControls = ({ page, totalPages, onPrev, onNext }) => (
  <Box
    gap={1}
    sx={{
      display: "flex",
      alignItems: "center",
      width: { xs: "100%", sm: "auto" },
    }}
  >
    <Typography variant="body2" color="text.secondary">
      {page} of {totalPages}
    </Typography>
    <Box border={1} borderColor="divider" borderRadius={1}>
      <IconButton onClick={onPrev} disabled={page <= 1} size="small">
        <FaCaretLeft />
      </IconButton>
      <IconButton onClick={onNext} disabled={page >= totalPages} size="small">
        <FaCaretRight />
      </IconButton>
    </Box>
  </Box>
);
