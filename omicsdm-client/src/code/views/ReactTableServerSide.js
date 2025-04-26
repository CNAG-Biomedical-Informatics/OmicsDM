import React from "react";
import ReactTable from "react-table";
import "react-table/react-table.css";
import Loading from "./components/LoadingTable";
import debounce from "lodash.debounce";

// probably can be replaced by ReactQueryTable

export class ReactTableServerSide extends React.Component {
  /*Render Data*/
  constructor(props) {
    super(props);

    this.loadTableDataWithDebounce = debounce(this.props.loadTableData, 1000);
    this.searchDelay = false;
  }

  onFilteredChange = (column, value) => {
    //Sets serchDelay to True to allow a small delay before triggering the filtering query
    if (this.props.fieldsDelay.includes(value.id)) this.searchDelay = true;
    else this.searchDelay = false;
  }

  //Debounce or no according to the searchDelay boolean
  loadTableDataStrategy = (tableState) => {
      if(this.searchDelay) {
        return this.loadTableDataWithDebounce(tableState);
      } else {
        return this.props.loadTableData(tableState);
    }
  }

  render() {
    /* Pagination*/
    const { pageSize, page, pages, totalItems } = this.props.pagination;

    return (
      <ReactTable
        data={this.props.data}
        filterable
        columns={this.props.columns}
        defaultPageSize={pageSize}
        pages={pages}
        pageSizeOptions={[100, 200, 300]}
        showPagination={true}
        showPaginationTop={false}
        showPaginationBottom={true}
        getTdProps={this.props.onRowClick}
        className="-striped -highlight"
        style={{
          height: 700,
        }}
        manual
        // onFetchData={this.props.loadTableData}
        onFetchData={this.loadTableDataStrategy}
        onFilteredChange={this.onFilteredChange}
        loading={this.props.loading}
        LoadingComponent={Loading}
        defaultFiltered={this.props.defaultFiltered}
      >
        {/* React Table Functional Rendering for printing number of record
        Passing a function as the child of ReactTable called with the fully resolved state of the table
        makeTable function which returns the standard table component and the instance of the component*/}
        {(state, makeTable, instance) => {
          //Get Counts of Table Rows
          let recordsInfoText = "";
          //Count Records
          const recordsCountFrom = (page - 1) * pageSize + 1;
          const recordsCountTo = recordsCountFrom + pageSize - 1;

          recordsInfoText = `${recordsCountFrom}-${recordsCountTo} of ${totalItems} records`;
          //Render JSX
          return (
            <div className="main-grid">
              <div className="above-table text-right">
                <div className="col-sm-12">
                  <span className="records-info">{recordsInfoText}</span>
                </div>
              </div>
              {makeTable()}
            </div>
          );
        }}
      </ReactTable>
    );
  }
}
