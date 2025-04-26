import React from "react";
import {
  Grid,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";

import auth from "../../../Auth";

// Handle field update
// const handleFieldUpdate = async () => {
//   if (selected.length === 0 || !fieldSelected || !newValue) {
//     setPopupErrors("Please fill all fields");
//     return;
//   }

//   const selectedRows = selected.map((item) => item.id);
//   const view = location.pathname.split("/")[2];

//   console.log("view", view);

//   const response = await adminExecuteUpdate(
//     auth.getToken(),
//     config.api_endpoint,
//     view,
//     JSON.stringify({
//     dbRowIds: selectedRows,
//     field: fieldSelected,
//     value: newValue,
//     })
//   );

//   const error_msg = await response.text();
//   if (response.status === 200) {
//     const { page, pageSize, filtered, sorted } = pagination;

//     const data_query = {
//     page: page,
//     pageSize,
//     filtered,
//     sorted,
//     };
//     getData(data_query, filtered, sorted);
//   } else {
//     setPopupErrors(error_msg);
//   }
// };

const AdminViewSpecific = (props) => {
  // Look if there is any way to connect MaterialReactTable to
  // https://next.mui.com/toolpad/core/react-crud/ it would
  // be cool to be able to click on a row and then
  // render the react-crud field edit view

  const {
    fieldSelected,
    modifiableFields,
    newValue,
    handleFieldSelectedChanged,
    handleFieldValueChanged,
    handleUpdate,
  } = props;

  return (
    <Grid item xs={12}>
      <Typography variant={"h5"} align={"left"} padding={4}>
        Select the field to be modified
      </Typography>
      <FormControl sx={{ m: 1, minWidth: 420 }}>
        <InputLabel id="field-select-label">Field</InputLabel>
        <Select
          id="field-select"
          label="Column"
          value={fieldSelected}
          // onChange={(e) =>
          //   this.setState({ fieldSelected: e.target.value })
          // }
          onChange={(e) => handleFieldSelectedChanged(e.target.value)}
        >
          {modifiableFields.map((option) => (
            <MenuItem value={option.key}>{option.label}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        sx={{ m: 1, minWidth: 420 }}
        id="standard-basic"
        label="Value"
        value={newValue}
        // onChange={(e) => this.setState({ newValue: e.target.value })}
        onChange={(e) => handleFieldValueChanged(e.target.value)}
      />
      <Button
        sx={{ m: 1 }}
        variant="contained"
        color="primary"
        onClick={() => {
          handleUpdate();
        }}
      >
        Update
      </Button>
    </Grid>
  );
};

export default AdminViewSpecific;
