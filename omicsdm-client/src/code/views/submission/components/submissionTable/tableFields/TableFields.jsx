import React from "react";
import { AsyncPaginate } from "react-select-async-paginate";
import { MRT_EditCellTextField } from "material-react-table";

import { S3Uploader } from "../../../submit-files/evaporateJS/S3Uploader";
import { dataset_list } from "../../../../../apis";
import auth from "../../../../../Auth";

const TableFieldsGenerator = (props) => {
  console.log("TableFieldsGenerator props", props);

  const {
    changeHandler,
    handleFileUploadFinished,
    fileUploadRefs,
    fileUploadRefs2,
    projectId,
  } = props;

  const getJSXerror = (row) =>
    row.error === "" ? null : (
      <i id={`error_form_${row.id}-${row.index}`}>
        <font color="red"> {row.error} </font>
      </i>
    );

  const getJSXSelectOptions = (header, row) =>
    header.selection.map((optionItem) =>
      optionItem === row.value ? (
        <option value={optionItem} selected>
          {optionItem}
        </option>
      ) : (
        <option value={optionItem}>{optionItem}</option>
      )
    );

  // below is for files
  // to populate the dataset id dropdown
  const getDatasets = async (search, loadedOptions, { page }) => {
    // https://codesandbox.io/s/5y2xq39v5k?file=/src/loadOptions.js:124-229

    console.log("getDatasets search", search);
    console.log("projectId", projectId);

    //TODO replace with project+arg
    const response = await dataset_list(
      auth.getToken(),
      config.api_endpoint,
      JSON.stringify({
        project_id: projectId,
        dataset_id: search,
      })
    );
    const data = await response.json();

    const options = [];
    for (const [i, e] of data.entries()) {
      options.push({ value: i, label: e });
    }

    // react-select-async-paginate library expects loadedOptions
    const hasMore = false;
    loadedOptions = {
      options,
      hasMore,
      additional: {
        page,
      },
    };
    console.log("loadedOptions", loadedOptions);
    return loadedOptions;
  };

  const createFieldInputComponent = (props) => {
    const { fieldHeader, fieldObject, fileUploadRefs, fileUploadRefs2 } = props;

    console.log("createFieldInputComponent props", props);
    console.log("createFieldInputComponent fileUploadRefs", fileUploadRefs);

    let { value } = props;
    if (!value) {
      value = fieldObject.value;
    }

    console.log("fieldHeader", fieldHeader);
    console.log("fieldObject", fieldObject);
    console.log("value", value);
    console.log("fileUploadRefs", fileUploadRefs);
    console.log("fileUploadRefs2", fileUploadRefs2);

    const jsxKey = `${fieldObject.id}-${fieldObject.index}`;

    if (fieldHeader.inputType === "select") {
      return (
        <div>
          <select
            name={jsxKey}
            value={value}
            onChange={changeHandler}
            style={{ minWidth: "60px" }}
          >
            {getJSXSelectOptions(fieldHeader, fieldObject)}
          </select>
          {getJSXerror(fieldObject)}
        </div>
      );
    }

    if (fieldHeader.inputType === "select-dataset") {
      return (
        <div>
          <AsyncPaginate
            name={jsxKey}
            value={value}
            loadOptions={getDatasets}
            onChange={changeHandler}
            additional={{ page: 1 }}
            menuPortalTarget={document.body}
          />
          {getJSXerror(fieldObject)}
        </div>
      );
    }

    if (fieldHeader.inputType === "file") {
      return (
        <>
          <S3Uploader
            ref={(instance) => {
              fileUploadRefs.current[jsxKey] = instance;
            }}
            rowId={fieldObject.index}
            colId="file"
            onChange={changeHandler}
            handleUploadedFilesChanged={handleFileUploadFinished}
          />
          {getJSXerror(fieldObject)}
        </>
      );
    }

    if (fieldHeader.inputType === "file2") {
      return (
        <>
          <S3Uploader
            ref={(instance) => {
              fileUploadRefs2.current[jsxKey] = instance;
            }}
            rowId={fieldObject.index}
            colId="file2"
            onChange={changeHandler}
            handleUploadedFilesChanged={handleFileUploadFinished}
          />
          {getJSXerror(fieldObject)}
        </>
      );
    }

    return (
      <div>
        <input
          type="text"
          name={jsxKey}
          value={value}
          onChange={changeHandler}
          style={{
            minWidth: "20px",
            maxWidth: "100px",
          }}
        />
        {getJSXerror(fieldObject)}
      </div>
    );
  };

  const getFields = (props) => {
    const {
      colsCfg,
      nRows,
      existingRows,
      templateData,
      fileUploadRefs,
      fileUploadRefs2,
    } = props;

    console.log("TableFieldsGenerator props", props);
    console.log("TableFieldsGenerator colsCfg", colsCfg);
    console.log("TableFieldsGenerator nRows", nRows);

    const fieldInputComponents = [];
    const fieldObjects = [];

    const startIndex = existingRows ? existingRows : 0;
    const endIndex = existingRows ? nRows + existingRows : nRows;

    // Create a mapping from header names to column IDs, if templateData exists
    const headerToIdMap = {};
    if (templateData && templateData.length > 1) {
      console.log("templateData", templateData);
      const headers = Object.keys(templateData[0]).map((header) => header.trim());
      colsCfg.forEach((col) => {
        const headerIndex = headers.findIndex(
          (h) => h.toLowerCase() === col.title.toLowerCase()
        );
        if (headerIndex !== -1) {
          headerToIdMap[col.id] = headerIndex;
        }
      });
    }

    for (let i = startIndex; i < endIndex+1; i++) {
      const rowFieldObjects = [];
      const rowFieldInputComponents = {};

      // Initialize prefilled data for the current row if templateData exists
      const prefilledData = {};
      if (
        templateData &&
        templateData.length > 1 &&
        templateData[i - startIndex]
      ) {
        const row = Object.values(templateData[i - startIndex]);
        console.log("i", i);
        console.log("startIndex", startIndex);
        console.log("row", row);
        console.log("headerToIdMap", headerToIdMap);
        colsCfg.forEach((col) => {
          console.log("col", col);
          const dataIndex = headerToIdMap[col.id];  
          console.log("dataIndex", dataIndex);
          if (dataIndex !== -1 && dataIndex < row.length) {
            let value = row[dataIndex];
            console.log("value", value);
            // Handle specific default values if needed
            if (col.id === "datasetVisibilityDefault" && value) {
              value =
                value.toLowerCase() === "visible to all"
                  ? "visible to all"
                  : "private";
            }
            // convert numbers to string
            if (typeof value === "number") {
              value = value.toString();
            }
            prefilledData[col.id] = value;
          } else {
            //The file columns are not in the template data and expect empty arrays
            if (col.id.includes("file")) {
              prefilledData[col.id] = [];
            }
          }
        });
      }

      console.log("prefilledData", prefilledData);

      for (const colCfg of colsCfg) {
        let val = "";
        const boolCols = ["datasetVisibilityChangeable", "fileDlAllowed"];
        if (boolCols.includes(colCfg.id)) {
          val = true;
        }

        if (colCfg.id === "datasetVisibilityDefault") {
          val = "private";
        }

        console.log("colCfg", colCfg);

        // If templateData exists and has data for this row, use it
        if (
          prefilledData[colCfg.id] !== undefined &&
          prefilledData[colCfg.id] !== null
        ) {
          val = prefilledData[colCfg.id];

          // check if the value in the template data is in the allowed values
          if (colCfg.inputType === "select" && typeof val !== "boolean") {
            const allowedValues = colCfg.selection;
            if (!allowedValues.includes(val)) {
              alert(
                `
                The value ${val} is not in the allowed values for ${colCfg.title}.
                Thus, it has been set to ${allowedValues[0]}.
                `
              );
              val = allowedValues[0];
            }
          }
        }

        if (colCfg.id.includes("file")) {
          console.log("here");
        }

        const fieldObject = {
          id: colCfg.id,
          index: i,
          value: val,
          error: "",
        };
        rowFieldObjects.push(fieldObject);

        rowFieldInputComponents[colCfg.id] = createFieldInputComponent({
          fieldHeader: colCfg,
          fieldObject,
          value: null,
          fileUploadRefs,
          fileUploadRefs2,
        });
      }
      fieldObjects.push(rowFieldObjects);
      fieldInputComponents.push(rowFieldInputComponents);
    }
    console.group("Debugging");
    console.log("fieldObjects", fieldObjects);
    console.log("fieldInputComponents", fieldInputComponents);
    console.groupEnd();
    return [fieldObjects, fieldInputComponents];
  };

  const updateFields = ({
    colsCfg,
    fieldToBeUpdated,
    newValue,
    tableFieldsRef,
    fieldObjectsRef,
  }) => {
    console.log("updateFields fieldToBeUpdated", fieldToBeUpdated);
    console.log("updateFields newValue", newValue);

    const [id, index] = fieldToBeUpdated.split("-");
    console.log("id", id);
    console.log("index", index);

    // Create copies of the current form controls and table fields
    const currentFormControls = [...fieldObjectsRef.current];
    const currentTableFields = [...tableFieldsRef.current];

    console.log("currentFormControls", currentFormControls);

    // get the row of interest
    const rowControls = [...currentFormControls[index]];

    console.log("rowControls", rowControls);
    // Find the index of the field to be updated within the row
    const fieldControlIndex = rowControls.findIndex((item) => item.id === id);

    // Get the specific field control
    const fieldControl = { ...rowControls[fieldControlIndex] };
    console.log("fieldControl", fieldControl);

    // if (Array.isArray(fieldControl.value)) {
    //   console.log("isArray");
    //   const indexField = fieldControl.value.indexOf(newValue);
    //   console.log("indexField", indexField);
    //   if (indexField === -1) {
    //     console.log("pushing");
    //     fieldControl.value.push(newValue);
    //   } else {
    //     console.log("splicing");
    //     fieldControl.value.splice(indexField, 1);
    //   }
    // } else {
    //   fieldControl.value = newValue;
    // }

    fieldControl.value = newValue;
    if (fieldControl.value === "true" || fieldControl.value == "false") {
      fieldControl.value = JSON.parse(fieldControl.value);
    }

    // TODO
    // processing for file upload
    console.log("fieldControl.value", fieldControl.value);

    // Update the row controls with the updated field control
    rowControls[fieldControlIndex] = fieldControl;

    // Update the current form controls with the updated row controls
    currentFormControls[index] = rowControls;

    // Update the table fields with the updated form controls
    console.log("updateField colsCfg", colsCfg);

    currentTableFields[index][id] = createFieldInputComponent({
      fieldHeader: colsCfg.find((item) => item.id === id),
      fieldObject: fieldControl,
      value: null,
      fileUploadRefs,
      fileUploadRefs2,
    });
    return [currentFormControls, currentTableFields];
  };

  const prefillFields = ({ templateData, colsCfg }) => {
    const existingRows = null;
    const nRows = templateData.length - 1;
    const prefilledFields = getFields({
      colsCfg,
      nRows,
      existingRows,
      templateData,
      fileUploadRefs,
      fileUploadRefs2,
    });
    console.log("prefilledFields", prefilledFields);
    return prefilledFields;
  };

  if (props.event === "init") {
    const emptyFields = getFields({
      colsCfg: props.colsCfg,
      nRows: props.nRows,
      existingRows: null,
      templateData: null,
      fileUploadRefs,
      fileUploadRefs2,
    });
    console.log("TableFieldsGenerator fields", emptyFields);
    return emptyFields;
  }

  if (props.event === "add") {
    console.log("TableFieldsGenerator add");
    console.log("props", props);

    const existingRows = props.fieldObjects.length;
    console.log("existingRows", existingRows);

    const newFields = getFields({
      colsCfg: props.colsCfg,
      nRows: props.nRows,
      existingRows,
      templateData: null,
      fileUploadRefs,
      fileUploadRefs2,
    });
    console.log("TableFieldsGenerator fields", newFields);
    return newFields;
  }

  if (props.event === "prefill") {
    const prefilledFields = prefillFields(props);
    console.log("prefilledFields", prefilledFields);
    return prefilledFields;
  }

  //props.event === "update"
  const updatedFields = updateFields(props);
  console.log("updatedFields", updatedFields);
  return updatedFields;
};
export default TableFieldsGenerator;
