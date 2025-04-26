import React from "react";
import { Chip, Stack, Tooltip, Typography } from "@mui/material";

import CloudCircleIcon from "@mui/icons-material/CloudCircle";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import LOGO from "./../../img/omics_dm_logo_created_by_DALL-E.png";

// TODO
// the app title should check if the app is in production or not
// and show a different icon accordingly

// TODO
// The app title should show an error icon if the app is not connected to the server
// or if Keycloak is not available

function AppTitle() {
  const isProduction = process.env.NODE_ENV === "production";
  const isConnected = true;
  const isKeycloakAvailable = true;

  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <img src={LOGO} alt="OmicsDM logo" width="40" />
      <Typography variant="h6">OmicsDM</Typography>
      <Chip size="small" label="BETA" color="info" />
      <Tooltip title="Connected to production">
        {isProduction ? (
          <CheckCircleIcon color="success" fontSize="small" />
        ) : (
          <CloudCircleIcon color="error" fontSize="small" />
        )}
      </Tooltip>
      <Tooltip title="Server connection status">
        {isConnected && isKeycloakAvailable ? (
          <CheckCircleIcon color="success" fontSize="small" />
        ) : (
          <CloudCircleIcon color="error" fontSize="small" />
        )}
      </Tooltip>
    </Stack>
  );
}

export default AppTitle;
