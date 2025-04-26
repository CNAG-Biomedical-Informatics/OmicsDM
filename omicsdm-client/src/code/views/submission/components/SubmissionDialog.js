import React, { useState } from "react";
import { Navigate } from "react-router";

//better name for this component would be "SubmissionRedirect" 
// this component does not need to have an extra file
// would fit better into components/Submit.js

function SubmissionDialog(props) {
  const { type } = props;
  const [redirectStatus] = useState(true);

  console.log("code/views/submission/components/SubmissionDialog.js props", props);

  if (redirectStatus) {
    if (type === "Datasets")
      return (
        <Navigate
          to={"/datasetsubmitted"}
          state={{
            tableContents: props.tableContents,
            filename: props.filename,
            projectId: props.projectId,
            nextPage: "/submitfiles",
            nextPageLabel: "GO TO SUBMIT FILE(s)",
          }}
        />
      );
    if(type === "Files") {
      return (
        <Navigate
          to={"/filesubmitted"}
          state={{
            tableContents: props.tableContents,
            filename: props.filename,
            projectId: props.projectId,
            nextPage: "/",
            nextPageLabel: "GO TO MAIN PAGE",
          }}
        />
      );
    }
    return (
      <Navigate
        to={"/projectsubmitted"}
        state={{
          tableContents: props.tableContents,
          filename: props.filename,
          nextPage: "/",
          nextPageLabel: "GO TO MAIN PAGE",
        }}
      />
    );
  }
}

export default SubmissionDialog;
