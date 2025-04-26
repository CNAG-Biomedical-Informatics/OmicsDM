import React, { useEffect, useMemo, useState } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { MenuItem, ListItemIcon } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

import { useQuery } from "@tanstack/react-query";

import auth from "../../../Auth";
import TopToolbar from "./TopToolbar";

const { config } = window;

export default function ReactQueryTable(props) {
  const {
    queryId,
    tableCols,
    tableData,
    endpoint,
    enableRowSelection,
    onRowSelectionChange,
    rowSelection,
    enableRowActions,
    renderRowActionButton,
    rowIdKeys,
    setReturnedJson,
    enablePagination,
    columnFilters,
    setColumnFilters,
    topToolbarComponents,
    dialogComponentsMap,
    viewSpecificStateAndSetter,
    rowSelectionRequired,
    onRowClick,
    columnVisibility,
    modifiableFields,
    defaultPageSize = 20,
    enableHiding = true,
  } = props;

  console.log("ReactQueryTable props", props);
  console.log("ReactQueryTable tableData", tableData);

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: defaultPageSize,
  });

  const [colActionColKey, setColActionColKey] = useState("");

  const { data, isError, isFetching, isLoading, refetch } = useQuery({
    queryKey: [
      queryId,
      // changes in elements below will trigger a new query
      globalFilter,
      pagination.pageIndex,
      pagination.pageSize,
      sorting,
      columnFilters,
    ],
    queryFn: async () => {
      console.log("ReactQueryTable queryFn", queryId);
      console.log("ReactQueryTable queryFn", columnFilters);

      const fetchURL = new URL(`/api/${endpoint}`, config.api_endpoint);

      const query = {
        page: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        filtered: columnFilters ?? [],
        sorted: sorting ?? [],
      };

      // convert the value to integer for the id column
      query.filtered.forEach((filter) => {
        if (filter.id === "id") {
          filter.value = parseInt(filter.value);
        }
      });

      // Deepcopy the query object otherwise the original object will be modified
      const queryCopy = JSON.parse(JSON.stringify(query));
      queryCopy.filtered.forEach((filter) => {
        if (filter.id === "owner") {
          filter.id = "checkbox";
        }
      });

      console.log("ReactQueryTable query", query);
      console.log("ReactQueryTable queryCopy", queryCopy);

      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          connection: "keep-alive",
          Authorization: auth.getToken(),
        },
        body: JSON.stringify(queryCopy),
      };

      console.log("ReactQueryTable fetchURL", fetchURL.href);
      const response = await fetch(fetchURL.href, options);
      console.log("ReactQueryTable response", response);
      if (!response.ok) {
        console.error("ReactQueryTable response error", response);
        throw new Error("ReactQueryTable response error");
      }
      const json = await response.json();
      console.log("ReactQueryTable json", json);
      return json;
    },
    enabled: true,
    keepPreviousData: true,
  });

  const columns = useMemo(() => tableCols, []);

  useEffect(() => {
    console.log("ReactQueryTable data", data);
    setReturnedJson(data);
  }, [data]);

  useEffect(() => {
    console.log("ReactQueryTable tableData", tableData);
  }, [pagination]);

  const generateRowId = (row, rowIdKeys) => {
    // only return if not all the returned values are null
    if (!rowIdKeys.map((key) => row[key]).some((val) => val !== null)) {
      return;
    }
    // console.log("rowIdKeys", rowIdKeys);
    // console.log("rowIdKeys.map(key => row[key]).join('?')");
    // console.log(rowIdKeys.map((key) => row[key]).join("?"));
    return rowIdKeys.map((key) => row[key]).join("?");
  };

  const table = useMaterialReactTable({
    columns,
    data: tableData?.items ?? [],
    getRowId: (row) => generateRowId(row, rowIdKeys),
    enableHiding,
    enableEditing: true,
    enableColumnResizing: true,
    // defaultColumn: { size: 100, minSize: 100, maxSize: 300 },
    // enableGlobalFilterModes: true,
    enableRowSelection,
    onRowSelectionChange,
    enableRowActions,
    enablePagination,
    positionActionsColumn: "last",
    renderRowActions: ({ row }) =>
      renderRowActionButton ? renderRowActionButton(row) : null,
    initialState: {
      showColumnFilters: true,
      columnVisibility,
      density: "compact",
    },
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    rowCount: data?.meta?.totalRowCount ?? 0,
    state: {
      columnFilters,
      globalFilter,
      isLoading,
      pagination,
      showAlertBanner: isError,
      showProgressBars: isFetching,
      sorting,
      rowSelection: rowSelection ?? [],
    },
    muiTableBodyRowProps: onRowClick
      ? ({ row }) => ({
          onClick: () => onRowClick({ row }),
          sx: { cursor: "pointer" },
        })
      : {},
    renderCreateRowDialogContent: ({ table }) => {
      console.log("renderCreateRowDialogContent", dialogComponentsMap);

      const topToolbarBtnClicked = viewSpecificStateAndSetter[0];
      const dialogComponent =
        dialogComponentsMap?.[topToolbarBtnClicked] || dialogComponentsMap;

      console.log("dialogComponent", dialogComponent);

      // TODO
      // figure out how to render the dialog components conditionally

      return dialogComponent({
        action: viewSpecificStateAndSetter[0],
        selected: table.getSelectedRowModel(),
        setSelected: onRowSelectionChange,
        colActionColKey,
        setOpen: table.setCreatingRow,
        refetch,
      });
    },
    renderTopToolbar: ({ table }) => {
      return (
        <TopToolbar
          refetch={refetch}
          table={table}
          isError={isError}
          Components={topToolbarComponents}
          enableRowSelection={enableRowSelection}
          rowSelectionRequired={rowSelectionRequired}
          viewSpecificStateAndSetter={viewSpecificStateAndSetter}
        />
      );
    },
    renderColumnActionsMenuItems: ({
      internalColumnMenuItems,
      table,
      column,
    }) => {
      if (
        modifiableFields.length === 0 ||
        !modifiableFields.some((field) => field.key === column.id)
      ) {
        return internalColumnMenuItems;
      }

      return [
        <MenuItem
          key={`${column.id}-modify-vals-menu-item`}
          onClick={() => {
            console.log("renderColumnActionsMenuItems", column);
            setColActionColKey(column.id);
            table.setCreatingRow(true);
          }}
          disabled={
            !table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
          }
        >
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Modify values
        </MenuItem>,
        ...internalColumnMenuItems,
      ];
    },
  });

  return <MaterialReactTable table={table} />;
}
