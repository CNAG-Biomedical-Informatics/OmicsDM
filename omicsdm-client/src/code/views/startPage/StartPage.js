import React from "react";
import {
  Typography,
  Box,
  Button,
  Divider,
} from "@mui/material";
import Grid from "@mui/material/Grid";

import HomeCard from "./HomeCard";

const Big_Rounded_Button = (props) => (
  <Button
    sx={{
      marginLeft: "1%",
      borderRadius: "100px",
      fontSize: "20px",
      padding: "15px 40px 15px 40px",
      boxShadow: "1px 1px 5px black",
      "&:hover": {
        backgroundColor: "#91BFDB",
      },
      margin: "1%",
    }}
    {...props}
  />
);

const StartPage = () => {
  return (
    <div className={"home_box"}>
      <Grid
        container
        direction={"row"}
        alignItems={"center"}
        style={{ textAlign: "center", width: "100%" }}
      >
        <Grid item lg={12} style={{ background: "#06ae8e", width: "100%" }}>
          <div className={"banner"}></div>
        </Grid>
        <Grid item lg={12}>
          <Box p={2}>
            <Big_Rounded_Button href={"#/home"}>
              {" "}
              Access Data Portal{" "}
            </Big_Rounded_Button>
          </Box>
        </Grid>
        <Grid item lg={12}>
          <Box p={2}>
            <Divider />
            <Box p={3}>
              <Typography variant={"h4"}>3TR Platform</Typography>
            </Box>
            <Box p={3}>
              <Grid
                container
                direction={"row"}
                justifyContent={"center"}
                alignItems={"center"}
                spacing={1}
              >
                <Grid item lg={4}>
                  <HomeCard
                    type={"laptop"}
                    title={"Web Portal"}
                    description={"beta"}
                  />
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </div>
  );
};

export default StartPage;
