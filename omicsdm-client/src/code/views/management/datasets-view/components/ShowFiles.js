import React from 'react';
import { Link } from 'react-router';

import OMICSDM_BUTTON from '../../../components/buttonCollection/buttons';

export default function ShowFiles(props){

  const { selected } = props;

  return(
    <>
      {Object.keys(selected).length > 0 ? (
        <Link
          to={{
            pathname: "/files",
            state: {
              selectedDatasets: selected,
            },
          }}
        >
          <OMICSDM_BUTTON>
            Show to the selected dataset/s associated files
          </OMICSDM_BUTTON>
        </Link>
      ) : (
        <Link to={"/files"}>
          <OMICSDM_BUTTON data-cy={"show-all-files"}>
            Show all files
          </OMICSDM_BUTTON>
        </Link>
      )}
    </>
  )
}