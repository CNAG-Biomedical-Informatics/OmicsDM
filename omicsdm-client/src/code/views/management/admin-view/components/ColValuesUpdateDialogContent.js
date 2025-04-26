import React, { useState } from "react";
import { Typography, TextField } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import { SelectedRowsDialog } from "../../../components/dataTable/SelectedRowsDialog";

import { adminExecuteUpdate } from "../../../../apis";

import auth from "../../../../Auth";
import { useLocation } from "react-router";

const { config } = window;

const ColValuesUpdateExplanation = ({}) => {
  return (
    <span>
      <Typography variant="body">
        To modify the values of selected rows, click on the column menu icon:
        <MoreVertIcon
          sx={{
            fontSize: "1.2rem",
            marginLeft: "0.5rem",
          }}
        />
        <Typography variant="body" sx={{ marginLeft: "0.5rem" }}>
          and select "Modify values"
        </Typography>
      </Typography>
    </span>
  );
};

const ColValuesUpdateDialogContent = (props) => {
  const { colActionColKey, selected, setSelected, setOpen, refetch } = props;

  const location = useLocation();
  const [newValue, setNewValue] = useState("");

  const handleFieldUpdate = async () => {
    console.log(selected.rows.map((item) => item.id));
    console.log("colActionColKey", colActionColKey);

    const response = await adminExecuteUpdate(
      auth.getToken(),
      config.api_endpoint,
      location.pathname.split("/")[2],
      JSON.stringify({
        dbRowIds: selected.rows.map((item) => parseInt(item.id)),
        field: colActionColKey,
        value: newValue,
      })
    );
    if (response.status !== 200) {
      const error_msg = await response.text();
      console.error("Error updating field:", error_msg);
    }
    return;
  };

  return (
    <SelectedRowsDialog
      dialogTitle={"Update column values"}
      selected={selected}
      setSelected={setSelected}
      setOpen={setOpen}
      handleApply={handleFieldUpdate}
      refetch={refetch}
      DialogContentChildren={() => (
        <TextField
          label="New value"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
        />
      )}
    />
  );
};

export { ColValuesUpdateExplanation, ColValuesUpdateDialogContent };
