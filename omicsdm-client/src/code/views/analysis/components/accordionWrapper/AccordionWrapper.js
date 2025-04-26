import React from "react";
import { Accordion, AccordionSummary, AccordionDetails, Typography } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function MyAccordionComponent({
  title,
  wrappedComponent: WrappedComponent,
  wrappedComponentProps,
}) {

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6" align="center">
          Expand to {title}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <WrappedComponent {...wrappedComponentProps} />
      </AccordionDetails>
    </Accordion>
  );
}
