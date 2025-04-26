import React from "react";
import { CSVLink } from "react-csv"; // for this first the newest React Material Table should be installed
import { Typography } from "@mui/material";
import Grid from "@mui/material/Grid";

import JSONEditorWrapper from "../../../../components/jsonEditor";

import { BasicTable } from "../../../../components/dataTable/DataTable";

const UsedFilesAndConfig = (props) => {

  const {
    tableData,
    tableAccessors,
    filename,
    analysisJson,
  } = props
  console.log("UsedFilesAndConfig", props);

  return (
    <Grid container>
      <Grid item xs={6}>
        <Typography variant={"h6"}> Files </Typography>
        <BasicTable 
          data={tableData}
          accessorKeys={tableAccessors}
        />
        {/* <CSVLink
          data={tableContents}
          filename={filename}
        >
          Download Table as CSVs
        </CSVLink> */}
      </Grid>
      <Grid item xs={6}>
        <Typography variant={"h6"}>
          Analysis Configuration
        </Typography>
        <JSONEditorWrapper
          content={{json: analysisJson}}
          readOnly={true}
        />
      </Grid>
    </Grid>
  );
};

export default UsedFilesAndConfig;