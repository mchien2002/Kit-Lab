import { useContext, useEffect, useRef, useState } from "react";
import { Accordion } from "react-bootstrap";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import {
  calculateMeasure,
  calculatePrice,
  changeModuleDepthInStep,
  checkImpactModule,
  checkIndexDepthModule,
  checkModuleAvailability,
  countCurrentTotalDesign,
  countCurrentTotalDesignLover,
  countTotalDesignWithEdit,
  fetchGroupItem,
  findUnitPrice,
  handleDeleteTexture,
} from "../../utils/function";
import {
  getListMaterial,
  getListTexture,
  getListWifeModule,
  getModuleDetail,
} from "../../utils/getData";
import { KitchenContext } from "../Design/Design";
// import { KitchenContext } from "../Virtual/Virtual";
import "./MainOption.scss";
import callApi from "../../utils/callApi";
import Cookies from "js-cookie";
import Loading from "../Loading/Loading";

export default function MainOption() {
  const {
    display,
    isLoading,
    listStepDetail,
    lstMaterial,
    lstTexture,
    TypeModule,

    mainModule,
    setMainModule,
    subModule,
    setSubModule,
    subNull,

    mainSelected,
    setCheckReload,
    setCheckChange,
    setRefreshTotal,

    wallHeight,
    setWallHeight,

    lstTab,
    setLstTab,
    baseLstTab,
    setBaseLstTab,
    tabOption,
    setTabOption,
    lstSub,
    setLstSub,
    baseLstSub,
    setBaseLstSub,
    stepDetail,
    setStepDetail,
    infoTab,
    setInfoTab,
    baseInfoTab,
    setBaseInfoTab,

    trademark,
    trademarkRef,
    recommended,
    setRecommended,

    setIsLoading,

    setDependentStep,
    typeModuleId,
    setTypeModuleId,

    kitchen,
    currentIndex,
    currentStep,
    setExecutingModule,
  } = useContext(KitchenContext);

  const containerRef1 = useRef(null);
  const containerRef2 = useRef(null);
  const timeoutRef = useRef(null);

  const [data, setData] = useState();
  const [listTexture, setListTexture] = useState();
  const [moduleDetail, setModuleDetail] = useState();
  const [mainLover, setMainLover] = useState(null);
  const [selectGroup, setSelectGroup] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [DUBlank, setDUBlank] = useState(null);
  const [bgColor, setBgColor] = useState("#8f999e");
  const [imageUrls, setImageUrls] = useState([]);
  const [listMaterials, setListMaterials] = useState([]);
  const [isSon2k, setIsSon2k] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState(null);
  const token = Cookies.get("token");
  // useEffect(() => {
  //   const fetchModuleDetail = async () => {
  //     const filteredListMaterials = await getListMaterial(
  //       selectGroup,
  //       trademark?.value
  //     );
  //     setListMaterials(filteredListMaterials);
  //   };
  //   fetchModuleDetail();
  // }, [selectGroup]);

  const handleAccordionClick = async (index, groupId) => {
    setActiveAccordion(index === activeAccordion ? null : index);

    if (data[index].items.length === 0) {
      setIsFetching(true);
      // console.log(data[index].items);
      try {
        const headers = {
          authorization: `Bearer ${token}`,
        };

        const res = await callApi(
          `modules/product-configurator?type_module_id=${groupId}`,
          "GET",
          null,
          headers
        );

        if (res.status) {
          setIsFetching(false);
          const newData = [...data];
          newData[index].items = res.data.data;
          setData(newData);
        } else {
          setIsFetching(false);
          toast.error("Lỗi lấy danh sách module");
        }
      } catch (err) {
        setIsFetching(false);
        console.log(err);
        toast.error("Lỗi lấy danh sách module");
      }
    } else {
      console.log(data[index].item);
    }
  };

  const handleChangeMain = async (cabinet, group, glb, trademark, index) => {
    setCheckChange(true);
    const resultModuleDetail = await getModuleDetail(
      cabinet._id,
      trademark?.value
    );

    setLstSub(resultModuleDetail?.listSubmodule);
    setBaseLstSub(resultModuleDetail?.listSubmodule);
    setLstTab(() => {
      const newItems =
        resultModuleDetail?.listSubmodule?.map((item) => item.nameCollection) ||
        [];

      const updatedLstTab = ["Cabinet", ...newItems];

      return updatedLstTab;
    });

    setBaseLstTab(() => {
      const newItems =
        resultModuleDetail?.listSubmodule?.map((item) => item.nameCollection) ||
        [];

      const updatedLstTab = ["Cabinet", ...newItems];

      return updatedLstTab;
    });

    setInfoTab(() => {
      const newItems =
        resultModuleDetail?.listSubmodule?.map((item) => {
          return {
            pId: cabinet._id,
            name: item.nameCollection,
            _id: item._id,
          };
        }) || [];

      const updatedLstTab = ["Cabinet", ...newItems];

      return updatedLstTab;
    });

    setLstTab(() => {
      const newItems =
        resultModuleDetail?.listSubmodule?.map((item) => item.nameCollection) ||
        [];

      const updatedLstTab = ["Cabinet", ...newItems];

      return updatedLstTab;
    });

    setBaseInfoTab(() => {
      const newItems =
        resultModuleDetail?.listSubmodule?.map((item) => {
          return {
            pId: cabinet._id,
            name: item.nameCollection,
            _id: item._id,
          };
        }) || [];

      const updatedLstTab = ["Cabinet", ...newItems];

      return updatedLstTab;
    });

    let filteredListMaterials;

    filteredListMaterials = await getListMaterial(cabinet._id, trademark?.value);
    setListMaterials(filteredListMaterials);

    switch (cabinet.type) {
      case 2:
        console.log(cabinet);
        if (cabinet) {
          const isMaterialExists = filteredListMaterials?.some(
            (material) => material._id === recommended?.material?._id
          );

          let modulePrice;
          let measureWidth;
          let measureHeight;
          let measureDepth;

          const resultMeasureWidth = calculateMeasure(
            group.actualSize.width,
            0,
            0,
            0,
            kitchen[currentStep].scale,
            cabinet.indexDesign
          );
          const resultMeasureHeight = calculateMeasure(
            group.actualSize.height,
            0,
            wallHeight,
            0,
            kitchen[currentStep].scale,
            cabinet.indexDesign
          );

          measureWidth = resultMeasureWidth;
          measureHeight = resultMeasureHeight;
          measureDepth = group.actualSize.depth;

          let measure = {
            w: measureWidth,
            h: measureHeight,
            d: measureDepth,
          };

          const material = filteredListMaterials?.find((material) => {
            return material._id === recommended?.material?._id;
          });

          if (isMaterialExists && recommended.material !== null) {
            modulePrice = await determinePrice(group._id, material, measure);

            setMainModule({
              ...mainModule,
              module: {
                require: typeModuleId.require,
                _id: cabinet._id,
                only: cabinet.only,
                startIndex: cabinet.startIndex,
                size: cabinet.size,
                indexDesign: cabinet.indexDesign,
                listWifeModule: cabinet.listWifeModule,
                listSubmodule: cabinet.listSubmodule,
                infoMeasure: cabinet?.infoMeasure,
                indexDesignDepth: cabinet.indexDesignDepth,
                position: cabinet.position,
                listMaterial: cabinet.listMaterial,
                type: cabinet.type,
                coverBox: cabinet.coverBox,
                glbUrl: glb,
                name: cabinet.name,
                imgUrl: cabinet.imgUrl,
              },
              type: lstTab[tabOption],
              material: recommended.material,
              texture: recommended.texture,
              indexDesign: cabinet.indexDesign,
              measure: measure,
              actualSize: group.actualSize,
              groupId: group._id,
              //priceId: group.price._id,
              price: modulePrice?.price,
              unitPrice: modulePrice?.unitPrice,
            });
          } else {
            modulePrice = await determinePrice(
              group._id,
              mainModule?.material,
              measure
            );

            setMainModule({
              ...mainModule,
              module: {
                require: typeModuleId.require,
                _id: cabinet._id,
                size: cabinet.size,
                only: cabinet.only,
                startIndex: cabinet.startIndex,
                indexDesign: cabinet.indexDesign,
                listWifeModule: cabinet.listWifeModule,
                listSubmodule: cabinet.listSubmodule,
                infoMeasure: cabinet?.infoMeasure,
                indexDesignDepth: cabinet.indexDesignDepth,
                position: cabinet.position,
                listMaterial: cabinet.listMaterial,
                type: cabinet.type,
                coverBox: cabinet.coverBox,
                glbUrl: glb,
                name: cabinet.name,
                imgUrl: cabinet.imgUrl,
              },
              type: lstTab[tabOption],
              indexDesign: cabinet.indexDesign,
              measure: measure,
              actualSize: group.actualSize,
              groupId: group._id,
              //priceId: group.price._id,
              price: modulePrice?.price,
              unitPrice: modulePrice?.unitPrice,
            });
          }

          setSubModule(subNull);
          setExecutingModule(glb);
        }
        break;

      default:
        console.log(cabinet);
        if (cabinet) {
          const isMaterialExists = filteredListMaterials?.some(
            (material) => material._id === recommended?.material?._id
          );

          let modulePrice;
          let measureWidth;
          let measureHeight;
          let measureDepth;
          let scale;

          if (cabinet.type === TypeModule.LOVER_MODULE) {
            scale = mainLover?.scale;
          } else {
            scale = kitchen[currentStep].scale;
          }

          if (cabinet.type !== TypeModule.SCALE_MODULE) {
            const resultMeasureWidth = calculateMeasure(
              group.actualSize?.width,
              0,
              0,
              0,
              scale,
              cabinet.indexDesign
            );

            const resultMeasureHeight = calculateMeasure(
              group.actualSize.height,
              0,
              wallHeight,
              0,
              scale,
              cabinet.indexDesign
            );

            measureWidth = resultMeasureWidth;
            measureHeight = resultMeasureHeight;
            measureDepth = group.actualSize.depth;
          }

          let measure = {
            w: measureWidth,
            h: measureHeight,
            d: measureDepth,
          };

          if (
            isMaterialExists &&
            recommended.material !== null &&
            cabinet.type !== TypeModule.SCALE_MODULE
          ) {
            const material = filteredListMaterials?.find((material) => {
              return material._id === recommended?.material?._id;
            });
            modulePrice = await determinePrice(group._id, material, measure);

            setMainModule({
              ...mainModule,
              module: {
                require: typeModuleId.require,
                _id: cabinet._id,
                size: cabinet.size,
                only: cabinet.only,
                startIndex: cabinet.startIndex,
                indexDesign: cabinet.indexDesign,
                listWifeModule: cabinet.listWifeModule,
                listSubmodule: cabinet.listSubmodule,
                infoMeasure: cabinet?.infoMeasure,
                listMaterial: cabinet.listMaterial,
                indexDesignDepth: cabinet.indexDesignDepth,
                position: cabinet.position,
                type: cabinet.type,
                coverBox: cabinet.coverBox,
                glbUrl: glb,
                name: cabinet.name,
                imgUrl: cabinet.imgUrl,
              },
              type: lstTab[tabOption],
              material: recommended.material,
              texture: recommended.texture,
              indexDesign: cabinet.indexDesign,
              mainLover: mainLover,
              measure: measure,
              actualSize: group.actualSize,
              groupId: group._id,
              //priceId: group.price._id,
              price: modulePrice?.price,
              unitPrice: modulePrice?.unitPrice,
            });
          } else {
            modulePrice = await determinePrice(
              group._id,
              mainModule?.material,
              measure
            );

            setMainModule({
              ...mainModule,
              module: {
                require: typeModuleId.require,
                _id: cabinet._id,
                size: cabinet.size,
                only: cabinet.only,
                startIndex: cabinet.startIndex,
                indexDesign: cabinet.indexDesign,
                listWifeModule: cabinet.listWifeModule,
                listSubmodule: cabinet.listSubmodule,
                infoMeasure: cabinet?.infoMeasure,
                indexDesignDepth: cabinet.indexDesignDepth,
                position: cabinet.position,
                listMaterial: cabinet.listMaterial,
                type: cabinet.type,
                coverBox: cabinet.coverBox,
                glbUrl: glb,
                name: cabinet.name,
                imgUrl: cabinet.imgUrl,
              },
              type: lstTab[tabOption],
              indexDesign: cabinet.indexDesign,
              mainLover: mainLover,
              measure: measure,
              actualSize: group.actualSize,
              groupId: group._id,
              indexGroup: index,
              //priceId: group.price._id,
              price: modulePrice?.price,
              unitPrice: modulePrice?.unitPrice,
            });
          }

          setSubModule(subNull);
          setExecutingModule(glb);
        }
        break;
    }
  };

  const checkLogicLoad = (cabinet, group, glb, trademark, index) => {
    if (kitchen[currentStep].stepsWife.length === 0) {
      if (!checkIndexDepthModule(kitchen, currentStep, cabinet)) {
        Swal.fire({
          title:
            "Bạn có đồng ý thay đổi toàn bộ tủ đụng trần về cùng độ sâu với module bạn vừa chọn?",
          showCancelButton: true,
          confirmButtonText: "OK",
          cancelButtonText: "Cancel",
        }).then(async (result) => {
          if (result.isConfirmed) {
            changeModuleDepthInStep(
              cabinet,
              currentStep,
              currentIndex,
              kitchen,
              display,
              stepDetail,
              listStepDetail,
              trademark.value,
              setRefreshTotal
            );

            handleChangeMain(cabinet, group, glb, trademark, index);
          }
        });
      } else {
        handleChangeMain(cabinet, group, glb, trademark, index);
      }
    } else {
      handleChangeMain(cabinet, group, glb, trademark, index);
    }
  };

  const checkValidLoverToCurrent = (
    kitchen,
    currentStep,
    currentIndex,
    cabinet
  ) => {
    let validLover = true;

    kitchen[currentStep].listModuleLover.forEach((itemLover) => {
      const currentTotalDesign = countCurrentTotalDesign(
        kitchen,
        kitchen[currentStep],
        currentIndex
      );

      if (
        currentTotalDesign + cabinet.indexDesign > itemLover.totalDesign &&
        currentTotalDesign + cabinet.indexDesign <=
          itemLover.totalDesign + itemLover.indexDesign &&
        cabinet.type !== TypeModule.LOVER_MODULE
      ) {
        validLover = false;
      }
    });

    return validLover;
  };

  const checkValidLoverToLast = (
    kitchen,
    currentStep,
    currentIndex,
    cabinet
  ) => {
    let validLover = true;

    kitchen[currentStep].listModuleLover.forEach((itemLover) => {
      const currentTotalDesign = countTotalDesignWithEdit(
        kitchen,
        kitchen[currentStep],
        currentIndex
      );

      if (
        currentTotalDesign + cabinet.indexDesign > itemLover.totalDesign &&
        currentTotalDesign + cabinet.indexDesign <=
          itemLover.totalDesign + itemLover.indexDesign &&
        cabinet.type !== TypeModule.LOVER_MODULE
      ) {
        validLover = false;
      }
    });

    return validLover;
  };

  const checkLoverExistBehind = (kitchen, currentStep, currentIndex) => {
    let existModuleLover = false;

    for (
      let ix = currentIndex + 1;
      ix < kitchen[currentStep].designUnit;
      ix++
    ) {
      if (kitchen[currentStep]?.listModuleLover?.length !== 0) {
        if (
          kitchen[currentStep].lstModule[ix]?.mainModule?.module?.type ===
          TypeModule.LOVER_MODULE
        ) {
          existModuleLover = true;
          break;
        }
      }
    }

    return existModuleLover;
  };

  const removeBehindModule = (display, kitchen, currentStep, currentIndex) => {
    for (let i = currentIndex + 1; i < kitchen[currentStep].designUnit; i++) {
      if (kitchen[currentStep].lstModule[i].mainModule !== null) {
        display.scene.remove(
          kitchen[currentStep].lstModule[i].mainModule?.gltf
        );

        if (kitchen[currentStep].lstModule[i].lstSubModule.length !== 0) {
          kitchen[currentStep].lstModule[i].lstSubModule?.forEach(
            (subModule) => {
              display.scene.remove(subModule?.gltf);
            }
          );
        }
        kitchen[currentStep].lstModule[i].mainModule = null;
        kitchen[currentStep].lstModule[i].lstSubModule = [];
      } else {
        break;
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        let moduleList;
        let listWifeModule;

        setMainLover(null);

        if (kitchen[currentStep]?.listModuleLover?.length > 0) {
          const currentTotalDesign = countCurrentTotalDesign(
            kitchen,
            kitchen[currentStep],
            currentIndex
          );

          for (const itemLover of kitchen[currentStep].listModuleLover) {
            if (
              itemLover.totalDesign <= currentTotalDesign &&
              itemLover.totalDesign + itemLover.indexDesign > currentTotalDesign
            ) {
              const currentTotalDesignLover = countCurrentTotalDesignLover(
                kitchen,
                kitchen[currentStep],
                currentIndex,
                itemLover.totalDesign
              );

              listWifeModule = await getListWifeModule(itemLover.module._id);
              setMainLover(itemLover);
              setDUBlank(itemLover.indexDesign - currentTotalDesignLover);

              moduleList = listWifeModule.listModule;
              break;

              // listWifeModule = itemLover.module.listWifeModule.listModule
              // setMainLover(itemLover);
              // setDUBlank(itemLover.indexDesign - currentTotalDesignLover);

              // moduleList = listWifeModule;
              // break;
            }
          }
        }

        if (
          !listWifeModule &&
          stepDetail?.typeModules.some((module) => {
            if (module.dependentStep) {
              setDependentStep(module.dependentStep);
            }
            if (module.require === true && module.startIndex === currentIndex) {
              setTypeModuleId(module);
            } else if (module.require === false) {
              setTypeModuleId(module);
            }

            return (
              module.require === true && module.startIndex === currentIndex
            );
          })
        ) {
          moduleList = stepDetail?.typeModules.find(
            (module) => module.require === true
          )?.listModule;
        } else if (!listWifeModule) {
          moduleList = stepDetail?.typeModules.find(
            (module) => module.require === false
          )?.listModule;
        }

        setData(moduleList);

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
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [stepDetail, currentStep, currentIndex]);

  useEffect(() => {
    const fetchModuleDetail = async () => {
      if (mainModule) {
        const resultModuleDetail = await getModuleDetail(
          mainModule?.module?._id,
          trademark?.value
        );

        if (mainModule?.gltf && mainModule?.gltf !== null) {
          let newLstTab = ["Cabinet"];
          kitchen[currentStep]?.lstModule[currentIndex]?.tabs?.map((item) => {
            if (item?.name) {
              newLstTab.push(item?.name);
            }
          });

          setBaseLstTab(newLstTab);
          setLstTab(newLstTab);
          setBaseInfoTab(kitchen[currentStep]?.lstModule[currentIndex]?.tabs);
          setInfoTab(kitchen[currentStep]?.lstModule[currentIndex]?.tabs);
        } else {
          setLstTab(() => {
            const newItems =
              resultModuleDetail?.listSubmodule?.map(
                (item) => item.nameCollection
              ) || [];

            const updatedLstTab = ["Cabinet", ...newItems];

            return updatedLstTab;
          });

          setBaseLstTab(() => {
            const newItems =
              resultModuleDetail?.listSubmodule?.map(
                (item) => item.nameCollection
              ) || [];

            const updatedLstTab = ["Cabinet", ...newItems];

            return updatedLstTab;
          });
        }
      }

      const filteredGroup = data?.filter(
        (item) => item?._id === mainModule?.groupId
      );
      if (filteredGroup !== undefined) {
        if (mainModule?.groupId && mainModule?.groupId !== selectGroup) {
          setSelectGroup(mainModule.groupId);

          const filteredListMaterials = await getListMaterial(
            mainModule.module._id,
            trademark?.value
          );
          setListMaterials(filteredListMaterials);
        }
      }
    };

    fetchModuleDetail();
  }, [mainModule?.module, data]);

  useEffect(() => {
    const fetchModuleDetail = async () => {
      if (mainModule?.material?._id) {
        // const resultMaterial = await getListTexture(
        //   mainModule?.material?._id,
        //   trademark?.value
        // );
        // if (mainModule?.material?.name === "Sơn 2K") {
        //   setIsSon2k(true);
        // }
        // setListTexture(resultMaterial);
        const filteredListTextures = listMaterials?.filter(
          (item) => item._id === mainModule?.material?._id
        );
        if (mainModule?.material?.customColor === true) {
          setIsSon2k(true);
        }

        if (filteredListTextures !== undefined) {
          setListTexture(filteredListTextures[0]?.listTexture);
        }
      }
    };

    fetchModuleDetail();
  }, [mainModule?.material, data]);

  const handleWheelScroll = (e, curRef) => {
    const container = curRef.current;
    if (e.deltaY > 0) {
      container.scrollLeft += e.deltaY / 5;
    } else {
      container.scrollLeft -= Math.abs(e.deltaY / 5);
    }
  };

  const determinePrice = async (groupId, material, measure) => {
    console.log(material);

    try {
      let result = { price: null, unitPrice: null };
      const trademarkId = trademark.value;
      let unitPrice = { formulaPrice: null, priceValue: null };
      unitPrice = {
        formulaPrice: material.formulaPrice,
        priceValue: material.priceValue,
        priceUser: material.priceUser,
      };

      if (unitPrice) {
        const price = calculatePrice(
          unitPrice.formulaPrice,
          measure.w,
          measure.h,
          measure.d,
          unitPrice.priceValue
        );

        result = { price: price, unitPrice: unitPrice };
        return result;
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleHover = (event, texture) => {
    const x = event.clientX;
    const y = event.clientY;
    const colorZoom = document.getElementById("colorZoom");

    colorZoom.style.display = "block";
    colorZoom.style.backgroundImage = `url(${process.env.REACT_APP_URL}uploads/images/icons/${texture})`;
    colorZoom.style.left = `${x - 70}px`;
    colorZoom.style.top = `${y - 230}px`;
  };

  const handleLeave = () => {
    clearTimeout(timeoutRef.current);
    const colorZoom = document.getElementById("colorZoom");
    colorZoom.style.display = "none";
  };

  const renderMaterialItem = (material, imgUrl, checked) => {
    return (
      <div
        id={material._id}
        key={material._id}
        className={checked ? "material-item active" : "material-item"}
        style={{
          "--url": `url(${process.env.REACT_APP_URL}uploads/images/icons/${imgUrl})`,
        }}
        title={material.name}
      >
        <p>{material.name}</p>

        <div className="input-box">
          <input
            disabled={isLoading}
            name="cabinet-material"
            type="radio"
            value={imgUrl}
            checked={checked}
            onChange={async () => {
              setCheckReload(false);

              if (
                mainModule?.module?.glbUrl &&
                mainModule?.module?.glbUrl !== null
              ) {
                // setMainModule({
                //   ...mainModule,
                //   material: {
                //     _id: material._id,
                //     name: material.name,
                //     imgUrl: imgUrl,
                //     metalness: material.metalness,
                //   },
                //   texture: {
                //     _id: null,
                //     name: null,
                //     iconUrl: null,
                //     imgUrl: null,
                //   },
                // });

                let modulePrice;
                let measureWidth;
                let measureHeight;
                let measureDepth;

                if (mainModule?.module?.type !== TypeModule.SCALE_MODULE) {
                  if (typeof mainModule.measure.w === "number") {
                    measureWidth = mainModule.measure.w;
                  } else {
                    measureWidth = calculateMeasure(
                      mainModule.measure.w,
                      0,
                      0,
                      0,
                      mainModule.scale,
                      mainModule.indexDesign
                    );
                  }
                  if (typeof mainModule.measure.h === "number") {
                    measureHeight = mainModule.measure.h;
                  } else {
                    measureHeight = calculateMeasure(
                      mainModule.measure.h,
                      0,
                      wallHeight,
                      0,
                      mainModule.scale,
                      mainModule.indexDesign
                    );
                  }

                  measureDepth = mainModule.measure.d;
                } else {
                  measureWidth = mainModule.measure;
                  measureHeight = 5;
                  measureDepth = 600;

                  if (
                    kitchen[currentStep]?.groupPuzzle &&
                    kitchen[currentStep]?.groupPuzzle[0]?.forY === null
                  ) {
                    display.scene.traverse((object) => {
                      if (object.name === "MATBEP") {
                        handleDeleteTexture(object, 0, 1);
                      }
                    });
                  }
                }
                const glbObject = display.scene.getObjectByProperty(
                  "uuid",
                  mainModule?.gltf?.uuid
                );
                const mainObject = glbObject.getObjectByName("MAIN");
                handleDeleteTexture(mainObject, 0, 1);

                let measure = {
                  w: measureWidth,
                  h: measureHeight,
                  d: measureDepth,
                };
                modulePrice = await determinePrice(
                  mainModule.groupId,
                  material,
                  measure
                );
                if (mainModule?.module?.type !== TypeModule.SCALE_MODULE) {
                  console.log(material);
                  setRecommended({
                    ...recommended,
                    material: {
                      _id: material._id,
                      name: material.name,
                      formulaPrice: material?.formulaPrice,
                      priceValue: material?.priceValue,
                      priceUser: material?.priceUser,
                      imgUrl: imgUrl,
                      metalness: material?.mvr?.metalness,
                      roughness: material?.mvr?.roughness,
                    },
                    texture: {
                      _id: null,
                      name: null,
                      iconUrl: null,
                      imgUrl: null,
                    },
                  });
                  localStorage.setItem(
                    "recommendedMain",
                    JSON.stringify({
                      ...recommended,
                      material: {
                        _id: material._id,
                        name: material.name,
                        imgUrl: imgUrl,
                        metalness: material?.mvr?.metalness,
                        roughness: material?.mvr?.roughness,
                      },
                      texture: {
                        _id: null,
                        name: null,
                        iconUrl: null,
                        imgUrl: null,
                      },
                    })
                  );
                }

                setMainModule({
                  ...mainModule,
                  material: {
                    _id: material._id,
                    name: material.name,
                    formulaPrice: material?.formulaPrice,
                    priceValue: material?.priceValue,
                    priceUser: material?.priceUser,
                    customColor: material.customColor,
                    imgUrl: imgUrl,
                    metalness: material?.mvr?.metalness,
                    roughness: material?.mvr?.roughness,
                  },
                  texture: {
                    _id: null,
                    name: null,
                    iconUrl: null,
                    imgUrl: null,
                  },
                  price: modulePrice?.price,
                  unitPrice: modulePrice?.unitPrice,
                });
              } else {
                toast.error("Bạn cần chọn module trước khi chọn vật liệu.");
              }
            }}
            onClick={() => {
              if (
                mainModule?.material?.imgUrl === imgUrl &&
                mainModule?.module?.glbUrl
              ) {
                const glbObject = display.scene.getObjectByProperty(
                  "uuid",
                  mainModule?.gltf?.uuid
                );
                const mainObject = glbObject.getObjectByName("MAIN");
                handleDeleteTexture(mainObject, 0, 1);

                if (
                  kitchen[currentStep]?.groupPuzzle &&
                  kitchen[currentStep]?.groupPuzzle[0]?.forY === null
                ) {
                  display.scene.traverse((object) => {
                    if (object.name === "MATBEP") {
                      handleDeleteTexture(object, 0, 1);
                    }
                  });
                }

                setMainModule({
                  ...mainModule,
                  material: {
                    _id: null,
                    name: null,
                    customColor: null,
                    imgUrl: null,
                    formulaPrice: null,
                    priceValue: null,
                    priceUser: null,
                    // metalness: 0,
                    // roughness : 1,
                  },
                  texture: {
                    _id: null,
                    name: null,
                    iconUrl: null,
                    imgUrl: null,
                  },
                  price: null,
                  unitPrice: null,
                });
              }
            }}
          />
        </div>
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
        style={{
          "--url": `url(${process.env.REACT_APP_URL}uploads/images/icons/${iconUrl})`,
        }}
        title={texture.name}
        // onMouseEnter={(e) =>
        //   (timeoutRef.current = setTimeout(() => {
        //     handleHover(e, iconUrl);
        //   }, 800))
        // }
        // onMouseLeave={handleLeave}
      >
        <input
          disabled={isLoading}
          name="cabinet-texture"
          type="radio"
          value={imgUrl}
          checked={checked}
          onChange={() => {
            setCheckReload(false);

            if (
              mainModule?.module?.glbUrl &&
              mainModule?.module?.glbUrl !== null &&
              mainModule?.material?._id
            ) {
              if (mainModule?.module?.type !== TypeModule.SCALE_MODULE) {
                setRecommended({
                  ...recommended,
                  texture: {
                    _id: texture._id,
                    name: texture.name,
                    iconUrl: iconUrl,
                    imgUrl: imgUrl,
                  },
                });
                localStorage.setItem(
                  "recommendedMain",
                  JSON.stringify({
                    ...recommended,
                    texture: {
                      _id: texture._id,
                      name: texture.name,
                      iconUrl: iconUrl,
                      imgUrl: imgUrl,
                    },
                  })
                );
              }

              setMainModule({
                ...mainModule,
                texture: {
                  _id: texture._id,
                  name: texture.name,
                  iconUrl: iconUrl,
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
        />
      </div>
    );
  };

  useEffect(() => {
    const storedImageUrls = localStorage.getItem("imageUrls");
    if (storedImageUrls) {
      setImageUrls(JSON.parse(storedImageUrls));
    }
  }, []);

  const addImageUrl = (url) => {
    let updatedImageUrls = [...imageUrls];

    if (updatedImageUrls.length >= 12) {
      updatedImageUrls.shift();
    }

    updatedImageUrls.push(url);

    setImageUrls(updatedImageUrls);
    localStorage.setItem("imageUrls", JSON.stringify(updatedImageUrls));
  };

  const handleBgColorChange = (event) => {
    setBgColor(event.target.value);
    addImageUrl(event.target.value);
    setRecommended({
      ...recommended,
      texture: {
        _id: event.target.value,
        name: event.target.value,
        iconUrl: event.target.value,
        imgUrl: event.target.value,
      },
    });
    localStorage.setItem(
      "recommendedMain",
      JSON.stringify({
        ...recommended,
        texture: {
          _id: event.target.value,
          name: event.target.value,
          iconUrl: event.target.value,
          imgUrl: event.target.value,
        },
      })
    );
    setMainModule({
      ...mainModule,
      texture: {
        _id: event.target.value,
        name: event.target.value,
        iconUrl: event.target.value,
        imgUrl: event.target.value,
      },
    });
  };

  const handleImageClick = (url) => {
    setBgColor(url);
    setRecommended({
      ...recommended,
      texture: {
        _id: url,
        name: url,
        iconUrl: url,
        imgUrl: url,
      },
    });
    localStorage.setItem(
      "recommendedMain",
      JSON.stringify({
        ...recommended,
        texture: {
          _id: url,
          name: url,
          iconUrl: url,
          imgUrl: url,
        },
      })
    );
    setMainModule({
      ...mainModule,
      texture: {
        _id: url,
        name: url,
        iconUrl: url,
        imgUrl: url,
      },
    });
  };

  const showSon2k = () => {
    return (
      <div className="colorPicker-son2k">
        <input
          type="color"
          className="colorPicker-2k"
          id="colorPicker"
          value={bgColor}
          onChange={(e) => {
            handleBgColorChange(e);
          }}
        />
        <div className="imageList">
          {imageUrls.map((url, index) => (
            <div
              className="color-box"
              style={{
                backgroundColor: url,
                width: "15px",
                height: "15px",
                marginRight: "5px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid black",
              }}
              onClick={() => handleImageClick(url)}
            ></div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="mainOption">
      <section className="module-container">
        <p className="title-control">Kiểu dáng</p>

        <div className="module-option">
          {data?.map(
            (group, index) =>
              fetchGroupItem(group, currentIndex, kitchen, currentStep) && (
                <Accordion
                  key={group._id}
                  defaultActiveKey={index}
                  onSelect={() => handleAccordionClick(index, group._id)}
                >
                  {/* <Accordion.Item eventKey={index}> */}
                  <Accordion.Item>
                    <Accordion.Header>{group.name}</Accordion.Header>
                    <Accordion.Body>
                      {isFetching && <Loading />}
                      <div className="module-option">
                        {fetchGroupItem(
                          group,
                          currentIndex,
                          kitchen,
                          currentStep
                        )
                          ?.items.sort((a, b) => a.indexDesign - b.indexDesign)
                          .map((cabinet) => {
                            const glb = cabinet.glbUrl;
                            const checked =
                              kitchen[currentStep]?.lstModule[currentIndex]
                                ?.mainModule?.module?._id === cabinet._id;

                            return (
                              <div
                                key={cabinet._id}
                                id={cabinet._id}
                                className="col-6 col-md-4 col-xl-3"
                                style={{
                                  "--url": `url(${process.env.REACT_APP_URL}uploads/images/icons/${cabinet.imgUrl})`,
                                  padding: "4px",
                                }}
                              >
                                <div
                                  className={
                                    checked
                                      ? "module-item active"
                                      : "module-item"
                                  }
                                  title={cabinet.name}
                                >
                                  <input
                                    disabled={isLoading}
                                    name="cabinet"
                                    type="radio"
                                    value={glb}
                                    checked={checked}
                                    onChange={async () => {
                                      setCheckReload(false);

                                      if (!trademark) {
                                        toast.error(
                                          "Bạn cần chọn nhà cung cấp trước khi thiết kế."
                                        );
                                        trademarkRef.current.focus();
                                      } else {
                                        setIsLoading(true);

                                        if (
                                          !checkModuleAvailability(
                                            kitchen,
                                            currentStep,
                                            currentIndex,
                                            cabinet,
                                            group
                                          )
                                        ) {
                                          toast.error(
                                            `Không thể thêm module ${cabinet.name} vào vị trí này vì không phù hợp kích thước`
                                          );
                                          setIsLoading(false);
                                          return;
                                        }

                                        if (
                                          !checkImpactModule(
                                            kitchen,
                                            currentStep,
                                            currentIndex,
                                            cabinet
                                          )
                                        ) {
                                          toast.error(
                                            `Không thể thêm module ${cabinet.name} vào vị trí này`
                                          );
                                          setIsLoading(false);
                                          return;
                                        }

                                        if (
                                          cabinet.indexDesign ===
                                          mainModule?.module?.indexDesign
                                        ) {
                                          //cung dvtk

                                          checkLogicLoad(
                                            cabinet,
                                            group,
                                            glb,
                                            trademark,
                                            index
                                          );
                                        } else {
                                          //khac dvtk
                                          if (
                                            kitchen[currentStep]
                                              ?.listModuleLover?.length > 0
                                          ) {
                                            //step phu thuoc
                                            if (
                                              cabinet.type !==
                                              TypeModule.LOVER_MODULE
                                            ) {
                                              //khac tu doi
                                              if (mainModule?.module === null) {
                                                //main null

                                                if (
                                                  kitchen[currentStep]
                                                    ?.totalIndexDesign +
                                                    cabinet.indexDesign -
                                                    kitchen[currentStep]
                                                      .lstModule[currentIndex]
                                                      .mainModule.indexDesign <=
                                                  kitchen[currentStep]
                                                    ?.designUnit
                                                ) {
                                                  //KT tu doi toi vi tri hien tai
                                                  if (
                                                    checkValidLoverToCurrent(
                                                      kitchen,
                                                      currentStep,
                                                      currentIndex,
                                                      cabinet
                                                    )
                                                  ) {
                                                    //khong va cham tu doi
                                                    checkLogicLoad(
                                                      cabinet,
                                                      group,
                                                      glb,
                                                      trademark,
                                                      index
                                                    );
                                                  } else {
                                                    toast.error(
                                                      "Bạn còn phải thiết kế tủ đôi nữa chứ!!!"
                                                    );
                                                  }
                                                } else {
                                                  toast.error(
                                                    "Module bạn chọn không phù hợp với số lượng đơn vị thiết kế còn lại!!!"
                                                  );
                                                }
                                              } else {
                                                //main khac null

                                                //KT co ton tai module doi phia sau chua
                                                if (
                                                  checkLoverExistBehind(
                                                    kitchen,
                                                    currentStep,
                                                    currentIndex
                                                  )
                                                ) {
                                                  //co tu doi phia sau
                                                  if (
                                                    cabinet.indexDesign >
                                                      mainModule?.module
                                                        ?.indexDesign &&
                                                    kitchen[currentStep]
                                                      .lstModule[
                                                      currentIndex + 1
                                                    ]?.mainModule?.module
                                                      ?.type ===
                                                      TypeModule.LOVER_MODULE
                                                  ) {
                                                    toast.error(
                                                      "Bạn còn phải thiết kế tủ đôi nữa chứ!!!"
                                                    );
                                                  } else {
                                                    Swal.fire({
                                                      title:
                                                        "Thay đổi của ban có thể ảnh hưởng tới tủ đôi?",
                                                      text: "Nếu đồng ý thay đổi thì phải xóa đi những module đã thêm ở phía sau",
                                                      showCancelButton: true,
                                                      confirmButtonText: "OK",
                                                      cancelButtonText:
                                                        "Cancel",
                                                    }).then(async (result) => {
                                                      if (result.isConfirmed) {
                                                        removeBehindModule(
                                                          display,
                                                          kitchen,
                                                          currentStep,
                                                          currentIndex
                                                        );

                                                        checkLogicLoad(
                                                          cabinet,
                                                          group,
                                                          glb,
                                                          trademark,
                                                          index
                                                        );
                                                      }
                                                    });
                                                  }
                                                } else {
                                                  //chua co tu doi phia sau
                                                  //KT co va cham tu doi khong (toi module cuoi cung)
                                                  if (
                                                    checkValidLoverToLast(
                                                      kitchen,
                                                      currentStep,
                                                      currentIndex,
                                                      cabinet
                                                    )
                                                  ) {
                                                    //khong va cham tu doi
                                                    if (
                                                      kitchen[currentStep]
                                                        ?.totalIndexDesign +
                                                        cabinet.indexDesign -
                                                        kitchen[currentStep]
                                                          .lstModule[
                                                          currentIndex
                                                        ].mainModule
                                                          .indexDesign <=
                                                      kitchen[currentStep]
                                                        ?.designUnit
                                                    ) {
                                                      //chua full dvtk

                                                      checkLogicLoad(
                                                        cabinet,
                                                        group,
                                                        glb,
                                                        trademark,
                                                        index
                                                      );
                                                    } else if (
                                                      kitchen[currentStep]
                                                        .lstModule[
                                                        currentIndex + 1
                                                      ] &&
                                                      kitchen[currentStep]
                                                        .lstModule[
                                                        currentIndex + 1
                                                      ]?.mainModule !== null
                                                    ) {
                                                      //vuot qua dvtk
                                                      Swal.fire({
                                                        title:
                                                          "Bạn có đồng ý thay đổi thành module này và xóa đi những module thừa ở phía sau?",
                                                        showCancelButton: true,
                                                        confirmButtonText: "OK",
                                                        cancelButtonText:
                                                          "Cancel",
                                                      }).then(
                                                        async (result) => {
                                                          if (
                                                            result.isConfirmed
                                                          ) {
                                                            checkLogicLoad(
                                                              cabinet,
                                                              group,
                                                              glb,
                                                              trademark,
                                                              index
                                                            );
                                                          }
                                                        }
                                                      );
                                                    } else {
                                                      toast.error(
                                                        "Module bạn chọn không phù hợp với số lượng đơn vị thiết kế còn lại!!!"
                                                      );
                                                    }
                                                  } else {
                                                    //va cham voi tu doi
                                                    if (
                                                      kitchen[currentStep]
                                                        .lstModule[
                                                        currentIndex + 1
                                                      ]?.mainModule === null
                                                    ) {
                                                      toast.error(
                                                        "Bạn còn phải thiết kế tủ đôi nữa chứ!!!"
                                                      );
                                                    } else {
                                                      Swal.fire({
                                                        title:
                                                          "Thay đổi của ban có thể ảnh hưởng tới tủ đôi?",
                                                        text: "Nếu đồng ý thay đổi thì phải xóa đi những module đã thêm ở phía sau",
                                                        showCancelButton: true,
                                                        confirmButtonText: "OK",
                                                        cancelButtonText:
                                                          "Cancel",
                                                      }).then(
                                                        async (result) => {
                                                          if (
                                                            result.isConfirmed
                                                          ) {
                                                            removeBehindModule(
                                                              display,
                                                              kitchen,
                                                              currentStep,
                                                              currentIndex
                                                            );

                                                            checkLogicLoad(
                                                              cabinet,
                                                              group,
                                                              glb,
                                                              trademark,
                                                              index
                                                            );
                                                          }
                                                        }
                                                      );
                                                    }
                                                  }
                                                }
                                              }
                                            } else if (
                                              cabinet.type ===
                                              TypeModule.LOVER_MODULE
                                            ) {
                                              //tu doi
                                              if (
                                                cabinet.indexDesign <= DUBlank
                                              ) {
                                                //du cho trong cho lover
                                                if (
                                                  kitchen[currentStep]
                                                    .lstModule[currentIndex + 1]
                                                    ?.mainModule === null
                                                ) {
                                                  checkLogicLoad(
                                                    cabinet,
                                                    group,
                                                    glb,
                                                    trademark,
                                                    index
                                                  );
                                                } else {
                                                  Swal.fire({
                                                    title:
                                                      "Thay đổi của ban có thể ảnh hưởng tới tủ đôi?",
                                                    text: "Nếu đồng ý thay đổi thì phải xóa đi những module đã thêm ở phía sau",
                                                    showCancelButton: true,
                                                    confirmButtonText: "OK",
                                                    cancelButtonText: "Cancel",
                                                  }).then(async (result) => {
                                                    if (result.isConfirmed) {
                                                      removeBehindModule(
                                                        display,
                                                        kitchen,
                                                        currentStep,
                                                        currentIndex
                                                      );

                                                      checkLogicLoad(
                                                        cabinet,
                                                        group,
                                                        glb,
                                                        trademark,
                                                        index
                                                      );
                                                    }
                                                  });
                                                }
                                              } else {
                                                toast.error(
                                                  "Tủ đôi sẽ bị sai!!!"
                                                );
                                              }
                                            }
                                          } else {
                                            //step thuong
                                            if (
                                              kitchen[currentStep]
                                                ?.totalIndexDesign +
                                                cabinet.indexDesign -
                                                kitchen[currentStep].lstModule[
                                                  currentIndex
                                                ].mainModule.indexDesign <=
                                              kitchen[currentStep]?.designUnit
                                            ) {
                                              //chua full dvtk

                                              checkLogicLoad(
                                                cabinet,
                                                group,
                                                glb,
                                                trademark,
                                                index
                                              );
                                            } else if (
                                              kitchen[currentStep].lstModule[
                                                currentIndex + 1
                                              ] &&
                                              kitchen[currentStep].lstModule[
                                                currentIndex + 1
                                              ]?.mainModule !== null
                                            ) {
                                              //vuot qua dvtk
                                              Swal.fire({
                                                title:
                                                  "Bạn có đồng ý thay đổi thành module này và xóa đi những module thừa ở phía sau?",
                                                showCancelButton: true,
                                                confirmButtonText: "OK",
                                                cancelButtonText: "Cancel",
                                              }).then(async (result) => {
                                                if (result.isConfirmed) {
                                                  checkLogicLoad(
                                                    cabinet,
                                                    group,
                                                    glb,
                                                    trademark,
                                                    index
                                                  );
                                                }
                                              });
                                            } else {
                                              toast.error(
                                                "Module bạn chọn không phù hợp với số lượng đơn vị thiết kế còn lại!!!"
                                              );
                                            }
                                          }
                                        }
                                      }

                                      setIsLoading(false);
                                      // }
                                    }}
                                    onClick={() => {
                                      if (mainModule?.module?.glbUrl === glb) {
                                        toast.error(
                                          "Bạn không thể để trống module"
                                        );
                                      }
                                    }}
                                  />
                                </div>

                                <div className="info">
                                  <span className="info__DU">
                                    {cabinet.indexDesign > 1
                                      ? `${
                                          Number(group.actualSize.width) ||
                                          `${300 * cabinet.indexDesign} - ${
                                            500 * cabinet.indexDesign
                                          }`
                                        }mm`
                                      : "300 - 500mm"}
                                  </span>

                                  <span className="info__name">
                                    {cabinet.name}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
              )
          )}
        </div>
      </section>

      <div id="colorZoom"></div>

      <section className="materialTexture-container">
        <p className="title-control">Vật liệu và màu sắc</p>
        <div
          className="material-option"
          ref={containerRef1}
          onWheel={(e) => handleWheelScroll(e, containerRef1)}
        >
          {listMaterials &&
          mainModule?.module !== null &&
          mainModule?.module?._id !== null &&
          mainModule?.module?.listMaterial !== null
            ? listMaterials.map((material) => {
                const checked = mainModule?.material?._id === material._id;

                return renderMaterialItem(material, material._id, checked);
              })
            : lstMaterial?.map((material) => {
                // const checked = mainModule?.material?._id === material._id;
                const checked = false;

                return renderMaterialItem(material, material._id, checked);
              })}
        </div>

        <div
          className="texture-option"
          ref={containerRef2}
          onWheel={(e) => handleWheelScroll(e, containerRef2)}
        >
          {mainModule?.module !== null &&
          mainModule?.module?._id !== null &&
          mainModule?.material &&
          listTexture?.length > 0
            ? listTexture?.map((texture, id) => {
                const imgUrl = texture.imgUrl;
                const iconUrl = texture.iconUrl;
                const checked = mainModule?.texture?.imgUrl === imgUrl;

                return renderTextureItem(texture, imgUrl, iconUrl, checked, id);
              })
            : isSon2k === true
            ? showSon2k()
            : lstTexture?.map((texture, id) => {
                const imgUrl = texture.imgUrl;
                const iconUrl = texture.iconUrl;
                const checked = false;
                // const checked = mainModule?.texture?.imgUrl === imgUrl;

                return renderTextureItem(texture, imgUrl, iconUrl, checked, id);
              })}
        </div>
      </section>
    </div>
  );
}
