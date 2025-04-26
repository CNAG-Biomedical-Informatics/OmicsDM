import React from 'react';
import { Box, Typography } from '@mui/material';

const AnalysesResultsHeader = (props) => {
  console.log("HeaderFrame props", props);

  const {
    allAborted,
    analysisId,
    analysisName } = props;

  return (
    <Box ml="20px">
      {/* below commented out because it is still hardcoded */}
      {/* <Typography variant={"h6"} align={"left"}>
        Analysis Name: {analysisName}
      </Typography> */}

      {allAborted
        ? <Typography
          style={{ color: 'red' }}
          variant={"h6"}
          align={"left"}>
          ABORTED
        </Typography>
        : null
      }
    </Box>
  );
};

export default AnalysesResultsHeader;