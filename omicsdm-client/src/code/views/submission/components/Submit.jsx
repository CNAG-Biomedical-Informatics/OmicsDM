import React, { useState } from "react";
import { Navigate, useLocation } from "react-router";
import { Typography, Backdrop, CircularProgress, Box } from "@mui/material";

import auth from "../../../Auth";
import SubmissionTable from "../components/submissionTable/SubmissionTable";

const Submit = () => {
  const location = useLocation();
  console.log("Submit.jsx location", location);

  const projectId = location.state ? location.state.projectId : null;

  let submissionLevel = null;
  const url = window.location.href;
  if (!url.includes("submitted")) {
    submissionLevel = url.split("submit")[1];
  }

  const allowRendering =
    submissionLevel === "projects"
      ? auth.getUserGroups().includes("admin")
      : true;

  const [submittting, setSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [filesUploaded, setFilesUploaded] = useState([]);

  if (!projectId) {
    switch (submissionLevel) {
      case "datasets":
        return <Navigate to="createdatasets/selectproject" />;
      case "files":
        return <Navigate to="uploadfiles/selectproject" />;
    }
  }

  if (!allowRendering) {
    return <Navigate to="/home" />;
  }

  return (
    <>
      <Typography variant={"h5"} align={"center"}>
        Create {submissionLevel}
      </Typography>

      <SubmissionTable
        projectId={projectId}
        submissionLevel={submissionLevel}
        selectedFiles={selectedFiles}
        filesUploaded={filesUploaded}
        setSelectedFiles={setSelectedFiles}
        setFilesUploaded={setFilesUploaded}
        setSubmitting={setSubmitting}
      />
      <Backdrop style={{ color: "white", zIndex: "100" }} open={submittting}>
        <CircularProgress color="inherit" />
        <Box>
          <Typography variant="h6" align="center">
            {submissionLevel === "files" &&
              "Uploading files... (closing the window will stop the upload)"}
          </Typography>
          {submissionLevel === "files" &&
            `Files uploaded:${filesUploaded.length}/${selectedFiles.length}`}
        </Box>
      </Backdrop>
    </>
  );
};

export default Submit;
