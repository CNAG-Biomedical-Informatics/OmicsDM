import React, { Component } from "react";
import {Circles} from "react-loader-spinner";

class Loading extends Component {
  render() {
    return this.props.loading ? (
      <div className="-loading-active">
        <div
          className="-loading-inner"
          style={{
            display: "block",
            position: "absolute",
            left: 0,
            right: 0,
            background: "",
            transition: "all .3s ease",
            top: 0,
            bottom: 0,
            textAlign: "center",
          }}
        >
          <Circles
            type="Circles"
            color="#00BFFF"
            style={{}}
            height="80"
            width="100"
          />
        </div>
      </div>
    ) : null;
  }
}

export default Loading;