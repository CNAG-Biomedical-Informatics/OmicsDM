import React from "react";
import { Container, Typography, Button, Box } from "@mui/material";

const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <Container
      maxWidth="sm"
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        textAlign: "center",
      }}
    >
      <Typography variant="h4" color="error" gutterBottom>
        Something went wrong
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        {error?.message || "An unexpected error has occurred."}
      </Typography>
      <Box mt={2}>
        <Button
          variant="contained"
          color="secondary"
          onClick={resetErrorBoundary}
        >
          Try Again
        </Button>
      </Box>
    </Container>
  );
};

export default ErrorFallback;
