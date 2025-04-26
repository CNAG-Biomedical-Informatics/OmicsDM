import React from "react";
import { Typography } from "@mui/material";

export default function Copyright(props) {
  return (
    <Typography
      variant="body2"
      align="center"
      {...props}
      sx={[
        {
          color: "text.secondary",
        },
        ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
      ]}
    >
      {"Copyright © "}
      {new Date().getFullYear()}
      {" Ivo Christopher Leist | CNAG"}
    </Typography>
  );
}
