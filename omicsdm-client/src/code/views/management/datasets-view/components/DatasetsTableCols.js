import React from "react";
import { extraFileDownload } from "../../../../apis";
import auth from "../../../../Auth";
import {
  moveSpecificColsToTheFront,
  getTableCols,
} from "../../../components/dataTable/utils";

const { config } = window;

// Helper function to render the download link
const renderFileLink = ({ cell, key }) => {
  console.log("renderFileLink", key, cell);

  const fileType = key === "policy_file" ? "dataPolicy" : "clinical";
  const fileName = cell.getValue();

  if (!fileName || fileName.length === 0) return "";
  return (
    <a
      href="#"
      onClick={async (e) => {
        e.preventDefault();
        const query = {
          datasetId: cell.row.original.id,
          fileType,
        };
        const res = await extraFileDownload(
          auth.getToken(),
          config.api_endpoint,
          JSON.stringify(query)
        );
        if (res.status !== 200) return;
        const data = await res.json();
        window.open(data.presigned_url, "_self");
      }}
    >
      {fileName[0]}
    </a>
  );
};

const getDatasetViewTableCols = (colHeaders) => {
  const toBeModifiedAndMovedCols = ["policy_file", "clinical_file"];
  const cols = getTableCols(
    colHeaders,
    toBeModifiedAndMovedCols,
    renderFileLink
  );
  return moveSpecificColsToTheFront(cols, toBeModifiedAndMovedCols);
};

export default getDatasetViewTableCols;
