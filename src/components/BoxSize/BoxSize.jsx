import { useSelector } from "react-redux";
import FormType1 from "../FormType/FormType1";
import "./BoxSize.scss";

export default function BoxSize({ setShowBoxSize }) {
  const data = JSON.parse(localStorage.getItem("measure"));

  return (
    <div className="boxSize">
      <div
        className="boxSize__close"
        onClick={() => {
          setShowBoxSize(false);
        }}
      ></div>

      <div className="boxSize__main">
        {/* <FormType1 dataEdit={lstMeasure} /> */}
        <FormType1 dataEdit={data} />
      </div>
    </div>
  );
}
