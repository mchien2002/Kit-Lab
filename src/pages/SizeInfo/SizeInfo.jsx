import React, { useState } from "react";
import FormType1 from "../../components/FormType/FormType1";
import FormType2 from "../../components/FormType/FormType2";
import FormType3 from "../../components/FormType/FormType3";
import FormType4 from "../../components/FormType/FormType4";
import "./SizeInfo.scss";

export default function SizeInfo() {
  const [type, setType] = useState(1);

  return (
    <div className="sizeInfoPage col-12">
      <div className="col-12 d-flex flex-row">
        <div className="col-7 d-flex flex-wrap">
          <div className="col-12 d-flex flex-wrap">
            <div
              className={`card-type col-6 d-flex flex-column ${
                type === 1 ? "active" : ""
              }`}
              onClick={() => setType(1)}
            >
              <img src="./assets/images/option/bep-I.png" alt="bep-I" />
              <p className="card-type__name">Tủ bếp chữ I</p>
            </div>

            <div
              className={`card-type col-6 d-flex flex-column ${
                type === 2 ? "active" : ""
              }`}
              onClick={() => setType(2)}
            >
              <img src="./assets/images/option/bep-I2.png" alt="bep-I2" />
              <p className="card-type__name">Tủ bếp chữ I đụng trần</p>
            </div>
          </div>

          <div className="col-12 d-flex flex-wrap mt-5">
            <div
              className={`card-type col-6 d-flex flex-column ${
                type === 3 ? "active" : ""
              }`}
              onClick={() => setType(3)}
            >
              <img src="./assets/images/option/bep-L.png" alt="bep-L" />
              <p className="card-type__name">Tủ bếp chữ L</p>
            </div>

            <div
              className={`card-type col-6 d-flex flex-column ${
                type === 4 ? "active" : ""
              }`}
              onClick={() => setType(4)}
            >
              <img src="./assets/images/option/bep-L2.png" alt="bep-L2" />
              <p className="card-type__name">Tủ bếp chữ L đụng trần</p>
            </div>
          </div>
        </div>

        <div className="container__form col-5 my-auto">
          {type === 1 ? (
            <FormType1 />
          ) : type === 2 ? (
            <FormType2 />
          ) : type === 3 ? (
            <FormType3 />
          ) : type === 4 ? (
            <FormType4 />
          ) : null}
        </div>
      </div>
    </div>
  );
}
