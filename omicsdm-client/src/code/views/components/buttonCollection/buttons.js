import React from "react";
import { Button } from "@mui/material";
import { teal } from "@mui/material/colors";

const OMICSDM_BUTTON = (props) => (
  <Button
    sx={{
      color: "white",
      backgroundColor: teal[500],
      marginRight: "2px",
      "&:hover": {
        backgroundColor: teal[700],
      },
    }}
    {...props}
  />
);

const OMICSDM_BUTTON_LIGHT = (props) => (
  <Button
    sx={{
      color: teal[500],
      backgroundColor: "#FAFAFA",
      "&:hover": {
        backgroundColor: "#f0f0f0",
      },
    }}
    {...props}
  />
);

export default OMICSDM_BUTTON;
export { OMICSDM_BUTTON_LIGHT };
