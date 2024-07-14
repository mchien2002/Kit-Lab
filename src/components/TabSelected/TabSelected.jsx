import { useContext, useEffect, useState } from "react";
import { KitchenContext } from "../Design/Design";
// import { KitchenContext } from "../Virtual/Virtual";
import "./TabSelected.scss";
import { toast } from "react-hot-toast";
import {
  findFirstNull,
  getPrice,
  roundNumber,
  roundNumberFloat,
} from "../../utils/function";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function TabSelected({ data, step, showNextStep }) {
  const context = useContext(KitchenContext);

  const [tabActive, setTabActive] = useState(0);

  const settings = {
    dots: true,
    infinite: false,
    centerMode: false,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
  };
  // console.log(showNextStep);

  const handleChangeTab = (tabId) => {
    if (step === context.currentStep && tabId !== context.currentIndex) {
      context.setCurrentStep(step);
      context.setCurrentIndex(tabId);

      context.setTabSelected({
        step: step,
        index: tabId,
      });
    } else if (
      tabId !== context.currentIndex ||
      (tabId === context.currentIndex && context.currentStep !== step)
    ) {
      context.setCurrentStep(step);
      context.setCurrentIndex(tabId);

      context.setTabSelected({
        step: step,
        index: tabId,
      });
    }

    if (
      context.kitchen[context.currentStep].lstModule[context.currentIndex]
        ?.mainModule?.module === null
    ) {
      context.setCheckChange(false);
      context.setKitchen((prevKitchen) => {
        let newKitchen = [...prevKitchen];

        newKitchen[context.currentStep].lstModule[
          context.currentIndex
        ].mainModule = null;

        const totals = context.calculateTotalIndexDesign(
          newKitchen[context.currentStep].lstModule
        );
        newKitchen[context.currentStep].totalIndexDesign = totals[0];
        newKitchen[context.currentStep].totalMeasure = totals[1];

        // newKitchen[context.currentStep].totalIndexDesign =
        //   context.calculateTotalIndexDesign(
        //     newKitchen[context.currentStep].lstModule
        //   );

        return newKitchen;
      });

      if (context.currentIndex === 0) {
        context.setExecutingStep(context.currentStep - 1);
      }
    }
  };

  function isHexColor(str) {
    return /^#[0-9A-F]{6}$/i.test(str);
  }

  function renderTexture(sub) {
    const iconUrl = sub?.texture?.iconUrl || "";

    function isHexColor(str) {
      return /^#[0-9A-F]{6}$/i.test(str);
    }

    const displayContent = isHexColor(iconUrl) ? (
      <div
        className="color-box"
        style={{
          backgroundColor: iconUrl,
          width: "15px",
          height: "15px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
        }}
      ></div>
    ) : (
      <img
        src={`${process.env.REACT_APP_URL}uploads/images/icons/${iconUrl}`}
        alt="Màu sắc"
        title={sub?.texture?.name}
        className="material-icon"
      />
    );

    return (
      <span className="module-texture" title={sub?.texture?.name}>
        {displayContent}
        {sub?.texture?.name}
      </span>
    );
  }

  useEffect(() => {
    setTabActive(context.currentIndex);
  }, [context.currentStep, context.currentIndex]);

  return (
    <div>
      <div className="tabSelected">
        <div className="tabTitle">
          <p className="name">{data.name}</p>

          {/* <p className="step">
            <span
              style={{
                color:
                  data.totalIndexDesign > data.designUnit
                    ? "#bd0424"
                    : data.totalIndexDesign === data.designUnit
                    ? "#1b1b1b"
                    : "#939393",
              }}
            >
              {data.totalIndexDesign}
            </span>
            /{data.designUnit}★
          </p> */}

          <p className="step">
            <span
              style={{
                color:
                  data.totalIndexDesign > data.designUnit
                    ? "#bd0424"
                    : data.totalIndexDesign === data.designUnit
                    ? "#1b1b1b"
                    : "#939393",
              }}
            >
              {(data.totalMeasure && roundNumberFloat(data.totalMeasure)) || 0}
            </span>
            /{data.measure && roundNumberFloat(data.measure)} mm
          </p>
        </div>

        <div className="tabSelectedPane col-12 d-flex flex-row">
          {data.lstModule?.map(
            (item, id) =>
              item.mainModule &&
              item.mainModule !== null && (
                <div
                  key={id}
                  onClick={() => handleChangeTab(id)}
                  className={
                    tabActive === id && step === context.currentStep
                      ? "tabSelectedIndex tabSelectedIndex-active"
                      : "tabSelectedIndex"
                  }
                  style={{
                    "--size": `${
                      item.mainModule?.module?.indexDesign
                        ? (item?.mainModule?.module?.indexDesign /
                            data.designUnit) *
                          100
                        : (1 / data.designUnit) * 100
                    }%`,
                  }}
                ></div>
              )
          )}

          {data.totalIndexDesign !== 0 &&
            data.totalIndexDesign <= data.designUnit && (
              // {data.totalIndexDesign <= data.designUnit &&
              // context.currentStep === step && (

              <div
                className="btn-next text-center"
                style={{
                  "--sizeBlank": `${
                    ((data.designUnit - data.totalIndexDesign) /
                      data.designUnit) *
                    100
                  }%`,
                  display:
                    data.designUnit <= data.totalIndexDesign ? "none" : "block",
                }}
                onClick={() => {
                  if (
                    !context.isLoading &&
                    ((data.lstModule[context.currentIndex]?.mainModule?.module
                      ?.glbUrl &&
                      data.lstModule[context.currentIndex]?.mainModule?.module
                        ?.glbUrl !== null) ||
                      (context.mainModule?.module?.glbUrl &&
                        context.mainModule?.module?.glbUrl !== null))
                  ) {
                    context.setMainSelected(null);
                    context.setSubSelected(null);
                    context.setMainModule(context.mainNull);
                    context.setSubModule(context.subNull);

                    context.setTabSelected({
                      step: null,
                      index: null,
                    });
                    context.setModelClicked(null);

                    const idx = findFirstNull(context.kitchen[step].lstModule);
                    handleChangeTab(idx);
                  } else {
                    toast.error("Bạn cần phải chọn module");
                  }
                }}
              >
                <i className="fas fa-plus"></i>
              </div>
            )}
        </div>

        <div
          className="tabSelectedContent"
          style={{
            "--display": `${context.currentStep !== step ? "none" : "block"}`,
          }}
        >
          {data.lstModule[tabActive]?.mainModule?.module?.glbUrl &&
          data.lstModule[tabActive]?.mainModule?.module?.glbUrl !== null ? (
            <div className="moduleDetail col-12">
              <Slider {...settings}>
                <div className="moduleDetail__main col-12">
                  <img
                    src={`${process.env.REACT_APP_URL}uploads/images/icons/${data.lstModule[tabActive].mainModule?.module?.imgUrl}`}
                    alt="main"
                    className="module-icon"
                  />

                  <div className="d-flex flex-column justify-content-between ps-1">
                    <p
                      className="module-name"
                      title={` ${data.lstModule[tabActive].mainModule?.type} / ${data.lstModule[tabActive].mainModule?.module?.name}`}
                    >
                      {data.lstModule[tabActive].mainModule?.type} /{" "}
                      {data.lstModule[tabActive].mainModule?.module?.name}
                    </p>

                    <div className="col-12 d-flex flex-column align-items-start">
                      {data.lstModule[tabActive]?.mainModule?.material
                        ?.name && (
                        <div className="col d-flex flex-row align-items-start">
                          <span
                            className="module-material"
                            title={
                              data.lstModule[tabActive]?.mainModule?.material
                                ?.name
                            }
                          >
                            {
                              data.lstModule[tabActive]?.mainModule?.material
                                ?.name
                            }
                          </span>
                        </div>
                      )}

                      {data.lstModule[tabActive]?.mainModule?.texture?.name && (
                        <div className="col d-flex flex-row align-items-start">
                          <span
                            className="module-texture"
                            title={
                              data.lstModule[tabActive]?.mainModule?.texture
                                ?.name
                            }
                          >
                            {/^#[0-9A-F]{6}$/i.test(
                              data.lstModule[tabActive]?.mainModule?.texture
                                ?.iconUrl
                            ) ? (
                              <div
                                className="color-box"
                                style={{
                                  backgroundColor:
                                    data.lstModule[tabActive]?.mainModule
                                      ?.texture?.iconUrl,
                                  width: "15px",
                                  height: "15px",
                                  display: "inline-block",
                                  marginRight: "5px",
                                  borderRadius: "50%",
                                }}
                              ></div>
                            ) : (
                              <img
                                src={`${process.env.REACT_APP_URL}uploads/images/icons/${data.lstModule[tabActive]?.mainModule?.texture?.iconUrl}`}
                                alt="Màu sắc"
                                title={
                                  data.lstModule[tabActive]?.mainModule?.texture
                                    ?.name
                                }
                                className="material-icon"
                              />
                            )}

                            {
                              data.lstModule[tabActive]?.mainModule?.texture
                                ?.name
                            }
                          </span>
                        </div>
                      )}
                    </div>

                    {data.lstModule[tabActive]?.mainModule.price > 0 && (
                      <p className="module-price">
                        <i className="fas fa-usd-circle"></i>

                        <span>
                          {data.lstModule[tabActive]?.mainModule.price &&
                            roundNumber(
                              data.lstModule[tabActive]?.mainModule.price
                            ).toLocaleString("vi-VN")}
                          Đ
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                {data.lstModule[tabActive]?.lstSubModule.length !== 0
                  ? data.lstModule[tabActive]?.lstSubModule?.map(
                      (sub, index) => {
                        if (sub && sub?.module !== null) {
                          return (
                            <div
                              key={index}
                              className="moduleDetail__main col-12"
                            >
                              <img
                                src={`${process.env.REACT_APP_URL}uploads/images/icons/${sub?.module?.imgUrl}`}
                                alt="door"
                                className="module-icon"
                              />

                              <div className="d-flex flex-column justify-content-between ps-1">
                                <p
                                  className="module-name"
                                  title={`${sub?.type} / ${sub?.module?.name}`}
                                >
                                  {sub?.type} / {sub?.module?.name}
                                </p>

                                <div className="col-12 d-flex flex-column align-items-start">
                                  {sub?.material?.name && (
                                    <div className="col d-flex flex-row align-items-start">
                                      <span
                                        className="module-material"
                                        title={sub?.material?.name}
                                      >
                                        {sub?.material?.name}
                                      </span>
                                    </div>
                                  )}

                                  {sub?.texture?.name && (
                                    <div className="col d-flex flex-row align-items-start">
                                      <span
                                        className="module-texture"
                                        title={sub?.texture?.name}
                                      >
                                        {/^#[0-9A-F]{6}$/i.test(
                                          sub?.texture?.iconUrl
                                        ) ? (
                                          <div
                                            className="color-box"
                                            style={{
                                              backgroundColor:
                                                sub?.texture?.iconUrl,
                                              width: "15px",
                                              height: "15px",
                                              display: "inline-block",
                                              marginRight: "5px",
                                              borderRadius: "50%",
                                            }}
                                          ></div>
                                        ) : (
                                          <img
                                            src={`${process.env.REACT_APP_URL}uploads/images/icons/${sub?.texture?.iconUrl}`}
                                            alt="Màu sắc"
                                            title={sub?.texture?.name}
                                            className="material-icon"
                                          />
                                        )}

                                        {sub?.texture?.name}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {sub?.price > 0 && (
                                  <p className="module-price">
                                    <i className="fas fa-usd-circle"></i>

                                    <span>
                                      {sub?.price &&
                                        roundNumber(sub?.price).toLocaleString(
                                          "vi-VN"
                                        )}
                                      Đ
                                    </span>
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        }
                      }
                    )
                  : null}
              </Slider>
            </div>
          ) : (
            <p className="text-null">Chọn module</p>
          )}
        </div>

        {showNextStep && (
          <div className="nextStep">
            <div className="tabSelectedPane">
              <div
                className="btn-next text-center"
                style={{
                  "--sizeBlank": `100%`,
                }}
                onClick={() => {
                  if (!context.isLoading) {
                    context.setMainModule(context.mainNull);
                    context.setSubModule(context.subNull);
                    context.handleChangeStep(step);
                    context.setShowNextStep(false);

                    context.setTabSelected({
                      step: null,
                      index: null,
                    });
                    context.setMainSelected(null);
                    context.setSubSelected(null);
                  }
                }}
              >
                <i className="fas fa-plus"></i>
              </div>
            </div>

            <div className="nextStepContent">
              <p className="text-null">Chọn module</p>
            </div>
          </div>
        )}
      </div>

      <div className="line"></div>
    </div>
  );
}
