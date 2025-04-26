// use this to show download links for selected files
import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

import ReactTable from "react-table";

import { MaterialReactTable } from "material-react-table";

import { TableWithDeleteRowButton } from "../../../components/dataTable/DataTable";

import { OMICSDM_BUTTON_LIGHT } from "../../../components/buttonCollection/buttons";

import auth from "../../../../Auth";
import { file } from "../../../../apis";

// this component should no longer be needed
// the delete logic should be moved to file overview table
// similar to the template overview table

export default function ShowFileDeletion(props) {
  //columns for the table
  const headers = [
    { label: "File ID", key: "experiment" },
    { label: "Dataset ID", key: "datasetID" },
    { label: "File Name", key: "FileName" },
    { label: "File Version", key: "FileVersion" },
  ];

  const columns = [];
  for (const header of headers) {
    const col = {
      Header: header.label,
      accessor: header.key,
      minWidth: 20,
      maxWidth: 160, //seems to be needed to distribute the cols evenly
    };
    columns.push(col);
  }

  const [open, setOpen] = useState(false);
  const [data, setData] = useState({});
  const [error, setError] = useState(false);

  useEffect(() => {
    if (open) {
      {
        const rows = getDataTable();
        setData(rows);
      }
    }
  }, [open]);

  const getDataTable = () => {
    //Build data to render on react-table
    const data = [];

    for (const experiment of Object.entries(props.selected)) {
      data.push({
        experiment: experiment[1].id,
        datasetID: experiment[1].dataset_id,
        FileName: experiment[1].name,
        FileVersion: experiment[1].version,
      });
    }
    return data;
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setError(false);
  };

  const handleDelete = async () => {
    const query = { fileIds: props.selected.map((file) => file.id) };
    const res = await file(
      auth.getToken(),
      config.api_endpoint,
      "disable",
      JSON.stringify(query)
    );

    if (res.status != 200) {
      // show error dialog

      setError("something went wrong");
    }
    const response = await res.json();
    props.onConfirm();
    setOpen(false);
  };

  return (
    <>
      {/* TODO put this in a function */}
      {error && (
        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {"Error while deleting files"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {error}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary" autoFocus>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <OMICSDM_BUTTON_LIGHT onClick={handleClickOpen} style={{ color: "red" }}>
        Delete Files
      </OMICSDM_BUTTON_LIGHT>

      <Dialog
        fullWidth={true}
        maxWidth={"sm"}
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Are you sure you want to delete the files below?"}
        </DialogTitle>
        <DialogContent>
          <TableWithDeleteRowButton
            data={data}
            accessorKeys={["experiment", "datasetID", "FileName", "FileVersion"]}
            cols={columns}
            deleteId={"experiment"}
            confirmationQuestion={
              "Are you sure you want to delete the selected files?"
            }
          />
          {/* {data.length === props.selected.length ? (
            <ReactTable
              data={data}
              filterable
              columns={columns}
              defaultPageSize={data.length}
              pageSizeOptions={[100, 200, 300]}
              className="-striped -highlight"
            />
          ) : (
            <div>list files to be deleted...</div>
          )} */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDelete} style={{ color: "red" }}>
            Yes please delete them
          </Button>
          <Button onClick={handleClose} color="primary">
            Not now
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
