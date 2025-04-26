import React, { useState, useEffect, useMemo } from "react";
import { Navigate, useLocation } from "react-router";
import Grid from "@mui/material/Grid";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Popup from "reactjs-popup";

import ReactQueryTable from "../../components/dataTable/ReactQueryTable";

// Datasets Table specific imports
import getDatasetsViewTableCols from "../datasets-view/components/DatasetsTableCols";
import ShareDataMenu from "../datasets-view/components/ShareDataMenu";
import ShareDataDialogContent from "../datasets-view/components/ShareDataDialogContent";
import NavigateToFilesView from "../datasets-view/components/NavigateToFilesView";

// Files Table specific imports
import ShowSelectedFiles from "../files-view/components/ShowSelectedFiles";
import getFilesViewTableCols from "../files-view/components/FilesTableCols";
import {
  OpenDownloadLinksDialogBtn,
  DownloadLinksDialogContent,
} from "../files-view/components/DownloadLinksDialogContent";
import {
  DeleteFilesDialogBtn,
  DeleteFilesDialogContent,
} from "../files-view/components/DeleteFilesDialogContent";

// Admin View specific imports
import { getTableCols } from "../../components/dataTable/utils";
import {
  ColValuesUpdateExplanation,
  ColValuesUpdateDialogContent,
} from "../admin-view/components/ColValuesUpdateDialogContent";

import { getViewCols } from "../../../apis";
import auth from "../../../Auth";

const { config, playgroundCfg } = window;
const visiblecColumnsMap = playgroundCfg.dataManagement.colVisbililty;
console.log("visiblecColumnsMap", visiblecColumnsMap);

const topToolbarComponentsMap = {
  datasets: [[ShareDataMenu, ShareDataDialogContent], NavigateToFilesView],
  files: [
    [OpenDownloadLinksDialogBtn, DownloadLinksDialogContent],
    [DeleteFilesDialogBtn, DeleteFilesDialogContent],
  ],
  admin: [[ColValuesUpdateExplanation, ColValuesUpdateDialogContent]],
};

const TableViewFunctional = () => {
  const location = useLocation();

  const [view, setView] = useState(location.pathname.split("/")[1]);

  const [columnFilters, setColumnFilters] = useState([]);
  const [tableCols, setTableCols] = useState(
    useMemo(() => {
      return [
        {
          accessorKey: "id",
          header: "ID",
        },
      ];
    })
  );
  const [tableData, setTableData] = useState([]);
  const [returnedJson, setReturnedJson] = useState([]);

  const [selected, setSelected] = useState([]);
  const [popupErrors, setPopupErrors] = useState("");
  const [initialized, setInitialized] = useState(false);

  const [sharingAction, setSharingAction] = useState(""); //datasets table specific
  const [topToolbarBtnClicked, setTopToolbarBtnClicked] = useState(""); //files table specific
  const [clickedRowAnalysisId, setClickedRowAnalysisId] = useState(""); //analysis table specific

  const viewSpecificStateAndSetterMap = {
    datasets: [sharingAction, setSharingAction],
    files: [topToolbarBtnClicked, setTopToolbarBtnClicked],
  };

  // admin view specific
  const [modifiableFields, setModifiableFields] = useState([]);

  // Fetch view columns from the API
  const getViewColsFunc = async () => {
    // Note: location.pathname is used
    // because the state view is not update before function call

    const urlPath = location.pathname;
    console.log("getViewColsFunc urlPath", urlPath);
    console.log("getViewColsFunc view", view);
    const submissionLevel = urlPath.split("/")[2];

    const apiUrlSuffix = urlPath.includes("analyses")
      ? "/analysis/viewcols"
      : location.pathname.includes("admin")
        ? `/${submissionLevel}/adminviewcols`
        : `${urlPath}/viewcols`; //default

    try {
      const response = await getViewCols(
        auth.getToken(),
        config.api_endpoint,
        apiUrlSuffix
      );
      const jsonData = await response.json();

      const tableColsMap = {
        admin: getTableCols, // has to be first otherwise the find will not work
        datasets: getDatasetsViewTableCols,
        files: getFilesViewTableCols,
        analyses: getFilesViewTableCols,
      };

      const tableType = Object.keys(tableColsMap).find((key) =>
        urlPath.includes(key)
      );

      console.log("tableType", tableType);

      const colsHeaders = jsonData[0].headers;
      const cols = tableColsMap[tableType](colsHeaders);
      if (tableType === "admin") {
        const modifiableFields =
          submissionLevel === "files"
            ? colsHeaders.slice(1)
            : colsHeaders.slice(2);
        setModifiableFields(modifiableFields);
      }

      // add a ownership column as the first column
      const ownershipCol = {
        accessorKey: "owner",
        header: "",
        size: 60,
        Cell: ({ row }) => {
          if (row.original.isUserOwner) {
            return <AccountCircleIcon />;
          }
          return row.original.owner;
        },
      };
      setTableCols([ownershipCol, ...cols]);
    } catch (error) {
      console.log("error", error);
    }
  };

  // Initialization
  useEffect(() => {
    console.log("TableViewFunctional useEffect");
    console.log("location", location);
    const initialize = async () => {
      if (auth.tokenExpired()) {
        setPopupErrors("Session expired. Please login again");
      }
      await getViewColsFunc();

      // If redirected from dataset view
      console.log("location", location);
      if (location.state) {
        const { newColumnFilters } = location.state;
        setColumnFilters(newColumnFilters);
      }
      setInitialized(true);
    };
    initialize();
  }, [location]);

  // Files view delete handler
  const handleFileDeleteConfirmed = () => {
    // const { page, pageSize, filtered, sorted } = pagination;
    // const data_query = { page, pageSize, filtered, sorted };
    // getData(data_query, filtered, sorted);
    setSelected([]);
  };

  const onRowClickRedirect =
    view === "analyses"
      ? ({ row }) => {
          setClickedRowAnalysisId(row.original.analysis_id);
        }
      : null;

  useEffect(() => {
    console.log("returnedJson", returnedJson);
    if (!returnedJson) return;
    setTableData(returnedJson);
  }, [returnedJson]);

  useEffect(() => {
    setView(location.pathname.split("/")[1]);
    setSelected([]);
    setColumnFilters([]);
    setInitialized(false);
    setModifiableFields([]);
  }, [location]);

  useEffect(() => {
    setSelected([]);
  }, [columnFilters]);

  // Render error popup if needed
  if (popupErrors) {
    return (
      <Popup open={true} closeOnDocumentClick onClose={closeModal}>
        <div>
          <button className="close" onClick={closeModal}>
            &times;
          </button>
          <div className="page-header">
            <h1>Logging error</h1>
          </div>
          <div className="alert alert-warning">{popupErrors}</div>
        </div>
      </Popup>
    );
  }
  // Modal closing handler
  const closeModal = () => {
    if (popupErrors === "Session expired. Please login again") {
      auth.user.keycloak.logout();
    }
    setPopupErrors("");
  };

  // Redirect for analysis view
  if (clickedRowAnalysisId !== "") {
    return <Navigate to={{ pathname: `${clickedRowAnalysisId}` }} />;
  }

  const endpoint =
    view === "admin"
      ? `${location.pathname.split("/")[2]}/admin/view`
      : view === "analyses"
        ? "analysis/data"
        : `${view}/all`;

  const topToolbarComponents = topToolbarComponentsMap?.[view]
    ? topToolbarComponentsMap[view].map((item) => {
        if (Array.isArray(item)) {
          return item[0];
        }
        return item;
      })
    : [];

  const dialogComponentsMap = { [view]: {} };
  if (view === "files") {
    console.log("HERE");
    dialogComponentsMap[view]["delete"] = DeleteFilesDialogContent;
    dialogComponentsMap[view]["download"] = DownloadLinksDialogContent;
    console.log("dialogComponentsMap", dialogComponentsMap);
  } else if (view === "datasets") {
    dialogComponentsMap[view] = topToolbarComponentsMap?.[view][0][1] || [];
  }

  console.log("topToolbarComponents", topToolbarComponents);
  console.log("dialogComponentsMap2", dialogComponentsMap);

  return (
    <Grid container>
      {/* {view === "files" && (
        <ShowSelectedFiles
          selected={selected}
          handleFileDeleteConfirmed={handleFileDeleteConfirmed}
        />
      )} */}
      {initialized && (
        <Grid item xs={12}>
          <ReactQueryTable
            queryId={view + -"table"}
            tableCols={tableCols}
            tableData={tableData}
            endpoint={endpoint}
            enableRowSelection={true}
            onRowSelectionChange={setSelected}
            rowSelection={selected}
            rowIdKeys={["id"]}
            setReturnedJson={setReturnedJson}
            enablePagination={true}
            topToolbarComponents={topToolbarComponents}
            dialogComponentsMap={dialogComponentsMap?.[view] || []}
            viewSpecificStateAndSetter={
              viewSpecificStateAndSetterMap?.[view] || []
            }
            enableHiding={true}
            columnFilters={columnFilters}
            setColumnFilters={setColumnFilters}
            columnVisibility={visiblecColumnsMap?.[view] || {}}
            onRowClick={onRowClickRedirect}
            modifiableFields={modifiableFields}
          />
        </Grid>
      )}
    </Grid>
  );
};

export default TableViewFunctional;
