import React, {useState} from "react";
import Popup from "reactjs-popup";

export default function PopupError(props) {

  let {error,onClose} = props

  const [open,setOpen] = useState(true);

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  return (
    <Popup open={open} closeOnDocumentClick onClose={handleClose}>
      <div>
        <button className="close" onClick={handleClose}>
          {" "}
          &times;{" "}
        </button>
        <div className="page-header">
          {" "}
          <h1> Logging error. </h1>{" "}
        </div>
        <div className="alert alert-warning">{error} </div>
      </div>
    </Popup>
  );
}
