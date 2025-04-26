import React from "react";
import {TextField, Box} from "@mui/material";
import Grid from "@mui/material/Grid";

function Form(props) {
  const { values, handleChange } = props;

  return (
    <form noValidate autoComplete="off">
      <Grid container justifyContent="left" alignItems="left" spacing={2}>
        <Grid item xs={6}>
          <TextField
            id="standard-basic"
            label="Analysis id"
            value={values.analysisId}
            onChange={handleChange("analysisId")}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            id="filled-basic"
            label="Analyis name"
            value={values.analysisName}
            onChange={handleChange("analysisName")}
          />
        </Grid>
      </Grid>
    </form>
  );
}

export default Form;
