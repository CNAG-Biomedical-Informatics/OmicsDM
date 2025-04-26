import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import Grid from "@mui/material/Grid";

import { MaterialReactTable } from "material-react-table";

import TableFieldsGenerator from "./tableFields/TableFields";
import TableTemplates from "./tableTemplates/TableTemplates";
import TableActions from "./tableActions/TableActions";

import { submissionCols, datasetSubmissionCols} from "../../../../apis";
import auth from "../../../../Auth";

import { getColsDef } from "../../../helpers";

const getSubmissionCols = async ({ queryKey }) => {
  const [_key, { submissionLevel, projectId }] = queryKey;

  console.log("getSubmissionCols _key", _key);
  console.log("submissionLevel", submissionLevel);
  console.log("projectId", projectId);

  let jsonData = {};
  const urlSuffix = `${submissionLevel}/submissioncols`;

  let response = {};

  if (submissionLevel === "projects" || submissionLevel === "files") {
    response = await submissionCols(
      auth.getToken(),
      config.api_endpoint,
      urlSuffix
    );

    if (response.status === 200) {
      jsonData = await response.json();
      return jsonData[0].message;
    }

    console.log("Error fetching submissionCols");
    console.log("response", response);
    return [];
  }

  // dataset submission
  const query = {
    project_id: projectId,
  };

  response = await datasetSubmissionCols(
    auth.getToken(),
    config.api_endpoint,
    JSON.stringify(query)
  );

  if (response.status === 200) {
    jsonData = await response.json();
    console.log("jsonData", jsonData);
    return jsonData.headers;
  }

  console.log("Error fetching datasetSubmissionCols");
  console.log("response", response);
  return [];
};

const SubmissionTable = (props) => {
  const {
    projectId,
    submissionLevel,
    selectedFiles,
    filesUploaded,
    setSelectedFiles,
    setFilesUploaded,
    setSubmitting,
  } = props;

  console.log("SubmissionTable");
  console.log("props", props);

  const [headers, setHeaders] = useState([]);

  // used to validate and submit the table
  const [fieldObjects, setFieldObjects] = useState([]);
  const fieldObjectsRef = useRef(fieldObjects);

  // used to populate the table with input fields
  const [tableFields, setTableFields] = useState([]);
  const tableFieldsRef = useRef(tableFields);

  const [validated, setValidated] = useState(false);

  const fileUploadRefs = useRef({});
  const fileUploadRefs2 = useRef({});

  const key = `${submissionLevel}-getSubmissionCols`;

  const { data: colsCfg } = useQuery({
      queryKey: [key, { submissionLevel, projectId }], 
      queryFn: getSubmissionCols,
      enabled: !!submissionLevel,
  });

  const navigate = useNavigate();

  // const getSubmissionCols = async ({ queryKey }) => {
  //   const [_key, { submissionLevel }] = queryKey;

  //   console.log("getSubmissionCols _key", _key);
  //   console.log("submissionLevel", submissionLevel);

  //   let jsonData = {};
  //   const urlSuffix = `${submissionLevel}/submissioncols`;

  //   let response = {};

  //   if (submissionLevel === "projects" || submissionLevel === "files") {
  //     response = await submissionCols(
  //       auth.getToken(),
  //       config.api_endpoint,
  //       urlSuffix
  //     );

  //     if (response.status === 200) {
  //       jsonData = await response.json();
  //       return jsonData[0].message;
  //     }

  //     console.log("Error fetching submissionCols");
  //     console.log("response", response);
  //     return [];
  //   }

  //   // dataset submission
  //   const query = {
  //     project_id: projectId,
  //   };

  //   response = await datasetSubmissionCols(
  //     auth.getToken(),
  //     config.api_endpoint,
  //     JSON.stringify(query)
  //   );

  //   if (response.status === 200) {
  //     jsonData = await response.json();
  //     console.log("jsonData", jsonData);
  //     return jsonData.headers;
  //   }

  //   console.log("Error fetching datasetSubmissionCols");
  //   console.log("response", response);
  //   return [];
  // };

  const getValForTable = (id, value) => {
    console.log("getValForTable");
    console.log("id", id);
    console.log("value", value);

    // if (id === "datasetVisibilityDefault") {
    //   return value ? "private" : "visible to all";
    // }
    if (Array.isArray(value)) {
      return [...new Set(value)].join(" ");
    }
    if (typeof value === "boolean") {
      return value.toString();
    }

    // for the file submission level
    if (typeof value === "object") {
      return value.label;
    }
    return value;
  };

  const filterNonEmptyValues = (arr) => {
    return arr.filter(row => 
      row.some(item => 
        item.value !== "" && item.value !== null && item.value !== undefined &&
        !(Array.isArray(item.value) && item.value.length === 0)
      )
    );
  };

  const createSummaryInserted = (formRows, colsCfg) => {
    // TODO
    // maybe split into two functions
    // one for the population of the table
    // and the other for the navigation to the summary page

    console.log("createSummaryInserted");
    console.log("formRows", formRows);
    console.log("colsCfg", colsCfg);

    const accessoryKeys = colsCfg.map((col) => col.id);
    const cols = getColsDef(accessoryKeys);
    console.log("cols", cols);  

    const tableContents = [];

    // add table headers
    // const tableHeaders = [];
    // for (const row of colsCfg) {
    //   tableHeaders.push(row.title);
    // }
    // tableContents.push(tableHeaders);

    // // add table values
    // for (const row of formRows) {
    //   console.log("row", row);
    //   const rowValues = [];
    //   for (const column of row) {
    //     const { id, value } = column;
    //     rowValues.push(getValForTable(id, value));
    //   }
    //   tableContents.push(rowValues);
    // }

    // 

    const filledRows = filterNonEmptyValues(formRows); 
    console.log("filledRows", filledRows);
    
    for (const row of filledRows) {
      const rowValues = {};
      for (const column of row) {
        const { id, value } = column;
        rowValues[id] = getValForTable(id, value);
      }
      tableContents.push(rowValues);
    }

    const tableData = {
      cols,
      data: tableContents,
    }

    console.log("tableContents", tableContents);

    //go to Summary Inserted
    const pathname = `/${submissionLevel}ubmitted`;
    console.log("pathname", pathname);

    const today = new Date().toISOString().slice(0, 10);

    let nextPage = "/";
    let nextPageLabel = "GO TO MAIN PAGE";
    if (submissionLevel === "datasets") {
      nextPage = "/submitfiles";
      nextPageLabel = "GO TO SUBMIT FILE(s)";
    }
    console.log("before Navigate");
    const state = {
      projectId: projectId,
    };
    console.log("state", state);
    navigate(pathname, {
      state: {
        tableData,
        tableContents,
        filename: `${today}_submitted_${submissionLevel}.csv`,
        projectId: projectId,
        nextPage,
        nextPageLabel,
      },
    });
  };

  const handleFileUploadFinished = (fileName) => {
    console.log("handleFileUploadFinished");
    console.log("fileName", fileName);

    setFilesUploaded([...filesUploaded, fileName]);

    console.log("selectedFiles", selectedFiles);

    // when there is no file uploaded selectedFiles looks like this
    // selectedFiles { "id-1": undefined }

    if (selectedFiles["id-1"] === undefined) {
      console.log("Hack to not let it crash when no files are uploaded");
      console.log("No files uploaded");
      setSubmitting(false);
      createSummaryInserted(fieldObjectsRef.current, colsCfg);
      return;
    }

    if (Object.keys(selectedFiles).length === filesUploaded.length) {
      console.log("All files uploaded");
      console.log("fieldObjectsRef", fieldObjectsRef);
      setSubmitting(false);
      createSummaryInserted(fieldObjectsRef.current, colsCfg);
    }
  };

  const changeHandler = (event, eventMeta) => {
    // depending onto what this event handler is attached
    // eventMeta is either the selectedFiles
    // or other meta data
    console.log("Submit.js: SubmissionTable.js changeHandler");
    console.log("event", event);
    console.log("eventMeta", eventMeta);

    const changeDatasetId = !event.target;
    const value = changeDatasetId ? event : event.target.value;
    const name = changeDatasetId ? eventMeta.name : event.target.name;

    const updatedSubmissionTable = TableFieldsGenerator({
      event: "update",
      colsCfg,
      fieldToBeUpdated: name, //<colId>-<rowIndex>
      newValue: value,
      fieldObjectsRef,
      tableFieldsRef,
      fileUploadRefs,
      fileUploadRefs2,
      changeHandler,
      handleFileUploadFinished,
    });

    if (!changeDatasetId) {
      setSelectedFiles({
        ...selectedFiles,
        [name]: eventMeta,
      });
    }

    console.log("updatedSubmissionTable", updatedSubmissionTable);

    setFieldObjects(updatedSubmissionTable[0]);
    fieldObjectsRef.current = updatedSubmissionTable[0];

    setTableFields(updatedSubmissionTable[1]);
    tableFieldsRef.current = updatedSubmissionTable[1];

    setValidated(false);
  };

  const reload = () => {
    console.log("Reload");
    console.log("fieldObjects", fieldObjects);
    console.log("colsCfg", colsCfg);

    const nRows = fieldObjects.length;
    const newRows = TableFieldsGenerator({
      event: "init",
      nRows,
      colsCfg,
      fieldObjects,
      tableFields,
      fileUploadRefs,
      fileUploadRefs2,
      changeHandler,
      handleFileUploadFinished,
    });

    setFieldObjects(newRows[0]);
    fieldObjectsRef.current = newRows[0];

    setTableFields(newRows[1]);
    tableFieldsRef.current = newRows[1];
  };

  // initial load
  useEffect(() => {
    console.log("Submit.js: SubmissionTable.js useEffect");
    console.log("submissionLevel", submissionLevel);
    console.log("fileUploadRefs", fileUploadRefs);

    if (!colsCfg) {
      return;
    }

    const nRows = submissionLevel === "files" ? 10 : 2;

    const emptySubmissionTable = TableFieldsGenerator({
      event: "init",
      colsCfg,
      nRows,
      fieldObjectsRef,
      tableFieldsRef,
      fileUploadRefs,
      fileUploadRefs2,
      changeHandler,
      handleFileUploadFinished,
      projectId,
    });

    console.log("emptySubmissionTable[0]", emptySubmissionTable[0]);
    setFieldObjects(emptySubmissionTable[0]);
    fieldObjectsRef.current = emptySubmissionTable[0];

    console.log("emptySubmissionTable[1]", emptySubmissionTable[1]);
    setTableFields(emptySubmissionTable[1]);
    tableFieldsRef.current = emptySubmissionTable[1];

    const headers = [];
    for (const col of colsCfg) {
      const suffixIndicator = col.mandatory ? "*" : "";

      const colHeader = {
        accessorKey: col.id,
        header: col.title + suffixIndicator,
        size: 80,
      };
      headers.push(colHeader);
    }
    console.log("headers", headers);
    setHeaders(headers);
  }, [colsCfg]);

  return (
    <>
      <Grid container justifyContent="center">
        <Grid
          item
          lg={12}
          style={{
            marginBottom: "20px",
            marginTop: "20px",
          }}
        >
          <TableTemplates
            colsCfg={colsCfg}
            tableFieldsRef={tableFieldsRef}
            fieldObjectsRef={fieldObjectsRef}
            fileUploadRefs={fileUploadRefs}
            fileUploadRefs2={fileUploadRefs2}
            setTableFields={setTableFields}
            setFieldObjects={setFieldObjects}
            reload={reload}
            changeHandler={changeHandler}
          />
        </Grid>
        <TableActions
          projectId={projectId}
          fieldObjects={fieldObjects}
          colsCfg={colsCfg}
          validated={validated}
          tableFields={tableFields}
          tableFieldsRef={tableFieldsRef}
          fieldObjectsRef={fieldObjectsRef}
          fileUploadRefs={fileUploadRefs}
          fileUploadRefs2={fileUploadRefs2}
          changeHandler={changeHandler}
          handleFileUploadFinished={handleFileUploadFinished}
          reload={reload}
          createSummaryInserted={createSummaryInserted}
          setValidated={setValidated}
          setSubmitting={setSubmitting}
          setFieldObjects={setFieldObjects}
          setTableFields={setTableFields}
          setSelectedFiles={setSelectedFiles}
        />
      </Grid>
      <MaterialReactTable
        columns={headers}
        data={tableFields}
        enableFilters={false}
        enableSorting={false}
      />
    </>
  );
};
export default SubmissionTable;
