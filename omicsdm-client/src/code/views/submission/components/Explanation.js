import React from "react";
import {
  Typography,
  Divider,
} from "@mui/material";
import Grid from "@mui/material/Grid";


export const Explanation = () => {
  const FILES = window.location.hash === "#/submitfiles";
  const PROJECTS = window.location.hash === "#/submitprojects";

  if (PROJECTS) {
    return (
      <Grid direction="row" justify="center" alignItems="center">
        <Grid item lg={12}>
          <Typography variant={"h6"} align={"center"}>
            {" "}
            How to submit projects
          </Typography>
          <div className={"explanation"}>
            To submit a single or multiple project, please enter the required
            information:
            <ul>
              <li>Project ID</li>
              <li>Name</li>
              <li>Owners</li>
              <li>Description</li>
              <li>diseases</li>
              <li>Dataset Visibility Default (public or private)</li>
              <li>Dataset Visibility Changeable (true or false)</li>
              <li>File Download Allowed (true or false)</li>
            </ul>
            Click the <strong>VALIDATE</strong> button to verify that data is
            ready for submission. Then click on <strong>SUBMIT</strong>. You can{" "}
            <strong>VALIDATE</strong> your data anytime during the submission.
            Please, keep in mind that you can't save a draft of your current
            submission. Also, leaving the page will cancel all your entries.
            <Divider />
            <strong>Buttons +1, +10, +100 </strong> will add extra rows to the
            submission table. In case of Upload, you don't need to click on it.
          </div>
        </Grid>
      </Grid>
    );
  }

  if (FILES) {
    return (
      <Grid direction="row" justify="center" alignItems="center">
        <Grid item lg={12}>
          <Typography variant={"h6"} align={"center"}>
            {" "}
            How to submit files
          </Typography>
          <div className={"explanation"}>
            To submit a single or multiple files, please enter the required
            information:
            <ul>
              <li>Dataset ID</li>
              <li>File (allowed formats: tsv, csv, txt, gz, rds, rda, h5ad)</li>
              <li>Comment</li>
            </ul>
            Click the <strong>VALIDATE</strong> button to verify that data is
            ready for submission. Then click on <strong>SUBMIT</strong>. You can{" "}
            <strong>VALIDATE</strong> your data anytime during the submission.
            Please, keep in mind that you can't save a draft of your current
            submission. Also, leaving the page will cancel all your entries.
            <Divider />
            <strong>Buttons +1, +10, +100 </strong> will add extra rows to the
            submission table. In case of Upload, you don't need to click on it.
          </div>
        </Grid>
      </Grid>
    );
  }
  return (
    <Grid direction="row" justify="center" alignItems="center">
      <Grid item lg={12}>
        <Typography variant={"h6"} align={"center"}>
          {" "}
          How to submit datasets
        </Typography>
        <div className={"explanation"}>
          To submit a single or multiple datasets, please enter the required
          information:
          <ul>
            <li>Dataset ID</li>
            <li>Name</li>
            <li>Disease</li>
            <li>Treatment</li>
            <li>Molecular Information</li>
            <li>Sample Type</li>
            <li>Data Type</li>
            <li>Value Type</li>
            <li>Platform</li>
            <li>Genome Assembly</li>
            <li>Annotation</li>
            <li>Samples Count</li>
            <li>Features Count</li>
            <li>Features ID</li>
            <li>Healthy Controls Included</li>
            <li>Additional Info</li>
            <li>Contact</li>
            <li>Tags</li>
            <li>Visibility (private / visible to all)</li>
            <li>Data Usage Policy file (pdf specifying data usage restrictions)</li>
            <li>Clinical File (csv export from RedCap)</li>
          </ul>
          Click the <strong>VALIDATE</strong> button to verify that data is
          ready for submission. Then click on <strong>SUBMIT</strong>. You can{" "}
          <strong>VALIDATE</strong> your data anytime during the submission.
          Please, keep in mind that you can't save a draft of your current
          submission. Also, leaving the page will cancel all your entries.
          <Divider />
          <strong>Buttons +1, +10, +100 </strong> will add extra rows to the
          submission table. In case of Upload, you don't need to click on it.
        </div>
      </Grid>
    </Grid>
  );
};
