import React from "react";

import {
  Card,
  CardContent,
  CardMedia,
  Typography,
} from "@mui/material";

import LOGO from "./img/3TR_logo_final.jpg";

export default function HomeCard(props) {
  const getImage = () => {
    if (props.type === "database") {
      return LOGO;
    }
    return LOGO;
  };

  return (
    <Card sx={{ border: "none", boxShadow: "none" }}>
      <CardMedia
        sx={{ height: 140, backgroundSize: "contain" }}
        image={getImage()}
        title={props.type}
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="h2">
          {props.title}
        </Typography>
        <Typography variant="body2" color="textSecondary" component="p">
          {props.description}
        </Typography>
      </CardContent>
    </Card>
  );
}
