import React from "react";
import { Dialog, DialogTitle } from "@mui/material";
import InstructionsContent from "./instructionsContent/InstructionsContent";

import PropTypes from "prop-types";

const SimpleDialog = (props) => {
  const { open, onClose } = props;

  const handleClose = (value) => {
    onClose(value);
  };

  return (
    <Dialog
      onClose={handleClose}
      aria-labelledby="simple-dialog-title"
      open={open}
    >
      <DialogTitle id="simple-dialog-title">Read Instructions</DialogTitle>
      <InstructionsContent />
    </Dialog>
  );
};

SimpleDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};

export default SimpleDialog;
