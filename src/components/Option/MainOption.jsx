import { useContext, useEffect, useRef, useState } from "react";
import { KitchenContext } from "../Design/Design";
import toast from "react-hot-toast";
import {
  countCurrentTotalDesign,
  countTotalDesign,
  getPrice,
  removeLastModule,
} from "../../utils/function";
import { Button, message, Popconfirm } from "antd";

export default function MainOption() {
  const {
    display,
    isLoading,
    stepDetail,
    lstMaterial,
    lstTexture,
    TypeModule,

    modelClicked,
    showBoxSize,
    showNextStep,
    setKitchen,

    mainModule,
    setMainModule,
    subModule,
    setSubModule,
    subNull,

    mainSelected,
    setMainSelected,
    subSelected,
    setSubSelected,

    prevCurrentStep,
    prevCurrentIndex,

    recommended,
    setRecommended,

    setCurrentDU,

    setModelClicked,
    setCurrentIndex,
    setCurrentStep,
    setShowBoxSize,
    setShowNextStep,

    setIsLoading,

    dependentStep,
    setDependentStep,
    typeModuleId,
    setTypeModuleId,
    indexSub,
    setIndexSub,

    kitchen,
    currentDU,
    currentIndex,
    currentStep,
    executingDU,
    executingTotalDU,
    executingIndex,
    executingStep,
    executingModule,
    setExecutingDU,
    setExecutingTotalDU,
    setExecutingIndex,
    setExecutingStep,
    setExecutingModule,

    tabSelected,
    setTabSelected,
  } = useContext(KitchenContext);

  const containerRef1 = useRef(null);
  const containerRef2 = useRef(null);
  const timeoutRef = useRef(null);

  const [temp, setTemp] = useState({});
  const [showPopup, setShowPopup] = useState(false);

  const [data, setData] = useState();

  useEffect(() => {
    const getListModule = () => {
      if (kitchen[currentStep]?.listModuleLover?.length > 0) {
        const currentTotalDesign = countCurrentTotalDesign(
          kitchen[currentStep],
          currentIndex
        );
        for (const itemLover of kitchen[currentStep].listModuleLover) {
          if (itemLover.totalDesign === currentTotalDesign) {
            return itemLover.module.listWifeModule;
          }
        }
      }

      if (
        stepDetail?.typeModules.some((module) => {
          if (module.dependentStep) {
            setDependentStep(module.dependentStep);
          }
          if (module.require === true && module.startIndex === currentIndex) {
            setTypeModuleId(module);
          } else {
            setTypeModuleId(module);
          }

          return module.require === true && module.startIndex === currentIndex;
        })
      ) {
        return stepDetail?.typeModules.find((module) => module.require === true)
          .listModule;
      } else {
        return stepDetail?.typeModules.find(
          (module) => module.require === false
        ).listModule;
      }
    };

    setData(getListModule());

    setTimeout(() => {
      const moduleContainer = document.getElementById(
        mainSelected?.module?._id
      );
      const materialContainer = document.getElementById(
        mainSelected?.material?._id
      );
      const textureContainer = document.getElementById(
        mainSelected?.texture?._id
      );

      if (materialContainer) {
        materialContainer.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
      if (textureContainer) {
        textureContainer.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
      if (moduleContainer) {
        moduleContainer.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }, 300);
  }, [stepDetail, currentStep, currentIndex]);

  // useEffect(() => {
  //   if (mainSelected !== null) {
  //     setTimeout(() => {
  //       const moduleContainer = document.getElementById(
  //         mainModule?.module?._id
  //       );
  //       const materialContainer = document.getElementById(
  //         mainModule?.material?._id
  //       );
  //       const textureContainer = document.getElementById(
  //         mainModule?.texture?._id
  //       );

  //       if (moduleContainer) {
  //         moduleContainer.scrollIntoView({ behavior: "smooth" });
  //       }
  //       if (materialContainer) {
  //         materialContainer.scrollIntoView({ behavior: "smooth" });
  //       }
  //       if (textureContainer) {
  //         textureContainer.scrollIntoView({ behavior: "smooth" });
  //       }
  //     }, 500);
  //   }
  // }, [mainModule, mainSelected]);

  const handleWheelScroll = (e, curRef) => {
    const container = curRef.current;
    if (e.deltaY > 0) {
      container.scrollLeft += e.deltaY / 5;
    } else {
      container.scrollLeft -= Math.abs(e.deltaY / 5);
    }
  };

  const confirm = async (cabinet, glb) => {
    const price = await determinePrice(
      typeModuleId,
      mainModule?.material?._id,
      cabinet.indexDesign
    );

    setMainModule({
      ...mainModule,
      module: {
        require: false,
        _id: cabinet._id,
        type: cabinet.type,
        listWifeModule: cabinet.listWifeModule,
        listSubmodule: cabinet.listSubmodule,
        size: cabinet.size,
        glbUrl: glb,
        name: cabinet.name,
        icon: cabinet.imgUrl,
        indexDesign: cabinet.indexDesign,
      },
      indexDesign: cabinet.indexDesign,
      price: price,
    });

    setSubModule(subNull);

    setExecutingModule(glb);

    setShowPopup(false);
  };

  const cancel = (e) => {
    setShowPopup(false);
  };

  const determinePrice = async (typeModuleId, materialId, indexDesign) => {
    try {
      let measure = 425;
      const trademarkId = "64c8ae2b3ac796ed6e28e18c";

      // if (context.currentStep === 0 || context.currentStep === 2) {
      //   measure = context.baseMeasureRight;
      // } else if (context.currentStep === 1 || context.currentStep === 3) {
      //   measure = context.baseMeasureLeft;
      // }

      const price = await getPrice(typeModuleId, 0, materialId, trademarkId);

      const calculatedPrice = (measure * indexDesign * price) / 1000;

      return calculatedPrice;
    } catch (error) {
      console.log(error);
    }
  };

  const handleHover = (event, texture) => {
    const x = event.clientX;
    const y = event.clientY;
    const colorZoom = document.getElementById("colorZoom");

    colorZoom.style.display = "block";
    colorZoom.style.backgroundImage = `url(${texture})`;
    colorZoom.style.left = `${x - 70}px`;
    colorZoom.style.top = `${y - 230}px`;
  };

  const handleLeave = () => {
    clearTimeout(timeoutRef.current);
    const colorZoom = document.getElementById("colorZoom");
    colorZoom.style.display = "none";
  };

  const renderMaterialItem = (material, iconUrl, checked) => {
    return (
      <div
        id={material._id}
        key={material._id}
        className={checked ? "material-item active" : "material-item"}
        style={{ "--url": `url(${iconUrl})` }}
        title={material.name}
      >
        <p>{material.name}</p>

        <input
          disabled={isLoading}
          name="cabinet-material"
          type="radio"
          value={iconUrl}
          checked={checked}
          onChange={async () => {
            if (
              mainModule?.module?.glbUrl &&
              mainModule?.module?.glbUrl !== null
            ) {
              const price = await determinePrice(
                typeModuleId,
                material._id,
                mainModule.indexDesign
              );

              if (
                mainModule?.module?.type === TypeModule.MAIN_MODULE ||
                mainModule?.module?.type === TypeModule.REQUIRE_MODULE
              ) {
                setRecommended({
                  ...recommended,
                  material: {
                    _id: material._id,
                    name: material.name,
                    icon: iconUrl,
                  },
                });
              }

              setMainModule({
                ...mainModule,
                material: {
                  _id: material._id,
                  name: material.name,
                  icon: iconUrl,
                },
                texture: {
                  _id: null,
                  name: null,
                  icon: null,
                  imgUrl: null,
                },
                price: price,
              });
            } else {
              toast.error("Bạn cần chọn module trước khi chọn vật liệu.");
            }
          }}
          onClick={() => {
            if (
              mainModule?.material?.icon === iconUrl &&
              mainModule?.module?.glbUrl
            ) {
              setMainModule({
                ...mainModule,
                material: {
                  _id: null,
                  name: null,
                  icon: null,
                },
                texture: {
                  _id: null,
                  name: null,
                  icon: null,
                  imgUrl: null,
                },
              });
            }
          }}
        />
      </div>
    );
  };

  const renderTextureItem = (texture, imgUrl, iconUrl, checked) => {
    return (
      <div
        ref={timeoutRef}
        id={texture._id}
        key={texture._id}
        className={checked ? "texture-item active" : "texture-item"}
        style={{ "--url": `url(${iconUrl})` }}
        title={texture.name}
        onMouseEnter={(e) =>
        (timeoutRef.current = setTimeout(() => {
          handleHover(e, iconUrl);
        }, 800))
        }
        // onMouseEnter={(e) => handleHover(e, iconUrl)}
        // onMouseMove={(e) => handleHover(e, imgUrl)}
        onMouseLeave={handleLeave}
      >
        <input
          disabled={isLoading}
          name="cabinet-texture"
          type="radio"
          value={imgUrl}
          checked={checked}
          onChange={() => {
            if (
              mainModule?.module?.glbUrl &&
              mainModule?.module?.glbUrl !== null &&
              mainModule?.material?.icon
            ) {
              if (mainModule?.module?.type !== TypeModule.SCALE_MODULE) {
                setRecommended({
                  ...recommended,
                  texture: {
                    _id: texture._id,
                    name: texture.name,
                    icon: iconUrl,
                    imgUrl: imgUrl,
                  },
                });
              }

              setMainModule({
                ...mainModule,
                texture: {
                  _id: texture._id,
                  name: texture.name,
                  icon: iconUrl,
                  imgUrl: imgUrl,
                },
              });
            } else {
              if (!mainModule?.module?.glbUrl) {
                toast.error(
                  "Bạn cần chọn module và vật liệu trước khi chọn màu sắc."
                );
              } else {
                toast.error("Bạn cần chọn vật liệu trước khi chọn màu sắc.");
              }
            }
          }}
        // onClick={() => {
        //   if (
        //     mainModule?.mainTexture === imgUrl &&
        //     mainModule?.mainType &&
        //     mainModule?.mainMaterial
        //   ) {
        //     setMainModule({
        //       ...mainModule,
        //       mainTextureIdx: null,
        //       mainTextureIcon: null,
        //       mainTextureName: null,
        //       mainTexture: null,
        //     });
        //   }
        // }}
        />
      </div>
    );
  };

  return (
    <div className="mainOption">
      <section className="module-container">
        <p className="title-control">Kiểu dáng</p>
        <Popconfirm
          title="Xóa module thừa ở cuối"
          description="Bạn có đồng ý thay đổi thành module này và xóa đi những module thừa ở phía sau?"
          open={showPopup}
          // getPopupContainer={(triggerNode) => triggerNode.parentElement}
          onConfirm={() => confirm(temp.cabinet, temp.glb)}
          onCancel={cancel}
          okText="Yes"
          cancelText="No"
        >
          <div className="module-option col-12">
            {data?.map((cabinet) => {
              const glb = cabinet.glbUrl;
              const checked = mainModule?.module?.glbUrl === glb;

              return (
                <div
                  id={cabinet._id}
                  key={cabinet._id}
                  className="col-4 col-xl-3"
                  style={{
                    "--url": `url(https://api.lanha.vn/profiles/icon-img/${cabinet.imgUrl})`,
                    padding: "4px",
                  }}
                >
                  <div
                    className={checked ? "module-item active" : "module-item"}
                    title={cabinet.name}
                  >
                    <input
                      disabled={isLoading}
                      name="cabinet"
                      type="radio"
                      value={glb}
                      checked={checked}
                      onChange={async () => {
                        if (currentIndex === 0) {
                          if (cabinet.type === 2) {
                            toast.error("Không thể thêm tủ khô vào vị trí này");
                            return;
                          } else if (cabinet.type === 5) {
                            toast.error("Không thể thêm tủ đôi vào vị trí này");
                            return;
                          }
                        }
                        if (
                          kitchen[currentStep].lstModule[currentIndex]
                            .mainModule.indexDesign !== cabinet.indexDesign &&
                          kitchen[currentStep].listModuleLover?.length > 0 &&
                          kitchen[currentStep].lstModule[currentIndex]
                            .mainModule.module !== null
                        ) {
                          let errorModuleLogic = false;
                          for (
                            let ix = currentIndex;
                            ix < kitchen[currentStep].designUnit;
                            ix++
                          ) {
                            if (
                              kitchen[currentStep].lstModule[ix]?.mainModule
                                ?.module?.type === TypeModule.LOVER_MODULE
                            ) {
                              errorModuleLogic = true;
                              break;
                            }
                          }
                          if (errorModuleLogic) {
                            toast.error("Tủ đôi sẽ bị sai!!");
                            return;
                          }
                        }
                        if (
                          kitchen[currentStep]?.totalIndexDesign +
                          cabinet.indexDesign -
                          kitchen[currentStep].lstModule[currentIndex]
                            .mainModule.indexDesign <=
                          kitchen[currentStep]?.designUnit
                        ) {
                          switch (cabinet.type) {
                            case 2:
                              if (
                                kitchen[currentStep].lstModule[currentIndex + 1]
                                  ?.mainModule === null ||
                                kitchen[currentStep].lstModule[currentIndex + 1]
                                  ?.mainModule.module.type ===
                                  TypeModule.IMPACT_MODULE ||
                                currentIndex + 1 ===
                                kitchen[currentStep].designUnit
                              ) {
                                setShowPopup(false);
                                const price = await determinePrice(
                                  typeModuleId,
                                  mainModule?.material?._id,
                                  cabinet.indexDesign
                                );

                                if (
                                  recommended.material !== null &&
                                  cabinet.type !== TypeModule.SCALE_MODULE
                                ) {
                                  setMainModule({
                                    ...mainModule,
                                    module: {
                                      require: false,
                                      _id: cabinet._id,
                                      size: cabinet.size,
                                      indexDesign: cabinet.indexDesign,
                                      listWifeModule: cabinet.listWifeModule,
                                      listSubmodule: cabinet.listSubmodule,
                                      type: cabinet.type,
                                      glbUrl: glb,
                                      name: cabinet.name,
                                      icon: cabinet.imgUrl,
                                    },
                                    material: recommended.material,
                                    texture: recommended.texture,
                                    indexDesign: cabinet.indexDesign,
                                    price: price,
                                  });
                                } else {
                                  setMainModule({
                                    ...mainModule,
                                    module: {
                                      require: false,
                                      _id: cabinet._id,
                                      size: cabinet.size,
                                      indexDesign: cabinet.indexDesign,
                                      listWifeModule: cabinet.listWifeModule,
                                      listSubmodule: cabinet.listSubmodule,
                                      type: cabinet.type,
                                      glbUrl: glb,
                                      name: cabinet.name,
                                      icon: cabinet.imgUrl,
                                    },
                                    indexDesign: cabinet.indexDesign,
                                    price: price,
                                  });
                                }

                                setSubModule(subNull);

                                setExecutingModule(glb);
                              } else {
                                toast.error(
                                  "Không thể thêm tủ khô vào vị trí này"
                                );
                              }
                              break;

                            default:
                              if (
                                kitchen[currentStep].lstModule[currentIndex - 1]
                                  ?.mainModule.module.type !==
                                TypeModule.IMPACT_MODULE
                              ) {
                                setShowPopup(false);
                                let setLoveModule = true;

                                if (
                                  kitchen[currentStep].listModuleLover?.length >
                                  0
                                ) {
                                  kitchen[currentStep].listModuleLover.forEach(
                                    (itemLover) => {
                                      const currentTotalDesign =
                                        countTotalDesign(
                                          kitchen[currentStep],
                                          currentIndex
                                        );
                                      if (
                                        currentTotalDesign +
                                        cabinet.indexDesign >
                                        itemLover.totalDesign &&
                                        currentTotalDesign +
                                          cabinet.indexDesign <
                                          itemLover.totalDesign +
                                            itemLover.module.indexDesign &&
                                        cabinet.type !== TypeModule.LOVER_MODULE
                                      ) {
                                        setLoveModule = false;
                                      }
                                    }
                                  );
                                }

                                if (setLoveModule) {
                                  const price = await determinePrice(
                                    typeModuleId,
                                    mainModule?.material?._id,
                                    cabinet.indexDesign
                                  );

                                  // setMainModule({
                                  //   ...mainModule,
                                  //   module: {
                                  //     require: false,
                                  //     _id: cabinet._id,
                                  //     size: cabinet.size,
                                  //     indexDesign: cabinet.indexDesign,
                                  //     listWifeModule: cabinet.listWifeModule,
                                  //     type: cabinet.type,
                                  //     glbUrl: glb,
                                  //     name: cabinet.name,
                                  //     icon: cabinet.imgUrl,
                                  //   },
                                  //   indexDesign: cabinet.indexDesign,
                                  //   price: price,
                                  // });

                                  if (
                                    recommended.material !== null &&
                                    cabinet.type !== TypeModule.SCALE_MODULE
                                  ) {
                                    setMainModule({
                                      ...mainModule,
                                      module: {
                                        require: false,
                                        _id: cabinet._id,
                                        size: cabinet.size,
                                        indexDesign: cabinet.indexDesign,
                                        listWifeModule: cabinet.listWifeModule,
                                        listSubmodule: cabinet.listSubmodule,
                                        type: cabinet.type,
                                        glbUrl: glb,
                                        name: cabinet.name,
                                        icon: cabinet.imgUrl,
                                      },

                                      material: recommended.material,
                                      texture: recommended.texture,
                                      indexDesign: cabinet.indexDesign,
                                      price: price,
                                    });
                                  } else {
                                    setMainModule({
                                      ...mainModule,
                                      module: {
                                        require: false,
                                        _id: cabinet._id,
                                        size: cabinet.size,
                                        indexDesign: cabinet.indexDesign,
                                        listWifeModule: cabinet.listWifeModule,
                                        listSubmodule: cabinet.listSubmodule,
                                        type: cabinet.type,
                                        glbUrl: glb,
                                        name: cabinet.name,
                                        icon: cabinet.imgUrl,
                                      },
                                      indexDesign: cabinet.indexDesign,
                                      price: price,
                                    });
                                  }

                                  setSubModule(subNull);

                                  setExecutingModule(glb);
                                } else {
                                  toast.error(
                                    "Bạn còn phải thiết kế tủ đôi nữa chứ!!"
                                  );
                                }
                              } else {
                                toast.error("Va chạm với tủ khô");
                              }
                              break;
                          }
                        } else if (
                          kitchen[currentStep].lstModule[currentIndex + 1] &&
                          kitchen[currentStep].lstModule[currentIndex + 1]
                            ?.mainModule !== null
                        ) {
                          setTemp({ cabinet: cabinet, glb: glb });

                          setShowPopup(true);
                        } else {
                          toast.error(
                            "Module bạn chọn không phù hợp với số lượng đơn vị thiết kế còn lại!!!"
                          );
                        }
                      }}
                      onClick={() => {
                        if (mainModule?.module?.glbUrl === glb) {
                          toast.error("Bạn không thể để trống module");
                        }
                      }}
                    />
                  </div>

                  <div className="info">
                    <span className="info__name">{cabinet.name}</span>
                    <span className="info__DU">
                      {cabinet.indexDesign > 1
                        ? `${cabinet.indexDesign}★`
                        : "★"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Popconfirm>
      </section>

      <div id="colorZoom"></div>

      <section className="materialTexture-container">
        <p className="title-control">Vật liệu và màu sắc</p>
        <div
          className="materialTexture-option"
          ref={containerRef1}
          onWheel={(e) => handleWheelScroll(e, containerRef1)}
        >
          {mainModule?.module !== null &&
            mainModule?.module?._id !== null &&
            mainModule?.module?.require !== null
            ? stepDetail?.typeModules
              .find(
                (module) => module.require === mainModule?.module?.require
              )
              ?.listModule?.find((md) => md._id === mainModule?.module?._id)
              ?.listMaterial?.map((material) => {
                const iconUrl = `https://api.lanha.vn/profiles/icon-img/${material.imgUrl}`;
                const checked = mainModule?.material?.icon === iconUrl;

                return renderMaterialItem(material, iconUrl, checked);
              })
            : lstMaterial.map((material) => {
              const iconUrl = `https://api.lanha.vn/profiles/icon-img/${material.imgUrl}`;
              const checked = mainModule?.material?.icon === iconUrl;

              return renderMaterialItem(material, iconUrl, checked);
            })}
        </div>

        <div
          className="materialTexture-option"
          ref={containerRef2}
          onWheel={(e) => handleWheelScroll(e, containerRef2)}
        >
          {mainModule?.module !== null &&
            mainModule?.module?._id !== null &&
            mainModule?.material?._id
            ? stepDetail?.typeModules
              .find(
                (module) => module.require === mainModule?.module?.require
              )
              .listModule?.find((md) => md._id === mainModule?.module?._id)
              ?.listMaterial?.find(
                (md) => md._id === mainModule?.material?._id
              )
              ?.listTexture.map((texture, id) => {
                const imgUrl = `https://api.lanha.vn/profiles/texture-img/${texture.imgUrl}`;
                const iconUrl = `https://api.lanha.vn/profiles/icon-img/${texture.iconUrl}`;
                const checked = mainModule?.texture?.imgUrl === imgUrl;

                return renderTextureItem(
                  texture,
                  imgUrl,
                  iconUrl,
                  checked,
                  id
                );
              })
            : lstTexture.map((texture, id) => {
              const imgUrl = `https://api.lanha.vn/profiles/texture-img/${texture.imgUrl}`;
              const iconUrl = `https://api.lanha.vn/profiles/icon-img/${texture.iconUrl}`;
              const checked = mainModule?.texture?.imgUrl === imgUrl;

              return renderTextureItem(texture, imgUrl, iconUrl, checked, id);
            })}
        </div>
      </section>
    </div>
  );
}
