import React from "react";
import { Box, Typography } from "@mui/material";
import { SignInButton } from "@toolpad/core";

import { useSession } from "../../SessionContext";
import LOGO from "../../../img/omics_dm_logo_created_by_DALL-E.png";

function Home() {
  const { session } = useSession();

  return (
    <Box sx={{ textAlign: "center" }}>
      <Typography variant={"h4"} sx={{ padding: "20px" }}>
        Welcome to OmicsDM
      </Typography>
      <Box
        component={"img"}
        src={LOGO}
        id="logo"
        alt="OmicsDM logo"
        sx={{
          width: "9%",
          marginBottom: "42px",
          background: "#4575b4",
          borderRadius: "20px",
          padding: "5px",
        }}
      />
      <br />
      {!session && (
        <SignInButton
          variant="contained"
          color="primary"
          sx={{ marginBottom: 2 }}
        />
      )}
    </Box>
  );
}

export default Home;
