import React from "react";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Typography,
  Divider,
} from "@mui/material";

import TableChartIcon from "@mui/icons-material/TableChart";

import { OMICSDM_BUTTON_LIGHT } from "../../components/buttonCollection/buttons";

// Probably no longer needed as soon MaterialReactTable is used for every table

export default function CustomizeColumns(props) {
  // TODO
  // hand over the current headers to CustomizeColumns

  // const headers = config[`${props.type}ViewHeaders`];
  const { headers } = props;

  // Remove the classes usage
  // const classes = useStyles();
  const columns = headers.map((x) => x.key);

  const [open, setOpen] = React.useState(false);
  let [checked, setChecked] = React.useState(headers.map((x) => x.key));

  const handleCheck = (value) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const selectAll = (bool) => {
    if (bool) {
      setChecked(columns);
    } else {
      setChecked([]);
    }
  };

  const handleUpdate = () => {
    setOpen(false);

    // change column visibility
    const columns_view = [];
    columns.forEach((item) => {
      if (checked.includes(item)) {
        columns_view.push(item);
      }
    });
    props.updateColumns(columns_view);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <OMICSDM_BUTTON_LIGHT
        color="primary"
        onClick={handleClickOpen}
        startIcon={<TableChartIcon />}
      >
        Show/Hide Table Columns
      </OMICSDM_BUTTON_LIGHT>

      <Dialog
        fullWidth={true}
        maxWidth={"sm"}
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Select Table Columns"}
        </DialogTitle>
        <DialogContent>
          <Typography variant={"subtitle1"}> Select Columns</Typography>
          <Typography variant={"subtitle2"}>
            The selection doesn't apply to the download
          </Typography>
          <Divider />
          <Button onClick={() => selectAll(true)} color="primary">
            Select All
          </Button>
          <Button onClick={() => selectAll(false)} color="primary">
            Deselect All
          </Button>
          <Divider />
          <List sx={{
            width: "100%",
            maxWidth: "100%",
            maxHeight: "300px",
            overflowY: "auto",
            bgcolor: "background.paper"
          }}>
            {columns.map((item, index) => {
              const labelId = item;
              const checked_bool = checked.indexOf(item) !== -1;
              return (
                <ListItem
                  key={index}
                  role={undefined}
                  dense
                  button
                  onClick={handleCheck(item)}
                >
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={checked_bool}
                      tabIndex={-1}
                      disableRipple
                      inputProps={{ "aria-labelledby": labelId }}
                    />
                  </ListItemIcon>
                  <ListItemText id={labelId} primary={labelId} />
                </ListItem>
              );
            })}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Not now
          </Button>
          <Button onClick={handleUpdate} color="primary">
            Update Table
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
