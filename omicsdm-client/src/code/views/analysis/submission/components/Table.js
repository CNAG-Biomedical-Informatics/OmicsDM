import React from "react";

const TableRow = (props) => {
  const { contents } = props;
  const mappingContents = contents.map((value) => (
    <td scope="row"> {value} </td>
  ));
  return <tr>{mappingContents}</tr>;
}
const TableHeader = (props) => {
  const { contents } = props;
  const mappingContents = contents.map((value) => (
    <th scope="col"> {value} </th>
  ));
  return <tr>{mappingContents}</tr>;
}

export default function Table (props) {
  const { tableContents } = props;
  const headers = tableContents[0];

  let rows = [];
  for (let i = 1; i < tableContents.length; i++) {
    rows.push(<TableRow contents={tableContents[i]} />);
  }

  const tableStyle = {
    height: 40,
  };

  return (
    <table style={tableStyle} className="table table-sm mx-4 my-2">
      <thead>
        <TableHeader contents={headers} />
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
}
