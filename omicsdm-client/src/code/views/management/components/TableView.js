import React, { Component } from "react";
import { Navigate } from "react-router";
import Grid from "@mui/material/Grid";
import { CsvButton } from "../../components/buttonCollection/CsvButton";
import { ReactTableServerSide } from "../../ReactTableServerSide";

import Popup from "reactjs-popup";
import auth from "../../../Auth";
import {
  adminExecuteUpdate,
  datasetAll,
  getTableData,
  getViewCols,
  extraFileDownload,
} from "../../../apis";

import {
  updateTable,
  toggleRow,
  createIconOwner,
} from "../../components/TableMethods";

import CustomizeColumns from "./CustomizeColumns";

import 'bootstrap/dist/css/bootstrap.min.css';
import AdminViewSpecific from "../admin-view/adminViewHeader";
import DatasetsViewSpecific from "../datasets-view/components/DatasetsHeader";
import createCellxgeneButton from "../files-view/components/ShowCellxgeneIcon";
import ShowSelectedFiles from "../files-view/components/ShowSelectedFiles";

import { withRouter } from "../../../helper_functions/Helpers";

const { config } = window;

/**
 * Component for showing Datasets- or Files data.
 * @component
 * @category data management
 * @subcategory table-view
 */

// TODO
// replace the Table View Class
// with a functional View Component

class TableView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dataType: this.props.location.pathname.split("/")[1],
      headers: [],
      modifiableFields: [],
      fieldSelected: "",
      newValue: "",

      // TODO
      // actions/actionsSelected should
      // defined somewhere else
      actions: [
        { value: "unselected", name: "----" },
        { value: "shareWithGroups", name: "Share with groups" },
        { value: "unShareWithGroups", name: "Unshare with groups" },
      ],
      actionSelected: "unselected",

      pagination: {
        loadData: true,
        page: 0,
        pages: 0,
        pageSize: 10,
        totalItems: 0,
        fields: [],
        filtered: [],
        sorted: [],
      },
      items: [],
      selected: [],
      selectedFields: {},
      selectAll: 0,
      popupErrors: "",
      csvData: [],
      csvFileName: "",
      columnsShown: [],
      open: false,
      setOpen: false,
      defaultColumnsBool: true,

      // for the files fiew
      defaultFilter: [],
      initialized: false,

      // for the analysis view
      clickedRowAnalysisId: "",
    };
    this.getCsvData = this.getCsvData.bind(this);
    this.csvLink = React.createRef();

    //needed for CustomizeColumns
    this.updateColumns = this.updateColumns.bind(this);
    this.getDataColumnTable = this.getDataColumnTable.bind(this);
  }

  /* Define a method to control Row Clicks*/
  // at the moment this is only used in the analysis view
  onRowClick = (state, rowInfo, column, instance) => {

    // console.log("onRowClick", rowInfo);

    if (this.props.location.pathname.split("/")[1] != "analyses") {
      return {
        onClick: (e) => {
          //
        }
      }
    }

    return {
      onClick: (e) => {
        /*1.If row is Experiment ID then Route to Experiment Information*/
        console.log("rowInfo", rowInfo.original.id);
        console.log("column", column);
        this.setState({ clickedRowAnalysisId: rowInfo.original.id });
        // this.setState({group: rowInfo.original.group , type : column.id});
      },
      style: {
        cursor: "pointer",
      },
    };
  };

  // function below is files view specific
  handleFileDeleteConfirmed = () => {
    const { page, pageSize, filtered, sorted } = this.state.pagination;

    const data_query = {
      page,
      pageSize,
      filtered,
      sorted,
    };
    this.getData(data_query, filtered, sorted);

    // after deletion the file selected state should be reseted
    this.setState({ selected: [] });
  };

  async getViewCols() {
    let jsonData = {};

    const urlPath = this.props.location.pathname
    console.log("getViewCols urlPath", urlPath);

    let apiUrlSuffix = urlPath + "/viewcols";
    if (urlPath.includes("admin")) {
      const view = urlPath.split("/")[2];
      apiUrlSuffix = `/${view}/adminviewcols`;
    }

    if (urlPath.includes("analyses")) {
      apiUrlSuffix = "/analysis/viewcols"
    }

    // if (urlPath.includes("datasets")) {
    //   apiUrlSuffix = "/datasets/viewcols"
    // }

    console.log("apiUrlsuffix", apiUrlSuffix);
    try {
      const response = await getViewCols(
        auth.getToken(),
        config.api_endpoint,
        apiUrlSuffix
      );
      jsonData = await response.json();
      console.log("jsonData", jsonData);
      return jsonData[0].headers;
    } catch (error) {
      console.log("error", error);
    }
  }

  async componentDidMount() {
    if (auth.tokenExpired()) {
      this.setState({
        popupErrors: "Session expired. Please login again",
      });
    }

    const urlPath = this.props.location.pathname
    let view = urlPath.split("/")[1];

    console.log("view", view);

    let pageHeader = "List of";
    let tableHeaders = []
    if (urlPath.includes("admin")) {
      console.log("HERE")
      view = urlPath.split("/")[2];
      pageHeader = `Admin view for ${view}`;
      tableHeaders = await this.getViewCols();

      const subTitle = `Select the ${view}/field to be modified`
      let modifiableFields = tableHeaders.slice(2);
      if (view === "files") {
        modifiableFields = tableHeaders.slice(1);
      }
      this.setState({
        headers: tableHeaders,
        modifiableFields,
        pageHeader,
        subTitle,
        initialized: true
      });
      console.log("HERE2")
      return
    }
    console.log("HERE3")
    tableHeaders = await this.getViewCols();
    console.log("tableHeaders", tableHeaders);
    this.setState({
      headers: tableHeaders,
      pageHeader: `${pageHeader} ${view}`,
    });

    // if redirected from dataset view
    // take the selected dataset's owners/ids
    // and use it to pre set the filter
    if (this.props.location.state) {

      console.log("this.props.location.state", this.props.location.state);

      const { selectedDatasets } = this.props.location.state;

      const ids = new Set(selectedDatasets.map((d) => d.dataset_id));
      const owners = new Set(selectedDatasets.map((d) => d.owner));

      this.setState({
        defaultFilter: [
          {
            id: "dataset_id",
            value: [...ids].join(),
          },
          // TODO
          // rename the dataset owner column id
          // checkbox is confusing
          {
            id: "checkbox",
            value: [...owners].join(),
          },
        ],
        initialized: true,
      });
    } else {
      this.setState({ initialized: true });
    }
  }

  getDataColumnTable() {
    const toggleSelectAll = (selectAll, rows) => {
      const newSelected = [];
      //Update all checkboxes as checked
      if (selectAll === 0) {
        for (const row of rows) {
          newSelected.push(row);
        }
      }
      return newSelected;
    };

    const isSelected = (id, selectedObj) => {
      if (selectedObj.length === 0) {
        return false;
      }
      for (const selected of selectedObj) {
        if (selected.id === id) {
          return true;
        }
      }
      return false;
    };

    const columnCheckbox = {
      // this.state.select all value mapping:
      // nothing = 0 -> checkbox is unchecked
      // all = 1 -> checkbox is checked
      // one/multiple = 2 -> checkbox is indeterminate

      id: "checkbox",
      Header: (x) => (
        <span>
          Select{" "}
          <input
            data-cy={"select-all-checkbox"}
            type="checkbox"
            className="checkbox"
            checked={this.state.selectAll === 1}
            ref={(input) => {
              if (input && this.state.selectAll === 2) {
                if (this.state.selected.length === 0) {
                  input.checked = false;
                } else {
                  input.indeterminate = true;
                }
              }
            }}
            onChange={() =>
              this.setState({
                selected: toggleSelectAll(
                  this.state.selectAll,
                  this.state.items
                ),
                selectAll: this.state.selectAll === 0 ? 1 : 0,
              })
            }
          />
        </span>
      ),
      Cell: ({ original, index }) => {
        return (
          <input
            data-cy={`select-row-checkbox-${index}`}
            type="checkbox"
            className="checkbox"
            checked={isSelected(original.id, this.state.selected)}
            onChange={() =>
              this.setState({
                selected: toggleRow(original, this.state.selected),
                selectAll: 2,
              })
            }
          />
        );
      },
      sortable: false,
      filterable: false,
      width: 80,
    };
    const columns = [columnCheckbox];


    if (this.props.location.pathname.split("/")[1] === "datasets") {
      // if (this.state.dataType === "datasets2") {      
      const handleClick = async (event, rowId, fileType) => {
        event.preventDefault();
        const query = {
          datasetId: rowId,
          fileType,
        }
        // TODO
        // would be good to have for this a generic function
        let res = null;
        res = await extraFileDownload(
          auth.getToken(),
          config.api_endpoint,
          JSON.stringify(query)
        );

        // res = fileType === "clinical" ? await clinicalDataDownload(
        //   auth.getToken(),
        //   config.api_endpoint,
        //   JSON.stringify(query)
        // ) : await policyDataDownload(
        //   auth.getToken(),
        //   config.api_endpoint,
        //   JSON.stringify(query)
        // );

        if (res.status !== 200) {
          // TODO
          // show an error message
          // to the user
          return;
        }
        const data = await res.json();
        const presignedUrl = data.presigned_url;

        // redirect to the presigned url
        // TODO
        // below works but it is not considered to be best practice
        // to be more consistent with the rest of the code
        // it would be better to use the react router { withRouter }
        window.open(presignedUrl, '_self');


        // TODO
        // this should trigger the creation of a presigned url
      }

      const columnDataPolicy = {
        id: "dataPolicy",

        // TODO
        // Do not define the button during the render
        Cell: ({ original }) => {
          if (original.policy_file === undefined || original.policy_file.length === 0) {
            return "";
          }
          return (
            <a
              href={"#"}
              onClick={
                (event) => handleClick(
                  event,
                  original.id,
                  "dataPolicy"
                )
              }
            >
              {original.policy_file[0]}
            </a>
          )
        },
        Header: "Data Policy",
        sortable: false,
        filterable: false,
        width: 120,
      };

      const columnClinicalData = {
        id: "clinicalData",
        Cell: ({ original }) => {
          if (original.clinical_file === undefined || original.clinical_file.length === 0) {
            return "";
          }
          return (
            <a
              href={"#"}
              onClick={
                (event) => handleClick(
                  event,
                  original.id,
                  "clinical"
                )
              }
            >
              {original.clinical_file[0]}
            </a>
          )
        },
        Header: "Clinical Data",
        sortable: false,
        filterable: false,
        width: 120,
      };

      columns.push(createIconOwner());
      columns.push(columnDataPolicy);
      columns.push(columnClinicalData);
    }

    if (this.props.location.pathname.split("/")[1] === "files") {
      columns.push(createIconOwner());
      columns.push(createCellxgeneButton());
    }

    return updateTable(
      columns,
      this.state.columnsShown,
      this.state.headers,
      this.state.items,
      this.state.defaultColumnsBool
    );
  }

  closeModal = () => {
    if (this.state.popupErrors === "Session expired. Please login again") {
      auth.user.keycloak.logout();
    }
    this.setState({ popupErrors: "" });
  };

  handleSelectChange = (event) => {
    this.setState({ actionSelected: event.target.value });
  };

  clearSelection = () => {
    this.setState({
      selected: [],
      selectAll: 0,
    });
  };

  // Dummy method because ReactTableServerSide needs it
  // onRowClick = (state, rowInfo, column, instance) => ({
  //   onClick: (e) => {
  //     //
  //   },
  // });

  getData = async (data_query, filtered, sorted) => {
    /* Call POST Data*/

    console.log("data_query_view", data_query);

    const urlPath = this.props.location.pathname
    console.log("urlPath", urlPath);

    let apiUrlSuffix = urlPath + "/all";

    if (urlPath.includes("projects")) {
      apiUrlSuffix = "projects/admin/view"
    }

    if (urlPath.includes("admin")) {
      const view = urlPath.split("/")[2];
      apiUrlSuffix = `/${view}/admin/view`;
    }

    if (urlPath.includes("analyses")) {
      apiUrlSuffix = "/analysis/data"
    }

    console.log("apiUrlsuffix", apiUrlSuffix);

    getTableData(
      auth.getToken(),
      config.api_endpoint,
      apiUrlSuffix,
      JSON.stringify(data_query)
    )
      .then((response) => response.json())
      .then((data) => {

        console.log("data", data);
        this.setState({
          items: data.items,
          pagination: {
            page: data._meta.page,
            pages: data._meta.total_pages,
            pageSize: data._meta.page_size,
            totalItems: data._meta.total_items,
            // fields: fields,
            filtered,
            sorted,
            loadData: false,
          },
        });
      });
  };

  /*Method to call API Endpoint to get React Table Data*/
  loadTableData = (state) => {

    /*Call API Endpoint*/
    const data_query = {
      page: state.page + 1,
      pageSize: state.pageSize,
      // fields: fields,
    };
    /*Check filtered Criteria*/
    if (state.filtered) {
      data_query.filtered = state.filtered.map((item) => ({
        id: item.id,
        value: item.value,
      }));
    }
    /*Check sorted Criteria*/
    if (state.sorted) {
      data_query.sorted = state.sorted;
    }

    /* Call POST Data*/
    this.getData(data_query, state.filtered, state.sorted);
  };

  getCsvData = async (headers) => {
    /*Get All Data to be printed to CSV Files*/
    const data_query = {
      page: 1,
      pageSize: this.state.pagination.pageSize,
      fields: this.state.pagination.fields,
      filtered: this.state.pagination.filtered.map((item) => ({
        id: item.id,
        value: [item.value],
      })),
      sorted: this.state.pagination.sorted,
    };

    let getData = true;
    const allItems = [];
    /*Get All Data*/
    while (getData) {
      /*Call POST Data*/
      await datasetAll(
        auth.getToken(),
        config.api_endpoint,
        JSON.stringify(data_query)
      )
        .then((response) => response.json())
        .then((data) => {
          allItems.push(...data.items);
          if (data_query.page < data._meta.total_pages) {
            getData = true;
            data_query.page = data_query.page + 1;
          } else getData = false;
        });
    }
    //Build data for CSV
    const data = [];

    for (let item of allItems) {
      const row = {};
      //1. Loop Headers
      for (let header of this.state.headers) {
        row[header.key] =
          typeof item[header.key] === "boolean"
            ? item[header.key].toString()
            : item[header.key];
      }
      //2. Add row to data
      data.push(row);

      // TODO
      // remove the ID column
    }

    const today = new Date().toISOString().slice(0, 10);
    this.setState(
      // TODO
      // the csvFileName should not be hardcoded!
      { csvData: data, csvFileName: `${today}_dataset_list.csv` },
      () => {
        // click the CSVLink component to trigger the CSV download
        this.csvLink.current.link.click();
      }
    );
  };

  updateColumns(columns) {
    //needed for CustomizeColumns
    this.setState({ columnsShown: columns });
    this.setState({ defaultColumnsBool: false });
  }

  handleFieldSelectedChanged = (value) => {
    this.setState({ fieldSelected: value });
  };

  handleFieldValueChanged = (value) => {
    this.setState({ newValue: value });
  };

  handleFieldUpdate = async () => {

    // this function is used in admin mode
    const { selected, fieldSelected, newValue } = this.state;

    if (selected === [] && fieldSelected === "" && newValue === "") {
      return;
    }

    if (selected === "" || fieldSelected === "" || newValue === "") {
      this.setState({ popupErrors: "Please fill all fields" });
    }

    const selectedRows = selected.map((item) => item.id);

    // ! BUG
    // below fails because the endpoint url is wrong

    const view = this.props.location.pathname.split("/")[2];
    console.log("view", view)

    // const urlSuffix = `/${view}/admin/update`;

    const response = await adminExecuteUpdate(
      auth.getToken(),
      config.api_endpoint,
      view,
      JSON.stringify({
        dbRowIds: selectedRows,
        field: fieldSelected,
        value: newValue,
      })
    );

    const error_msg = await response.text();
    if (response.status === 200) {
      const { page, pageSize, filtered, sorted } = this.state.pagination;

      const data_query = {
        page: page,
        pageSize,
        filtered,
        sorted,
      };
      this.getData(data_query, filtered, sorted);
    } else {
      this.setState({ popupErrors: error_msg });
    }
  };

  // ! FIXME
  // after pressing update the pagination (top right)
  // does not behave as expected
  // starts with 1-10 of 2 records
  // after pressing update the pagination starts with 11-20 of 2 records
  // with every update the pagination increases by 10

  // this happens also when doing dataset sharing

  // note: the changes do not persist after reloading the page
  // it is again 1-10 of 2 records

  render() {
    const analysisId = this.state.clickedRowAnalysisId;

    if (analysisId != "") {
      return <Navigate to={{ pathname: `${analysisId}` }} />;
    }

    /*Show popup in case an error with the login occurs*/
    if (this.state.popupErrors) {
      return (
        <Popup open={true} closeOnDocumentClick onClose={this.closeModal}>
          <div>
            <button className="close" onClick={this.closeModal}>
              {" "}
              &times;{" "}
            </button>
            <div className="page-header">
              {" "}
              <h1>Logging error</h1>{" "}
            </div>
            <div className="alert alert-warning">{this.state.popupErrors} </div>
          </div>
        </Popup>
      );
    }

    const columnsDataTable = this.getDataColumnTable();

    // depending on the url path another fieldsDelay is needed
    const view = this.props.location.pathname.split("/")[1];
    let fieldsDelay = [];

    let tableCols=[]
    if (view === "datasets") {
      fieldsDelay = ["dataset_id", "project_id"];
      tableCols = [
        {
          accessoryKey: "id",
          Header: "ID",
        },
        {
          accessoryKey: "dataset_id",
          Header: "Dataset ID",
        },
      ]

    }

    if (view === "files") {
      console.log("HERE-5")
      fieldsDelay = ["dataset_id", "project_id", "name"];
    }

    return (
      <Grid container>
        {this.props.location.pathname.split("/")[1] === "admin" && (
          <AdminViewSpecific
            subTitle={this.state.subTitle}
            fieldSelected={this.state.fieldSelected}
            modifiableFields={this.state.modifiableFields}
            newValue={this.state.newValue}
            handleFieldSelectedChanged={this.handleFieldSelectedChanged}
            handleFieldValueChanged={this.handleFieldValueChanged}
            handleUpdate={this.handleFieldUpdate}
          />
        )}
        <Grid item xs={12}>
          <CustomizeColumns
            headers={this.state.headers}
            updateColumns={this.updateColumns}
          />
          <CsvButton
            getCsvData={this.getCsvData}
            csvData={this.state.csvData}
            headersCsv={this.state.headers}
            nameFile={this.state.csvFileName}
            csvLink={this.csvLink}
          />
        </Grid>
        {this.props.location.pathname.split("/")[1] === "datasets" && (
          <DatasetsViewSpecific
            selected={this.state.selected}
            actions={this.state.actions}
            actionSelected={this.state.actionSelected}
            pagination={this.state.pagination}
            handleSelectChange={this.handleSelectChange}
            getData={this.getData}
            clearSelection={this.clearSelection}
          />
        )}
        {this.props.location.pathname.split("/")[1] === "files" && (
          <ShowSelectedFiles
            selected={this.state.selected}
            handleFileDeleteConfirmed={this.handleFileDeleteConfirmed}
          />
        )}
        {this.state.initialized && (
          <Grid item xs={12}>
            <ReactTableServerSide
              headers={this.state.headers}
              columns={columnsDataTable[0]}
              data={columnsDataTable[1]}
              pagination={this.state.pagination}
              onRowClick={this.onRowClick}
              loadTableData={this.loadTableData}
              loading={this.state.pagination.loadData}
              defaultFiltered={this.state.defaultFilter}
              fieldsDelay={fieldsDelay}
            />
          </Grid>
        )}
      </Grid>
    );
  }
}

export default withRouter(TableView);