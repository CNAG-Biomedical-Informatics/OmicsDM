import React from "react";
import { CSVLink } from "react-csv";
import OMICSDM_BUTTON from "./buttons";

export const CsvButton = ({
  getCsvData,
  csvData,
  headersCsv,
  csvLink,
  nameFile,
}) => {
  return (
    <>
      <OMICSDM_BUTTON className="btn btn-success mx-2 my-2" onClick={getCsvData}>
        <i
          className="fa fa-download"
          aria-hidden="true"
          data-cy="download-table-to-csv"
        />{" "}
        Download Table to CSV
      </OMICSDM_BUTTON>
      <CSVLink
        data={csvData}
        headers={headersCsv}
        className="hidden"
        ref={csvLink}
        filename={nameFile}
        target="_blank"
      />
    </>
  );
};
