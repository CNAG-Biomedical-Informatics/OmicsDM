import React from "react";
import { useNavigate } from "react-router";
import { Typography } from "@mui/material";
import { useLocation } from "react-router";
import { TableWithCustomTopToolbar } from "../../../components/dataTable/DataTable";

import OMICSDM_BUTTON from "../../../components/buttonCollection/buttons";

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
      <TableWithCustomTopToolbar
        data={state.tableData.data}
        cols={state.tableData.cols}
      />
    </>
  );
};

export default SummaryInserted;
