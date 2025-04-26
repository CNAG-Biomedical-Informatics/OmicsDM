import React from "react";
import { Tooltip } from "@mui/material";
import Grid from "@mui/material/Grid";

import DoneIcon from "@mui/icons-material/Done";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ReplayIcon from "@mui/icons-material/Replay";

import OMICSDM_BUTTON from "../../../../../components/buttonCollection/buttons";

export const AddRowsButtons = ({ addRows }) => {
  // Renders three buttons
  // next to each other, each with a tooltip
  // to add 1, 10, or 100 rows to the table

  const rowOptions = [1, 10, 100].map((value) => ({
    value,
    tooltip: `Add ${value} row${value > 1 ? "s" : ""} to the table`,
  }));

  return (
    <>
      {rowOptions.map((option) => (
        <Grid item key={option.value}>
          <Tooltip title={option.tooltip} placement="top">
            <OMICSDM_BUTTON id={`addRow-${option.value}`} onClick={addRows}>
              +{option.value}
            </OMICSDM_BUTTON>
          </Tooltip>
        </Grid>
      ))}
    </>
  );
};

export const ActionButtons = ({ validate, submit, reload }) => {
  // Renders three buttons
  // next to each other
  // to validate, submit, or reload the data

  const buttons = [
    { id: "validate", icon: <DoneIcon />, onClick: validate, text: "VALIDATE" },
    {
      id: "submit",
      icon: <CloudUploadIcon />,
      onClick: submit,
      text: "SUBMIT",
    },
    { id: "reload", icon: <ReplayIcon />, onClick: reload, text: "RELOAD" },
  ];

  return (
    <>
      {buttons.map((button) => (
        <Grid item>
          <Tooltip title={button.text} placement="top">
            <OMICSDM_BUTTON
              id={button.id}
              onClick={button.onClick}
              startIcon={button.icon}
            >
              {button.text}
            </OMICSDM_BUTTON>
          </Tooltip>
        </Grid>
      ))}
    </>
  );
};
