import { useContext, useEffect, useState } from "react";
import { KitchenContext } from "../Design/Design";
import KitchenItem from "./KitchenItem";
import "./ReviewDesign.scss";
import {
  calculateTotalPrice,
  handleSaveDesign,
  handleSaveImage,
  roundNumber,
} from "../../utils/function";
import { getListDesignProdConfigAction } from "../../store/actions/listDesignProdConfig.action";
import { useDispatch, useSelector } from "react-redux";
import { Tabs } from "antd";

export default function ReviewDesign() {
  const context = useContext(KitchenContext);
  const dispatch = useDispatch();

  const [totalPrice, setTotalPrice] = useState(0);
  const [projectName, setProjectName] = useState(JSON.parse(localStorage.getItem("projectName")) ?? 'Dự án 1');

  const imgDataStorage = JSON.parse(localStorage.getItem("imgData"));
  const productInfoStorage = JSON.parse(localStorage.getItem("productInfo"));
  const kitchenStorage = JSON.parse(localStorage.getItem("kitchen"));
  const trademarkStorage = JSON.parse(localStorage.getItem("trademark"));
  const projectNameStorage = JSON.parse(localStorage.getItem("projectName"));

  const { listDesignProdConfig } = useSelector(
    (state) => state.listDesignProdConfig
  );

  const close = () => {
    context.setShowPopupSave(false);
  };

  const handleChangeTab = (key) => { };

  useEffect(() => {
    dispatch(getListDesignProdConfigAction());
    setTotalPrice(calculateTotalPrice(context.kitchen));
  }, []);

  return (
    <div className="review-popup">
      <div className="review-popup-close" onClick={() => close()}></div>

      <div className="reviewDesign col-12 d-flex flex-row">
        <div className="reviewDesign__left col-4 p-3">
          <div className="project-container d-flex flex-column">
            <input
              type="text"
              value={projectNameStorage || projectName}
              autoFocus={projectNameStorage ? false : true}
              className="project-name"
              onChange={(e) => {
                setProjectName(e.target.value);
              }}
            />

            <div className="d-flex flex-wrap">
              <div className="d-flex flex-column col-12">
                <div className="d-flex flex-row">
                  <p className="project-title">Kiểu dáng:</p>
                  <p className="project-content">{productInfoStorage.name}</p>
                </div>

                <div className="d-flex flex-row">
                  <p className="project-title">Nhà cung cấp:</p>
                  <p className="project-content">{trademarkStorage.label}</p>
                </div>
              </div>

              <div className="d-flex flex-row col-12">
                <p className="project-title">Kích thước:</p>

                <div className="d-flex flex-wrap col">
                  {kitchenStorage.reverse().map(
                    (step) =>
                      step.measure && (
                        <div key={step.stepId} className="col-6">
                          <p className="project-label">{step.name}</p>
                          <p className="project-value">{step.measure.toFixed(2)} (mm)</p>
                        </div>
                      )
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="ratio ratio-4x3">
            <img
              className="design-image"
              alt="Design Image"
              src={imgDataStorage}
            />
          </div>

          <div className="d-flex flex-row justify-content-between mt-2">
            <i
              className="fas fa-arrow-to-bottom"
              onClick={() => handleSaveImage()}
            ></i>

            <button className="btn-border-rounded">Chỉnh sửa</button>
          </div>

          {/* <div className="latest-project mt-3">
            <p className="latest-project__title">Các dự án gần đây</p>

            <div className="col-12 d-flex flex-row">
              {listDesignProdConfig.slice(-2).map((project) => {
                return (
                  <div key={project._id} className="col-4 px-1">
                    <div className="d-flex flex-column justify-content-between h-100">
                      <img
                        className="details__image w-100"
                        alt="Rectangle"
                        src={`${process.env.REACT_APP_URL}uploads/images/designs/${project.picUrl}`}
                      />
                      <p className="latest-project__name" title={project.name}>
                        {project.name}
                      </p>
                    </div>
                  </div>
                );
              })}

              <div className="col-4 px-1">
                <div className="new-project d-flex flex-column justify-content-center align-items-center">
                  <i className="fas fa-plus-circle"></i>
                  <p className="latest-project__name">Dự án mới</p>
                </div>
              </div>
            </div>
          </div> */}
        </div>

        <div className=" reviewDesign__right col-8 d-flex flex-column justify-content-between p-3">
          {/* <div className="project-container d-flex flex-column">
            <input
              type="text"
              value={projectNameStorage || projectName}
              autoFocus={projectNameStorage ? false : true}
              className="project-name"
              onChange={(e) => {
                setProjectName(e.target.value);
              }}
            />

            <div className="d-flex flex-row">
              <div className="d-flex flex-column col-4">
                <div className="d-flex flex-row">
                  <p className="project-title">Kiểu dáng:</p>
                  <p className="project-content">{productInfoStorage.name}</p>
                </div>

                <div className="d-flex flex-row">
                  <p className="project-title">Nhà cung cấp:</p>
                  <p className="project-content">{trademarkStorage.label}</p>
                </div>
              </div>

              <div className="d-flex flex-row col-8">
                <p className="project-title">Kích thước:</p>

                <div className="d-flex flex-wrap col">
                  {kitchenStorage.reverse().map(
                    (step) =>
                      step.measure && (
                        <div key={step.stepId} className="col-6">
                          <p className="project-label">{step.name}</p>
                          <p className="project-value">{step.measure} (mm)</p>
                        </div>
                      )
                  )}
                </div>
              </div>
            </div>
          </div> */}

          <div className="kitchen-container">
            <Tabs
              onChange={handleChangeTab}
              // activeKey={tabOption}
              type="card"
              // centered
              items={context.kitchen
                .filter((step) => step.totalIndexDesign > 0)
                .map((item, i) => {
                  const id = String(i);
                  return {
                    label: `${item.name}`,
                    key: id,
                    children: <KitchenItem data={item} />,
                  };
                })}
            />
          </div>

          <div>
            <div className="price-container d-flex flex-row justify-content-between align-items-center">
              <p className="price-container__label">Tổng cộng:</p>
              {totalPrice ? (
                <p className="price-container__number">
                  {roundNumber(totalPrice).toLocaleString("vi-VN")}Đ
                </p>
              ) : (
                <p className="price-container__number">0Đ</p>
              )}
            </div>

            <div className="d-flex flex-row justify-content-end">
              <button
                className="btn-save"
                onClick={() => handleSaveDesign(projectName)}
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
