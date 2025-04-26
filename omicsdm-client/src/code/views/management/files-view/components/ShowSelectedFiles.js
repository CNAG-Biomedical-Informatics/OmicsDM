import React from "react";

import OMICSDM_BUTTON from "../../../components/buttonCollection/buttons";

import ShowFileDeletion from "./ShowFileDeletion";

// use this to show the Download URLs
export default function showSelectedFiles(props) {

  const { selected, handleFileDeleteConfirmed } = props;

  return (
    <div className={"actionContainer"}>
      <span style={{ marginLeft: "10px" }}>
        Files Selected: {Object.keys(selected).length}
      </span>
      {Object.keys(selected).length > 0 ? (
        // Open Dialog
        <ShowFileDeletion
          selected={selected}
          onConfirm={handleFileDeleteConfirmed}
        />
      ) : (
        // Buttons are set to disabled if no row is selected
        <OMICSDM_BUTTON
          disabled={true}
          style={{ marginLeft: "10px", background: "darkred" }}
        >
          Delete Files
        </OMICSDM_BUTTON>
      )}
    </div>
  );
}
