import React, { useEffect, useState } from 'react';
import { Box, Stepper, Step, StepButton, Button, Typography } from '@mui/material';

export default function HorizontalNonLinearStepper(props) {

  const {
    steps,
    components,
    requiredStatesToBeSet,
  } = props;
  // steps = list of strings
  // components = object of components
  // disableNextButton = function to disable the next button
  // requiredStatesToBeSet = array of states that need to be set before the next button is enabled

  const [activeStep, setActiveStep] = useState(0);
  const [isNextDisabled, setIsNextDisabled] = useState(true);

  const handleNext = () => {
    if (isNextDisabled) {
      return
    }

    if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1);
      setIsNextDisabled(true);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleStep = (step) => () => {
    setActiveStep(step);
  };

  useEffect(() => {
    console.log("activeStep", activeStep);
    console.log("requiredStatesToBeSet", requiredStatesToBeSet);

    if (activeStep + 2 > steps.length) {
      return;
    }

    const key = `step${activeStep + 1}To${activeStep + 2}`;
    console.log("Stepper key", key);
    const requiredState = requiredStatesToBeSet[key];
    console.log("requiredState", requiredState);

    for (const [key, value] of Object.entries(requiredState)) {
      if (Object.keys(value).length > 0) {
        setIsNextDisabled(false);
        return;
      }
    }
    setIsNextDisabled(true);
  }, [activeStep, requiredStatesToBeSet]);

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
        <Button
          color="inherit"
          disabled={activeStep === 0}
          onClick={handleBack}
          sx={{ mr: 1 }}
        >
          Back
        </Button>
        <Box sx={{ flex: '1 1 auto' }} />
        {activeStep !== steps.length - 1 && (
          <Button
            onClick={handleNext}
            sx={{ mr: 1 }}
            disabled={isNextDisabled}
          >
            Next
          </Button>
        )}
      </Box>
      <Stepper nonLinear activeStep={activeStep}>
        {steps.map((label, index) => (
          <Step key={label} >
            <StepButton
              color="inherit"
              onClick={handleStep(index)}
              disabled={isNextDisabled && index === activeStep + 1}
            >
              {label}
            </StepButton>
          </Step>
        ))}
      </Stepper>
      {components[activeStep]}
    </>
  );
}