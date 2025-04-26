import React, { useMemo, useEffect, useState } from "react";

import DeleteIcon from "@mui/icons-material/Delete";

import { file_download2 } from "../../../../apis";
import auth from "../../../../Auth";

import { BasicTable } from "../../../components/dataTable/DataTable";
import { SelectedRowsDialog } from "../../../components/dataTable/SelectedRowsDialog";
import { TableActionButton } from "../../../components/dataTable/TopToolbar";
import { Typography } from "@mui/material";
import {
  TruncatedLink,
  UrlCopyBtn,
} from "../../../components/dataTable/CustomRenderer";

const { config } = window;

const DeleteFilesDialogBtn = ({ table, setAction }) => {
  return (
    <TableActionButton
      table={table}
      handleClick={() => {
        table.setCreatingRow(true);
        setAction("delete");
      }}
      btnText="Delete Files"
      tooltip="Delete selected files"
      startIcon={<DeleteIcon />}
      color="error"
    />
  );
};

const DeleteFilesDialogContent = (props) => {
  console.log("DownloadLinksDialogContent props", props);
  const { selected, setSelected, setOpen, refetch } = props;

  console.log("DownloadLinksDialogContent selected", selected);

  const tableCols = useMemo(() => {
    return [
      {
        accessorKey: "id",
        header: "File ID",
        size: 20,
      },
      {
        accessorKey: "dataset_id",
        header: "Dataset ID",
        size: 10,
      },
      {
        accessorKey: "name",
        header: "File Name",
        size: 20,
      },
      {
        accessorKey: "version",
        header: "Version",
        size: 20,
      },
      {
        accessorKey: "url",
        header: "URL",
        size: 20,
        Cell: ({ cell }) => {
          const url = cell.getValue();
          return <TruncatedLink href={url}>{url}</TruncatedLink>;
        },
      },
      {
        accessorKey: "copy",
        header: "",
        size: 20,
        Cell: ({ row }) => {
          return <UrlCopyBtn row={row} />;
        },
      },
    ];
  });

  return (
    <SelectedRowsDialog
      dialogTitle={"Delete Files"}
      tableCols={tableCols}
      selected={selected}
      setSelected={setSelected}
      setOpen={setOpen}
      refetch={refetch}
      DialogContentChildren={() => (
        <BasicTable data={selected} cols={tableCols} />
      )}
    />
  );
};

export { DeleteFilesDialogBtn, DeleteFilesDialogContent };
