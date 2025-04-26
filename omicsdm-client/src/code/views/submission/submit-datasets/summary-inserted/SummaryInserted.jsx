import React from "react";
import { CSVLink } from "react-csv";
import { useNavigate } from "react-router";
import { Typography } from "@mui/material";
import { useLocation } from "react-router";
import { MaterialReactTable } from "material-react-table";

import OMICSDM_BUTTON from "../../../components/buttonCollection/buttons";

import { teal } from "@mui/material/colors";

const RedirectButton = ({ to, children, ...props }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    console.log("RedirectButton handleClick to", to);
    console.log("Redirecting...");
    navigate(to.pathname, { state: to.state });
  };

  return <OMICSDM_BUTTON onClick={handleClick}>{children}</OMICSDM_BUTTON>;
};

const SummaryInserted = () => {
  const { state } = useLocation();
  console.log("SummaryInserted.js state", state);

  if (!state) {
    window.location.href = "/home";
    return null;
  }

  return (
    <>
      <Typography variant={"h5"} align={"center"}>
        {" "}
        project: {state.projectId}
      </Typography>
      <Typography variant={"h5"} align={"center"}>
        {" "}
        Submission Successful!{" "}
      </Typography>
      <Typography variant={"h6"} align={"center"}>
        Summary of your Submission
      </Typography>
      {/* try to drop csv link */}
      <CSVLink
        style={{ color: teal[500], paddingLeft: 10, paddingRight: 10 }}
        data={state.tableContents}
        filename={state.filename}
      >
        DOWNLOAD AS CSV
      </CSVLink>
      {state.nextPage === "" ? null : (
        <RedirectButton
          to={{
            pathname: state.nextPage,
            state: {
              projectId: state.projectId,
            },
          }}
        >
          {state.nextPageLabel}
        </RedirectButton>
      )}
      <MaterialReactTable
        data={state.tableData.data}
        columns={state.tableData.cols}
        enableFilters={false}
        enablePagination={false}
        enableSorting={false}
      />
    </>
  );
};

export default SummaryInserted;
