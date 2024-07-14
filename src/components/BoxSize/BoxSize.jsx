import { useSelector } from "react-redux";
import FormType from "../FormType/FormType";
import "./BoxSize.scss";

export default function BoxSize({ setShowBoxSize, type, formData }) {
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
        {type === 1 ? <FormType dataEdit={formData} /> : null}
      </div>
    </div>
  );
}
