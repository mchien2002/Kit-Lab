import { useContext, useEffect, useState } from "react";
import { KitchenContext } from "../Design/Design";
import "./TabSelected.scss";
import { toast } from "react-hot-toast";
import { findFirstNull, getPrice } from "../../utils/function";

export default function TabSelected({ data, step, eStep, done, showNextStep }) {
  const context = useContext(KitchenContext);

  const [tabActive, setTabActive] = useState(0);
  const [mPrice, setMPrice] = useState(0);
  const [sPrice, setSPrice] = useState(0);

  const handleChangeTab = (tabId) => {
    if (step === context.currentStep && tabId !== context.currentIndex) {
      context.setCurrentStep(step);
      context.setCurrentIndex(tabId);

      context.setTabSelected({
        step: step,
        index: tabId,
      });

      // context.setModelClicked(null);
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

      // context.setModelClicked(null);
    }

    if (
      context.kitchen[context.currentStep].lstModule[context.currentIndex]
        ?.mainModule?.module === null
    ) {
      context.setKitchen((prevKitchen) => {
        let newKitchen = [...prevKitchen];

        newKitchen[context.currentStep].lstModule[
          context.currentIndex
        ].mainModule = null;

        newKitchen[context.currentStep].totalIndexDesign =
          context.calculateTotalIndexDesign(
            newKitchen[context.currentStep].lstModule
          );

        return newKitchen;
      });
    }
  };

  useEffect(() => {
    setTabActive(context.currentIndex);
  }, [context.currentStep, context.currentIndex]);

  useEffect(() => {
    const determinePrice = async () => {
      if (
        context.mainModule?.mainTypeId &&
        context.mainModule?.mainMaterialId
      ) {
        try {
          let measure = 0;
          const trademarkId = "64c8ae2b3ac796ed6e28e18c";

          if (context.currentStep === 0 || context.currentStep === 2) {
            if (context.currentStep === 2 && context.currentIndex === 0) {
              measure = context.baseMeasureRight + 275;
            } else {
              measure = context.baseMeasureRight;
            }
          } else if (context.currentStep === 1 || context.currentStep === 3) {
            if (context.currentIndex === 0) {
              measure = context.baseMeasureLeft + 600;
            } else {
              measure = context.baseMeasureLeft;
            }
          }

          const price = await getPrice(
            context.mainModule.mainTypeId,
            0,
            context.mainModule.mainMaterialId,
            trademarkId
          );

          const calculatedPrice =
            (measure * context.mainModule.indexDesign * price) / 1000;

          setMPrice(calculatedPrice);

          // context.setMainModule({
          //   ...context.mainModule,
          //   mainPrice: calculatedPrice,
          // });
        } catch (error) {
          console.log(error);
        }
      }
    };

    determinePrice();
  }, [context.mainModule, context.currentStep, context.currentIndex]);

  useEffect(() => {
    const determinePrice = async () => {
      if (context.subModule?.subTypeId && context.subModule?.subMaterialId) {
        try {
          let measure = 0;
          const trademarkId = "64c8ae2b3ac796ed6e28e18c";

          if (context.currentStep === 0 || context.currentStep === 2) {
            measure = context.baseMeasureRight;
          } else if (context.currentStep === 1 || context.currentStep === 3) {
            measure = context.baseMeasureLeft;
          }

          const price = await getPrice(
            context.subModule.subTypeId,
            0,
            context.subModule.subMaterialId,
            trademarkId
          );

          const calculatedPrice =
            (measure * context.subModule.indexDesign * price) / 1000;

          setSPrice(calculatedPrice);
        } catch (error) {
          console.log(error);
        }
      }
    };

    determinePrice();
  }, [context.subModule, context.currentStep, context.currentIndex]);

  return (
    <div className="tabSelected">
      <div className="tabTitle">
        <p className="name">{data.name}</p>

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
            {data.totalIndexDesign}
          </span>
          /{data.designUnit}★
        </p>
      </div>

      <div className="tabSelectedPane col-12 d-flex flex-row">
        {data.lstModule?.map(
          (item, id) =>
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
                    item?.mainModule?.indexDesign
                      ? (item?.mainModule.indexDesign / data.designUnit) * 100
                      : (1 / data.designUnit) * 100
                  }%`,
                }}
              >
                <p>{id + 1}</p>
                {item?.mainModule?.indexDesign > 1 ? (
                  <p>{item?.mainModule?.indexDesign}★</p>
                ) : (
                  <p>★</p>
                )}
              </div>
            )
        )}

        {data.totalIndexDesign <= data.designUnit &&
          (done || context.executingStep === eStep) && (
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
                  console.log("2222222222222222222222222222222222222222222222");

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
            <div className="moduleDetail__main col-12 col-xl-6">
              <img
                src={`https://api.lanha.vn/profiles/icon-img/${data.lstModule[tabActive].mainModule?.module?.icon}`}
                alt="main"
                className="module-icon"
              />

              <div className="d-flex flex-column justify-content-between ps-1">
                <p
                  className="module-name"
                  title={` Cabinet / ${data.lstModule[tabActive].mainModule?.module?.name}`}
                >
                  Cabinet / {data.lstModule[tabActive].mainModule?.module?.name}
                </p>

                <div className="col-12 d-flex flex-row align-items-center">
                  {data.lstModule[tabActive]?.mainModule?.material?.name ? (
                    <div className="col-6 d-flex flex-row align-items-center">
                      <img
                        src={
                          data.lstModule[tabActive]?.mainModule?.material?.icon
                        }
                        alt="Vật liệu"
                        title={
                          data.lstModule[tabActive]?.mainModule?.material?.name
                        }
                        className="material-icon"
                      />
                      <span
                        className="module-material"
                        title={
                          data.lstModule[tabActive]?.mainModule?.material?.name
                        }
                      >
                        {data.lstModule[tabActive]?.mainModule?.material?.name}
                      </span>
                    </div>
                  ) : (
                    <div className="col-6 d-flex flex-row align-items-center"></div>
                  )}

                  {data.lstModule[tabActive]?.mainModule?.texture?.name ? (
                    <div className="col-6 d-flex flex-row align-items-center">
                      <img
                        src={
                          data.lstModule[tabActive]?.mainModule?.texture?.icon
                        }
                        alt="Màu sắc"
                        title={
                          data.lstModule[tabActive]?.mainModule?.texture?.name
                        }
                        className="material-icon"
                      />
                      <span
                        className="module-texture"
                        title={
                          data.lstModule[tabActive]?.mainModule?.texture?.name
                        }
                      >
                        {data.lstModule[tabActive]?.mainModule?.texture?.name}
                      </span>
                    </div>
                  ) : (
                    <div className="col-6 d-flex flex-row align-items-center"></div>
                  )}
                </div>

                {data.lstModule[tabActive]?.mainModule.price > 0 && (
                  <p className="module-price">
                    <i className="fas fa-usd-circle"></i>

                    <span>
                      {data.lstModule[tabActive]?.mainModule.price &&
                        data.lstModule[
                          tabActive
                        ]?.mainModule.price.toLocaleString("vi-VN")}
                      Đ
                    </span>
                  </p>
                )}
              </div>
            </div>

            {data.lstModule[tabActive]?.lstSubModule[0]?.module?.name ? (
              <div className="moduleDetail__main col-12 col-xl-6">
                <img
                  src={`https://api.lanha.vn/profiles/icon-img/${data.lstModule[tabActive]?.lstSubModule[0]?.module?.icon}`}
                  alt="door"
                  className="module-icon"
                />

                <div className="d-flex flex-column justify-content-between ps-1">
                  <p className="module-name">
                    Door /{" "}
                    {data.lstModule[tabActive]?.lstSubModule[0]?.module?.name}
                  </p>

                  <div className="col-12 d-flex flex-row align-items-center">
                    {data.lstModule[tabActive]?.lstSubModule[0]?.material
                      ?.name ? (
                      <div className="col-6 d-flex flex-row align-items-center">
                        <img
                          src={
                            data.lstModule[tabActive]?.lstSubModule[0]?.material
                              ?.icon
                          }
                          alt="Vật liệu"
                          title={
                            data.lstModule[tabActive]?.lstSubModule[0]?.material
                              ?.name
                          }
                          className="material-icon"
                        />
                        <span
                          className="module-material"
                          title={
                            data.lstModule[tabActive]?.lstSubModule[0]?.material
                              ?.name
                          }
                        >
                          {
                            data.lstModule[tabActive]?.lstSubModule[0]?.material
                              ?.name
                          }
                        </span>
                      </div>
                    ) : (
                      <div className="col-6 d-flex flex-row align-items-center"></div>
                    )}

                    {data.lstModule[tabActive]?.lstSubModule[0]?.texture
                      ?.name ? (
                      <div className="col-6 d-flex flex-row align-items-center">
                        <img
                          src={
                            data.lstModule[tabActive]?.lstSubModule[0]?.texture
                              ?.icon
                          }
                          alt="Màu sắc"
                          title={
                            data.lstModule[tabActive]?.lstSubModule[0]?.texture
                              ?.name
                          }
                          className="material-icon"
                        />
                        <span
                          className="module-texture"
                          title={
                            data.lstModule[tabActive]?.lstSubModule[0]?.texture
                              ?.name
                          }
                        >
                          {
                            data.lstModule[tabActive]?.lstSubModule[0]?.texture
                              ?.name
                          }
                        </span>
                      </div>
                    ) : (
                      <div className="col-6 d-flex flex-row align-items-center"></div>
                    )}
                  </div>

                  {data.lstModule[tabActive]?.subModule?.subMaterialName ? (
                    <p className="module-price">
                      <i className="fas fa-usd-circle"></i>

                      <span>{sPrice && sPrice.toLocaleString("vi-VN")}Đ</span>
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="text-null">Chọn module</p>
        )}
      </div>

      {done !== true &&
        showNextStep &&
        step === context.executingStep + 1 && (
          <div className="nextStep">
            <div className="tabSelectedPane">
              <div
                className="btn-next text-center"
                style={{
                  "--sizeBlank": `100%`,
                }}
                onClick={() => {
                  // if (!context.isLoading) {
                  context.setMainModule(context.mainNull);
                  context.setSubModule(context.subNull);
                  context.handleChangeStep();
                  // context.handleSetNullModule();
                  context.setShowNextStep(false);

                  context.setTabSelected({
                    step: null,
                    index: null,
                  });
                  context.setMainSelected(null);
                  context.setSubSelected(null);
                  // }
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
  );
}
