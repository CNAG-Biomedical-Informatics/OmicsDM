import React, { useState, useMemo, useEffect } from "react";

import { Typography } from "@mui/material";

import { BasicTable } from "../../../components/dataTable/DataTable";
import {
  getDataTable,
  SelectedRowsDialog,
} from "../../../components/dataTable/SelectedRowsDialog";

import { groups_get, action_update } from "../../../../apis";
import auth from "../../../../Auth";

const { config } = window;

export default function ShareDataDialogContent(props) {
  console.log("ShareDataDialogContent props", props);

  const { action, selected, setSelected, setOpen, refetch } = props;

  const [groups, setGroups] = useState([]);
  const [groupSelected, setGroupSelected] = useState("ALL");

  const getAllGroups = async () => {
    console.log("getAllGroups");
    const conf = config.config_keycloak;
    console.log("conf", conf);

    const url = `${conf["auth-server-url"]}admin/realms/${conf.realm}/groups`;
    console.log("url", url);

    const res = await groups_get(auth.getToken(), url);
    console.log("res", res);

    if (!res.ok) {
      console.error("Failed to fetch groups", res.statusText);
      return;
    }

    let groupData = await res.json();
    console.log("groupData", groupData);
    let groups = groupData.map((group) => group.name);
    console.log("groups", groups);

    // get the user's groups and remove the leading slash
    const toRemove = auth.decoded().group.map((e) => e.slice(1));

    // remove the groups of the user and the admin group
    toRemove.push("admin");
    groups = groups.filter((el) => {
      return !toRemove.includes(el);
    });

    groups.unshift("ALL");
    setGroups(groups);
  };

  const handleApply = async () => {
    const projectIdToDatasets = {};

    for (const dataset of selected.rows) {
      const { project_id, dataset_id } = dataset.original;
      if (!projectIdToDatasets.hasOwnProperty(project_id)) {
        projectIdToDatasets[project_id] = [];
      }
      projectIdToDatasets[project_id].push(dataset_id);
    }

    const arg = action === "share with groups" ? "addGroup" : "removeGroup";
    const responses = [];
    for (const projectId in projectIdToDatasets) {
      const datasetIds = projectIdToDatasets[projectId].join(",");
      const queryUrl = `datasets?arg=${arg}&project=${projectId}&dataset=${datasetIds}&group=${groupSelected}`;

      const response = await action_update(
        auth.getToken(),
        config.api_endpoint,
        queryUrl,
        "PUT"
      );
      responses.push(response);
    }

    // if not all responses are ok
    if (responses.every((r) => r.status === 200)) {
      return;
    }

    // loop over responses and find the ones that failed
    const proj_ids = new Set();
    for (const response of responses) {
      if (response.status !== 200) {
        const res = await response.json();

        if (res.message == "dataset visibility is not changeable") {
          proj_ids.add(res.project);
        }
      }
    }
    console.error(
      `The datasets of ${[...proj_ids].join(", ")} cannot be shared/unshared`
    );
  };

  const handleSelectChange = (event) => {
    console.log("handleSelectChange", event.target.value);
    setGroupSelected(event.target.value);
  };

  const groupOptions = (data) => {
    const groups = data.groups;
    const items = [];
    for (let i = 0; i < groups.length; i++) {
      items.push(
        <option key={i} value={groups[i]}>
          {groups[i]}
        </option>
      );
    }
    return items;
  };

  const tableCols = useMemo(() => {
    return [
      {
        accessorKey: "dataset_id",
        header: "Datasets ID",
        size: 20,
      },
      {
        accessorKey: "visibility",
        header: "Current Visibility",
        size: 10,
      },
      {
        accessorKey: "shared_with",
        header: "Current Groups",
        size: 20,
      },
    ];
  });

  useEffect(() => {
    getAllGroups();
  }, []);

  return (
    <SelectedRowsDialog
      dialogTitle={"Share/Unshare Selected Datasets"}
      selected={selected}
      setSelected={setSelected}
      setOpen={setOpen}
      handleApply={handleApply}
      refetch={refetch}
      DialogContentChildren={() => (
        <>
          <Typography variant={"subtitle1"}>
            Selection of your <b>own</b> Datasets to apply the action:
            {action}
          </Typography>
          <Typography>
            Changes will be applied to all files associated to the selected
            Datasets
          </Typography>
          <div className="p-2">
            <select
              className="mx-2 my-2"
              value={groupSelected}
              onChange={handleSelectChange}
            >
              {groupOptions({ groups })}
            </select>
          </div>
          <BasicTable
            data={getDataTable({ tableCols, selected })}
            cols={tableCols}
          />
        </>
      )}
    />
  );
}
