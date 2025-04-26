import React, { useEffect, useState } from "react";

import { 
  Typography, 
  Card, 
  CardContent, 
  CardActionArea, 
  Button, 
  Grid, 
  IconButton 
} from "@mui/material";

const AnalysisCards = (props) => {
  const {
    cardType,
    objectList,
    selectedCard,
    // handleClick,
    onChange,
    handleUsePreviousClick,
    selectedAnalysisId
  } = props;

  console.log("objectList", objectList)

  const showBorder = (cardType, selectedCard, index) => {
    console.log("cardType", cardType)
    if (cardType != "followUps") {
      return selectedCard == index
    }
    if (selectedCard == null) {
      return false
    }
    return selectedCard.includes(index)
  }
  // Remove classes
  // const classes = useStyles();

  const handleClick = async (id, cardType, selectedCard, onChange, cardInfo) => {
    console.log("id", id)
    console.log("selectedCard", selectedCard)
    console.log("cardInfo", cardInfo)
    console.log("onChange", onChange)
    console.log("cardType", cardType)

    // TODO
    // it should first be checked if the analysis of the selected card has already been done in the past
    // if yes, then the user should be asked if he wants to use the previous results
    // if no, then the analysis should be done

    const template = await getFollowingCards(
      cardInfo.name,
      cardType
    )
    console.log("template", template)
    console.log("update template", analysisJson)

    setJson({
      ...analysisJson,
      json: {
        ...analysisJson.json,
        ...template
      }
    })

    if (cardType === "followUps") {
      // on change should be able to set multiple values
      console.log("followUps - HERE")
      onChange(prevState => {
        console.log("prevState", prevState)
        if (prevState == null) {
          console.log("prevState == null")
          return [id]
        }
        if (prevState.includes(id)) {
          console.log("prevState.includes(id)", prevState.includes(id))
          return prevState.filter(item => item !== id)
        }
        else {
          console.log("prevState does not include(id)", prevState.includes(id))
          return [...prevState, id]
        }
      })
    }
    else {
      onChange(prevState => prevState == id ? null : id)
    }
  };

  return (
    <>
      {objectList.map((object, index) => (
        <IconButton key={index}>
          <Grid item>
            <Card
              sx={{ 
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: showBorder(cardType, selectedCard, index) ? 'solid 1px blue' : 'solid 1px white',
                maxWidth: 345,
                minWidth: 200
              }}
            >
              <CardActionArea
                onClick={() => handleClick(index, cardType, selectedCard, onChange, objectList[index])}
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
                    onClick={() => handleUsePreviousClick(cardType, object.name)}
                  >
                    use previous results
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleSkipClick(cardType, object.name)}
                  >
                    Skip
                  </Button>
                  <Typography variant="body2" color="text.secondary">
                    {selectedAnalysisId}
                  </Typography>
                </>
              ) : (null)}
            </Card>
          </Grid>
        </IconButton>
      ))
      }
    </>
  )
}

export default AnalysisCards;
