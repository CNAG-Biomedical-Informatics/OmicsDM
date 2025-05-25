import React from "react";
import PropTypes from "prop-types";
import { IconButton } from "@mui/material";
import { datasetVisualization } from "../../apis";
import auth from "../../Auth";

const { config } = window;
import CELLXGENE_LOGO from "../../../img/cellxgene_logo.png";

// CellxgeneButton as a React component
const CellxgeneButton = ({ fileOrAnalysis }) => {
  // if (file.visualizer !== "cellxgene") {
  //   return <div />;
  // }

  let payload = {};
  if (fileOrAnalysis.isAnalysisResult) {
    payload["isAnalysisResult"] = true;
    payload["analysis_id"] = "3tr_sgfeg4g4444";
    payload["file_name"] = "data_scored.h5ad";
  } else {
    payload = {
      dataset_owner: fileOrAnalysis.owner,
      dataset_id: fileOrAnalysis.dataset_id,
      file_name: fileOrAnalysis.name,
      file_version: fileOrAnalysis.version,
    };
  }
  console.log("payload", payload);

  const handleClick = async () => {
    console.log("cellxgene button clicked");
    try {
      const response = await datasetVisualization(
        auth.getToken(),
        config.api_endpoint,
        // JSON.stringify({
        //   dataset_owner: fileOrAnalysis.owner,
        //   dataset_id: fileOrAnalysis.dataset_id,
        //   file_name: fileOrAnalysis.name,
        //   file_version: fileOrAnalysis.version,
        // })
        JSON.stringify(payload)
      );
      console.log(response);
      const msg = await response.text();
      if (response.status === 200) {
        const url = await JSON.parse(msg).data;
        console.log(url);
        window.open(`${url}`);
        alert(`cellxgene instance opened in a new tab at ${url}`);
      } else {
        alert(`Server error: ${response.status} with message: ${msg}`);
      }
    } catch (err) {
      alert(`Server is not responding: ${err}`);
    }
  };

  return (
    <IconButton
      size="small"
      style={{
        backgroundColor: "white",
        borderRadius: "50%",
        padding: "4px",
        marginRight: "8px",
      }}
      onClick={handleClick}
    >
      <img
        src={CELLXGENE_LOGO}
        alt="CELLXGENE_LOGO"
        style={{ width: "24px", height: "24px" }}
      />
    </IconButton>
  );
};

CellxgeneButton.propTypes = {
  file: PropTypes.shape({
    visualizer: PropTypes.string.isRequired,
    owner: PropTypes.string.isRequired,
    dataset_id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    version: PropTypes.string.isRequired,
  }).isRequired,
};

// Helper function for table usage
export const renderCellxgeneButtonInsideTable = ({ cell }) => {
  if (cell.row.original.visualizer !== "cellxgene") {
    return <div />;
  }
  return <CellxgeneButton fileOrAnalysis={cell.row.original} />;
};

export default CellxgeneButton;
