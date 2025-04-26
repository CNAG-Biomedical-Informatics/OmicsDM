import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";

import toast from "react-hot-toast";

import auth from "../../../Auth";
import {
  analysisTemplate,
  analysisTemplatesList,
  analysisTemplateDelete,
} from "../../../apis";
import sampleData from "../../analysis/sampledata";

import OMICSDM_BUTTON from "../../components/buttonCollection/buttons";

import JSONEditorWrapper from "../../components/jsonEditor";

import AccordionWrapper from "./../../analysis/components/accordionWrapper/AccordionWrapper";
import { getColsDef } from "../../analysis/helpers";

import { TableWithDeleteRowButton } from "../../components/dataTable/DataTable";

// TODO as soon MaterialReactTable is v3
// add a custom text for no rows found

// e.g.
{/* <Typography variant="body2" color="textSecondary" align="center">
  No templates available. Please add a new template.
</Typography> */}

const AddOrModifyAnalysisTemplate = (props) => {

  const { setTemplates } = props;

  const [content, setContent] = useState({ json: {} });
  const [formValues, setFormValues] = useState({});

  const exampleTemplates = ["deseq2", "getgo", "fgsea"]

  const save = async () => {
    console.log("content", content);

    let analysisJson = null;
    analysisJson = content.text === undefined
      ? content.json
      : JSON.parse(content.text);

    // const analysisJson = JSON.parse(content.text);

    console.log("analysisJson", analysisJson)


    console.log("formValues", formValues);

    // API call to save the json
    const response = await analysisTemplate(
      auth.getToken(),
      config.api_endpoint,
      JSON.stringify({
        analysisType: formValues.analysisType,
        analysisDescription: formValues.description,
        analysisJson,
      })
    );
    // check if response is ok
    if (response.ok) {
      toast.success("Analysis template saved successfully");
      setTemplates((templates) => [
        ...templates,
        {
          analysisType: formValues.analysisType,
          name: Object.keys(analysisJson)[0],
          description: formValues.description,
        },
      ]);
    } else {
      const data = await response.json();
      console.log("Error saving analysis template", data);
      toast.error(data.message);
    }
  };

  const handleChangeForm = (input) => (e) => {
    setFormValues({ ...formValues, [input]: e.target.value });
  };

  const handleExampleButtonClicked = (template) => {
    console.log("template", template);
    console.log("sampleData", sampleData);
    console.log("sampleData.json", sampleData.json);
    const templateData = { [template]: sampleData.json[template] };
    setContent({ json: templateData });

    setFormValues({
      analysisType: "RNA-seq",
      description: `Example analysis template for ${template}`
    });
  }

  return (
    <>
      <p>Add the analysis settings below</p>
      <Grid item xs={12}>
        <Typography>Examples</Typography>
        {exampleTemplates.map((template) => ((
          <OMICSDM_BUTTON
            onClick={() => {
              handleExampleButtonClicked(template);
            }}
          > {template}
          </OMICSDM_BUTTON>
        ))
        )}
      </Grid>
      <br />
      <Grid container spacing={2}>
        <Grid item xs={12}>
          {/* TODO should be dropdown */}
          <TextField
            value={formValues.analysisType}
            id="analysis-type"
            label="Analysis Type"
            onChange={handleChangeForm("analysisType")}
            InputLabelProps={{ shrink: !!formValues.analysisType }}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            value={formValues.description}
            id="description"
            label="Description"
            onChange={handleChangeForm("description")}
            style={{ width: "100%" }}
            InputLabelProps={{ shrink: !!formValues.description }}
          />
        </Grid>
      </Grid >
      <br />
      <Grid container spacing={2} >
        <Grid item xs={6}>
          <JSONEditorWrapper
            content={content}
            onChange={setContent}
          />
        </Grid>
        <Grid item xs={6}>
          <Button
            variant="contained"
            color="primary"
            onClick={save}
          > Save to Server </Button>
        </Grid>
      </Grid>
    </>
  )
}

export default function AnalysisTemplates() {

  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    const fetchTemplates = async () => {
      const query = {
        analysisLevel: "analysisTypes"
      }
      const response = await analysisTemplatesList(
        auth.getToken(),
        config.api_endpoint,
        JSON.stringify(query)
      );
      const data = await response.json();
      console.log("Fetched templates", data); // Verify here the data is as expected
      console.log("Fetched templates length", data.length); // Verify here the data is as expected
      setTemplates(data.templates);
    };

    fetchTemplates();
  }, []);

  const handleDelete = async (templateName) => {
    const response = await analysisTemplateDelete(
      auth.getToken(),
      config.api_endpoint,
      JSON.stringify({ analysisName: templateName })
    );

    if (response.ok) {
      toast.success("Analysis template deleted successfully");
      const updatedTemplates = templates.filter((template) => template.name !== templateName);
      setTemplates(updatedTemplates);
    } else {
      toast.error("Error deleting analysis template");
    }
  };

  // TODO Tab View
  // Tab1 add new analysis template
  // Tab2 edit existing analysis template
  // Dropdown to select the analysis types
  // option to add a new analysis type
  // add an extra field type which specifies the pipeline type
  // snakemaker or nextflow

  const data = []
  for (const template of templates) {
    data.push({
      analysisType: template.analysisType,
      name: template.name,
      description: template.description
    });
  }

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Existing Templates
      </Typography>
      <TableWithDeleteRowButton
        data={data}
        accessorKeys={["analysisType","name","description"]}
        deleteId="name"
        confirmationQuestion="Are you sure you want to delete this template?"
        deletionHandler={handleDelete}
      />
      <br />
      <AccordionWrapper
        title={"Add or Modify Analysis Templates"}
        wrappedComponent={AddOrModifyAnalysisTemplate}
        wrappedComponentProps={{ templates, setTemplates }}
      />
    </>
  );
}