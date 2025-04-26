import React from "react";

// TODO
// no longer needed?

// const TableColsHeadersGenerator = (headers) => {
//   console.log("TableColsHeadersGenerator headers", headers);

//   const createTableColsHeaders = (headers) => {
//     const colHeaders = [];
//     for (let header of headers) {
//       const headerTable = { accessor: header.id };

//       const checkboxItem = ""; // Define checkboxItem content if necessary

//       headerTable.Header =
//         "mandatory" in header || "description" in header
//           ? (props) => (
//               <div>
//                 {checkboxItem} {header.title}{" "}
//                 {header.mandatory ? <font color="red"> * </font> : null}
//                 {header.description !== "" ? (
//                   <label title={header.description}>
//                     <i className="fa fa-comment-o" aria-hidden="true" />
//                   </label>
//                 ) : null}
//               </div>
//             )
//           : header.title;

//       headerTable.style = { whiteSpace: "unset" };
//       headerTable["minWidth"] = 100;
//       colHeaders.push(headerTable);
//     }
//     return colHeaders;
//   };
//   const colHeaders = createTableColsHeaders(headers);
//   console.log("TableColsHeadersGenerator colHeaders", colHeaders);
//   return colHeaders;
// };

// export default TableColsHeadersGenerator;
