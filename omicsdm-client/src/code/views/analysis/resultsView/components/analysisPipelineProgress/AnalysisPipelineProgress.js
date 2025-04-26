import React from "react";
import { Box } from "@mui/material";

import AnalysesFlow from "./../../../components/AnalysesFlow";

const updatingTaskData = (taskData, jobData, analyses, analysisLevel) => {
  console.log("updatingTaskData", taskData, analyses);
  for (let idx = 0; idx < analyses.length; idx++) {
    const task = analyses[idx]
    console.log("task,idx", task, idx)

    // check if the task is in the jobData
    if (jobData.jobs[task] != undefined) {
      const status = jobData.jobs[task][`status`]

      let jobStatus = "waiting"
      if (status === "SUCCESS") {
        jobStatus = "done"
      }
      else if (status === "STARTED") {
        jobStatus = "running"
      }
      else if (status === "REVOKED") {
        jobStatus = "fail"
      }

      console.log("before push", taskData)
      console.log(`Pushing task: ${task} with status: ${jobStatus} and number: ${idx}`)

      taskData.steps.push({
        name: task,
        status: jobStatus,
        analysisLevel: analysisLevel,
      })
    }
    else {
      taskData.steps.push({
        name: task,
        status: "waiting",
        analysisLevel: analysisLevel,
      })
    }
  }
  return taskData
}

const AnalysisPipelineProgress = (props) => {
  console.log("Summary props", props);

  const { jobData, analysisJson } = props

  const baseAnalyses = [];
  const followUpAnalyses = [];

  let taskData = {
    steps: [
    ]
  }

  if (jobData !== undefined) {

    for (const [analysis, details] of Object.entries(analysisJson)) {
      if (details.options.bases_on === null) {
        baseAnalyses.push(analysis);
      } else {
        followUpAnalyses.push(analysis);
      }
    }

    taskData = updatingTaskData(taskData, jobData, baseAnalyses, "base")
    console.log("taskData1", taskData)
    taskData = updatingTaskData(taskData, jobData, followUpAnalyses, "followUp")
    console.log("taskData2", taskData)
  }

  // TODO 
  // figure out why taskData.steps[0].number is existing
  // no where a number is assigned to the steps

  return (
    <Box>
      <AnalysesFlow taskData={taskData} />
    </Box>
  );
};

export default AnalysisPipelineProgress;