import React, { useEffect, useState } from "react";
import { Grid, Tooltip, Typography } from "@mui/material";
import CSVReader from "react-csv-reader";

import { OMICSDM_BUTTON_LIGHT } from "../../../../components/buttonCollection/buttons";

import { download_excel } from "../../../../../apis";

import auth from "../../../../../Auth";

import TableFieldsGenerator from "../tableFields/TableFields";

const TableTemplates = (props) => {
  const {
    tableFieldsRef,
    fieldObjectsRef,
    colsCfg,
    reload, // function to reset the table
    fileUploadRefs,
    fileUploadRefs2,
    setTableFields,
    setFieldObjects,
    changeHandler,
  } = props;

  const [submissionLevel, setSubmissionLevel] = useState("");

  const getExcelTemplate = async (submissionLevel) => {
    let fn = "step0-project.xlsx";
    if (submissionLevel === "datasets") {
      fn = "step1-dataset.xlsx";
    } else if (submissionLevel === "files") {
      fn = "step2-file.xlsx";
    }

    // remove the trailing s of the submissionLevel
    const queryArg = submissionLevel.slice(0, -1);

    await download_excel(auth.getToken(), config.api_endpoint, queryArg, fn);
  };

  const loadFile = (templateData) => {
    // reset the table
    reload();
    console.log("loadFile data", templateData);

    const nRows = templateData.length;
    const prefilledSubmissionTable = TableFieldsGenerator({
      event: "prefill",
      colsCfg,
      nRows,
      fieldObjectsRef,
      tableFieldsRef,
      fileUploadRefs,
      fileUploadRefs2,
      changeHandler,
      templateData,
      setTableFields,
      setFieldObjects,
    });

    setFieldObjects(prefilledSubmissionTable[0]);
    fieldObjectsRef.current = prefilledSubmissionTable[0];

    setTableFields(prefilledSubmissionTable[1]);
    tableFieldsRef.current = prefilledSubmissionTable[1];
  };

  useEffect(() => {
    const url = window.location.href;
    const submissionLevel = url.split("submit")[1];
    setSubmissionLevel(submissionLevel);
  });

  return (
    <Grid container justifyContent="center" spacing={3}>
      <Grid
        item
        lg={4}
        style={{
          border: "1px solid #9ecae1",
          "borderRadius": "10px",
          padding: "0.5%",
          textAlign: "center",
        }}
      >
        <Typography variant="body" align="center">
          Upload a template as tsv (tab separated) to prefill the table:
        </Typography>
        <Grid container justifyContent="center">
          <Grid item>
            <CSVReader
              cssClass="react-csv-input"
              accept={".csv, .tsv, .txt"}
              onFileLoaded={loadFile}
            />
          </Grid>
          <Grid item>
            <Tooltip
              title="Download a template to submit data"
              placement="bottom"
            >
              <OMICSDM_BUTTON_LIGHT
                onClick={() => getExcelTemplate(submissionLevel)}
              >
                DOWNLOAD TEMPLATE
              </OMICSDM_BUTTON_LIGHT>
            </Tooltip>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
export default TableTemplates;
