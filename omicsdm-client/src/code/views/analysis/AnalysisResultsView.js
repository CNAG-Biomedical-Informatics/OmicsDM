import React, { useEffect, useState } from "react";
import {
  Typography,
  Button,
} from "@mui/material"
import Grid from "@mui/material/Grid";

import { useQuery } from '@tanstack/react-query';

import { DNA } from "react-loader-spinner";

import auth from "../../Auth";
import { jobsStatus, analysisResults, analysisSubmissionData, analysis_abort } from "../../apis";

import ShowGeneratedFiles from "./ShowGeneratedFiles";
import ShowAnalysesResults from "./components/ShowAnalysesResults";

import AnalysesResultsHeader from "./resultsView/components/analysesResultsHeader/AnalysesResultsHeader";
import UsedFilesAndConfig from "./resultsView/components/usedFilesAndConfig/UsedFilesAndConfig";
import AnalysisPipelineProgress from "./resultsView/components/analysisPipelineProgress/AnalysisPipelineProgress";

import AccordionWrapper from "./components/accordionWrapper/AccordionWrapper";

import { getColsDef } from "./helpers";


// icons below maybe interesting to put on the tab headers
// import TaskAltIcon from '@mui/icons-material/TaskAlt'; //Done
// import ReportGmailerrorredIcon from '@mui/icons-material/ReportGmailerrorred'; // Fail Icon
// import PendingOutlinedIcon from '@mui/icons-material/PendingOutlined';
// import CircularProgress from '@mui/material/CircularProgress'; // In Progress

const getJobsStatus = async ({ queryKey }) => {
  const [_key, { analysisId }] = queryKey;

  console.log("getJobsStatus", analysisId);
  console.log("getJobsStatus", _key);

  const query = {
    analysis_id: analysisId,
  };

  const res = await analysisSubmissionData(
    auth.getToken(),
    config.api_endpoint,
    JSON.stringify(query)
  );
  if (!res.ok) {
    throw new FetchError("Problem fetching job status", response.status);
  }
  console.log("res status :>> ", res);
  const data = await res.json();
  console.log("get JobsStatus data :>> ", data);
  console.log("get JobsStatus data.analysis_json :>> ", data.data.analysis_json);
  console.log("get JobsStatus data. :>> ", data.data.analysis_json.analysis);

  const query2 = {
    analysis_id: analysisId,
    analysis: data.data.analysis_json.analysis,
  };

  console.log("query", query2);

  const res2 = await jobsStatus(
    auth.getToken(),
    config.api_endpoint,
    JSON.stringify(query2)
  );
  console.log("res2 status :>> ", res2);
  if (!res2.ok) {
    throw new FetchError("Problem fetching job status", response.status);
  }

  console.log("res status :>> ", res2);
  const data2 = await res2.json();
  console.log("data2 :>> ", data2);

  return data2;
};

const getAnalysisSubmissionSummary = async ({ queryKey }) => {
  const [_key, { analysisId }] = queryKey;

  console.log("getAnalysisSubmissionSummary", analysisId);
  console.log("getAnalysisSubmissionSummary", _key);

  const query = {
    analysis_id: analysisId,
  };

  console.log("query", query);

  const res = await analysisSubmissionData(
    auth.getToken(),
    config.api_endpoint,
    JSON.stringify(query)
  );
  console.log("res status :>> ", res);
  if (!res.ok) {
    throw new FetchError("Problem fetching job status", response.status);
  }

  console.log("res status :>> ", res);
  const data = await res.json();
  console.log("data :>> ", data);
  console.log("data.message :>> ", data.message);

  return data;
};

const getAnalysisJson = (props, AnalysisSummaryQuery) => {
  if (!AnalysisSummaryQuery) {
    return {};
  }

  let jsonData = {};
  if (AnalysisSummaryQuery.status === "success") {
    console.log("success AnalysisSummaryQuery :>> ", AnalysisSummaryQuery);
    jsonData = AnalysisSummaryQuery.data.data.analysis_json;
    console.log("jsonData", jsonData);
  } else {
    console.log("else AnalysisSummaryQuery.status :>> ", AnalysisSummaryQuery.status);
  }
  return jsonData;
};

const getFileName = (props, AnalysisSummaryQuery) => {
  console.log("getFileName", AnalysisSummaryQuery);

  let fileName = "";
  if (AnalysisSummaryQuery.status === "success") {
    console.log("success AnalysisSummaryQuery :>> ", AnalysisSummaryQuery);
    fileName = AnalysisSummaryQuery.data.data.csv_file_name;
    console.log("fileName", fileName);
  }
  return fileName;
};

const getTableContents = (props, AnalysisSummaryQuery) => {

  if (AnalysisSummaryQuery.status !== "success") {
    return []
  }

  console.log("success AnalysisSummaryQuery :>> ", AnalysisSummaryQuery);
  const fileData = AnalysisSummaryQuery.data.data.file_data;

  // TODO
  // dataset_id and file_id should not be a number
  // maybe it would be good to query the database again
  // to get for both the dataset_id and file_id as proper strings

  const data = []
  const keys = Object.keys(fileData);
  keys.forEach((key) => {
    const file = fileData[key];
    data.push({
      owner: file.owner,
      datasetId: file.dataset_id,
      fileId: key,
      name: file.name,
      version: file.version,
    });
  });

  return data;
}

const getHtmls = async ({ queryKey }) => {
  const [_key, { analysisId }] = queryKey;

  const query = {
    analysis_id: analysisId,
  }

  console.log("query", query);

  const res = await analysisResults(
    auth.getToken(),
    config.api_endpoint,
    JSON.stringify(query)
  );
  if (!res.ok) {
    throw new FetchError("Problem fetching htmls", response.status);
  }
  console.log("res", res);
  const data2 = await res.json();
  console.log("data2", data2);
  // console.log("data2.htmls", data2.htmls);
  return data2.htmls;
}

const AnalysisResultsView = (props) => {
  console.log("AnalysisSubmissionSummary props", props);

  const analysisId = window.location.href.split("/").pop();
  const analysisName = "hardcoded";

  const [value, setValue] = useState(0); //needed for the tabs
  const [allAborted, setAllAborted] = useState(false);
  const [refetchInterval, setRefetchInterval] = useState(6000)

  const AnalysisSummaryQuery = useQuery({
    queryKey: ["analysisSubmissionSummary", { analysisId }],
    queryFn: getAnalysisSubmissionSummary,
    retry: (failureCount, error) =>
      error.statusCode === 404 && failureCount <= 3,
  });

  const { status, data, error } = useQuery({
    queryKey: ["analysisStatus", { analysisId }],
    queryFn: getJobsStatus,
    refetchInterval,
  });

  const { status: statusHtml, data: dataHtml, refetch } = useQuery({
    queryKey: ["analysesHtmls", { analysisId }],
    queryFn: getHtmls,
    retry: (failureCount, error) =>
      error.statusCode === 404 && failureCount <= 3,
  });

  console.log("statusHtml", statusHtml);
  console.log("dataHtml", dataHtml);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    if (status === 'success' && data.analysisStatus == "ABORTED") {
      setRefetchInterval(false);
      setAllAborted(true);
    }

    if (status === 'success' && data.analysisStatus == "finished") {
      setRefetchInterval(false);
    }

    // const atLeastOneJobFinished = (jobs) => {
    //   if (Object.values(jobs).some(job => job.status === "SUCCESS")) {
    //     return true
    //   }
    //   return false
    // }

    // TODO
    // not only return the finished but also the R logs of the running analyses 
    if (status === 'success') {
      console.log("useEffect data", data);
      refetch();
    }
  }, [status, data, allAborted]);

  // TODO
  // The expected possible responses of the servers should be:
  // a) html for the finished analyses
  // b) empty string for the analyses that are not finished yet 
  //      ==> this should lead to a loading spinner in the corresponding tab
  //      ==> returning the job output of jenkins
  // c) html that renders the error message for the analyses that failed

  const tableData = getTableContents(props, AnalysisSummaryQuery);
  const filename = getFileName(props, AnalysisSummaryQuery);
  const analysisJson = getAnalysisJson(props, AnalysisSummaryQuery);

  const abortAnalyses = async (analysisId, analysis, token, api_endpoint, setAllAborted) => {

    // "analysis" can be "ALL" or "analysis_name
    // "analysis_name" is the name of the analysis that you want to abort
    // "ALL" indicates that you want to abort all the analyses

    const query = {
      analysis_id: analysisId,
      analysis: analysis,
    };
    const res = await analysis_abort(
      token,
      api_endpoint,
      JSON.stringify(query)
    );
    if (!res.ok) {
      throw new FetchError("Problem aborting analysis", response.status);
    }
    const data = await res.json();
    console.log("data", data);

    if (data["message"] === "All Analyses aborted") {
      console.log("All Analyses aborted");
      setAllAborted(true);
    }
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={4}>
        <AnalysesResultsHeader
          allAborted={allAborted}
          analysisId={analysisId}
          analysisName={analysisName}
        />
      </Grid>
      <Grid item xs={4}>
        <AnalysisPipelineProgress
          jobData={data}
          analysisJson={analysisJson}
        />
      </Grid>
      <Grid item xs={12}>
        {!allAborted && shouldProgressUpdateBeShown(status, data) ? (
          <>
            <DNA />
            <Typography variant="h6" align="left">
              Running the following analyses at the moment:
            </Typography>
            {renderAnalysesProgress(data, analysisId, abortAnalyses)}
            {/* <Button
              style={{
                color: "red",
              }}
              variant="contained"
              onClick={() => {
                abortAnalyses(
                  analysisId,
                  "ALL",
                  auth.getToken(),
                  config.api_endpoint,
                  setAllAborted
                );
              }}
            >
              Abort all analyses
            </Button> */}
          </>
        ) : null}
        <AccordionWrapper
          title="see the used files and analysis configuration"
          wrappedComponent={UsedFilesAndConfig}
          wrappedComponentProps={{
            filename,
            tableData,
            tableAccessors: ["owner", "datasetId", "fileId", "name"],
            analysisJson
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <ShowGeneratedFiles
          analysisId={analysisId}
          analysisJson={analysisJson}
        />
        <ShowAnalysesResults
          analysisJson={analysisJson}
          htmls={dataHtml}
          value={value}
          handleChange={handleChange}
          jobData={data}
        />
      </Grid>
    </Grid >
  )
};


const shouldProgressUpdateBeShown = (status, data) => {
  console.log("shouldShouldProgressUpdateBeShown ", status, data);
  if (status === "loading" || status === "error") {
    return true
  }

  if (status === "success" && data.analysisStatus !== "finished") {
    return true
  }
  return false
}

const renderAnalysesProgress = (data, analysisId, abortAnalyses) => {
  console.log("renderAnalysesProgress data", data);

  if (data === undefined) {
    return null
  }
  const jobs = data["jobs"];
  console.log("jobs", jobs);

  if (data["jobs"] === undefined) {
    console.log("data['jobs'] === undefined", data);
    return null
  }

  const keys = Object.keys(data["jobs"]);
  console.log("keys", keys);

  const progress_mapping = {}

  // TODO
  // better use here the analysisJson
  // because it should be also possible to abort the analyses which
  // have not even started yet

  Object.keys(jobs).map((job) => {
    const status = jobs[job]["status"]
    console.log("status", status);

    if (status === "QUEUE") {
      progress_mapping[job] = `${job} in queue`
      console.log("progress_mapping[job]", progress_mapping[job]);
    }

    if (status === "STARTED") {
      const workflow_done_in_percent = jobs[job].console_out.workflow_done_in_percent
      if (workflow_done_in_percent == null) {
        progress_mapping[job] = `${job} started`
        console.log("progress_mapping[job]", progress_mapping[job]);
      } else {
        progress_mapping[job] = `${job} ${workflow_done_in_percent}%`
        console.log("progress_mapping[job]", progress_mapping[job]);
      }
    }
  })
  console.log("progress_mapping", progress_mapping);

  // TODO
  // it would be good to have some kind of feed back if the abort was successful
  // and if not prompt the user to try again 

  return (
    <>
      {Object.keys(progress_mapping).map((job) => {
        return (
          <Grid container>
            <Grid item xs={3}>
              <Typography variant="h6" align="center">
                {progress_mapping[job]}
              </Typography>
            </Grid>
            <Grid item xs={3}>
              <Button
                style={{
                  color: "red",
                }}
                variant="contained"
                onClick={() => {
                  abortAnalyses(
                    analysisId,
                    job,
                    auth.getToken(),
                    config.api_endpoint,
                    null
                  );
                }}
              >
                Abort
              </Button>
            </Grid>
          </Grid>
        )
      }
      )}
    </>
  )
};


export default AnalysisResultsView;