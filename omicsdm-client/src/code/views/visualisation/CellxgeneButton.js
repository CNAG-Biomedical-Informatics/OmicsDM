import React from "react";
import PropTypes from "prop-types";
import { IconButton } from "@mui/material";

// import toast from "react-hot-toast";

import { useSnackbar } from "../../snackbarContext";
import HTTPError from "../../apis";
import { requestJson, datasetVisualization } from "../../apis";
import auth from "../../Auth";

const { config } = window;
import CELLXGENE_LOGO from "../../../img/cellxgene_logo.png";

// CellxgeneButton as a React component
const CellxgeneButton = ({
  fileOrAnalysis,
  // setSnackbarOpen,
  // setSnackbarMessage,
}) => {
  // if (file.visualizer !== "cellxgene") {
  //   return <div />;
  // }

  const snackbar = useSnackbar();

  let payload = {};
  if (fileOrAnalysis.isAnalysisResult) {
    payload["isAnalysisResult"] = true;
    payload["analysis_id"] = fileOrAnalysis.analysis_id;
    payload["file_name"] = "data_scored.h5ad";
    payload["analysis"] = fileOrAnalysis.analysis;
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
    snackbar.info("Starting cellxgene instance...");
    try {
      const data = await requestJson(() =>
        datasetVisualization(
          auth.getToken(),
          config.api_endpoint,
          JSON.stringify(payload)
        )
      );

      window.open(`${data.shiny_proxy_url}`);

      const snackbar_msg = (
        <span>
          cellxgene instance opened in a new tab at{" "}
          <a
            href={data.shiny_proxy_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {data.shiny_proxy_url}
          </a>
        </span>
      );

      snackbar.success(snackbar_msg, { autoHideDuration: 8000 });

      // setSnackbarMessage(snackbar_msg);

      // console.log("cellxgene parsed:", data);
      // window.open(`${data.shiny_proxy_url}`);
      // alert(
      //   `cellxgene instance opened in a new tab at ${data.shiny_proxy_url}`
      // );
    } catch (err) {
      // HTTP-level errors: server responded with a status (e.g., 400/500)
      if (err instanceof HTTPError) {
        const msg =
          err.parsed?.message || // preferred: API-provided message
          err.bodyText || // fallback: raw body
          err.message; // final fallback: "HTTP 500 ..."
        console.error("cellxgene HTTP error:", err.response.status, msg);

        snackbar.error(msg);
        return;
      }

      // Network/runtime-level errors: no Response object
      // (fetch throws TypeError on network failure; AbortError on aborts)
      if (err?.name === "AbortError") {
        console.error("Request aborted:", err);
        alert("Request was canceled. Please try again.");
      } else {
        console.error("Network or runtime error:", err);
        alert(
          "Network or runtime error. Please check the console for details."
        );
      }
    }
  };

  // state setters are examples; adjust to your hooks/state
  const handleClick2 = async () => {
    try {
      const res = await datasetVisualization(
        auth.getToken(),
        config.api_endpoint,
        JSON.stringify(payload)
      );
      // Peek the raw body without consuming the main stream
      const raw = await res.clone().text();
      console.log("cellxgene status:", res.status, res.statusText);
      console.log("cellxgene raw:", raw);

      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);

      const data = await res.json(); // <- this awaits the server response
      console.log("cellxgene parsed:", data);

      window.open(`${data.shiny_proxy_url}`);
      alert(
        `cellxgene instance opened in a new tab at ${data.shiny_proxy_url}`
      );
    } catch (err) {
      const errorData = await res.json();
      console.error("cellxgene fetch failed:", err);
      alert(errorData.message);
    }
  };

  const handleClick3 = async () => {
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
      // console.log(response);
      // console.log("response.status", response.status);
      // console.log("response.json()", response.json());
      // const json = await response.json();
      // console.log("json", json);
      const msg = await response.text();
      // console.log("msg", msg);
      if (response.status === 200) {
        const data = await JSON.parse(msg);
        console.log("JSON.parse(msg)", JSON.parse(msg));
        console.log(data.shiny_proxy_url);
        window.open(`${data.shiny_proxy_url}`);
        alert(
          `HERE 3 cellxgene instance opened in a new tab at ${data.shiny_proxy_url}`
        );
      } else {
        alert(`Server error: ${response.status} with message: ${msg}`);
      }
    } catch (err) {
      if (err instanceof TypeError && msg === null) {
        console.error("response", response);
        return;
      }
      alert(`Server is not responding !!: ${err}`);
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
      onClick={(e) => {
        // e.preventDefault();
        // e.stopPropagation();
        handleClick();
      }}
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
