import React, { useEffect, useState } from "react";
import Styles from "./UploadItem.module.css";
import { Line } from "rc-progress";

const UploadItem = (props) => {
  
  const { name, progress } = props;
  

  const [barProgress, setBarProgress] = useState(0);

  // temporary fix to make sure that a row no longer jumps back to 0% after the file has been uploaded. 
  // This is because the progress state object ("progressFiles" in ReactS3UploaderCustomFunctional.js)
  // seems to be reset after the file has been uploaded.Not sure why this is happening as soon this is figured out
  // below should be removed and the render switched from {barProgress} to {progress}
  useEffect(() => {
    
    if (barProgress !== 100) {
      setBarProgress(progress);
    }
  }, [props.progress]);

  return (
    <>
      <p>
        File {name} Progress {Math.round(barProgress * 100) / 100} %
      </p>
      <Line
        strokeWidth={1}
        strokeColor={barProgress === 100 ? "#00a626" : "#2db7f5"}
        percent={barProgress}
      />
    </>
  );
};

export default UploadItem;
