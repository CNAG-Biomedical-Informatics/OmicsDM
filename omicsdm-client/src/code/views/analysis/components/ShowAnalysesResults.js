import React, { useRef, useEffect, useState } from "react";
import { Tabs, Tab, Typography, Paper, Box } from "@mui/material";
import Grid from "@mui/material/Grid";

// icons below maybe interesting to put on the tab headers
// import TaskAltIcon from '@mui/icons-material/TaskAlt'; //Task Done
// import ReportGmailerrorredIcon from '@mui/icons-material/ReportGmailerrorred'; // Task failed or aborted
// import PendingOutlinedIcon from '@mui/icons-material/PendingOutlined'; // Pending Task
// import CircularProgress from '@mui/material/CircularProgress'; // Task in progress

const IframeEmbed = ({ htmlContent, title, width = '100%', height = '400px' }) => {

  console.log("IframeEmbed props", { htmlContent, title, width, height });

  const iframeRef = useRef(null);
  const [error, setError] = useState(false);

  // Attach an error listener to handle iframe loading issues.
  useEffect(() => {
    const handleIframeError = () => {
      setError(true);
    };
    const iframeCurrent = iframeRef.current;
    if (iframeCurrent) {
      iframeCurrent.addEventListener('error', handleIframeError);
    }
    return () => {
      if (iframeCurrent) {
        iframeCurrent.removeEventListener('error', handleIframeError);
      }
    };
  }, []);

  return (
    <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
      {error ? (
        <Typography color="error">Failed to load content.</Typography>
      ) : (
        <Box
          sx={{
            position: 'relative',
            width,
            paddingBottom: '56.25%', // Maintains a 16:9 aspect ratio
            overflow: 'hidden',
          }}
        >
          <iframe
            ref={iframeRef}
            srcDoc={htmlContent}
            title={title}
            style={{
              border: '0',
              position: 'absolute',
              top: 0,
              left: 0,
              width,
              height,
            }}
            loading="lazy"
          />
        </Box>
      )}
    </Paper>
  );
};

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Grid sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Grid>
      )}
    </div>
  );
};

const ShowAnalysesResults = (props) => {

  const {
    analysisJson,
    htmls,
    value,
    handleChange,
    jobData
  } = props;

  console.log("ShowAnalyisResults props", props)

  const renderTabLabels = (analysisJson, value, handleChange) => {
    const a11yProps = (index) => {
      return {
        id: `simple-tab-${index}`,
        "aria-controls": `simple-tabpanel-${index}`,
      };
    };

    console.log("analysisJson", analysisJson);
    const keys = Object.keys(analysisJson);
    return (
      <Tabs
        value={value}
        onChange={handleChange}
      >
        {
          keys.map((key, index) => (
            console.log("key", key),
            <Tab label={key} {...a11yProps(index)} key={index} />
          ))
        }
      </Tabs >
    )
  }

  const scrollToBottom = () => {
    ref.current.scrollTop = ref.current.scrollHeight;
  }

  const renderTabs = (htmls, value, jobData) => {

    let finished_analyses = []
    if (htmls != undefined) {
      finished_analyses = Object.keys(htmls);
      console.log("finished_analyses", finished_analyses);
    }

    let jobKeys = []
    if (jobData != undefined) {
      console.log("jobData", jobData)
      jobKeys = Object.keys(jobData["jobs"])
    }

    // TODO
    // only run the scroll to bottom function
    // when the tab contains a log file

    // TODO
    // pass information to render renderTab to distinguish
    // between log files and results files

    console.log("renderTabs jobStatus", jobData)
    console.log("renderTabs finished_analyses", finished_analyses)
    console.log("renderTabs jobKeys", jobKeys)

    return (
      <>

        {finished_analyses.length === 0
          ? Object.keys(analysisJson).map((_, index) => (
            <TabPanel value={value} index={index}>
              <Typography variant={"h6"}> No results yet </Typography>
            </TabPanel>
          ))
          : finished_analyses.map((key, index) => (
            <TabPanel value={value} index={index}>
              <IframeEmbed
                htmlContent={htmls[key]}
                title={key}
                width="100%"
                height="600px"
              />
            </TabPanel>
          ))
        }
      </>
    )
  }
  return (
    <>
      {renderTabLabels(analysisJson, value, handleChange)}
      {renderTabs(htmls, value, jobData)}
    </>
  )
}

export default ShowAnalysesResults;