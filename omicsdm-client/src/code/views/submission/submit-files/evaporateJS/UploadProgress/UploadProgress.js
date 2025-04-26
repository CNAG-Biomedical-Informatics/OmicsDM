import React, { useEffect } from "react";
import { size, toArray } from "lodash";

import UploadItem from "../UploadItem/UploadItem";
import Styles from "./UploadProgress.module.css";

export const UploadProgress = (props) => {
  const { progressFiles } = props;

  const uploadedFileAmount = size(progressFiles);

  return uploadedFileAmount > 0 ? (
    <div className={Styles.wrapper}>
      <h4>Uploading File</h4>

      {size(progressFiles)
        ? Object.entries(progressFiles).map(([key, value]) => (
            <UploadItem name={key} progress={value} />
          ))
        : null}
    </div>
  ) : null;
};
