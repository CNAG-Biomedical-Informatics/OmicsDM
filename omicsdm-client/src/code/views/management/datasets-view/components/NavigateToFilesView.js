import React from "react";
import { Link } from "react-router";
import { Button } from "@mui/material";
import InventoryIcon from "@mui/icons-material/Inventory";

const NavigateToFilesView = ({ table }) => {
  const { selectedRows, datasetIds, owners } = table
    .getSelectedRowModel()
    .rows.reduce(
      (acc, row) => {
        const { dataset_id, owner } = row.original;

        // Save the row info if you need it later
        acc.selectedRows.push({ dataset_id, owner });
        acc.datasetIds.add(dataset_id);
        acc.owners.add(owner);
        return acc;
      },
      { selectedRows: [], datasetIds: new Set(), owners: new Set() }
    );

  const newColumnFilters = [
    {
      id: "dataset_id",
      value: [...datasetIds].join(),
    },
    {
      id: "owner",
      value: [...owners].join(),
    },
  ];

  console.log("table.getSelectedRowModel()", table.getSelectedRowModel());
  console.log("selectedRows", selectedRows);

  return (
    <Link
      to="/files"
      state={{
        newColumnFilters,
      }}
    >
      <Button
        table={table}
        startIcon={<InventoryIcon />}
        btnText="Share/Unshare Selection"
        tooltip="Share/Unshare selection with all or selected groups"
        disabled={
          !table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
        }
        variant="contained"
      >
        Show associated files
      </Button>
    </Link>
  );
};

export default NavigateToFilesView;
