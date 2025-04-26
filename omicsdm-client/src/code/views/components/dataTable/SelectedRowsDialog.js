import React from "react";

import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

const getDataTable = ({ selected, tableCols }) => {
  console.log("in getDataTable", selected, tableCols);

  const accessorKeys = tableCols.map((col) => col.accessorKey);
  const data = [];
  for (const row of selected.rows) {
    const { isUserOwner } = row.original;

    if (isUserOwner) {
      data.push({
        ...accessorKeys.reduce((acc, key) => {
          acc[key] = row.original[key];
          return acc;
        }, {}),
      });
    }
  }
  return data;
};

const SelectedRowsDialog = (props) => {
  const {
    dialogTitle,
    setSelected,
    setOpen,
    DialogContentChildren,
    handleApply,
    refetch,
  } = props;

  const handleClose = () => {
    setOpen(false);
    setSelected([]);
    refetch();
  };

  return (
    <>
      <DialogTitle id="alert-dialog-title">{dialogTitle}</DialogTitle>
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
      >
        {DialogContentChildren?.()}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Not now
        </Button>
        {handleApply && (
          <Button
            onClick={async () => {
              await handleApply();
              handleClose();
            }}
            color="primary"
            data-cy={"btn-update-table"}
          >
            Update Table
          </Button>
        )}
      </DialogActions>
    </>
  );
};

export { getDataTable, SelectedRowsDialog };
