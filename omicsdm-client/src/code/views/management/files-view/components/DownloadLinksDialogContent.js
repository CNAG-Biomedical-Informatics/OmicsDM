import React, { useMemo, useEffect, useState } from "react";

import DownloadIcon from "@mui/icons-material/Download";

import { file_download2 } from "../../../../apis";
import auth from "../../../../Auth";

import { BasicTable } from "../../../components/dataTable/DataTable";
import {
  getDataTable,
  SelectedRowsDialog,
} from "../../../components/dataTable/SelectedRowsDialog";
import { TableActionButton } from "../../../components/dataTable/TopToolbar";
import { Typography } from "@mui/material";
import {
  TruncatedLink,
  UrlCopyBtn,
} from "../../../components/dataTable/CustomRenderer";

const { config } = window;

const OpenDownloadLinksDialogBtn = ({ table, setAction }) => {
  return (
    <TableActionButton
      table={table}
      handleClick={() => {
        table.setCreatingRow(true);
        setAction("download");
      }}
      btnText="Download Files"
      tooltip="Show download links for selected files"
      startIcon={<DownloadIcon />}
    />
  );
};

// TODO
// This component is quite similar to the
// ShowGeneratedFiles component
// in the analysis-view folder.
// maybe we can refactor this

const DownloadLinksDialogContent = (props) => {
  console.log("DownloadLinksDialogContent props", props);
  const { selected, setSelected, setOpen, refetch } = props;

  const [data, setData] = useState([]);

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

  const getUrls = async () => {
    console.log("getUrls selected", selected);

    const data = [];
    selected.rows.forEach((row) => {
      data.push(row.id);
    });

    const res = await file_download2(
      auth.getToken(),
      config.api_endpoint,
      JSON.stringify({ file_ids: data })
    );
    const urls = await res.json();
    return urls.presignedUrls;
  };

  useEffect(() => {
    (async () => {
      const urlsMapping = await getUrls();
      const rows = getDataTable({ tableCols, selected });
      rows.forEach((row) => {
        const url = urlsMapping[row.id];
        row.url = url;
        row.copy = "";
      });
      setData(rows);
    })();
  }, []);

  return (
    <SelectedRowsDialog
      dialogTitle={"Download Files"}
      tableCols={tableCols}
      selected={selected}
      setSelected={setSelected}
      setOpen={setOpen}
      refetch={refetch}
      DialogContentChildren={() => (
        <>
          {data.length === selected.rows.length ? (
            <>
              <Typography variant="body2" color="text.secondary">
                Note: The download links are valid for 1 hour.
              </Typography>
              <BasicTable data={data} cols={tableCols} />
            </>
          ) : (
            <div>Generating download URLs...</div>
          )}
        </>
      )}
    />
  );
};

export { OpenDownloadLinksDialogBtn, DownloadLinksDialogContent };
