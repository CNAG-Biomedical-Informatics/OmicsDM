import React, { useState, useEffect, useMemo } from "react";
import { MenuItem, Select, Box } from "@mui/material";

import ReactQueryTable from "../../../components/dataTable/ReactQueryTable";

function getNestedValue(obj, keys) {
  return keys.reduce((acc, key) => acc?.[key], obj);
}

function setNestedValue(obj, keys, value) {
  // When there are no more keys, return the new value
  if (keys.length === 0) return value;

  const [firstKey, ...rest] = keys;
  return {
    ...obj,
    [firstKey]: setNestedValue(obj?.[firstKey] ?? {}, rest, value),
  };
}

const VersionSelectDropdown = ({
  row,
  versionOptions,
  selectedVersionsAndIds,
  setSelectedVersionsAndIds,
}) => {

  console.log("VersionSelectDropdown row", row);
  console.log("selectedVersionsAndIds", selectedVersionsAndIds);
  console.log("versionOptions", versionOptions);

  if (Object.keys(selectedVersionsAndIds).length === 0) {
    console.log("VersionSelectDropdown selectedVersionsAndIds is empty");
    return null;
  }

  // Destructure values from the row
  const { owner, project_id, dataset_id, name } = row.original;
  const keys = [owner, project_id, dataset_id, name];

  // Retrieve the available version options
  const fileIdsAndVersions = getNestedValue(versionOptions, keys)
  const currentSelection = getNestedValue(selectedVersionsAndIds, keys);
  console.log("fileIdsAndVersions", fileIdsAndVersions);
  console.log("currentSelection", currentSelection);

  // Handler to update the nested state when version changes
  // eg. { owner: { project_id: { dataset_id: { name: { fileId: 1, fileVersion: 1 }}}}}
  const handleVersionChange = (e) => {
    const { fileId, fileVersion } = e.target.value;
    console.log("handleVersionChange", fileId, fileVersion);
    setSelectedVersionsAndIds((prev) => setNestedValue(prev, keys, { fileId, fileVersion }));
  };

  // Memoize options so that their reference is stable
  const memoizedOptions = useMemo(() => fileIdsAndVersions, [fileIdsAndVersions]);

  // Ensure reference equality: find the option instance that matches currentSelection.
  const adjustedSelection = useMemo(() => {
    return (
      memoizedOptions.find(
        (item) =>
          item.fileId === currentSelection.fileId &&
          item.fileVersion === currentSelection.fileVersion
      ) || currentSelection
    );
  }, [currentSelection, memoizedOptions]);

  return (
    <Select
      value={adjustedSelection}
      onChange={handleVersionChange}
      renderValue={(selected) => selected.fileVersion}
    >
      {memoizedOptions.map((item) => (
        <MenuItem key={item.fileId} value={item}>
          {item.fileVersion}
        </MenuItem>
      ))}
    </Select>
  );
};

export default function SelectFiles(props) {

  console.log("SelectFiles props", props);

  const {
    rowSelection,
    selectedVersionsAndIds,
    versionOptions,
    setRowSelection,
    setFilesSelected,
    setSelectedVersionsAndIds,
    setVersionOptions
  } = props;

  // initial table render
  const [returnedJson, setReturnedJson] = useState(null);
  const [tableData, setTableData] = useState({});

  // to force a re-render of the table otherwise the version selection is not working
  const [tableKey, setTableKey] = useState("analysis-submission-file-selection-table-render-1");

  const [columnFilters, setColumnFilters] = useState([]);

  //table cols including the version selection column
  const tableCols = useMemo(
    () => {
      console.log("useMemo versionOptions", versionOptions);
      return [
        {
          accessorKey: "id",
          header: "File ID",
        },
        {
          accessorKey: "owner",
          header: "Owner",
        },
        {
          accessorKey: "project_id",
          header: "Project ID",
        },
        {
          accessorKey: "dataset_id",
          header: "Dataset ID",
        },
        {
          accessorKey: "name",
          header: "File",
        },
        {
          accessorKey: "version",
          header: "Version",
          enableColumnFilter: false,
          Cell: ({ row }) => {
            return (
              <VersionSelectDropdown
                row={row}
                versionOptions={versionOptions}
                selectedVersionsAndIds={selectedVersionsAndIds}
                setSelectedVersionsAndIds={setSelectedVersionsAndIds}
              />
            );
          }
        }
      ];
    }, [versionOptions, selectedVersionsAndIds]);
  //       Cell: ({ row }) => {
  //         const { owner, project_id, dataset_id, name } = row.original;

  //         const fileIdsAndVersions = versionOptions?.[owner]?.[project_id]?.[dataset_id]?.[name] || {};
  //         console.log("fileIdsAndVersions", fileIdsAndVersions);
  //         // objects looks as follows inside the array: {"fileId": 47,"fileVersion": 1}

  //         const handleVersionChange = (e) => {
  //           const { fileId, fileVersion } = e.target.value;
  //           setSelectedVersionsAndIds((prev) => ({
  //             ...prev,
  //             [owner]: {
  //               ...prev[owner],
  //               [project_id]: {
  //                 ...prev[owner]?.[project_id],
  //                 [dataset_id]: {
  //                   ...prev[owner]?.[project_id]?.[dataset_id],
  //                   [name]: {
  //                     fileId,
  //                     fileVersion,
  //                   },
  //                 },
  //               },
  //             },
  //           }));
  //         };
  //         return (
  //           <Select
  //             value={selectedVersionsAndIds?.[owner]?.[project_id]?.[dataset_id]?.[name]}
  //             onChange={handleVersionChange}
  //             renderValue={(selected) => selected.fileVersion}
  //           >
  //             {
  //               fileIdsAndVersions.length > 0 ? (
  //                 // loop over fileIdsAndVersions where the key is the fileId and the value is the version
  //                 fileIdsAndVersions.map((fileIdAndVersion) => (
  //                   <MenuItem value={fileIdAndVersion}>
  //                     {fileIdAndVersion.fileVersion}
  //                   </MenuItem>
  //                 ))
  //               ) : (
  //                 <MenuItem disabled>Loading...</MenuItem>
  //               )
  //             }
  //           </Select >
  //         );
  //       },
  //     },
  //   ]
  // }, [versionOptions, selectedVersionsAndIds]);

  // Deduplicate the tableData based on the combination of keys
  const deduplicateData = (json) => {
    const seen = new Set();
    return json.items.filter((item) => {
      const key = `${item.owner}-${item.project_id}-${item.dataset_id}-${item.name}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  };

  // populate and update the version selection column
  useEffect(() => {
    console.log("returnedJson", returnedJson);
    if (!returnedJson) return;

    const updatedVersions = {};
    returnedJson.items.forEach((file) => {
      if (!updatedVersions[file.owner]) {
        updatedVersions[file.owner] = {};
      }
      if (!updatedVersions[file.owner][file.project_id]) {
        updatedVersions[file.owner][file.project_id] = {};
      }
      if (!updatedVersions[file.owner][file.project_id][file.dataset_id]) {
        updatedVersions[file.owner][file.project_id][file.dataset_id] = {};
      }
      if (!updatedVersions[file.owner][file.project_id][file.dataset_id][file.name]) {
        updatedVersions[file.owner][file.project_id][file.dataset_id][file.name] = [];
      }

      const fileVersionAndFileId = {};
      fileVersionAndFileId["fileId"] = file.id;
      fileVersionAndFileId["fileVersion"] = file.version;

      updatedVersions[file.owner][file.project_id][file.dataset_id][file.name].push(fileVersionAndFileId);
    });

    // deep copy updatedVersions into selectedVersionsAndIds
    const newSelectedVersionsAndIds = JSON.parse(JSON.stringify(updatedVersions));

    // and update the selectedVersionsAndIds state but only if the version is not already set
    // in that way that the highest version is selected by default
    Object.keys(newSelectedVersionsAndIds).forEach((owner) => {
      Object.keys(newSelectedVersionsAndIds[owner]).forEach((project_id) => {
        Object.keys(newSelectedVersionsAndIds[owner][project_id]).forEach((dataset_id) => {
          Object.keys(newSelectedVersionsAndIds[owner][project_id][dataset_id]).forEach((name) => {
            const fileIdsAndVersions = newSelectedVersionsAndIds[owner][project_id][dataset_id][name];
            console.log("HERE fileIdsAndVersions", fileIdsAndVersions);
            if (fileIdsAndVersions.length > 0) {
              const highestVersion = Math.max(...fileIdsAndVersions.map(f => f.fileVersion));
              const fileId = fileIdsAndVersions.find(f => f.fileVersion === highestVersion).fileId;
              if (!selectedVersionsAndIds[owner]?.[project_id]?.[dataset_id]?.[name]) {
                newSelectedVersionsAndIds[owner][project_id][dataset_id][name] = {
                  fileId,
                  fileVersion: highestVersion
                };
              } else {
                newSelectedVersionsAndIds[owner][project_id][dataset_id][name] = selectedVersionsAndIds[owner][project_id][dataset_id][name];
              }
            }
          });
        });
      });
    });

    console.log("newSelectedVersionsAndIds", newSelectedVersionsAndIds);

    setSelectedVersionsAndIds(newSelectedVersionsAndIds);

    console.log("updatedVersions", updatedVersions);
    setVersionOptions(updatedVersions);

    const deduplicatedData = deduplicateData(returnedJson);
    setTableData({ ...returnedJson, items: deduplicatedData });
  }, [returnedJson]);

  // to force a re-render of the table otherwise the version selection is not working
  useEffect(() => {
    // get current tableKey and extract the number
    const tableKeyNumber = parseInt(tableKey.split("-").pop());
    const newTableKeyNumber = tableKeyNumber + 1;
    const newTableKey = `analysis-submission-file-selection-table-render-${newTableKeyNumber}`;
    setTableKey(newTableKey);
  }, [versionOptions, selectedVersionsAndIds]);

  useEffect(() => {
    console.log("useEffect after rowSelection");
    console.info({ rowSelection });
    console.info({ selectedVersionsAndIds });

    // update each rowSelectionValue with the selected version
    // loop over rowSelection
    const rowIdToSelectedVersionAndFileId = {};
    Object.keys(rowSelection).forEach((rowId) => {
      const [owner, project_id, dataset_id, name] = rowId.split("?");

      rowIdToSelectedVersionAndFileId[rowId] = {};
      // get the selected version for this row
      const versionAndId = selectedVersionsAndIds?.[owner]?.[project_id]?.[dataset_id]?.[name];
      rowIdToSelectedVersionAndFileId[rowId] = versionAndId;
    });
    console.info({ rowIdToSelectedVersionAndFileId }); //read your managed row selection state
    setFilesSelected(rowIdToSelectedVersionAndFileId);
  }, [rowSelection, selectedVersionsAndIds])

  return (
    <Box display="flex" justifyContent="center">
      <Box width="90%">
        <br />
        <ReactQueryTable
          key={tableKey} // forces a re-render
          queryId="analysis-submission-file-selection-table"
          tableCols={tableCols}
          tableData={tableData}
          endpoint={"files/all"}
          enableRowSelection={true}
          onRowSelectionChange={setRowSelection}
          rowSelection={rowSelection}
          rowIdKeys={["owner", "project_id", "dataset_id", "name"]}
          setReturnedJson={setReturnedJson}
          enablePagination={false}
          defaultPageSize={100}
          enableHiding={false}
          columnFilters={columnFilters}
          setColumnFilters={setColumnFilters}
          rowSelectionRequired={true}
        />
      </Box>
    </Box>
  );
}