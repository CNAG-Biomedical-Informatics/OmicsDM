import React from 'react';
import { Typography, TextField, Box } from "@mui/material";
import Grid from "@mui/material/Grid";

import { MaterialReactTable } from "material-react-table";

import { analysis_create } from '../../../../apis';
import auth from "../../../../Auth";
import OMICSDM_BUTTON from '../../../components/buttonCollection/buttons';

import JSONEditorWrapper from "../../../components/jsonEditor";

import  { getColsDef } from '../../helpers';


const Form = (props) => {
  const { values, handleChange, startAnalysis, analysisJson } = props;

  return (
    <form noValidate autoComplete="off">
      <Grid container justifyContent="left" alignItems="left" spacing={2}>
        <Grid item xs={2}>
          <TextField
            id="standard-basic"
            label="Analysis id"
            value={values.analysisId}
            onChange={handleChange("analysisId")}
          />
        </Grid>
        <Grid item xs={2}>
          <TextField
            id="filled-basic"
            label="Analysis name"
            value={values.analysisName}
            onChange={handleChange("analysisName")}
          />
        </Grid>
        <Grid item xs={2}>
          <OMICSDM_BUTTON
            id="apply"
            sx={{
              background: "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
              border: 0,
              borderRadius: 3,
              boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
              color: "white",
              height: 48,
              padding: "0 30px",
            }}
            onClick={startAnalysis}
            oncClick={() => startAnalysis(analysisJson)}
          >
            Run
          </OMICSDM_BUTTON>
        </Grid>
      </Grid>
    </form>
  );
}


const SummaryFrame = (props) => {
  console.log("Summary props", props);
  const { tableData, analysisJson } = props;

  return (
    <Grid container>
      <Grid item xs={6}>
        <Typography variant={"h6"}> Used files </Typography>
        <MaterialReactTable
          data={tableData.data}
          columns={tableData.cols}
          enableFilters={false}
          enablePagination={false}
          enableSorting={false}
        />
      </Grid>
      <Grid item xs={6}>
        <Typography variant={"h6"}>
          {" "}
          Used analysis configuration (JSON){" "}
        </Typography>
        <JSONEditorWrapper
          content={analysisJson}
          readOnly={true}
        />
      </Grid>
    </Grid>
  );
};

export default function SubmitAnalysis(props) {
  // export default function SubmitAnalysis(props) {
  const {
    setFormValues,
    formValues,
    filesSelected,
    analysisJson,
    setError,
    setRedirect,
  } = props;

  // example for filesSelected (= rowIdToSelectedVersion)
  // {
  // "3tr?proj1?test?info_TEST_134_135.csv": 1,
  // "3tr?proj1?test?COUNTS_genes_TEST_134_135_summed.csv": 1
  // }

  const handleChangeForm = (name) => (event) => {
    setFormValues({ ...formValues, [name]: event.target.value });
  };

  // TODO
  // The Submit Analysis Tab should only be
  // accessible if all the other tabs are filled

  const startAnalysis = async () => {

    console.log("formValues", formValues);

    // TODO
    // Figure out why this is triggered when the page is loaded
    // should only be triggered when the button is pressed

    if (!formValues.analysisId || formValues.analysisId === "") {
      setError("analysis ID must be set");
      return;
    }

    if (filesSelected.length === 0) {
      setError("at least one file must be selected");
      return;
    }

    if (Object.keys(analysisJson).length === 0) {
      setError("analysis cannot be empty");
      return;
    }

    // TODO
    // preselect select all files
    console.group("startAnalysis");
    console.log("selectedFiles", filesSelected);

    const fileIds = [];
    for (const [rowId, fileIdAndVersion] of Object.entries(filesSelected)) {
      fileIds.push(fileIdAndVersion.fileId);
    }

    // const fileIds = usedFiles.map((file) => file.fileId);
    console.log("fileIds", fileIds);

    const api_success = [];

    console.log("formValues", formValues);
    console.log("analysisJson", analysisJson);

    // copy the analysisJson
    try {
      const response = await analysis_create(
        auth.getToken(),
        config.api_endpoint,
        JSON.stringify({
          analysis_id: formValues.analysisId,
          analysis_name: formValues.analysisName,
          file_ids: fileIds,
          analysis_Json: analysisJson.json,
        })
      );

      console.log("response.status", response.status);
      if (response.status !== 200) {
        api_success.push(false);
        const json = await response.json();
        setError(json.message);
      } else {
        api_success.push(true);
      }
      if (api_success.every(Boolean)) {
        console.log("success");
        setRedirect(true);
      }
    } catch (err) {
      setError(err);
    }
    console.groupEnd();
  };

  console.log("filesSelected :>> ", filesSelected);


  // key/value loop over filesSelected
  // the key is the rowId
  // the value is the version
  const tableContents = [];
  const accessorKeys = ["owner", "datasetId", "fileId", "name", "version"];
  for (const [rowId, fileIdAndVersion] of Object.entries(filesSelected)) {
    const row = {}
    rowId.split("?").forEach((value, index) => {
      row[accessorKeys[index]] = value;
    });
    row.version = fileIdAndVersion.fileVersion;
    tableContents.push(row);
    // tableContents.push(rowId.split("?").concat(fileIdAndVersion.fileVersion));
  }
  console.log("tableContents :>> ", tableContents);

  const tableData = {
    cols: getColsDef(accessorKeys),
    data: tableContents,
  }

  console.log("tableData :>> ", tableData);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <br />
        <Form
          values={formValues}
          handleChange={handleChangeForm}
          startAnalysis={startAnalysis}
          analysisJson={analysisJson}
        />
      </Grid>
      <Grid item xs={12}>
        <Typography variant={"h6"}>
          Please double check the selected files and the analysis parameters
        </Typography>
        <br></br>
        <SummaryFrame
          tableData={tableData}
          tableContents={tableContents}
          analysisJson={analysisJson}
        />
      </Grid>
    </Grid>
  )
}
