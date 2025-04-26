import React, { useState } from "react";
import { Navigate } from "react-router";

import { Typography } from "@mui/material";

import auth from "../../../Auth";

import PopupError from "../submission/components/PopupError";
import HorizontalNonLinearStepper from "./components/HorizontalNonLinearStepper";

import SelectFiles from "./components/SelectFiles";
import ConfigureAnalysis from "./components/ConfigureAnalysis";
import SubmitAnalysis from "./components/SubmitAnalysis";

export default function AnalysisSubmissionView() {

  // fileData

  // This state stores the selected version for each file and the respective fileId
  // keyed by owner, project_id, dataset_id, and name.
  const [selectedFileVersionsAndIds, setSelectedFileVersionsAndIds] = useState({});
  const [versionOptions, setVersionOptions] = useState({});
  const [filesSelected, setFilesSelected] = useState({});

  const [formValues, setFormValues] = useState({});
  const [error, setError] = useState("");

  const [redirect, setRedirect] = useState(false);

  const [analysisJson, setJson] = useState({ "json": {} });
  const [rowSelection, setRowSelection] = useState({});

  // TODO
  // it should not be needed to handover the selected rows
  // and the queried data so the component can filter the data
  // better would be to handover the already filtered data

  const closeModal = () => {
    if (error === "Session expired. Please login again") {
      auth.user.keycloak.logout();
    }
    setError("");
  };

  const components = [
    <SelectFiles
      rowSelection={rowSelection}
      versionOptions={versionOptions}
      filesSelected={filesSelected}
      selectedVersionsAndIds={selectedFileVersionsAndIds}
      setRowSelection={setRowSelection}
      setFilesSelected={setFilesSelected}
      setSelectedVersionsAndIds={setSelectedFileVersionsAndIds}
      setVersionOptions={setVersionOptions}
    />,
    <ConfigureAnalysis
      analysisJson={analysisJson}
      setJson={setJson}
      filesSelected={filesSelected}
    />,
    <SubmitAnalysis
      setFormValues={setFormValues}
      formValues={formValues}
      filesSelected={filesSelected}
      analysisJson={analysisJson}
      setError={setError}
      setRedirect={setRedirect}
    />
  ];

  if (error !== "") {
    console.log("error", error)
    return (
      <PopupError
        error={error}
        onClose={() => closeModal()
        }
      />
    )
  }

  if (redirect) {
    console.log("redirect TRUE")
    const keycloakGroup = auth.getUserGroups()[0];
    return (
      <Navigate
        to={{
          pathname: `/analysis/view/${keycloakGroup}_${formValues.analysisId}`,
        }}
      />
    )
  }

  return (
    <>
      <Typography variant={"h6"}> Analysis Submission </Typography>
      <br />
      {"Please follow the sequence of the steps below"}
      <br />
      <HorizontalNonLinearStepper
        steps={[
          "Select Files",
          "Configure Pipeline",
          "Submit Analysis"
        ]}
        components={components}
        requiredStatesToBeSet={{
          "step1To2": filesSelected,
          "step2To3": analysisJson
        }}
      />
    </>
  );
};