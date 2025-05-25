import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
  Tabs,
  Tab,
} from "@mui/material";

import Grid from "@mui/material/Grid";

import JSONEditorWrapper from "../../../components/jsonEditor";

import {
  analysisTypesReq,
  analysisTemplateQuery,
  getPreviousAnalyses,
  file,
} from "../../../../apis";
import auth from "../../../../Auth";

import ReactQueryTable from "../../../components/dataTable/ReactQueryTable";

const renderCards = (
  cardType,
  objectList,
  selectedCard,
  handleClick,
  onChange,
  handleUsePreviousClick,
  selectedAnalysisId = ""
) => {
  const showBorder = (cardType, selectedCard, index) => {
    if (cardType !== "followUps") {
      return selectedCard === index;
    }
    if (selectedCard == null) {
      return false;
    }
    return selectedCard.includes(index);
  };

  return (
    <>
      {objectList.map((object, index) => (
        <IconButton key={index}>
          <Grid item>
            <Card
              sx={{
                maxWidth: 345,
                minWidth: 200,
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: showBorder(cardType, selectedCard, index)
                  ? "solid 1px blue"
                  : "white",
              }}
            >
              <CardActionArea
                onClick={() =>
                  handleClick(
                    index,
                    cardType,
                    selectedCard,
                    onChange,
                    objectList[index]
                  )
                }
              >
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {object.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {object.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
              {cardType === "base" ? (
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() =>
                      handleUsePreviousClick(cardType, object.name)
                    }
                  >
                    use previous results
                  </Button>
                  <Typography variant="body2" color="text.secondary">
                    {selectedAnalysisId}
                  </Typography>
                </>
              ) : null}
            </Card>
          </Grid>
        </IconButton>
      ))}
    </>
  );
};

export default function ConfigureAnalysis(props) {
  const { setJson, analysisJson, filesSelected } = props;

  // example for filesSelected (= rowIdToSelectedVersionAndId)
  // {
  // "3tr?proj1?test?info_TEST_134_135.csv": {"fileVersion": 1, "fileId": 1},
  // "3tr?proj1?test?COUNTS_genes_TEST_134_135_summed.csv": {"fileVersion": 1, "fileId": 2}
  // }
  console.log("filesSelected", filesSelected);

  const [analysisTypes, setAnalysisTypes] = useState([]);

  const [baseAnalyses, setBaseAnalyses] = useState([]);
  const [followUpAnalyses, setFollowUpAnalyses] = useState([]);

  const [analysisType, setAnalysisType] = useState(null);
  const [baseAnalysis, setBaseAnalysis] = useState(null);
  const [followUpAnalysis, setFollowUpAnalysis] = useState(null);

  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);

  const [assignedFiles, setAssignedFiles] = useState({});

  const [selectedAnalysisId, setAnalysisId] = useState("");

  const [usePreviousResults, setUsePreviousResults] = useState(false);
  const [previousAnalyses, setPreviousAnalyses] = useState([]);

  const [tableData, setTableData] = useState({});
  const [returnedJson, setReturnedJson] = useState({});

  const [columnFilters, setColumnFilters] = useState([]);

  // TODO
  // better put them together in a single object
  // {analysisLevel: "", analysisName: ""}
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedAnalysisLevel, setSelectedAnalysisLevel] = useState(null);

  const getFollowingCards = async (
    selectedCard,
    cardType,
    assignedFiles,
    previousAnalysisId
  ) => {
    // explanation
    // when usePreviousResults is true,
    // then the backend should return a modified template
    // in which based_on is set to the selectedAnalysisId

    const query = {
      analysisName: selectedCard,
      analysisLevel: cardType,
      usePreviousResults: usePreviousResults,
      previousAnalysisId: previousAnalysisId,
      selectedFiles: assignedFiles,
    };
    console.log("query", query);

    const res = await analysisTemplateQuery(
      auth.getToken(),
      config.api_endpoint,
      JSON.stringify(query)
    );
    if (res.status !== 200) {
      console.log("Error getting analysis templates");
      // set error message
    }
    const data = await res.json();
    console.log("data", data);
    if (cardType === "analysisTypes") {
      setBaseAnalyses(data.follow_ups);
    }

    if (cardType === "base") {
      setFollowUpAnalyses(data.follow_ups);
      // if (usePreviousResults) {
      //   console.log("use previous results")
      //   return
      // }
    }
    return data.template;
  };

  const handleClick2 = async (
    id,
    cardType,
    selectedCard,
    onChange,
    cardInfo
  ) => {
    console.log("id", id);
    console.log("selectedCard", selectedCard); // not needed
    console.log("cardInfo", cardInfo);
    console.log("onChange", onChange);
    console.log("cardType", cardType);

    // TODO
    // it should first be checked if the analysis of the selected card has already been done in the past
    // if yes, then the user should be asked if he wants to use the previous results
    // if no, then the analysis should be done

    const template = await getFollowingCards(
      cardInfo.name,
      cardType,
      assignedFiles,
      selectedAnalysisId
    );
    console.log("template", template);
    console.log("update template", analysisJson);

    setSelectedCard(cardInfo.name);
    setSelectedAnalysisLevel(cardType);
    setJson({
      ...analysisJson,
      json: {
        ...analysisJson.json,
        ...template,
      },
    });

    // open modal for the user to assign the file types (counts, info, etc.)
    // but only if the template expects files
    if (Object.keys(template[cardInfo.name]?.files).length > 0) {
      setOpen(true);
    }
  };

  const handleClose = async (analysisId) => {
    // query API to get the analysis template
    // pass the selected files to the API
    // so the analysis template can be updated with the selected files

    console.log("assignedFiles", assignedFiles);
    console.log("selectedAnalysisId", selectedAnalysisId);
    console.log("selectedCard", selectedCard);

    const template = await getFollowingCards(
      selectedCard,
      selectedAnalysisLevel,
      assignedFiles,
      analysisId
    );
    console.log("template", template);
    console.log("update template", analysisJson);

    setJson({
      ...analysisJson,
      json: {
        ...analysisJson.json,
        ...template,
      },
    });
    setOpen(false);
  };

  const handleUsePreviousClick = async (cardType, selectedCard) => {
    // TODO
    // query the backend to check if the analysis using
    // the selected files has already been done

    // if yes, then return the analysis_id of the previous analyses
    // if no, then return null => setPreviousResults()

    console.log("cardType", cardType);
    console.log("selectedCard", selectedCard);

    const fileNames = Object.keys(filesSelected).map((file) =>
      file.split("?").pop()
    );

    const query = {
      analysisType: cardType,
      analysisName: selectedCard,
      usedFiles: fileNames,
    };
    const previousAnalyses = await getPreviousAnalyses(
      auth.getToken(),
      config.api_endpoint,
      JSON.stringify(query)
    );
    if (previousAnalyses.status !== 200) {
      console.log("Error getting previous analyses");
      // set error message
    }
    const data = await previousAnalyses.json();
    console.log("data", data);

    if (data.analysis_ids.length > 0) {
      setPreviousAnalyses(data.analysis_ids);
    }
    setUsePreviousResults(true);
    setSelectedCard(selectedCard);
    setSelectedAnalysisLevel(cardType);
    setOpen2(true);
  };

  const handleClick = async (
    id,
    cardType,
    selectedCard,
    onChange,
    cardInfo
  ) => {
    console.log("id", id);
    console.log("selectedCard", selectedCard);
    console.log("cardInfo", cardInfo);
    console.log("onChange", onChange);
    console.log("cardType", cardType);

    // TODO
    // it should first be checked if the analysis of the selected card has already been done in the past
    // if yes, then the user should be asked if he wants to use the previous results
    // if no, then the analysis should be done

    const template = await getFollowingCards(cardInfo.name, cardType);
    console.log("template", template);
    console.log("update template", analysisJson);

    setJson({
      ...analysisJson,
      json: {
        ...analysisJson.json,
        ...template,
      },
    });

    if (cardType === "followUps") {
      // on change should be able to set multiple values
      console.log("followUps - HERE");
      onChange((prevState) => {
        console.log("prevState", prevState);
        if (prevState == null) {
          console.log("prevState == null");
          return [id];
        }
        if (prevState.includes(id)) {
          console.log("prevState.includes(id)", prevState.includes(id));
          return prevState.filter((item) => item !== id);
        } else {
          console.log("prevState does not include(id)", prevState.includes(id));
          return [...prevState, id];
        }
      });
    } else {
      onChange((prevState) => (prevState == id ? null : id));
    }
  };

  useEffect(() => {
    console.log("useEffect get Analysis Types");
    if (analysisTypes.length === 0) {
      // get from the props the selected files
      // and parse out the file extensions
      const fileExtensions = ".csv";
      console.log("fileExtensions", fileExtensions);

      const getAnalysisTypes = async (fileExtensions) => {
        // TODO
        // it would be good only show the analysis types
        // that fit to the selected files
        const query = {
          fileExtensions: fileExtensions,
        };
        console.log("query", query);

        const response = await analysisTypesReq(
          auth.getToken(),
          config.api_endpoint,
          JSON.stringify(query)
        );
        if (response.status !== 200) {
          console.log("Error getting analysis types");
          // set error message
        }
        const data = await response.json();
        console.log("data", data);
        setAnalysisTypes(data.analysis_types);
      };
      getAnalysisTypes(fileExtensions);
      console.log("initialized");
    }
  });

  const resetTemplateBasedConfiguration = () => {
    console.log("resetTemplateBasedConfiguration");
    setJson({ json: {} });
    setAnalysisType(null);
    setBaseAnalysis(null);
    setFollowUpAnalysis(null);
  };

  const TemplateBasedConfiguration = () => {
    return (
      <>
        <Button
          variant="contained"
          style={{ backgroundColor: "red" }}
          onClick={resetTemplateBasedConfiguration}
        >
          Reset
        </Button>
        <br></br>
        <br></br>
        <Typography variant={"h6"}>1. Select an analysis type</Typography>
        {renderCards(
          "analysisTypes",
          analysisTypes,
          analysisType,
          handleClick,
          setAnalysisType
        )}
        <br></br>
        <br></br>
        <Typography variant={"h6"}>2. Select a base analysis</Typography>
        {renderCards(
          "base",
          baseAnalyses,
          baseAnalysis,
          handleClick2,
          setBaseAnalysis,
          handleUsePreviousClick,
          selectedAnalysisId
        )}
        <br></br>
        <br></br>
        <Typography variant={"h6"}>
          3. Select one or multiple follow ups
        </Typography>
        {renderCards(
          "followUps",
          followUpAnalyses,
          followUpAnalysis,
          handleClick2,
          setFollowUpAnalysis
        )}
      </>
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

  const a11yProps = (index) => {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  };

  const [selectedTab, setSelectedTab] = useState(0);
  const handleChangTab = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleFileSelection = (event, fileType) => {
    console.log("event", event);
    console.log("fileType", fileType);
    console.log("event.target", event.target);
    console.log("event.target.value", event.target.value);
    const updatedAssignedFiles = {
      ...assignedFiles,
      [fileType]: event.target.value,
    };
    console.log("updatedAssignedFiles", updatedAssignedFiles);
    setAssignedFiles(updatedAssignedFiles);
  };

  const renderFileSelection = (
    analysisObj,
    analysis,
    filesSelected,
    selectedCard
  ) => {
    console.log("analysisObj", analysisObj);
    console.log("selectedCard", selectedCard);

    // if the analysisObj does not have a file selection
    // then return null
    const fileSelections = analysisObj.json[analysis]?.files;
    console.log("fileSelections", fileSelections);
    console.log("filesSelected", filesSelected);
    if (fileSelections === undefined) {
      console.log("analysisObj.json[analysis]?.files === undefined");
      return null;
    }

    const fileNames = Object.keys(filesSelected).map((file) =>
      file.split("?").pop()
    );
    console.log("fileNames", fileNames);

    const renderCircleWithOr = () => {
      return (
        <Paper
          elevation={4}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: 40,
            height: 40,
            borderRadius: "50%", // Creates the circle shape
            margin: "16px 0", // Adjust spacing around the circle
            backgroundColor: "primary.main",
            color: "white",
          }}
        >
          <Typography variant="caption">OR</Typography>
        </Paper>
      );
    };

    const renderReactomeMappingFileSelector = () => {
      const file_suffix = "2Reactome_All_Levels.txt";

      const bioDbsIdentfiers = [
        "UniProt", // protein sequence and functional information
        "ChEBI", // Chemical Entities of Biological Interest
        "Ensembl", // genome assemblies, gene annotations, functional annotations...
        "miRBase", // microRNA sequences and annotation
        "NCBI", // National Center for Biotechnology Information
        "GtoP", // Gene to Pathways
      ];

      return (
        <FormControl sx={{ m: 1, minWidth: 120 }}>
          <InputLabel id="select-1-label">
            {" "}
            Reactome identifier mapping file{" "}
          </InputLabel>
          <Select
            onChange={(event) =>
              handleFileSelection(event, "use_reactome_identifier_mapping_file")
            }
            id={"use_reactome_identifier_mapping_file"}
          >
            {bioDbsIdentfiers.map((file) => (
              <MenuItem value={file + file_suffix}>
                {file + file_suffix}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    };

    const fgseaSpecific = (analysis) => {
      if (analysis !== "fgsea") {
        return null;
      }
      return (
        <>
          {renderCircleWithOr()}
          {renderReactomeMappingFileSelector()}
        </>
      );
    };

    return (
      <>
        {Object.keys(fileSelections).map((key) => (
          <FormControl sx={{ m: 1, minWidth: 120 }}>
            <InputLabel id={`select-${key}-label`}>{key}</InputLabel>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Select
                value={assignedFiles?.countFile}
                onChange={(event) => handleFileSelection(event, key)}
                id={`select-${key}`}
              >
                {fileNames.map((file) => (
                  <MenuItem value={file}>{file}</MenuItem>
                ))}
              </Select>
            </Box>
            {fgseaSpecific(analysis)}
          </FormControl>
        ))}
      </>
    );
  };

  const handleAnalysisSelection = (event) => {
    console.log("event", event);
    console.log("event.target", event.target);
    console.log("event.target.value", event.target.value);
    setAnalysisId(event.target.value);
  };

  const renderAnalysesSelection = (analysisId) => {
    return (
      <FormControl sx={{ m: 1, minWidth: 120 }}>
        <InputLabel id="select-1-label">Analysis</InputLabel>
        <Select
          value={analysisId}
          onChange={handleAnalysisSelection}
          id={"Analysis-select"}
        >
          {previousAnalyses.map((analysis) => (
            <MenuItem value={analysis}>{analysis}</MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  };

  const handleClose2 = async (reRunBool, analysisId) => {
    console.log("reRunBool", reRunBool);
    console.log("analysisId", analysisId);

    const template = await getFollowingCards(
      selectedCard,
      selectedAnalysisLevel,
      assignedFiles,
      analysisId
    );
    console.log("template", template);
    console.log("update template", analysisJson);

    setJson({
      ...analysisJson,
      json: {
        ...analysisJson.json,
        ...template,
      },
    });

    if (reRunBool) {
      // TODO
    }
    setOpen2(false);
  };

  // TODO
  // Use previous results button should be only visible if the there already exists an analysis result
  // which had at least one of the selected files as Input

  const renderFileSelectionDialog = (
    analysisJson,
    selectedCard,
    filesSelected
  ) => {
    console.log("filesSelected", filesSelected);
    console.log("analysisJson", analysisJson);
    console.log("analysisJson.json", analysisJson.json);
    console.log("selectedCard", selectedCard);

    const selectedCardOptions = analysisJson.json[selectedCard];
    console.log("selectedCardOptions", selectedCardOptions);

    console.log(
      "if (selectedCardOptions.options.use_reactome_identifier_mapping_file)",
      selectedCardOptions.options.use_reactome_identifier_mapping_file
    );

    const renderExplanation = (selectedCardOptions) => {
      if (
        Object.keys(selectedCardOptions.options).includes(
          "use_reactome_identifier_mapping_file"
        )
      ) {
        return "You can either select an uploaded gmt file or select a reactome identifier mapping file";
      }
    };

    const disableConfirmButton = () => {
      const requiredKeys = ["counts", "info"];
      const allKeysArePresent = requiredKeys.every((key) =>
        Object.keys(assignedFiles).includes(key)
      );
      return !allKeysArePresent;
    };

    return (
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle id="alert-dialog-title">
          Please select the files for the analysis step: {selectedCard}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {renderExplanation(selectedCardOptions)}
          </DialogContentText>
          {renderFileSelection(
            analysisJson,
            selectedCard,
            filesSelected,
            selectedCard
          )}
        </DialogContent>
        <DialogActions style={{ justifyContent: "space-between" }}>
          <Button onClick={() => handleClose(null)} sx={{ color: "red" }}>
            Cancel
          </Button>
          <Button
            onClick={() => handleClose(selectedAnalysisId)}
            autoFocus
            // disabled={disableConfirmButton()}
          >
            Confirm selection
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const tableCols = useMemo(() => {
    return [
      {
        accessorKey: "id",
        header: "ID",
      },
      {
        accessorKey: "name",
        header: "Name",
      },
      {
        accessorKey: "description",
        header: "Description",
      },
      {
        accessorKey: "submitter_name",
        header: "Submitter",
      },
      {
        accessorKey: "submit_date",
        header: "Submitted",
        enableColumnFilter: false,
      },
    ];
  });

  const handleRowButtonClick = (row) => {
    console.log("handleRowButtonClick", row);
    const analysisJson = {
      json: row.original.analysis_settings,
    };
    setJson(analysisJson);
  };

  const renderRowActionButton = (row) => {
    return (
      <div style={{ display: "flex", flexWrap: "nowrap", gap: "0.5rem" }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            console.info("View Profile", row);
            handleRowButtonClick(row);
          }}
        >
          Copy
        </Button>
      </div>
    );
  };

  useEffect(() => {
    console.log("returnedJson", returnedJson);
    if (!returnedJson) return;
    setTableData(returnedJson);
  }, [returnedJson]);

  return (
    <Grid container>
      <Grid item xs={6}>
        <br />
        <Typography variant={"h6"}>
          As a starting point please use the prefilled templates or take a
          finished analysis
        </Typography>
        <Tabs
          value={selectedTab}
          onChange={handleChangTab}
          aria-label="basic tabs example"
          variant="fullWidth"
        >
          <Tab label="Templates" {...a11yProps(0)} />
          <Tab label="Finished Analyses" {...a11yProps(1)} />
        </Tabs>
        <TabPanel value={selectedTab} index={0}>
          <TemplateBasedConfiguration />
        </TabPanel>
        <TabPanel value={selectedTab} index={1}>
          <ReactQueryTable
            queryId={"analysis-submission-finished-analyses-table"}
            tableCols={tableCols}
            tableData={tableData}
            endpoint={"api/analysis/data"}
            enableRowSelection={false}
            enableRowActions={true}
            renderRowActionButton={renderRowActionButton}
            rowIdKeys={["id"]}
            setReturnedJson={setReturnedJson}
            enablePagination={false}
            defaultPageSize={10}
            enableHiding={false}
            columnFilters={columnFilters}
            setColumnFilters={setColumnFilters}
          />
        </TabPanel>
      </Grid>
      <Grid item xs={6}>
        <br></br>
        <br></br>
        <br></br>
        <JSONEditorWrapper content={analysisJson} onChange={setJson} />
        {open
          ? renderFileSelectionDialog(analysisJson, selectedCard, filesSelected)
          : null}
        {open2 ? (
          <Dialog open={open2} onClose={handleClose2}>
            <DialogTitle id="alert-dialog-title">
              {
                "It looks like the analysis has already been run. Do you want to run it again?"
              }
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                No worries, the previous results will not be overwritten.
              </DialogContentText>
              <DialogContentText>
                If you want to use the output of the previous run, please select
                the corresponding analysis in the list of finished analyses.
              </DialogContentText>
              {renderAnalysesSelection(selectedAnalysisId)}
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => handleClose2(false, selectedAnalysisId)}
                autoFocus
              >
                use the output of the selected previous run
              </Button>
              <Button onClick={() => handleClose2(true)}>run it again</Button>
            </DialogActions>
          </Dialog>
        ) : (
          <></>
        )}
      </Grid>
    </Grid>
  );
}
