import React from 'react';
import {
    Icon,
    IconButton
} from '@mui/material';
import styled from '@mui/material/styles/styled';

import { datasetVisualization } from '../../../../apis';
import auth from '../../../../Auth';

const { config } = window

const CellxgeneIcon = styled(Icon)({
  background: 'url("img/cellxgene_logo.png")',
  backgroundSize: 'cover',
  display: 'inline-block',
  height: '30px',
  width: '30px',
  verticalAlign: 'middle',
});

const CellxgeneButton = ({ row }) => {
  console.log("CellxgeneButton row", row)
  const handleClick = async () => {
    try {
      const response = await datasetVisualization(
        auth.getToken(),
        config.api_endpoint,
        JSON.stringify({
          dataset_owner: row.owner,
          dataset_id: row.dataset_id,
          file_name: row.name,
          file_version: row.version,
        })
      );
      const msg = await response.text();
      if (response.status !== 200) {
        alert("Server error: " + response.status + " with message: " + msg);
      } else {
        const url = JSON.parse(msg).shiny_proxy_url;
        window.open(url);
        alert("cellxgene instance opened in a new tab at " + url);
      }
    } catch (err) {
      console.error("ERROR", err);
      alert("Server is not responding: " + err);
    }
  }

  return (
    <IconButton onClick={handleClick}>
      <CellxgeneIcon />
    </IconButton>
  );
};

const createCellxgeneButton = () => ({
  id: "rowButton",
  Cell: ({ original }) => {
    if (original.visualizer === "cellxgene") {
      return (
        <CellxgeneButton
          row={original}
        />
      );
    } else {
      // if no visualizer is available
      return <div />;
    }
  },
  Header: (x) => {
    return <div>Visualizer</div>;
  },
  sortable: false,
  filterable: false,
  width: 120,
});

export default createCellxgeneButton;