import React from "react";
import Grid from "@mui/material/Grid";
import toast from "react-hot-toast";

import {
  AddRowsButtons,
  ActionButtons,
} from "./tableActionsButtons/TableActionButtons";
import Instructions from "../instructions/Instructions";

import auth from "../../../../../Auth";
import {
  validateSubmission,
  submitRows,
  dataset,
  file,
} from "../../../../../apis";

import TableFieldsGenerator from "../tableFields/TableFields";

const { config } = window;

const getNonEmptyRowIds = (formControls, colsCfg) => {
  console.group("getNonEmptyRowIds");
  console.log("formControls", formControls);
  console.log("headers", colsCfg);
  const dropdownCols = colsCfg
    .filter((colCfg) => colCfg.inputType === "select")
    .map((colCfg) => colCfg.id);

  console.log("dropdownCols", dropdownCols);

  const nonEmptyRows = [];
  for (const [i, row] of formControls.entries()) {
    for (const col of row) {
      if (!col.hasOwnProperty("value")) {
        continue;
      }
      if (Array.isArray(col.value) && col.value.length > 0) {
        console.log("Array.isArray(col.value) && col.value.length > 0");
        console.log(col.value);
        nonEmptyRows.push(i);
        break;
      }
      if (
        !dropdownCols.includes(col.id) &&
        col.id != "file" &&
        col.id != "file2" &&
        col.value !== ""
      ) {
        console.log(
          "!dropdownCols.includes(col.id) && col.id != 'file' && col.value !== ''"
        );
        console.log(col.id);
        console.log(col.value);
        nonEmptyRows.push(i);
        break;
      }
    }
  }
  console.log("nonEmptyRows");
  console.log(nonEmptyRows);
  console.groupEnd();
  return nonEmptyRows;
};

const valueIsAllowed = (input, columnHeader) => {
  let allowedValues = columnHeader.selection;

  // value is allowed should work for other columns (=visibility as well)

  if (columnHeader.hasOwnProperty("allowedValues")) {
    allowedValues = columnHeader.allowedValues;
  }
  return allowedValues.includes(input) ? "" : `${input} is not a valid option!`;
};

const validateSuffix = (fileName, valid_suffixes) => {
  const splitted = fileName.split(".");
  if (
    !(splitted.length === 1 || (splitted[0] === "" && splitted.length === 2)) &&
    valid_suffixes.includes(`.${splitted.pop().toLowerCase()}`)
  ) {
    return "";
  }
  return (
    "File suffix not recognised. It must be one of the following: " +
    valid_suffixes
  );
};

const validateSubmissionForm = (formRows, colsCfg) => {
  console.log("in validateSubmissionForm");
  console.log("formRows", formRows);
  console.log("colsCfg", colsCfg);
  console.log("config.valid_suffixes", config.valid_suffixes);
  formRows.forEach((row) => {
    for (const column of row) {
      const { value } = column;

      // continue looping for the project_id column
      // as it is not part of the table columns but set
      // when validating before submission
      if (column.id === "project_id") {
        continue;
      }

      // Check if the field is mandatory
      const columnHeader = colsCfg.find((item) => item.id === column.id);
      if (columnHeader.mandatory) {
        if (value === "" || value === "select") {
          column.error = "This field is required.";
        } else {
          column.error =
            columnHeader.selection.length > 0
              ? valueIsAllowed(value, columnHeader)
              : "";
        }
      }

      // check if file suffix is valid
      if (column.id === "file") {
        const fileName = row.filter((col) => col.id === "file")[0].value[0];

        if (fileName !== undefined) {
          const errorMsg = validateSuffix(fileName, config.valid_suffixes);
          if (errorMsg !== "") {
            column.error = errorMsg;
          }
        }
      }

      // TODO
      // set the columns which were invalid to the default value
      if (column.error) {
        // TODO change state to validated false
      }
    }
  });
};

const hasErrors = (formControls) => {
  console.log("in hasErrors");
  console.log("formControls", formControls);

  if (formControls === null) {
    return true;
  }

  /*Checks if formControls has some type of Error*/
  for (let row of formControls) {
    for (let col of row) {
      if (col.error !== "") {
        console.log("hasErrors");
        console.log("col", col);
        return true;
      }
    }
  }
  return false;
};

const TableActions = (props) => {
  const {
    projectId,
    colsCfg,
    fieldObjects,
    tableFields,
    tableFieldsRef,
    fieldObjectsRef,
    validated,
    reload,
    fileUploadRefs,
    fileUploadRefs2,
    changeHandler,
    handleFileUploadFinished,
    setTableFields,
    setFieldObjects,
    setValidated,
    setSubmitting,
  } = props;

  const addRows = (event) => {
    console.log("Add Row");
    console.log("fieldObjects", fieldObjects);
    console.log("colsCfg", colsCfg);
    console.log("tableFields", tableFields);
    console.log("event.target.innerHTML", event.target.innerHTML);

    const nRows = parseInt(event.target.innerHTML.replace("+", ""));
    const newRows = TableFieldsGenerator({
      event: "add",
      nRows,
      colsCfg,
      fieldObjects,
      tableFields,
      changeHandler,
      fileUploadRefs,
      fileUploadRefs2,
    });
    console.log("newRows", newRows);

    const newFieldObjects = fieldObjects.concat(newRows[0]);
    setFieldObjects(newFieldObjects);
    fieldObjectsRef.current = newFieldObjects;

    const newTableFields = tableFields.concat(newRows[1]);
    setTableFields(newTableFields);
    tableFieldsRef.current = newTableFields;
  };

  const validate = async () => {
    console.log("Validate");
    console.log("fieldObjects", fieldObjects);
    console.log("colsCfg", colsCfg);

    const nonEmptyRowIds = getNonEmptyRowIds(fieldObjects, colsCfg);
    let formRows = fieldObjects.filter((_, i) => nonEmptyRowIds.includes(i));

    if (nonEmptyRowIds.length === 0) {
      return;
    }

    console.log("projectID", projectId);
    console.log("formRows", formRows);

    validateSubmissionForm(formRows, colsCfg);

    const urlPath = window.location.href.split("/").slice(-1)[0];
    console.log(urlPath);

    const type = urlPath.split("submit")[1];
    console.log(type);

    // get the formRows with id === "DatasetID"
    // and then replace the value with the key label of the previous value
    formRows = formRows.map((row) => {
      return row.map((item) => {
        if (item.id === "DatasetID" && type !== "files") {
          // replace the "DatasetID" with "id"
          return {
            ...item,
            id: "id",
            value: item.value.label,
          };
        }

        if (item.id === "DatasetID" && type === "files") {
          return {
            ...item,
            value: item.value.label,
          };
        }
        return item;
      });
    });
    console.log("formRows updated", formRows);

    if (
      projectId &&
      !formRows.some((row) => row.some((col) => col.id === "projectId"))
    ) {
      formRows.forEach((row) => {
        row.push({
          id: type === "files" ? "projectId" : "project_id",
          value: projectId,
          error: "",
        });
      });
    }

    if (type === "files") {
      console.log("formRows", formRows);
      setValidated(true);
      toast.success("No errors found. Ready to submit");
      return formRows;
    }

    // project or dataset submssion specific validation
    // send POST requests to /validate endpoint
    const apiSuccesses = [];

    // loop over rows with the index
    for (const [index, row] of formRows.entries()) {
      const data = {};
      row.forEach((col) => {
        data[col.id] = col.value;
      });

      const response = await validateSubmission(
        auth.getToken(),
        config.api_endpoint,
        `${type}/validate`,
        JSON.stringify([data])
      );

      const res = await response.json();
      if (response.status !== 200) {
        const errMsg = `Error validating row ${index + 1}: `;

        console.log("res", res);
        console.log("res.message", res.message);

        if (res.message.includes("empty")) {
          toast.error(`${errMsg} fields with a * are required`);
        } else {
          toast.error(errMsg + res.message);
        }
        apiSuccesses.push(false);
      }
      apiSuccesses.push(true);
    }
    if (apiSuccesses.every(Boolean)) {
      toast.success("No errors found. Ready to submit");

      //reset all potential errors in the
      formRows = formRows.map((row) => {
        return row.map((item) => {
          return {
            ...item,
            error: "",
          };
        });
      });
      setFieldObjects(formRows);
      setValidated(true);
    }
    return formRows;
  };

  const postDatasetData = async (filteredRows) => {
    const errors = [];
    const responses = [];
    for (const row of filteredRows) {
      const metaData = {};
      for (const field of row) {
        metaData[field.id] = field.value;
      }

      console.log("metaData", metaData);
      const response = await dataset(
        auth.getToken(),
        config.api_endpoint,
        "create",
        JSON.stringify(metaData)
      );

      const res = await response.json();
      if (response.status != 200) {
        console.log("erroring here");
        // TODO
        // the error message should be more specific
        // = hast to include the dataset id
        //* has to be changed on the server side
        toast.error(res.message);
        errors.push(res.message);
      }
      responses.push(res);
    }

    return [responses, errors];
  };

  const submit = async () => {
    console.log("Submit");

    const formRows = await validate();
    toast.remove();

    // hasErrors never gets called
    if (hasErrors(formRows)) {
      console.log("hasErrors(formRows) || validated === false");
      console.log("hasErrors(formRows)", hasErrors(formRows));
      console.log("validated", validated);
      return;
    }

    // trigger the loading backdrop and remove form validation notification
    setValidated(false);
    setSubmitting(true);

    const api_success = [];

    // generate data to send POST request
    const formData = [];
    for (const row of formRows) {
      const data = {};
      row.forEach((col) => {
        data[col.id] = col.value;
      });
      formData.push(data);
    }

    const urlPath = window.location.href.split("/").slice(-1)[0];
    console.log(urlPath);

    const type = urlPath.split("submit")[1];
    console.log(type);

    const urlSuffix = `${type}/create`;

    console.log("before POST request");

    if (type === "projects") {
      // send POST request
      try {
        const response = await submitRows(
          auth.getToken(),
          config.api_endpoint,
          urlSuffix,
          JSON.stringify(formData)
        );

        const error_msg = await response.text();
        if (response.status !== 200) {
          api_success.push(false);
          toast.error(error_msg);
          setSubmitting(false);
          // setShowError(error_msg);
        } else {
          // update progress
          api_success.push(true);
        }
        if (api_success.every(Boolean)) {
          console.log("All rows submitted successfully");
          props.createSummaryInserted(formRows, colsCfg);
        }
      } catch (err) {
        console.log("ERROR", err);
        toast.error("Error submitting rows");
      }
    } else if (type === "datasets") {
      const [data, error] = await postDatasetData(formRows);
      if (error.length > 0) {
        // stop the loading backdrop
        setSubmitting(false);
        console.log("ERROR", error);
        return;
      }
      console.log("data", data);

      const dataPolicyFields = formRows
        .flat()
        .filter((row) => row.id === "file")
        .filter((row) => row.value.length !== 0);

      const clinicalDataFields = formRows
        .flat()
        .filter((row) => row.id === "file2")
        .filter((row) => row.value.length !== 0);

      if (dataPolicyFields.length == 0 && clinicalDataFields.length == 0) {
        console.log("before calling handleFileUploadFinished");
        handleFileUploadFinished();
        return;
      }

      const allDataPolicyFiles = dataPolicyFields
        .map(({ value }) => value)
        .flat();

      const allClinicalDataFiles = clinicalDataFields
        .map(({ value }) => value)
        .flat();

      const allFiles = allDataPolicyFiles.concat(allClinicalDataFiles);
      // setSelectedFiles(allFiles);
      console.log("allFiles", allFiles);

      // filter refsCollection to only contain the refs in which the row is not empty
      // row index = <columnName>-<rowNumber>
      const filledRowsIdsDataPolicy = dataPolicyFields.map(
        ({ index }) => `file-${index}`
      );
      const filledRowsIdsClinicalData = clinicalDataFields.map(
        ({ index }) => `file2-${index}`
      );
      console.log("filledRowsIdsDataPolicy", filledRowsIdsDataPolicy);
      console.log("filledRowsIdsClinicalData", filledRowsIdsClinicalData);

      console.log("props", props);
      console.log("fileUploadRefs", fileUploadRefs);
      const neededRefs1 = Object.keys(fileUploadRefs.current)
        .filter((key) => filledRowsIdsDataPolicy.includes(key))
        .reduce((obj, key) => {
          obj[key] = fileUploadRefs.current[key];
          return obj;
        }, {});

      const neededRefs2 = Object.keys(fileUploadRefs2.current)
        .filter((key) => filledRowsIdsClinicalData.includes(key))
        .reduce((obj, key) => {
          obj[key] = fileUploadRefs2.current[key];
          return obj;
        }, {});

      console.log("neededRefs1", neededRefs1);
      console.log("neededRefs2", neededRefs2);

      console.log("before starting upload");
      console.log("formRows", formRows);
      for (const ref in neededRefs1) {
        console.log("ref", ref);
        await neededRefs1[ref].startUpload(
          formRows, //contains all rows
          "dataPolicy",
          data
        );
      }

      for (const ref in neededRefs2) {
        await neededRefs2[ref].startUpload(
          formRows, //contains all rows
          "clinicalData",
          data
        );
      }
    } else {
      console.log("file submission");

      const filledRows = formRows
        .flat()
        .filter((row) => row.id === "file")
        .filter((row) => row.value.length !== 0);

      console.log("filledRows", filledRows);

      const allFiles = filledRows.map(({ value }) => value).flat();
      console.log("allFiles", allFiles);

      // setSelectedFiles(allFiles);

      const filledRowsIds = filledRows.map(({ index }) => `file-${index}`);

      console.log("filledRowsIds", filledRowsIds);
      console.log("refsCollection", fileUploadRefs.current);

      const neededRefs = Object.keys(fileUploadRefs.current)
        .filter((key) => filledRowsIds.includes(key))
        .reduce((obj, key) => {
          obj[key] = fileUploadRefs.current[key];
          return obj;
        }, {});
      console.log("neededRefs", neededRefs);

      // get the project id from the formRows
      console.log("formRows", formRows);
      // const projectId = formRows[0].find((col) => col.id === "project_id").value;

      console.log("projectId", projectId);

      for (const ref in neededRefs) {
        await neededRefs[ref].startUpload(formRows, "molecularData", projectId);
      }
    }
  };

  return (
    <Grid container justifyContent="center" spacing={1}>
      <AddRowsButtons addRows={addRows} />
      <ActionButtons validate={validate} submit={submit} reload={reload} />
      <Instructions />
    </Grid>
  );
};
export default TableActions;
