import React from "react";
import { Container, Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router";

const Error403 = () => {
  return (
    <>
      <Typography variant="h1" color="red" gutterBottom>
        403
      </Typography>
      <Typography variant="h5" gutterBottom>
        You do not have permission to access this page.
      </Typography>
    </>
  );
}

const Error404 = () => {
  return(
  <>
    <Typography variant="h1" color="primary" gutterBottom>
      404
    </Typography>
    <Typography variant="h5" gutterBottom>
      Oh! The page you are looking for does not exist.
    </Typography>
    <Typography variant="body1" color="textSecondary">
      It might have been moved or deleted.
    </Typography>
  </>
  )
};

const Error40X = ({errorCode}) => {
  const navigate = useNavigate();

  return (
    <Container
      maxWidth="md"
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        textAlign: "center",
      }}
    >
      {errorCode === 403 ? <Error403 /> : <Error404 />}
      <Box mt={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/")}
        >
          Return to Home
        </Button>
      </Box>
    </Container>
  );
};

export default Error40X;
