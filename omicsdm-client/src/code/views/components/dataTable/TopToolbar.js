import React from "react";
import {
  MRT_ToggleFullScreenButton,
  MRT_GlobalFilterTextField,
  MRT_ShowHideColumnsButton,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFiltersButton,
} from "material-react-table";
import { Button, IconButton, Tooltip, Box } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";

import ExportTable from "./ExportTable";

const RefreshDataButton = ({ refetch }) => {
  return (
    <Tooltip arrow title="Refresh Data">
      <IconButton onClick={() => refetch()}>
        <RefreshIcon />
      </IconButton>
    </Tooltip>
  );
};

const TableActionButton = (props) => {
  const { table, handleClick, startIcon, btnText, tooltip, variant, color } =
    props;

  return (
    <Tooltip arrow title={tooltip}>
      <Button
        onClick={handleClick}
        startIcon={startIcon}
        disabled={
          !table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
        }
        variant={variant || "outlined"}
        color={color || "primary"}
      >
        {btnText}
      </Button>
    </Tooltip>
  );
};

const SelectedRowCount = (props) => {
  const { table, selectionRequired } = props;

  let selectedRowCount = 0;
  let totalRowCount = 0;

  const { rowSelection } = table.getState();
  if (Object.keys(rowSelection).length > 0) {
    selectedRowCount = Object.keys(rowSelection).length;
    totalRowCount = table.getRowModel().rows.length;
  }

  if (totalRowCount === 0 && selectionRequired) {
    return <Box sx={{ p: 1, color: "red" }}>At least one must be selected</Box>;
  }

  return (
    <Box sx={{ p: 1 }}>
      {selectedRowCount} of {totalRowCount} selected
    </Box>
  );
};

const TopToolbar = ({
  refetch,
  table,
  isError,
  Components,
  enableRowSelection,
  rowSelectionRequired,
  viewSpecificStateAndSetter,
}) => {
  console.log("viewSpecificStateAndSetter", viewSpecificStateAndSetter);

  if (isError) {
    return (
      <div>
        <span>Error loading data</span>
      </div>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Box>
        <RefreshDataButton refetch={refetch} />
        {Array.isArray(Components)
          ? Components.map((Component) => (
              <Component
                table={table}
                setAction={viewSpecificStateAndSetter[1]}
                TableActionButton={TableActionButton}
              />
            ))
          : Components && (
              <Components
                table={table}
                setAction={viewSpecificStateAndSetter[1]}
                TableActionButton={TableActionButton}
              />
            )}
        {enableRowSelection && (
          <SelectedRowCount
            table={table}
            selectionRequired={rowSelectionRequired}
          />
        )}
      </Box>
      <Box>
        <MRT_GlobalFilterTextField table={table} /> {/* not in use yet */}
        <MRT_ToggleFiltersButton table={table} />
        <MRT_ShowHideColumnsButton table={table} />
        <MRT_ToggleDensePaddingButton table={table} />
        <ExportTable table={table} />
        <MRT_ToggleFullScreenButton table={table} />
      </Box>
    </Box>
  );
};

export default TopToolbar;
export { TableActionButton };
