import React from "react";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

import { datasetVisualization } from "../../apis";
import auth from "../../Auth";

const { config } = window;

export const updateTable = (
  columns,
  shownColumns,
  headers,
  objs,
  defaultColumnsBool
) => {
  //Translate API Data result to data and columns for the table
  for (const header of headers) {
    const column = {};
    column.Header =
      "tooltip" in header
        ? () => (
          <span title={header.tooltip}>
            {header.label}{" "}
            <i className="fa fa-comment-o" aria-hidden="true" />
          </span>
        )
        : header.label;
    column.accessor = header.key;

    // Note: "show" is deprecated so React Table cannot be updated (tested version: 6.10)
    column.show = header.hidden || header.hidden !== undefined ? false : true;
    if (shownColumns.length > 0) {
      column.show =
        shownColumns.includes(column.accessor) || column.id !== undefined
          ? true
          : false;
    }
    column["minWidth"] = 100;

    // 

    if (column.accessor === "healthyControllsIncluded") {


      column.Filter = ({ filter, onChange }) => (
        <select
          onChange={(event) => onChange(event.target.value)}
          style={{ width: "100%" }}
          value={filter ? filter.value : "all"}
          data-cy="healthyControllsIncluded-dropdown"
        >
          <option value="">all</option>
          <option value="True">True</option>
          <option value="False">False</option>
        </select>
      );
      column.filterMethod = (filter, rows) =>
        matchSorter(rows, filter.value, { keys: ["index"] });
      column.filterAll = true;
    }

    if (column.accessor === "visibility") {


      column.Filter = ({ filter, onChange }) => (
        <select
          onChange={(event) => onChange(event.target.value)}
          style={{ width: "100%" }}
          value={filter ? filter.value : "all"}
          data-cy="visibility-dropdown"
        >
          <option value="">all</option>
          <option value="visible to all">visible to all</option>
          <option value="private">private</option>
        </select>
      );
      column.filterMethod = (filter, rows) =>
        matchSorter(rows, filter.value, { keys: ["index"] });
      column.filterAll = true;
    }

    columns.push(column);

    // remove the last column (data policy)

  }

  //Build data to render on in a table
  const data = [];

  for (let obj of objs) {
    const row = {};
    //1. Loop Headers
    for (let column of columns) {
      row[column.accessor] = obj[column.accessor];
    }
    //2. Add isUserOwner and owner kc group name
    row.isUserOwner = obj.isUserOwner;
    row.owner = obj.owner;

    //3. Add row to data
    data.push(row);
  }
  return [columns, data];
};

/**
 * toggle checkbox in a row
 *
 * @param   {Object}   rowObj  all elements of the toggled row
 * @param   {Object}   selectedArr  current selected rows
 * @return  {string[]}        List of selected row ids
 *
 * @example <caption>select a row</caption>
 * row1 = {
    "isUserOwner": true,
    "id": "t",
    "name": "test",
    "desc": "lorem ipsum",
    "tags": "a,b",
    "partners": "xy,zz",
    "disease": "COPD",
    "treatment": "drugA",
    "cat": "Sequencing, genotyping, arrays",
    "visibility": "private",
    "submitter_name": "test",
    "shared_with": "3tr",
    "owner": "3tr"
    }
 * toggleRow(row1,[])
 * -> returns [row]
 *
 * @example <caption>deselect a row</caption>
 * togggleRow(row1,[row1])
 * -> returns []
 */
export const toggleRow = (rowObj, selectedArr) => {
  const selectedIndex = selectedArr.findIndex((x) => x.id === rowObj.id);

  if (selectedIndex === -1) {
    selectedArr.push(rowObj);
  } else {
    selectedArr.splice(selectedIndex, 1);
  }
  return selectedArr;
};

/**
 * toggle all checkboxes
 *
 * @param   {integer}   selectAll  code for rows selected (0:all,1:none,2:one/multiple)
 * @param   {Object}    rows  table rows
 * @return  {string[]}        List of selected row ids
 *
 * @example <caption>select all rows</caption>
 * toggleSelectAll(0,["3tr_test_testfile1.csv_v1","3tr_test_testfile1.csv_v2"])
 * -> returns ["3tr_test_testfile1.csv_v1","3tr_test_testfile1.csv_v2"]
 *
 * @example <caption>deselect all rows</caption>
 * toggleSelectAll(1,["3tr_test_testfile1.csv_v1","3tr_test_testfile1.csv_v2"])
 * -> returns []
 */
export const toggleSelectAll = (selectAll, rows) => {
  let newSelected = [];
  //Update all checkboxes as checked
  if (selectAll === 0) {
    // only add to newSelected if user is owner
    for (let row of rows) {
      newSelected.push(row);
      // if (row.isUserOwner) {
      //   newSelected.push(row);
      // }
    }
  }
  return newSelected;
};

export const isSelected = (unique_id, selectedObj) =>
  // FIXME
  // the selection in the dataset view is wrong because it is based on the dataset_id
  // and not on the row id
  // => meaning the dataset id can be not unique

  // but this is only a problem with showing if selected
  // not a problem with the selection because that one is correct
  selectedObj.findIndex((x) => x.id === unique_id) !== -1;

export const createIconOwner = () => ({
  // TODO
  // change the id from checkbox to owner
  // do not forget to change it on the server as well!
  id: "checkbox",

  Cell: ({ original }) => {
    if (original.isUserOwner) {
      return <AccountCircleIcon />;
    }
    return original.owner;
  },
  Header: (x) => {
    return <div>Owner</div>;
  },
  sortable: true,
  filterable: true,
  width: 60,
});

export const createRowButton = () => ({
  id: "rowButton",
  Cell: ({ original }) => {
    if (original.visualizer === "cellxgene") {
      return (
        <icon className="cellxgene"
          onClick={async () => {
            console.log("cellxgene button clicked")
            try {
              const response = await datasetVisualization(
                auth.getToken(),
                config.api_endpoint,
                JSON.stringify({
                  'dataset_owner': original.owner,
                  'dataset_id': original.dataset_id,
                  'file_name': original.name,
                  'file_version': original.version
                })
              )
              console.log(response)
              const msg = await response.text();
              if (response.status !== 200) {
                alert("Server error: " + response.status + " with message: " + msg);
              } else {
                const url = await JSON.parse(msg).data
                console.log(url)
                window.open(
                  `${url}`
                );
                alert("cellxgene instance opened in a new tab at " + url)
              }
            } catch (err) {
              alert("Server is not responding: ", err);
            }
          }}
        />
      );
    } else {
      // if no visualizer is available
      return <div />;
    }
  },
  Header: (x) => {
    return <div>Visualizer</div>;
  },
  sortable: false,
  filterable: false,
  width: 120,
});
