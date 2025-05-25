import React from "react";
import { IconButton } from "@mui/material";
import { datasetVisualization } from "../../../../apis";
import auth from "../../../../Auth";
import {
  moveSpecificColsToTheFront,
  getTableCols,
} from "../../../components/dataTable/utils";

const { config } = window;
import CELLXGENE_LOGO from "../../../../../img/cellxgene_logo.png";

import { renderCellxgeneButtonInsideTable } from "../../../visualisation/CellxgeneButton";

// Helper function to render the download link
// const renderCellxgeneButton = ({ cell }) => {
//   const file = cell.row.original;

//   if (file.visualizer !== "cellxgene") {
//     return <div />;
//   }

//   return (
//     <IconButton
//       size="small"
//       style={{
//         backgroundColor: "white",
//         borderRadius: "50%",
//         padding: "4px",
//         marginRight: "8px",
//       }}
//       onClick={async () => {
//         console.log("cellxgene button clicked");
//         try {
//           const response = await datasetVisualization(
//             auth.getToken(),
//             config.api_endpoint,
//             JSON.stringify({
//               dataset_owner: file.owner,
//               dataset_id: file.dataset_id,
//               file_name: file.name,
//               file_version: file.version,
//             })
//           );
//           console.log(response);
//           const msg = await response.text();
//           if (response.status === 200) {
//             const url = await JSON.parse(msg).data;
//             console.log(url);
//             window.open(`${url}`);
//             alert(`cellxgene instance opened in a new tab at ${url}`);
//           } else {
//             alert(`Server error: ${response.status} with message: ${msg}`);
//           }
//         } catch (err) {
//           alert(`Server is not responding: ${err}`);
//         }
//       }}
//     >
//       <img
//         src={CELLXGENE_LOGO}
//         alt="CELLXGENE_LOGO"
//         style={{ width: "24px", height: "24px" }}
//       />
//     </IconButton>
//   );
// };

const getFilesViewTableCols = (colHeaders) => {
  const toBeModifiedAndMovedCols = ["visualizer"];
  const cols = getTableCols(
    colHeaders,
    toBeModifiedAndMovedCols,
    renderCellxgeneButtonInsideTable
  );
  return moveSpecificColsToTheFront(cols, toBeModifiedAndMovedCols);
};

export default getFilesViewTableCols;
