import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  CardActionArea,
  IconButton,
} from "@mui/material";

import Grid from "@mui/material/Grid";

import auth from "../../../Auth";
import { projectGet } from "../../../apis";

const { config } = window;

// TODO
// on server side when submit new project validate that the background image url is valid

// return page which shows the projects in a grid of buttons
// and allows the user to select one of them

const selectProject = () => {

  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);

  const [selectedProject, setSelectedProject] = useState({
    id: "",
    name: "",
    description: "",
  });

  const [initialized, setInitialized] = useState(false);
  const [redirect, setRedirect] = useState(false);

  const [redirectPath, setRedirectPath] = useState("");

  const [tokenExpired, setTokenExpired] = useState(false);

  const handleClick = (projectId) => {
    // filter projects by projectId
    const proj = projects.filter(
      (project) => project.project_id === projectId
    )[0];

    setSelectedProject({
      id: projectId,
      name: proj.name,
      description: proj.description,
    });

    if (window.location.href.includes("createdatasets")) {
      setRedirectPath("/submitdatasets");
    }

    if (window.location.href.includes("uploadfiles")) {
      setRedirectPath("/submitfiles");
    }
    setRedirect(true);
  };

  useEffect(() => {
    if (initialized) {
      return;
    }
    // for now hardcoded later might be used
    // to search for a specific project
    const query = {
      search: "",
    };

    if (auth.tokenExpired()) {
      setTokenExpired(true);
      return;
    }

    const getProjects = async (query) => {
      const response = await projectGet(
        auth.getToken(),
        config.api_endpoint,
        JSON.stringify(query)
      );
      const projs = await response.json();
      setProjects(projs.projects);
      setInitialized(true);
    };
    getProjects(query).catch(console.error);
  });

  useEffect(() => {
    if (!redirect) {
      return;
    }
    console.log("redirecting to ", redirectPath);
    console.log("selected project ", selectedProject);
    const state = { projectId: selectedProject.id };
    console.log("state ", state);
    navigate(redirectPath, { state, replace: true });
    console.log("Updated location:", window.location.href)
  }, [redirect]);

  if (tokenExpired) {
    return (
      <div>
        <h1>Session expired. Please login again</h1>
      </div>
    );
  }

  // TODO
  // missing a token expired error message
  // if (auth.tokenExpired()) {
  //     this.setState({
  //       popupErrors: "Session expired. Please login again",
  //     });
  //   }

  return (
    <>
      <Typography variant="h6" gutterBottom>
        First select your project
      </Typography>
      <Grid container spacing={2}>
        {/* 4 * X grid */}
        {projects.map((project) => (
          <IconButton>
            <Grid item>
              <Card sx={{ maxWidth: 345, minWidth: 200 }}>
                <CardActionArea
                  id={project.project_id}
                  onClick={() => handleClick(project.project_id)}
                >
                  <CardMedia
                    component="img"
                    style={{
                      width: "30%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                    image={project.logo_url}
                    alt=""
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                      {project.project_id}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {project.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          </IconButton>
        ))}
      </Grid>
    </>
  );
}

export default selectProject;