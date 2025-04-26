import React from "react";
import PropTypes from "prop-types";
import DeleteIcon from "@mui/icons-material/Delete";
import { Box, IconButton, Tooltip } from "@mui/material";
import {
  useMaterialReactTable,
  MaterialReactTable,
} from "material-react-table";

import TopToolbar from "./TopToolbar";

const getColsDef = (accessorKeys) => {
  return accessorKeys.map((key) => ({
    accessorKey: key,
    header:
      key.charAt(0).toUpperCase() +
      key
        .slice(1)
        .split(/(?=[A-Z])/)
        .join(" "),
    size: 20,
  }));
};

const BasicTable = ({ data, accessorKeys, cols = [], overwriteProps = {} }) => {
  const columns =
    cols.length === 0 && accessorKeys.length > 0
      ? getColsDef(accessorKeys)
      : cols;

  const tableProps = {
    enableSorting: false,
    enablePagination: false,
    enableFilters: false,
    ...overwriteProps,
  };

  const table = useMaterialReactTable({
    columns,
    data,
    ...tableProps,
  });

  return <MaterialReactTable table={table} />;
};

const TableWithDeleteRowButton = ({
  data,
  accessorKeys,
  cols,
  deleteId,
  confirmationQuestion,
  deletionHandler,
  overwriteProps = {},
}) => {
  const openDeleteConfirmModal = (row) => {
    if (window.confirm(confirmationQuestion)) {
      deletionHandler(row.original[deleteId]);
    }
  };

  const renderRowActionButton = (row) => {
    console.log("row", row);
    return (
      <Box sx={{ display: "flex", gap: "1rem" }}>
        <Tooltip title="Delete">
          <IconButton color="error" onClick={() => openDeleteConfirmModal(row)}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    );
  };

  const tableProps = {
    enableSorting: true,
    enablePagination: true,
    enableFilters: true,
    enableRowActions: true,
    positionActionsColumn: "last",
    renderRowActions: ({ row }) => renderRowActionButton(row),
    ...overwriteProps,
  };

  return (
    <BasicTable
      data={data}
      accessorKeys={accessorKeys}
      cols={cols}
      overwriteProps={tableProps}
    />
  );
};

const TableWithCustomTopToolbar = ({
  data,
  accessorKeys,
  cols,
  overwriteProps = {},
}) => {
  const tableProps = {
    renderTopToolbar: ({ table }) => {
      return <TopToolbar table={table} />;
    },
    ...overwriteProps,
  };

  return (
    <BasicTable
      data={data}
      accessorKeys={accessorKeys}
      cols={cols}
      overwriteProps={tableProps}
    />
  );
};

BasicTable.propTypes = {
  data: PropTypes.array.isRequired,
  accessorKeys: PropTypes.array.isRequired,
  cols: PropTypes.array,
  overwriteProps: PropTypes.object,
};

BasicTable.defaultProps = {
  data: [],
  accessorKeys: [],
  cols: [],
  overwriteProps: {},
};

TableWithDeleteRowButton.propTypes = {
  data: PropTypes.array.isRequired,
  accessorKeys: PropTypes.array.isRequired,
  cols: PropTypes.array,
  deleteId: PropTypes.string.isRequired,
  confirmationQuestion: PropTypes.string.isRequired,
  overwriteProps: PropTypes.object,
};

TableWithDeleteRowButton.defaultProps = {
  data: [],
  accessorKeys: [],
  cols: [],
  deleteId: "",
  confirmationQuestion: "Are you sure you want to delete this item?",
  deletionHandler: () => {},
  overwriteProps: {},
};

TableWithCustomTopToolbar.propTypes = {
  data: PropTypes.array.isRequired,
  accessorKeys: PropTypes.array.isRequired,
  cols: PropTypes.array,
  overwriteProps: PropTypes.object,
};

TableWithCustomTopToolbar.defaultProps = {
  data: [],
  accessorKeys: [],
  cols: [],
  overwriteProps: {},
};

export { BasicTable, TableWithDeleteRowButton, TableWithCustomTopToolbar };
