export async function download_excel(token, urlprefix, arg, excel_name) {
  try {
    const res = await fetch(`${urlprefix}api/template?arg=${arg}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: token,
      },
    });
    const blob = await res.blob();
    const href = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.setAttribute("download", excel_name);
    document.body.appendChild(a);
    a.click();
  } catch (err) {
    return console.error(err);
  }
}

export async function fileAll(token, urlprefix, data) {
  return fetch(`${urlprefix}api/files/all`, {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      connection: "keep-alive",
      Authorization: token,
    },
  });
}

export async function dataset(token, urlprefix, arg, data) {
  return fetch(`${urlprefix}api/datasets/${arg}`, {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      connection: "keep-alive",
      Authorization: token,
    },
  });
}

export async function project(token, urlprefix, data) {
  return fetch(`${urlprefix}api/projects/create`, {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      connection: "keep-alive",
      Authorization: token,
    },
  });
}

export async function submitRows(token, urlprefix, urlSuffix, data) {
  return fetch(`${urlprefix}api/${urlSuffix}`, {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      connection: "keep-alive",
      Authorization: token,
    },
  });
}

export function projectSubmissionCols(token, urlprefix) {
  return fetch(`${urlprefix}api/projects/submissioncols`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      connection: "keep-alive",
      Authorization: token,
    },
  });
}

export function submissionCols(token, urlprefix, urlSuffix) {
  return fetch(`${urlprefix}api/${urlSuffix}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      connection: "keep-alive",
      Authorization: token,
    },
  });
}

export function adminViewCols(token, urlprefix, api, data) {
  return fetch(`${urlprefix}api/${api}/adminviewcols`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      connection: "keep-alive",
      Authorization: token,
    },
  });
}

// TODO
// merge submissionCols and viewCols
export function projectViewCols(token, urlprefix) {
  return fetch(`${urlprefix}api/projects/viewcols`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      connection: "keep-alive",
      Authorization: token,
    },
  });
}

export async function projectGet(token, urlprefix, data) {
  return fetch(`${urlprefix}api/projects/all`, {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      connection: "keep-alive",
      Authorization: token,
    },
  });
}

export async function datasetSubmissionCols(token, urlprefix, data) {
  return fetch(`${urlprefix}api/datasets/submissioncols`, {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      connection: "keep-alive",
      Authorization: token,
    },
  });
}

export function getViewCols(token, urlprefix, urlsuffix) {
  return fetch(`${urlprefix}api${urlsuffix}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      connection: "keep-alive",
      Authorization: token,
    },
  });
}

export function datasetViewCols(token, urlprefix) {
  return fetch(`${urlprefix}api/datasets/viewcols`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      connection: "keep-alive",
      Authorization: token,
    },
  });
}

export function datasetAdminViewCols(token, urlprefix) {
  return fetch(`${urlprefix}api/datasets/adminviewcols`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      connection: "keep-alive",
      Authorization: token,
    },
  });
}

export async function fileViewCols(token, urlprefix) {
  return fetch(`${urlprefix}api/files/viewcols`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      connection: "keep-alive",
      Authorization: token,
    },
  });
}

export async function fileSubmissionCols(token, urlprefix) {
  return fetch(`${urlprefix}api/files/submissioncols`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      connection: "keep-alive",
      Authorization: token,
    },
  });
}

export async function getTableData(token, urlprefix, urlsuffix, data) {
  return fetch(`${urlprefix}api${urlsuffix}`, {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      connection: "keep-alive",
      Authorization: token,
    },
  });
}

export async function datasetAll(token, urlprefix, data) {
  return fetch(`${urlprefix}api/datasets/all`, {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      connection: "keep-alive",
      Authorization: token,
    },
  });
}

export async function projectAll(token, urlprefix, data) {
  return fetch(`${urlprefix}api/projects/admin/view`, {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      connection: "keep-alive",
      Authorization: token,
    },
  });
}

export async function projectUpdate(token, urlprefix, data) {
  return fetch(`${urlprefix}api/projects/admin/update`, {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      connection: "keep-alive",
      Authorization: token,
    },
  });
}

export async function fileAllAdmin(token, urlprefix, data) {
  return fetch(`${urlprefix}api/files/admin/view`, {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      connection: "keep-alive",
      Authorization: token,
    },
  });
}

export async function fileUpdate(token, urlprefix, data) {
  return fetch(`${urlprefix}api/files/admin/update`, {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      connection: "keep-alive",
      Authorization: token,
    },
  });
}

export async function datasetAllAdmin(token, urlprefix, data) {
  return fetch(`${urlprefix}api/datasets/admin/view`, {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      connection: "keep-alive",
      Authorization: token,
    },
  });
}

export function adminView(token, urlprefix, dataType, data) {
  return fetch(`${urlprefix}api/${dataType}/admin/view`, {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      connection: "keep-alive",
      Authorization: token,
    },
  });
}

export function adminExecuteUpdate(token, urlprefix, dataType, data) {
  return fetch(`${urlprefix}api/${dataType}/admin/update`, {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      connection: "keep-alive",
      Authorization: token,
    },
  });
}

export async function datasetUpdate(token, urlprefix, data) {
  return fetch(`${urlprefix}api/datasets/admin/update`, {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      connection: "keep-alive",
      Authorization: token,
    },
  });
}

// TODO
// create a function that will return a list of all the datasets
// but is filterable by the text input box
export function dataset_list(token, urlprefix, data) {
  return fetch(`${urlprefix}api/datasets/list`, {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: token,
    },
  });
}

export async function file(token, urlprefix, arg, data) {
  return fetch(`${urlprefix}api/files/${arg}`, {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      connection: "keep-alive",
      Authorization: token,
    },
  });
}

export async function file_upload_start(token, urlprefix, data) {
  return fetch(`${urlprefix}api/files/startupload`, {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      // connection: "keep-alive",
      Authorization: token,
    },
  });
}

export async function file_upload_finish(token, urlprefix, data) {
  return fetch(`${urlprefix}api/files/finishupload`, {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      // connection: "keep-alive",
      Authorization: token,
    },
  });
}

export async function extraFileUploadFinish(token, urlprefix, data) {
  return fetch(`${urlprefix}api/datasets/extrafile/uploadfinish`, {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      // connection: "keep-alive",
      Authorization: token,
    },
  });
}

export async function extraFileDownload(token, urlprefix, data) {
  return fetch(`${urlprefix}api/datasets/extrafile/download`, {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      // connection: "keep-alive",
      Authorization: token,
    },
  });
}

export async function file_download2(token, urlprefix, data) {
  return fetch(`${urlprefix}api/files/download`, {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      // connection: "keep-alive",
      Authorization: token,
    },
  });
}

export async function validateDatasetSubmission(token, urlprefix, data) {
  return fetch(`${urlprefix}api/datasets/validate`, {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      connection: "keep-alive",
      Authorization: token,
    },
  });
}

export async function validateProjectSubmission(token, urlprefix, data) {
  return fetch(`${urlprefix}api/projects/validate`, {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      connection: "keep-alive",
      Authorization: token,
    },
  });
}

export async function validateSubmission(token, urlprefix, urlSuffix, data) {
  return fetch(`${urlprefix}api/${urlSuffix}`, {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      connection: "keep-alive",
      Authorization: token,
    },
  });
}

export async function action_update(token, urlprefix, query, method) {
  return fetch(`${urlprefix}api/${query}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      connection: "keep-alive",
      Authorization: token,
    },
  });
}

export function groups_get(token, urlprefix) {
  // if below returns the error: "unknown_error"
  // double check that the user has the following role assigned:
  // realm-management -> query-groups
  return fetch(urlprefix, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function analysis(token, urlprefix, arg, data) {
  return fetch(`${urlprefix}api/analysis?arg=` + arg, {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      connection: "keep-alive",
      Authorization: token,
    },
  });
}

export async function analysisStart(token, urlprefix, data) {
  return fetch(`${urlprefix}api/analysis/start`, {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      connection: "keep-alive",
      Authorization: token,
    },
  });
}

export async function jobsStatus(token, urlprefix, data) {
  return fetch(`${urlprefix}api/analysis/status`, {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      connection: "keep-alive",
      Authorization: token,
    },
  });
}

export async function analysisResults(token, urlprefix, data) {
  return fetch(`${urlprefix}api/analysis/results`, {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      connection: "keep-alive",
      Authorization: token,
    },
  });
}

export async function analysisFiles(token, urlprefix, data) {
  return fetch(`${urlprefix}api/analysis/files`, {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      connection: "keep-alive",
      Authorization: token,
    },
  });
}

export async function analysisData(token, urlprefix, data) {
  return fetch(`${urlprefix}api/analysis/data`, {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      connection: "keep-alive",
      Authorization: token,
    },
  });
}

export async function analysisSubmissionData(token, urlprefix, data) {
  return fetch(`${urlprefix}api/analysis/submissiondata`, {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      connection: "keep-alive",
      Authorization: token,
    },
  });
}

export function experiments_no_files(token, urlprefix, data) {
  return fetch(`${urlprefix}api/experimentnofiles/`, {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
}

export function fileIDs_list(token, urlprefix, data) {
  return fetch(`${urlprefix}api/file?arg=list`, {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: token,
    },
  });
}

export function analysis_create(token, urlprefix, data) {
  return fetch(`${urlprefix}api/analysis?arg=create`, {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: token,
    },
  });
}

// export async function datasetVisualization(token, urlprefix, data) {
//   return fetch(`${urlprefix}api/datasets/visualize`, {
//     method: "POST",
//     body: data,
//     headers: {
//       "Content-Type": "application/json",
//       Accept: "application/json",
//       connection: "keep-alive",
//       Authorization: token,
//     },
//   });
// }

export async function analysisTemplate(token, urlprefix, data) {
  console.log("data", data);
  return fetch(`${urlprefix}api/analysis/template/save`, {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      connection: "keep-alive",
      Authorization: token,
    },
  });
}

export function analysis_abort(token, urlprefix, data) {
  return fetch(`${urlprefix}api/analysis/abort`, {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: token,
    },
  });
}

export async function analysisViewCols(token, urlprefix) {
  return fetch(`${urlprefix}api/analysis/viewcols`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      connection: "keep-alive",
      Authorization: token,
    },
  });
}

export async function analysis2(token, urlprefix, data) {
  return fetch(`${urlprefix}api/analysis/data`, {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      connection: "keep-alive",
      Authorization: token,
    },
  });
}

export async function analysisTemplateQuery(token, urlprefix, data) {
  console.log("data", data);
  return fetch(`${urlprefix}api/analysis/template/query`, {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      connection: "keep-alive",
      Authorization: token,
    },
  });
}

export async function analysisTemplatesList(token, urlprefix, data) {
  console.log("data", data);
  return fetch(`${urlprefix}api/analysis/templates/list`, {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      connection: "keep-alive",
      Authorization: token,
    },
  });
}

export async function analysisTemplateDelete(token, urlprefix, data) {
  console.log("data", data);
  return fetch(`${urlprefix}api/analysis/templates/delete`, {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      connection: "keep-alive",
      Authorization: token,
    },
  });
}

export async function getPreviousAnalyses(token, urlprefix, data) {
  console.log("data", data);
  return fetch(`${urlprefix}api/analysis/previous`, {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      connection: "keep-alive",
      Authorization: token,
    },
  });
}

export async function analysisTypesReq(token, urlprefix, data) {
  console.log("data", data);
  return fetch(`${urlprefix}api/analysis/types`, {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      connection: "keep-alive",
      Authorization: token,
    },
  });
}

// cellxgene visualization
export async function datasetVisualization(token, urlprefix, data) {
  return fetch(`${urlprefix}api/files/cellxgene`, {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      connection: "keep-alive",
      Authorization: token,
    },
  });
}
