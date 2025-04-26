import React, {
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";

import AWS from "aws-sdk";

import Evaporate from "evaporate";

import auth from "../../../../Auth.js";

import UploadItem from "./UploadItem/UploadItem.js";

import {
  file_upload_start,
  file_upload_finish,
  extraFileUploadFinish,
  project
} from "../../../../apis.js";

const { config } = window;

import toast from "react-hot-toast";

// TODO
// look into how to make the file upload paused/resumeable

export const S3Uploader = forwardRef((props, ref) => {

  console.log("S3Uploader");
  console.log("props", props);
  console.log("ref", ref);

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [progressFiles, setProgressFiles] = useState(null);

  const evaporateDefaults = {
    signHeaders: { Authorization: auth.getToken() },

    // both crypto methods seems to be only needed for signature v4
    cryptoMd5Method: function (data) {
      return AWS.util.crypto.md5(data, "base64");
    },
    cryptoHexEncodedHash256: function (data) {
      return AWS.util.crypto.sha256(data, "hex");
    },
  };

  const createEvaporateInstance = () =>
    Evaporate.create({
      ...evaporateDefaults,
      ...config.config_aws,
    });

  const addFile = async (evaporateInstance, file, row, uploadType, projectIdOrData) => {

    console.log("ReactS3UploaderCustomFunctional addFile");
    console.log("file", file);
    console.log("row", row);
    console.log("uploadType", uploadType);
    console.log("projectIdOrData", projectIdOrData);

    const fileName = file.name;
    const metaData = {};

    row
      .filter((col) => col.id !== "file")
      .forEach((col) => (metaData[col.id] = col.value));

    metaData.fileName = fileName;
    let name = projectIdOrData[`${uploadType}AwsKey`];
    if (uploadType === "molecularData") {
      metaData.projectId = projectIdOrData;

      //post request to server to get aws ObjectKey
      // call to the backend to get aws ObjectKey and store meta data
      // example key: test_id/testfile_uploadedVersion_2.csv 

      const resFileUploadStart = await file_upload_start(
        auth.getToken(),
        config.api_endpoint,
        JSON.stringify(metaData)
      );

      const data = await resFileUploadStart.json();
      if (resFileUploadStart.status != 200) {
        toast.error(data.message);
        throw new Error(`HTTP error! status: ${resFileUploadStart.status}`);
      } else {
        name = data.awsKey;
      }
    }

    console.log("name", name);

    evaporateInstance.add({
      name: name,
      file,
      started: (file) => { },
      progress: (progressValue) => {
        setProgressFiles({
          ...progressFiles,
          [file.name]: progressValue * 100,
        });
      },
      complete: async (_xhr, awsKey) => {
        if (_xhr.status !== 200) {
          return;
        }

        let resFileUploadDone = null;
        // post request to server to update the file status in the db
        if (uploadType === "molecularData") {
          resFileUploadDone = await file_upload_finish(
            auth.getToken(),
            config.api_endpoint,
            JSON.stringify({ aws_key: awsKey })
          );
        } else {
          resFileUploadDone = await extraFileUploadFinish(
            auth.getToken(),
            config.api_endpoint,
            JSON.stringify({ aws_key: awsKey })
          );
        }

        if (resFileUploadDone.status != 200) {
          // TODO
          // show error message in the UI
          throw new Error(`HTTP error! status: ${resFileUploadDone.status}`);
        }

        const res = await resFileUploadDone.json();

        if (res.message == "File upload finished") {
          props.handleUploadedFilesChanged(file.name);
        }
      },
    });
  };

  const uploadToS3 = async (row, uploadType, projectId) => {
    console.log("ReactS3UploaderCustomFunctional uploadToS3");
    console.log("row", row);
    console.log("uploadType", uploadType);
    console.log("projectId", projectId);

    const evaporateInstance = await createEvaporateInstance();

    // upload in parallel
    // returns true if all files of one row are uploaded

    // FIXME
    // SonarQube
    // Consider using 'await' for the promise inside this 'try'
    // or replace it with 'Promise.prototype.catch(...)' usage.

    // !FIXME
    // addFile should include the project id

    const results = await Promise.all(
      selectedFiles.map((file) => {
        try {
          addFile(evaporateInstance, file, row, uploadType, projectId);
          return true;
        } catch (error) {
          return false;
        }
      })
    );
    // returns true if all files of one row are uploaded successfully
    return results.every(Boolean);
  };

  const onChange = (event) => {
    const progressDict = {};
    const files = Array.from(event.target.files);
    const fileNames = files.map((file) => file.name);

    // create progress dictionary
    files.forEach((file) => {
      progressDict[file.name] = 0;
    });

    setProgressFiles(progressDict);
    setSelectedFiles(files);

    console.log("ReactS3UploaderCustomFunctional onChange");
    console.log("fileNames", fileNames);
    console.log("props", props);
    console.log("event", event);

    // if (window.location.href.includes("files")) {
    //   props.onChange(fileNames, props.rowId, props.colId);
    //   return
    // }

    // add the following infos to event.target name, value
    // below is needed for the dataset submission
    const updatedEvent = {
      ...event,
      target: {
        ...event.target,
        name: `${props.colId}-${props.rowId}`,
        value: fileNames,
      },
    };
    props.onChange(updatedEvent, fileNames);
  };

  // handle exposes the function to parent ref
  useImperativeHandle(ref, () => ({
    startUpload(rows, uploadType, projectIdOrData) {
      if (uploadType === "molecularData") {
        console.log("projectId", projectIdOrData);
        return uploadToS3(rows[props.rowId], uploadType, projectIdOrData);
      }
      return uploadToS3(
        rows[props.rowId],
        uploadType,
        projectIdOrData[props.rowId]
      );
    },
  }));

  const renderProgressBar = () => {
    return progressFiles
      ? Object.entries(progressFiles).map(([key, value]) => (
        <UploadItem key={key} name={key} progress={value} />
      ))
      : null;
  };

  return (
    <>
      <input
        type="file"
        id="files"
        multiple
        onChange={onChange}
      />
      {/* {progressFiles && <UploadProgressMulti progressFiles={progressFiles} />} */}
      {/* {progressFiles && <UploadProgress progressFiles={progressFiles} />} */}
      {renderProgressBar()}
    </>
  );
});
