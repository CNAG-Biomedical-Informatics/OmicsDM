import React, { useState } from "react";

import { Button } from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

import SimpleDialog from "./simpleDialog";

import "./instructions.css";

const Instructions = () => {
  const [open, setOpen] = useState(false);
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = (value) => {
    setOpen(false);
  };

  return (
    <>
      <Button
        style={{ marginLeft: "3%" }}
        variant="outlined"
        color="primary"
        onClick={handleClickOpen}
        startIcon={<HelpOutlineIcon />}
      >
        Instructions
      </Button>
      <SimpleDialog open={open} onClose={handleClose} />
    </>
  );
};

export default Instructions;
