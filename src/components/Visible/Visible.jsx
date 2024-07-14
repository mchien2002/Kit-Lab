import { useContext } from "react";
import { handleHide, handleShow } from "../../utils/function";
import { KitchenContext } from "../Design/Design";
import "./Visible.scss";
import { useState } from "react";

export default function Visible() {
  const context = useContext(KitchenContext);

  const [visibleDoor, setVisibleDoor] = useState(true);
  const [visibleMeasure, setVisibleMeasure] = useState(false);

  return (
    <div className="visibleContainer">
      {visibleDoor ? (
        <button
          className="btnShowHide"
          onClick={() => {
            handleHide(context.display, "DOOR");
            setVisibleDoor(false);
          }}
        >
          <i className="far fa-eye-slash pe-2"></i>
          Ẩn cánh cửa
        </button>
      ) : (
        <button
          className="btnShowHide"
          onClick={() => {
            handleShow(context.display, "DOOR");
            setVisibleDoor(true);
          }}
        >
          <i className="far fa-eye pe-2"></i>
          Hiện cánh cửa
        </button>
      )}

      {visibleMeasure ? (
        <button
          className="btnShowHide"
          onClick={() => {
            // handleHide(context.display, "MEASURE");
            setVisibleMeasure(false);
            context.handleHideMeasure();
          }}
        >
          <i className="far fa-eye-slash pe-2"></i>
          Ẩn kích thước
        </button>
      ) : (
        <button
          className="btnShowHide"
          onClick={() => {
            // handleShow(context.display, "MEASURE");
            setVisibleMeasure(true);
            context.handleShowMeasure();
          }}
        >
          <i className="far fa-eye pe-2"></i>
          Hiện kích thước
        </button>
      )}
    </div>
  );
}
