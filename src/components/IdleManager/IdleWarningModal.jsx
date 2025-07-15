import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

const IdleWarningModal = ({ open, secondsLeft, onStayLoggedIn }) => {
  return (
    <Dialog open={open} onClose={onStayLoggedIn}>
      <DialogTitle>Are you still there?</DialogTitle>
      <DialogContent>
        <Typography>
          You will be logged out in <strong>{secondsLeft}</strong> seconds due
          to inactivity.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={onStayLoggedIn}>
          Stay Logged In
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default IdleWarningModal;
