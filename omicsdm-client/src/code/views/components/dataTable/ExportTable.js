import React, { useState } from "react";
import { Menu, MenuItem, Tooltip, IconButton } from "@mui/material";
import { mkConfig, generateCsv, download } from "export-to-csv";
import { FileCsv } from "@phosphor-icons/react";

const csvConfig = mkConfig({
  fieldSeparator: ",",
  decimalSeparator: ".",
  useKeysAsHeaders: true,
});

// TODO for dataset export
// figure out why it includes the columns:
// policy_presigned_url, clinical_presigned_url ??

const cleanData = (data) => {
  const tableDataCopy = JSON.parse(JSON.stringify(data));
  tableDataCopy.forEach((row) => {
    Object.keys(row).forEach((key) => {
      if (Array.isArray(row[key])) {
        row[key] = row[key].join(", ");
      }
    });
  });
  return tableDataCopy;
};

const handleExportRows = (rows, label) => {
  const rowData = rows.map((row) => row.original);
  const csv = generateCsv(csvConfig)(cleanData(rowData));

  const timestamp = new Date().toISOString().slice(0, 10);
  csvConfig.filename = `${timestamp}-${label}`;
  download(csvConfig)(csv);
};

function ExportTable({ table }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const createMenuItem = (label, tooltip, exportAction, disabled) => ({
    label,
    tooltip,
    onClick: () => {
      exportAction();
      handleClose();
    },
    disabled,
  });

  const menuItems = [
    createMenuItem(
      "Current Page Rows",
      "Export all rows as seen on the screen",
      () => handleExportRows(table.getRowModel().rows, "current-page-rows"),
      table.getRowModel().rows.length === 0
    ),
    createMenuItem(
      "Selected Rows",
      "Only export selected rows",
      () => handleExportRows(table.getSelectedRowModel().rows, "selected-rows"),
      !table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
    ),
  ];

  return (
    <>
      <Tooltip title="Export table data as CSV" placement="left">
        <IconButton onClick={handleClick}>
          <FileCsv />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {menuItems.map((item, index) => (
          <Tooltip key={index} title={item.tooltip} placement="left">
            <MenuItem disabled={item.disabled} onClick={item.onClick}>
              {item.label}
            </MenuItem>
          </Tooltip>
        ))}
      </Menu>
    </>
  );
}

export default ExportTable;
