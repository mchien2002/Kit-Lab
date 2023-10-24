import React from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setMeasureAction } from "../../store/actions/measure.action";

import "./FormType.scss";
import callApi from "../../utils/callApi";
import { getProductInfoAction } from "../../store/actions/productInfo.action";

export default function FormType4({ dataEdit }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { productInfo } = useSelector((state) => state.steps);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    const res = await callApi(`product/resgitry`, "POST", {
      listSize: [
        {
          typeSize: "STWL",
          value: data.trenTrai,
        },
        {
          typeSize: "STWR",
          value: data.trenPhai,
        },
        {
          typeSize: "STD",
          value: data.trenSau,
        },
        {
          typeSize: "STH",
          value: data.trenCao,
        },
        {
          typeSize: "SUWL",
          value: data.duoiTrai,
        },
        {
          typeSize: "SUWR",
          value: data.duoiPhai,
        },
        {
          typeSize: "SUD",
          value: data.duoiSau,
        },
        {
          typeSize: "SUH",
          value: data.duoiCao,
        },
      ],
      typeProduct: 3,
    });

    const jsonData = JSON.stringify(res.data.data);
    console.log(typeof jsonData);
    localStorage.setItem("productInfo", jsonData);

    navigate("/custom-design");
  };

  const handleClick = () => {
    handleSubmit(onSubmit)((data) => {
      if (!data.name) {
        setError("name", {
          type: "manual",
          message: "This field is required",
        });
        return;
      }

      onSubmit(data);
    });
  };

  return (
    <div>
      {!dataEdit && (
        <h2 className="text-center pb-2">Nhập thông tin thiết kế</h2>
      )}

      <div className="form-sizeInfo">
        <p className="title pb-3">Kích thước chiều dài (mm)</p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="col-12 d-flex flex-row align-items-start justify-content-between">
            <div className="col-2">
              <p className="position">Bếp trên</p>
            </div>

            <div className="col-5 col-lg-4">
              <div className="group-input">
                <label>Bên trái: </label>
                <input
                  type="number"
                  className={errors.trenTrai ? "error-input" : ""}
                  defaultValue={2400}
                  value={dataEdit?.trenTrai}
                  {...register("trenTrai", {
                    required: true,
                    min: 1400,
                    max: 3400,
                  })}
                />
              </div>

              <div className="group-input">
                <label>Chiều sâu: </label>
                <input
                  type="number"
                  value={350}
                  readOnly
                  {...register("trenSau")}
                />
              </div>
            </div>

            <div className="col-5 col-lg-4">
              <div className="group-input">
                <label>Bên phải: </label>
                <input
                  type="number"
                  className={errors.trenPhai ? "error-input" : ""}
                  value={dataEdit?.trenPhai}
                  defaultValue={2700}
                  {...register("trenPhai", {
                    required: true,
                    min: 1400,
                    max: 3400,
                  })}
                />
              </div>

              <div className="group-input">
                <label>Chiều cao: </label>
                <input
                  type="number"
                  className={errors.trenCao ? "error-input" : ""}
                  value={dataEdit?.trenCao}
                  defaultValue={500}
                  {...register("trenCao", {
                    required: true,
                    min: 300,
                    max: 1000,
                  })}
                />
              </div>
            </div>
          </div>

          <div className="line"></div>

          <div className="col-12 d-flex flex-row align-items-start justify-content-between">
            <div className="col-2">
              <p className="position">Bếp dưới</p>
            </div>

            <div className="col-5 col-lg-4">
              <div className="group-input">
                <label>Bên trái: </label>
                <input
                  type="number"
                  className={errors.duoiTrai ? "error-input" : ""}
                  value={dataEdit?.duoiTrai}
                  defaultValue={2400}
                  {...register("duoiTrai", {
                    required: true,
                    min: 1400,
                    max: 3400,
                  })}
                />
              </div>

              <div className="group-input">
                <label>Chiều sâu: </label>
                <input
                  type="number"
                  value={350}
                  readOnly={true}
                  {...register("duoiSau")}
                />
              </div>
            </div>

            <div className="col-5 col-lg-4">
              <div className="group-input">
                <label>Bên phải: </label>
                <input
                  type="number"
                  className={errors.duoiPhai ? "error-input" : ""}
                  value={dataEdit?.duoiPhai}
                  defaultValue={2700}
                  {...register("duoiPhai", {
                    required: true,
                    min: 1400,
                    max: 3400,
                  })}
                />
              </div>

              <div className="group-input">
                <label>Chiều cao: </label>
                <input
                  type="number"
                  className={errors.duoiCao ? "error-input" : ""}
                  value={dataEdit?.duoiCao}
                  defaultValue={500}
                  {...register("duoiCao", {
                    required: true,
                    min: 300,
                    max: 1000,
                  })}
                />
              </div>
            </div>
          </div>

          <div className="text-end pt-3">
            <button className="btn-submit" type="button" onClick={handleClick}>
              Xác nhận
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
