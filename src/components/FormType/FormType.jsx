import React, { useState, useContext, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../App";
import { getDesignUnit, getDesignUnitChange } from "../../utils/getData";
import "./FormType.scss";
import DimensionGuide from "../Popup/DimensionGuide";
import { Button, Select } from "antd";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { getTrademarksAction } from "../../store/actions/trademarks.action ";
import Loading from "../Loading/Loading";
import { ArrowRightOutlined } from "@ant-design/icons";

export default function FormType({ type, listConfigurator, dataEdit }) {
  const dispatch = useDispatch();
  const appContext = useContext(AppContext);
  const navigate = useNavigate();
  const [trademark, setTrademark] = useState();
  const [formClosed, setFormClosed] = useState(false);
  const [showPopupGuide, setShowPopupGuide] = useState(false);
  const [loading, setLoading] = useState(false);

  const trademarkRef = useRef();

  const { trademarks } = useSelector((state) => state.trademarks);

  let tabIndex = 0;

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    console.log(data);
    setLoading(true);

    const currentPathname = window.location.pathname;
    appContext.setProjectDetail([]);
    localStorage.clear();
    localStorage.setItem("canInside", appContext.canInside);
    localStorage.setItem("trademark", JSON.stringify(trademark));

    const dataProduct = await getDesignUnit(data, type._id);
    if (currentPathname === "/size-info") {
      navigate("/custom-design", {
        state: {
          type: type._id,
          formData: data,
          productData: dataProduct.data.data,
        },
      });
    } else if (currentPathname === "/custom-design") {
      const dataProductChange = await getDesignUnitChange(
        data,
        "6505a0ddc825350c4db83e95"
      );
      navigate("/custom-design", {
        state: {
          type: type._id,
          formData: data,
          productData: dataProduct.data.data,
          productChangeData: dataProductChange.data.data,
          newProduct: dataProductChange.config.data,
        },
      });
      setFormClosed(true);
    }
  };

  const handleClick = () => {
    if (trademark) {
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
    } else {
      toast.error(
        "Bạn Cần Chọn Nhà Cung Cấp Trước Khi Chuyển Qua Bước Tiếp Theo."
      );
      trademarkRef.current.focus();
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleClick();
    }
  };
  const handleClickTrademark = () => {
    dispatch(getTrademarksAction(type._id));
  };

  const handleChangeTrademark = (lable, option) => {
    const value = {
      value: option.key,
      pValue: option.trademarkBrandId,
      label: option.children,
    };

    setTrademark(value);
  };

  useEffect(() => {
    reset();
    setTrademark(null);
  }, [type]);

  return (
    <div>
      {!formClosed && (
        <div className="form-sizeInfo">
          <p className="title">Nhà cung cấp</p>
          <p className="desc-suplier">
            Mỗi nhà cung cấp có giá và sản phẩm khác nhau. Bạn có thể đổi nhà
            cung cấp ở bước tiếp theo.
          </p>

          <p className="detail-suplier">
            Tìm hiểu thêm về nhà cung cấp của chúng tôi
            <i className="fas fa-external-link-alt ps-1"></i>
          </p>

          <Select
            ref={trademarkRef}
            className="trademark mb-3"
            placeholder="Chọn nhà cung cấp"
            value={trademark?.value}
            onClick={handleClickTrademark}
            onChange={handleChangeTrademark}
            style={{
              width: "100%",
            }}
          >
            {trademarks?.map((group) => (
              <Select.OptGroup key={group?._id} label={group?.name}>
                {group.listTrademark.map(
                  (option) =>
                    option._id && (
                      <Select.Option
                        key={option._id}
                        trademarkBrandId={group._id}
                      >
                        {option.name}
                      </Select.Option>
                    )
                )}
              </Select.OptGroup>
            ))}
          </Select>

          <div className="d-flex flex-row justify-content-between align-items-center">
            <p className="title mb-0">Kích thước</p>

            <p className="guide" onClick={() => setShowPopupGuide(true)}>
              Hướng dẫn kích thước
            </p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} onKeyDown={handleKeyDown}>
            {listConfigurator?.[type.index]?.configSize?.map((item, index) => {
              return (
                <div key={index}>
                  <p className="position">{item.heading}</p>
                  <div className="col-12 d-flex flex-wrap align-items-start justify-content-between">
                    {item.textField.map((field, idField) => {
                      {
                        field.default === null && tabIndex++;
                      }
                      return (
                        <div key={idField} className="container-input">
                          {field.default === null ? (
                            <div className="group-input">
                              <label>{field.title} </label>
                              <div className="box-input">
                                <input
                                  tabIndex={tabIndex}
                                  placeholder={field.title}
                                  type="number"
                                  className={
                                    errors[field.typeSize] ? "error-input" : ""
                                  }
                                  defaultValue={dataEdit?.[field.typeSize]}
                                  {...register(`${field.typeSize}`, {
                                    required: true,
                                    min: [field.minValue],
                                    max: [field.maxValue],
                                  })}
                                />

                                {errors[field.typeSize] && (
                                  <p className="error-log">
                                    Kích thước phải từ {field.minValue}mm đến{" "}
                                    {field.maxValue}mm
                                  </p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="group-input">
                              <label>{field.title}</label>
                              <div key={idField * 10} className="box-input">
                                <input
                                  type="number"
                                  value={field.default}
                                  readOnly
                                  {...register(`${field.typeSize}`)}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <div className="d-flex flex-row justify-content-end pt-3">
              <Button
                className="btn-submit"
                type="primary"
                icon={<ArrowRightOutlined />}
                loading={loading}
                onClick={handleClick}
              >
                Xác nhận
              </Button>
            </div>
          </form>
        </div>
      )}

      {showPopupGuide && (
        <DimensionGuide
          showPopupGuide={showPopupGuide}
          setShowPopupGuide={setShowPopupGuide}
        />
      )}
    </div>
  );
}
