import { Slider } from "antd";
import { useContext, useState } from "react";
import { KitchenContext } from "../Design/Design";
import "./Zoom.scss";

export default function Zoom() {
  const { handleZoomIn, handleZoomOut } = useContext(KitchenContext);
  const [disabled, setDisabled] = useState(false);
  const onChange = (checked) => {
    setDisabled(checked);
  };

  return (
    <div className="zoom">
      <div className="zoom__left">
        <i className="far fa-expand"></i>
      </div>

      <div className="zoom__right">
        <i
          className="far fa-search-minus"
          onClick={() => {
            handleZoomOut();
          }}
        ></i>

        <div style={{ width: "120px", padding: "0 12px" }}>
          <Slider defaultValue={30} disabled={disabled} />
        </div>

        <i
          className="far fa-search-plus"
          onClick={() => {
            handleZoomIn();
          }}
        ></i>
      </div>
    </div>
  );
}
