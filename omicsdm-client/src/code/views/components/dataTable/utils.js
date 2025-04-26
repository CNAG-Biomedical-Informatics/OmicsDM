/**
 * Moves specific columns to the front of the global `baseCols` array.
 *
 * This function reorders columns by first extracting those whose `accessorKey`
 * matches any key in the provided `keys` array. The matched columns are sorted
 * based on the order of their keys in the `keys` array. It then appends the remaining
 * columns (those not specified in `keys`) to the sorted list, and returns the new array.
 *
 * This function is used in DatasetsTableCols.js to move the cols:
 * ["policy_file", "clinical_file"] to the front of the table
 * and in FilesTableCols.js to move the col ["Visualizer"] to the front.
 *
 * @param {Object[]} cols - array of column objects to be reordered.
 * @param {string[]} keys - array of column accessor keys that should be moved to the front.
 * @returns {Object[]} A new array of column objects with the specified columns at the beginning,
 *                     followed by the remaining columns.
 */
export const moveSpecificColsToTheFront = (cols, keys) => {
  const movedColumns = cols
    .filter((col) => keys.includes(col.accessorKey))
    .sort((a, b) => keys.indexOf(a.accessorKey) - keys.indexOf(b.accessorKey));

  const remainingColumns = cols.filter(
    (col) => !keys.includes(col.accessorKey)
  );

  return [...movedColumns, ...remainingColumns];
};

// add a docstring but state that targetCols and customRenderer are optional
/**
 * Generates an array of column definitions for a table based on the provided column headers.
 *
 * @param {Array} colHeaders - Array of column header objects, each containing `key` and `label`.
 * @param {Array} targetCols - Optional array of column keys to which a custom renderer should be applied.
 * @param {Function} customRenderer - Optional function to render the cell content for the specified columns.
 * @returns {Array} Array of column definitions for the table.
 */

export const getTableCols = (
  colHeaders,
  targetCols = [],
  customRenderer = null
) => {
  return colHeaders.map(({ key, label }) => ({
    accessorKey: key,
    header: label,
    size: 200,
    ...(targetCols.includes(key) && {
      Cell: ({ cell }) => {
        return customRenderer({ cell, key });
      },
    }),
  }));
};
