// use this component to show download links for selected files
import React, { useEffect, useState, useMemo } from "react";

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

import { BasicTable } from "../components/dataTable/DataTable";
import {
  TruncatedLink,
  UrlCopyBtn,
} from "../components/dataTable/CustomRenderer";

import { OMICSDM_BUTTON_LIGHT } from "../components/buttonCollection/buttons";

import { analysisFiles, datasetVisualization } from "../../apis";
import auth from "../../Auth";

import CellxgeneButton from "../visualisation/CellxgeneButton";

const { config } = window;

// TODO
// This component is quite similar to the
// DownloadLinksDialogContent component
// in the files-view folder.
// maybe we can refactor this

export default function ShowGeneratedFiles(props) {
  const { analysisJson, analysisId } = props;

  const [open, setOpen] = useState(false);
  const [data, setData] = useState({});

  const tableCols = useMemo(() => {
    return [
      {
        accessorKey: "analysis",
        header: "Analysis",
        size: 20,
      },
      {
        accessorKey: "FileName",
        header: "File Name",
        size: 20,
      },
      {
        accessorKey: "url",
        header: "Url",
        Cell: ({ row }) => (
          <TruncatedLink href={row.original.url}>
            {row.original.url}
          </TruncatedLink>
        ),
      },
      {
        accessorKey: "copy",
        header: "",
        size: 40,
        Cell: ({ row }) => <UrlCopyBtn row={row} />,
      },
    ];
  });

  const getUrls = async () => {
    const res = await analysisFiles(
      auth.getToken(),
      config.api_endpoint,
      JSON.stringify({
        analysis_id: analysisId,
        analysisJson,
      })
    );
    if (res.status !== 200) {
      console.error("Error fetching presigned urls");
      return [];
    }
    const urls = await res.json();
    return urls.presignedUrls;
  };

  useEffect(() => {
    if (open) {
      (async () => {
        const urlsMapping = await getUrls();
        const rows = getDataTable(urlsMapping);
        setData(rows);
      })();
    }
  }, [open]);

  const getDataTable = (urlsMapping) => {
    console.log("urlsMapping :>> ", urlsMapping);
    console.log("props :>> ", props);
    console.log("props.analysisJson :>> ", props.analysisJson);

    const data = [];
    Object.entries(props.analysisJson).forEach(([_, value]) => {
      data.push({
        analysis: value.analysis,
        FileName: value.analysis,
        url: urlsMapping[value.analysis],
      });
    });
    return data;
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Box display="flex" justifyContent="flex-end">
        <CellxgeneButton
          fileOrAnalysis={{
            isAnalysisResult: true,
          }}
        />
        <OMICSDM_BUTTON_LIGHT
          color="primary"
          onClick={() => {
            setOpen(true);
          }}
        >
          Download Results
        </OMICSDM_BUTTON_LIGHT>
      </Box>
      <Dialog
        fullWidth={true}
        maxWidth={"sm"}
        open={open}
        onClose={handleClose}
      >
        <DialogTitle>{"Download Links"}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Note: The download links are valid for 1 hour.
          </Typography>
          <BasicTable data={data} cols={tableCols} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Not now
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
