const getColsDef = (accessorKeys) => {
  return accessorKeys.map((key) => ({
    accessorKey: key,
    header: key.charAt(0).toUpperCase() + key.slice(1).split(/(?=[A-Z])/).join(" "),
    size: 20
  }));
}

export { getColsDef }