import React from "react";
import Grid from "@mui/material/Grid";

import ShowFiles from "./ShowFiles";

const DatasetsViewSpecific = (props) => {
  const { selected } = props;

  console.log("DatasetViewSpecific props", props);

  return (
    <Grid item xs={6} style={{ padding: "6px" }}>
      <ShowFiles selected={selected} />
    </Grid>
  );
};

export default DatasetsViewSpecific;
