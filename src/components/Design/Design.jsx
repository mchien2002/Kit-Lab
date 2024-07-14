import { usePrevious } from "@uidotdev/usehooks";
import { Tabs, TreeSelect } from "antd";
import Cookies from "js-cookie";
import { Select } from "antd";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { IoEyeOutline } from "react-icons/io5";
import { LuCornerUpLeft, LuCornerUpRight, LuSave } from "react-icons/lu";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { v4 as uuidv4 } from "uuid";
import { AppContext } from "../../App";
import SceneInit from "../../lib/SceneInit";
import { getMaterialAction } from "../../store/actions/material.action";
import { getTextureAction } from "../../store/actions/texture.action";
import { getTrademarksAction } from "../../store/actions/trademarks.action ";
import {
  calculateFormula,
  calculateMeasure,
  calculatePrice,
  calculateTotalIndexDesign,
  changeWardrobeType,
  countCurrentTotalDesign,
  countImpactModulePosition,
  draw,
  myRound,
  drawStep,
  getGLBSize,
  handleChangeTexture,
  handleDeleteTexture,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  isExistModuleWife,
  onlyRemoveModule,
  refresh3D,
  refreshMBVBScale,
  refreshModuleImpact,
  refreshModuleScale,
  reloadGLTFModel,
  scaleRequireModule,
  setCounterTop,
  setTemporaryOpacity,
} from "../../utils/function";
import BoxSize from "../BoxSize/BoxSize";
import Loading from "../Loading/Loading";
import MainOption from "../Option/MainOption.jsx";
import SubOption from "../Option/SubOption";
import ReviewDesign from "../Popup/ReviewDesign.jsx";
import SelectedItem from "../SelectedItem/SelectedItem.jsx";
import Visible from "../Visible/Visible";
import Zoom from "../Zoom/Zoom";
import "./Design.scss";
import callApi from "../../utils/callApi.js";
import { getPriceDetail, getTabDetail } from "../../utils/getData.js";

export const KitchenContext = createContext();

const scale = 1;

const X = 5.099999880382116;
const Y = 3.3000010476221315;
const Z = 5.120000903247968;

let isMouseDown = false;

var display = null;
// const glftLoader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();

const mainNull = {
  indexDesign: 1,
  module: null,
  material: null,
  texture: null,
  price: 0,
};

const subNull = {
  type: "sub",
  module: null,
  material: null,
  texture: null,
  price: 0,
};

const TypeModule = {
  MAIN_MODULE: 0,
  SUBMODULE: 1,
  IMPACT_MODULE: 2,
  SCALE_MODULE: 3,
  REQUIRE_MODULE: 4,
  LOVER_MODULE: 5,
  NULL_MODULE: 6,
};

const gltfProp = [
  "uuid",
  "parent",
  "children",
  "position",
  "scale",
  "useData",
  "size",
];
let listStepDetail = [];

export default function Design() {
  const appContext = useContext(AppContext);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [defaultZoom, setDefaultZoom] = useState(35);
  const [tabOption, setTabOption] = useState("0");

  const [currentStep, setCurrentStep] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const prevCurrentStep = usePrevious(currentStep);
  const prevCurrentIndex = usePrevious(currentIndex);

  const [currentDU, setCurrentDU] = useState(0);
  // const [isPB, setIsPB] = useState(localStorage.getItem("isPB") || false);
  const [isPB, setIsPB] = useState(false);

  const [dependentStep, setDependentStep] = useState(null);
  const [typeModuleId, setTypeModuleId] = useState(null);
  const [typePrice, setTypePrice] = useState(null);

  const [recommended, setRecommended] = useState({
    moduleType: null,
    material: null,
    texture: null,
  });
  const [subRecommended, setSubRecommended] = useState({
    moduleType: null,
    material: null,
    texture: null,
  });

  const [executingStep, setExecutingStep] = useState(0);
  const [executingIndex, setExecutingIndex] = useState(0);
  const [executingDU, setExecutingDU] = useState(0);
  const [executingTotalDU, setExecutingTotalDU] = useState(0);
  const [executingModule, setExecutingModule] = useState();

  const [checkChange, setCheckChange] = useState(false);

  const [modelClicked, setModelClicked] = useState(null);

  const [mainSelected, setMainSelected] = useState(null);
  const [subSelected, setSubSelected] = useState(null);

  const [wallHeight, setWallHeight] = useState(null);

  const [tabSelected, setTabSelected] = useState({ step: null, index: null });
  const [checkReload, setCheckReload] = useState(true);
  const [refreshTotal, setRefreshTotal] = useState(false);

  let [indexSub, setIndexSub] = useState(null);

  const [trademark, setTrademark] = useState();

  const [mainModule, setMainModule] = useState(mainNull);
  const prevMainModule = usePrevious(mainModule);
  const [subModule, setSubModule] = useState(subNull);
  const prevSubModule = usePrevious(subModule);
  const [lstSubModule, setLstSubModule] = useState(null);

  const [lstSub, setLstSub] = useState(null);
  const [baseLstSub, setBaseLstSub] = useState(null);
  const [lstTab, setLstTab] = useState(["Cabinet"]);
  const [baseLstTab, setBaseLstTab] = useState(["Cabinet"]);
  const [infoTab, setInfoTab] = useState();
  const [baseInfoTab, setBaseInfoTab] = useState(null);

  const [subAPI, setSubAPI] = useState(null);

  const [stepDetail, setStepDetail] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

  const [showBoxSize, setShowBoxSize] = useState(false);
  const [showVisible, setShowVisible] = useState(false);
  const [showNextStep, setShowNextStep] = useState(false);
  const [showPopupSave, setShowPopupSave] = useState(false);

  const [bgColor, setBgColor] = useState("#afb6ba");

  const [textureMB, setTextureMB] = useState();
  const [textureVB, setTextureVB] = useState();
  let [kitchen, setKitchen] = useState([]);

  const trademarkRef = useRef();
  const canvasRef = useRef(null);

  const { lstMaterial } = useSelector((state) => state.material);
  const { lstTexture } = useSelector((state) => state.texture);
  const { trademarks } = useSelector((state) => state.trademarks);

  const [canInside, setCanInside] = useState(appContext.canInside);

  const [trenTrai, setTrenTrai] = useState(0);
  const [trenPhai, setTrenPhai] = useState(0);
  const [duoiTrai, setDuoiTrai] = useState(0);
  const [duoiPhai, setDuoiPhai] = useState(0);

  const location = useLocation();
  const { type } = location.state || {};
  const { formData } = location.state || {};
  const { productData } = location.state || {};
  const { productChangeData } = location.state || {};
  const { newProduct } = location.state || {};
  let productInfoChange = productChangeData;
  let [productInfo, setProductInfo] = useState(productData);
  const [fromDataNew, setFromDataNew] = useState(0);
  let isSizeChange = false;

  const typeOption = [
    {
      value: false,
      title: "Tủ áo lọt lòng",
      children: [],
    },
    {
      value: true,
      title: "Tủ áo phủ bì",
      children: [],
    },
  ];

  useEffect(() => {
    let newKitchen = [...kitchen];

    if (newKitchen[currentStep]?.lstModule && infoTab) {
      newKitchen[currentStep].lstModule[currentIndex].tabs = infoTab;

      setKitchen(newKitchen);
    }
  }, [infoTab]);

  useEffect(() => {
    if (productInfoChange) {
      for (let step in productInfoChange.listStep) {
        const stepOld = productInfo.listStep.find(
          (item) => item._id === productInfoChange.listStep[step]._id
        );
        if (
          stepOld.designUnit !== productInfoChange.listStep[step].designUnit
        ) {
          const confirmReload = window.confirm(
            "Bạn có muốn xóa tất cả và làm lại không?"
          );
          if (confirmReload === true) {
            isSizeChange = true;
            break;
          } else {
            localStorage.removeItem("productInfoChange");
          }
        }
      }
      if (isSizeChange === true) {
        localStorage.removeItem("productInfo");
        localStorage.setItem("productInfo", newProduct);
        localStorage.removeItem("productInfoChange");
        localStorage.removeItem("executing");
        setProductInfo(productInfoChange);
        window.location.reload();
      } else {
        localStorage.removeItem("productInfo");
        localStorage.setItem("productInfo", newProduct);
        recalculateModules(productInfoChange);
        localStorage.removeItem("productInfoChange");
      }
    }
  }, [display, productInfoChange]);

  const recalculateModules = (productInfoChange) => {
    let newKitchen = [...kitchen];
    let measureCount = 0;
    newKitchen.forEach(async (item, index) => {
      if (item.measure !== null) {
        let checkTD = false;
        item.lstModule.forEach((module) => {
          if (module.mainModule?.module?.type === TypeModule.LOVER_MODULE) {
            checkTD = true;
          }
        });

        if (checkTD) {
          item.scale = item.scaleOriginal;
          item.scaleOriginal = productInfoChange.listStep[index].scale;
        } else {
          item.scale = productInfoChange.listStep[index].scale;
          item.scaleOriginal = productInfoChange.listStep[index].scale;
        }
        item.measure = productInfoChange.listStep[index].actualSize.width;
        let widthReset;
        if (
          productInfoChange?.typeProduct === 5 ||
          productInfoChange?.typeProduct === 6
        ) {
          if (item.baseScale === true) {
            widthReset =
              item.designUnitOriginal * 425 * item.scaleOriginal + 600;
          } else {
            widthReset = item.designUnit * 425 * item.scaleOriginal + 600;
          }
        } else if (
          productInfoChange?.typeProduct === 3 ||
          productInfoChange?.typeProduct === 4
        ) {
          widthReset = item.designUnitOriginal * 425 * item.scaleOriginal + 600;
        }
        // console.log(widthReset);
        let DU = item.designUnit;
        item.lstModule.forEach((module) => {
          if (module.mainModule?.module?.type === TypeModule.LOVER_MODULE) {
            widthReset -= module.mainModule?.measure?.w;
            DU -= module.mainModule?.module?.indexDesign;
          }
        });
        // console.log(widthReset);
        item.lstModule.forEach(async (module) => {
          // const newScale = countScale(widthReset, DU);
          const newScale = calculateFormula(
            item.formulaScale,
            item.measure,
            0,
            0,
            DU
          );

          if (module.mainModule?.module?.type !== TypeModule.LOVER_MODULE) {
            if (module.mainModule?.measure) {
              module.mainModule.measure.w =
                425 * newScale * module.mainModule.indexDesign +
                (module.mainModule.widthExtra || 0);
              // console.log(module.mainModule.unitPrice);
              if (module.mainModule.unitPrice !== undefined) {
                module.mainModule.price = calculatePrice(
                  module.mainModule.unitPrice?.formulaPrice,
                  module.mainModule.measure.w,
                  module.mainModule.measure.h,
                  module.mainModule.measure.d,
                  module.mainModule.unitPrice?.priceValue
                );
              }
            }
          }
        });

        if (
          productInfoChange?.typeProduct === 5 ||
          productInfoChange?.typeProduct === 6
        ) {
          if (item.name === "Bếp dưới") {
            item.lstModule.forEach(async (module) => {
              if (module.mainModule !== null) {
                if (
                  module.mainModule?.module?.type !== TypeModule.IMPACT_MODULE
                ) {
                  measureCount += module?.mainModule?.measure?.w;
                  // console.log(module.mainModule.measure);
                  // console.log(module.mainModule.measure.w);
                }
              }
            });
          }
        } else if (
          productInfoChange?.typeProduct === 3 ||
          productInfoChange?.typeProduct === 4
        ) {
          if (item.name === "Bếp dưới phải") {
            item.lstModule.forEach(async (module) => {
              if (module.mainModule !== null) {
                if (
                  module.mainModule?.module?.type !== TypeModule.IMPACT_MODULE
                ) {
                  measureCount += module?.mainModule?.measure?.w;
                }
              }
            });
          }
          if (item.name === "Bếp dưới trái") {
            item.lstModule.forEach(async (module) => {
              if (module.mainModule !== null) {
                if (
                  module.mainModule?.module?.type !== TypeModule.IMPACT_MODULE
                ) {
                  measureCount += module?.mainModule?.measure?.w;
                }
              }
            });
          }
        }
      } else {
        if (item.lstModule.length !== undefined) {
          if (
            productInfoChange?.typeProduct === 5 ||
            productInfoChange?.typeProduct === 6
          ) {
            if (item.lstModule[0].mainModule !== null) {
              item.lstModule[0].mainModule.measure = measureCount;
            }
            // item.lstModule.forEach(async (module) => {

            // });
            // item.lstModule[0].mainModule.measure =
            //   productInfoChange.listStep[0].actualSize.width;
          } else if (
            productInfoChange?.typeProduct === 3 ||
            productInfoChange?.typeProduct === 4
          ) {
            if (item.lstModule[0].mainModule !== null) {
              if (item.name === "Mặt bếp") {
                item.lstModule[0].mainModule.measure = measureCount;
              } else {
                item.lstModule[0].mainModule.measure = measureCount + 600;
              }
            }
          }
        }

        let measureTemp = {
          w: item.lstModule[0].mainModule?.measure,
          h: 5,
          d: 600,
        };
        //console.log(item.lstModule[0].mainModule.unitPrice);
        if (item.lstModule[0].mainModule?.unitPrice !== undefined) {
          item.lstModule[0].mainModule.price = calculatePrice(
            item.lstModule[0].mainModule?.unitPrice?.formulaPrice,
            measureTemp.w,
            measureTemp.h,
            measureTemp.d,
            item.lstModule[0].mainModule?.unitPrice?.priceValue
          );
        }
      }
    });
    setKitchen(newKitchen);
    if (display) {
      kitchen.forEach((step, index) => {
        refresh3D(
          canInside,
          isPB,
          display,
          index,
          productInfo,
          kitchen,
          trademark?.value
        );
        refreshModuleImpact(display, kitchen, index);
        const stepId = kitchen[currentStep].stepId;
        refreshMBVBScale(
          display,
          index,
          productInfo,
          kitchen,
          stepId,
          textureVB
        );
      });
    }
  };

  const handleBgColorChange = (event) => {
    setBgColor(event.target.value);
  };

  const handleChangeType = (value) => {
    setIsPB(value);

    changeWardrobeType(display, kitchen, canInside, value);
  };

  const handleChangeTrademark = (lable, option) => {
    const value = {
      value: option.key,
      pValue: option.trademarkBrandId,
      label: option.children,
    };

    if (trademark) {
      if (trademark.value !== option.key) {
        Swal.fire({
          title:
            "Nếu thay đổi nhà cung cấp thì sẽ bỏ hết phần vật liệu, màu sắc bạn đã chọn và chỉ giữ lại module?",
          showCancelButton: true,
          confirmButtonText: "OK",
          cancelButtonText: "Cancel",
        }).then((result) => {
          if (result.isConfirmed) {
            setTrademark(value);

            let newKitchen = [...kitchen];

            newKitchen.map((step) => {
              step.lstModule.map((item) => {
                if (item.mainModule !== null) {
                  item.mainModule.material = null;
                  item.mainModule.texture = null;
                  item.mainModule.price = null;

                  handleDeleteTexture(item.mainModule.gltf, 0, 1);
                }

                if (item.lstSubModule.length > 0) {
                  item.lstSubModule.map((sub) => {
                    sub.material = null;
                    sub.texture = null;
                    sub.price = null;

                    handleDeleteTexture(sub.gltf, 0, 1);
                  });
                }
              });
            });

            setKitchen(newKitchen);
          }
        });
      }
    } else {
      setTrademark(value);
    }
  };

  const handleChangeTab = async (key) => {
    const tabDetail = await getTabDetail(
      infoTab[key]._id,
      infoTab[key].pId,
      trademark?.value
    );
    console.log(tabDetail);
    setSubAPI(tabDetail);

    if (!isLoading) {
      setTabOption(key);
      if (parseInt(key) !== 0) {
        setIndexSub(key - 1);

        if (tabSelected.step !== null && lstSubModule?.length > 0) {
          setSubModule(lstSubModule[key - 1]);
          setSubSelected(lstSubModule[key - 1]);
        } else if (
          kitchen[currentStep].lstModule[currentIndex].lstSubModule.length !==
            0 &&
          kitchen[currentStep].lstModule[currentIndex].lstSubModule[key - 1]
        ) {
          setSubModule(
            kitchen[currentStep].lstModule[currentIndex].lstSubModule[key - 1]
          );
          setSubSelected(
            kitchen[currentStep].lstModule[currentIndex].lstSubModule[key - 1]
          );
        } else {
          setSubModule(subNull);
          setSubSelected(subNull);
        }
      }
    }
  };

  const handleZoomIn = () => {
    display.zoomIn();
  };

  const handleZoomOut = () => {
    display.zoomOut();
  };

  const handleSetNullModule = () => {
    // setExecutingModule(null);
  };

  const resetBaseScale = () => {
    const listStepReset = kitchen.filter((item) => item.baseScale === true);
    listStepReset.forEach((step) => {
      // let widthReset = step.measure;
      let widthReset = step.baseMeasure;
      let DU = step.designUnit;

      step.lstModule.forEach((module) => {
        if (
          module.mainModule?.module !== null &&
          module.mainModule?.module?.type === TypeModule.LOVER_MODULE
        ) {
          widthReset -= module.mainModule?.measure?.w;
          DU -= module.mainModule?.module?.indexDesign;
        }
      });

      const newScale = calculateFormula(
        step.formulaScale,
        widthReset,
        0,
        0,
        DU
      );
      step.scale = newScale;

      step.lstModule.forEach(async (module) => {
        if (
          module.mainModule !== null &&
          module.mainModule?.module?.type !== TypeModule.SCALE_MODULE &&
          module.mainModule?.module?.type !== TypeModule.LOVER_MODULE
        ) {
          const newMeasure = calculateMeasure(
            module.mainModule.actualSize.width,
            0,
            0,
            0,
            newScale,
            module.mainModule.indexDesign
          );

          module.mainModule.measure.w = newMeasure;
        }

        if (
          module.mainModule?.material !== null &&
          module.mainModule?.priceId
        ) {
          let newPrice;

          if (module.mainModule?.measure) {
            newPrice = calculatePrice(
              module.mainModule.unitPrice?.formulaPrice,
              module.mainModule.measure.w,
              module.mainModule.measure.h,
              module.mainModule.measure.d,
              module.mainModule.unitPrice?.priceValue
            );

            module.mainModule.price = newPrice;
          }
        }

        if (module.lstSubModule && module.lstSubModule.length > 0) {
          module.lstSubModule.forEach(async (sub) => {
            if (sub && sub.material && sub.material !== null) {
              let newMeasure = module.mainModule.measure;
              if (
                module.mainModule?.module?.type === TypeModule.IMPACT_MODULE
              ) {
                let newPrice;
                if (module.mainModule.measure) {
                  newPrice = calculatePrice(
                    sub.unitPrice?.formulaPrice,
                    module.mainModule.measure.w,
                    module.mainModule.measure.h,
                    module.mainModule.measure.d,
                    sub.unitPrice?.priceValue
                  );
                }

                sub.price = newPrice;
                sub.measure.h = module.mainModule.measure.h;
              } else if (
                module.mainModule !== null &&
                module.mainModule?.module?.type !== TypeModule.LOVER_MODULE
              ) {
                let newPrice;

                if (module.mainModule.measure && sub.unitPrice?.formulaPrice) {
                  newPrice = calculatePrice(
                    sub.unitPrice?.formulaPrice,
                    module.mainModule.measure.w,
                    module.mainModule.measure.h,
                    module.mainModule.measure.d,
                    sub.unitPrice?.priceValue
                  );
                }

                sub.price = newPrice;
                sub.measure = newMeasure;
              }
            }
          });
        }
      });

      const lstStepDependent = kitchen.filter(
        (item) => item?.position?.rotation === step.position.rotation
      );

      lstStepDependent.forEach((item) => {
        item.scale = newScale;

        item.lstModule.forEach(async (module) => {
          if (
            module.mainModule !== null &&
            module.mainModule?.module?.type !== TypeModule.SCALE_MODULE &&
            module.mainModule?.module?.type !== TypeModule.LOVER_MODULE
          ) {
            const newMeasure = calculateMeasure(
              module.mainModule.actualSize.width,
              0,
              0,
              0,
              newScale,
              module.mainModule.indexDesign
            );

            module.mainModule.measure.w = newMeasure;
          }

          if (
            module.mainModule?.material !== null &&
            module.mainModule?.priceId
          ) {
            let newPrice;

            if (module.mainModule?.measure) {
              newPrice = calculatePrice(
                module.mainModule.unitPrice?.formulaPrice,
                module.mainModule.measure.w,
                module.mainModule.measure.h,
                module.mainModule.measure.d,
                module.mainModule.unitPrice?.priceValue
              );

              module.mainModule.price = newPrice;
            }
          }

          if (module.lstSubModule?.length > 0) {
            module.lstSubModule.forEach(async (sub) => {
              if (sub && sub.material && sub.material !== null) {
                let newPrice;

                if (module.mainModule.measure && sub.unitPrice?.formulaPrice) {
                  newPrice = calculatePrice(
                    sub.unitPrice?.formulaPrice,
                    module.mainModule.measure.w,
                    module.mainModule.measure.h,
                    module.mainModule.measure.d,
                    sub.unitPrice?.priceValue
                  );
                }

                sub.price = newPrice;
                sub.measure = module.mainModule.measure;
              }
            });
          }
          setRefreshTotal(Math.random() * 100);
        });
      });
    });

    let newKitchen = [...kitchen];

    const totals = calculateTotalIndexDesign(newKitchen[currentStep].lstModule);
    newKitchen[currentStep].totalIndexDesign = totals[0];
    newKitchen[currentStep].totalMeasure = totals[1];

    setKitchen(newKitchen);
  };

  function findGroupsStartingWith(object, prefix) {
    const results = [];

    if (object.name.includes(prefix)) {
      results.push(object);
    }

    object.children.forEach((child) => {
      const childResults = findGroupsStartingWith(child, prefix);
      results.push(...childResults);
    });

    return results;
  }

  function findObjectByName(scene, nameSubstring) {
    function searchForObject(object, nameSubstring) {
      if (object.name && object.name.includes(nameSubstring)) {
        return object;
      }

      if (object.children && object.children.length > 0) {
        for (let i = 0; i < object.children.length; i++) {
          const child = object.children[i];
          const found = searchForObject(child, nameSubstring);
          if (found) {
            return found;
          }
        }
      }
      return null;
    }
    return searchForObject(scene, nameSubstring);
  }

  function getSizeZ(scene) {
    const boxHelper = new THREE.BoxHelper(scene, 0xff0000);
    boxHelper.update();
    const boundingBox = new THREE.Box3().setFromObject(boxHelper);
    const size = new THREE.Vector3();
    boundingBox.getSize(size);
    return (boundingBox.max.z - boundingBox.min.z) / 2;
  }

  const loadGLTFModel = async (moduleData, index, curStep) => {
    let step = null;
    if (curStep) {
      step = curStep;
    } else {
      step = currentStep;
    }

    return new Promise((resolve) => {
      const glftLoader = new GLTFLoader();
      const dLoader = new DRACOLoader();
      dLoader.setDecoderPath(
        "https://www.gstatic.com/draco/versioned/decoders/1.5.6/"
      );
      dLoader.setDecoderConfig({ type: "js" });
      glftLoader.setDRACOLoader(dLoader);
      if (!isLoading) {
        if (
          moduleData &&
          moduleData.module?.glbUrl &&
          mainModule.module?.glbUrl !== null
        ) {
          switch (moduleData.module.type) {
            case 1:
              setIsLoading(true);

              glftLoader.load(
                `${process.env.REACT_APP_URL}uploads/modules/${moduleData.module.glbUrl}`,
                // "./assets/glb/TA-K1-MODUL2-37-DOOR.glb",
                (gltfScene) => {
                  gltfScene.scene.traverse((child) => {
                    if (child.isMesh) {
                      child.receiveShadow = true;
                      child.castShadow = true;
                      child.material.metalness = 0.5;
                      //child.material.roughness = 0.05;

                      const map = child.material.map;
                      const ballMaterial = {
                        metalness: 0.5,
                        roughness: 0.5,
                        color: "#c9c9c9",
                        normalScale: new THREE.Vector2(0.15, 0.15),
                      };
                      let ballMat = new THREE.MeshStandardMaterial(
                        ballMaterial
                      );

                      if (map && child.name !== "MATBEP") {
                        child.material = new THREE.MeshBasicMaterial({
                          map: map,
                        });
                        child.material.needsUpdate = true;
                      }

                      if (child.name === "MATBEP") {
                        child.material = ballMat;
                      }
                    }
                  });

                  const door = gltfScene.scene.getObjectByName("DOOR");

                  if (
                    kitchen[step].lstModule[index]?.mainModule?.module?.only ===
                    true
                  ) {
                    gltfScene.scene.scale.set(
                      scale,
                      scale,
                      scale *
                        kitchen[step].lstModule[index]?.mainModule?.gltf?.scale
                          ?.z
                    );

                    gltfScene.scene.position.set(
                      kitchen[step].lstModule[index].mainModule.gltf.position.x,
                      kitchen[step].lstModule[index].mainModule.gltf.position.y,
                      kitchen[step].lstModule[index].mainModule.gltf.position
                        .z + 0.02
                    );
                  } else {
                    if (
                      // !isPB &&
                      isPB === false &&
                      canInside === true &&
                      kitchen[step].lstModule[index].mainModule.module.type !==
                        TypeModule.LOVER_MODULE &&
                      kitchen[step].lstModule[index].mainModule.module
                        .coverBox === true
                    ) {
                      if (!kitchen[step].baseScale) {
                        gltfScene.scene.scale.set(
                          scale,
                          scale - 0.04,
                          scale *
                            kitchen[step].lstModule[index]?.mainModule?.gltf
                              ?.scale?.z -
                            0.066 /
                              kitchen[step].lstModule[index]?.mainModule
                                ?.indexDesign
                        );

                        gltfScene.scene.position.set(
                          kitchen[step].lstModule[index].mainModule.gltf
                            .position.x + 0.015,
                          kitchen[step].lstModule[index].mainModule.gltf
                            .position.y + 0.02,
                          kitchen[step].lstModule[index].mainModule.gltf
                            .position.z + 0.004
                        );
                      } else {
                        gltfScene.scene.scale.set(
                          scale,
                          scale - 0.02,
                          scale *
                            kitchen[step].lstModule[index]?.mainModule?.gltf
                              ?.scale?.z -
                            0.066 /
                              kitchen[step].lstModule[index]?.mainModule
                                ?.indexDesign
                        );

                        gltfScene.scene.position.set(
                          kitchen[step].lstModule[index].mainModule.gltf
                            .position.x + 0.015,
                          kitchen[step].lstModule[index].mainModule.gltf
                            .position.y + 0.02,
                          kitchen[step].lstModule[index].mainModule.gltf
                            .position.z + 0.004
                        );
                      }
                    } else {
                      gltfScene.scene.scale.set(
                        scale,
                        scale,
                        scale *
                          kitchen[step].lstModule[index]?.mainModule?.gltf
                            ?.scale?.z
                      );

                      gltfScene.scene.position.set(
                        kitchen[step].lstModule[index].mainModule.gltf.position
                          .x,
                        kitchen[step].lstModule[index].mainModule.gltf.position
                          .y,
                        kitchen[step].lstModule[index].mainModule.gltf.position
                          .z
                      );
                    }
                  }

                  //lot long

                  gltfScene.scene.rotateY(
                    (kitchen[step].position.rotation * Math.PI) / 180
                  );

                  if (door && moduleData.texture?.imgUrl) {
                    const isHexColor = (str) => /^#[0-9A-F]{6}$/i.test(str);
                    if (isHexColor(moduleData.texture?.imgUrl)) {
                      const color = parseInt(
                        moduleData.texture?.imgUrl.substring(1),
                        16
                      );
                      const ballMaterial = {
                        metalness: moduleData.material.metalness,
                        roughness: moduleData.material.roughness,
                        color: color,
                        normalScale: new THREE.Vector2(0.15, 0.15),
                      };
                      let ballMat = new THREE.MeshStandardMaterial(
                        ballMaterial
                      );
                      gltfScene.scene.traverse((node) => {
                        if (node.isMesh) {
                          node.material = ballMat;
                        }
                      });
                    } else {
                      textureLoader.load(
                        `${process.env.REACT_APP_URL}uploads/images/textures/${moduleData.texture.imgUrl}`,

                        (texture) => {
                          const ballMaterial = {
                            metalness: moduleData.material?.metalness,
                            roughness: moduleData.material?.roughness,
                            color: "#c9c9c9",
                            normalScale: new THREE.Vector2(0.15, 0.15),
                          };
                          let ballMat = new THREE.MeshStandardMaterial(
                            ballMaterial
                          );
                          gltfScene.scene.traverse((node) => {
                            if (node.isMesh) {
                              node.material = ballMat;
                            }
                          });

                          texture.offset.set(1, 1);
                          texture.wrapS = texture.wrapT =
                            THREE.MirroredRepeatWrapping;
                          // texture.wrapS = texture.wrapT = THREE.RepeatWrapping
                          texture.repeat.set(1, 1);
                          texture.mapping = THREE.UVMapping;
                          door?.traverse((node) => {
                            if (node.isMesh) {
                              const materials = Array.isArray(node.material)
                                ? node.material
                                : [node.material];
                              materials.forEach((material) => {
                                material.map = texture;
                              });
                            }
                          });
                        }
                      );
                    }
                  } else if (!moduleData.texture?.imgUrl) {
                    if (moduleData.module.subSub !== true) {
                      const ballMaterial = {
                        metalness: 0.5,
                        roughness: 0.5,
                        color: "#c9c9c9",
                        normalScale: new THREE.Vector2(0.15, 0.15),
                      };
                      let ballMat = new THREE.MeshStandardMaterial(
                        ballMaterial
                      );
                      door?.traverse((node) => {
                        if (node.isMesh) {
                          node.material = ballMat;
                        }
                      });
                    }
                  }

                  const userData = {
                    step: currentStep,
                    index: currentIndex,
                  };
                  gltfScene.scene.userData = userData;

                  let newKitchen = [...kitchen];

                  newKitchen[step].lstModule[index].lstSubModule[
                    indexSub
                  ].gltf = gltfScene.scene;

                  setKitchen(newKitchen);

                  display.scene.add(gltfScene.scene);
                  resolve(gltfScene);
                  setIsLoading(false);
                }
              );

              break;

            case 3:
              setIsLoading(true);
              const combinedModelGroup = new THREE.Group();

              function loadAndAddModelToGroup(
                group,
                point,
                forStepXZ,
                forStepY,
                rotationAngle
              ) {
                glftLoader.load(
                  `${process.env.REACT_APP_URL}uploads/modules/${moduleData.module.glbUrl}`,
                  (gltfScene) => {
                    gltfScene.scene.traverse((child) => {
                      if (child.isMesh) {
                        //child.material.metalness = 0.5;
                        child.receiveShadow = true;
                        child.castShadow = true;
                      }
                    });

                    const cosValue = Math.cos(rotationAngle);
                    var [widthGlb, depthGlb, heightGlb] = getGLBSize(
                      gltfScene.scene
                    );

                    const heightScale =
                      Math.abs(forStepY?.position.y - point.start.y) /
                      heightGlb;

                    const widthScale =
                      ((point.end.x + point.endSize.width - point.start.x) *
                        forStepXZ.direction.x +
                        (point.end.z - point.start.z) * forStepXZ.direction.z) /
                      widthGlb;

                    gltfScene.scene.scale.y = heightScale ? heightScale : 1;
                    gltfScene.scene.scale.z = widthScale;

                    var [widthGlbScaled, depthGlbScaled, heightGlbScaled] =
                      getGLBSize(gltfScene.scene);

                    gltfScene.scene.size = {
                      width: widthGlbScaled,
                      depth: depthGlbScaled,
                      height: heightGlbScaled,
                    };

                    gltfScene.scene.position.x =
                      point.start.x *
                      (forStepXZ.direction.x === 0 ? 1 : forStepXZ.direction.x);
                    gltfScene.scene.position.y = point.start.y;
                    gltfScene.scene.position.z =
                      point.start.z *
                        (forStepXZ.direction.z === 0
                          ? 1
                          : forStepXZ.direction.z) +
                      gltfScene.scene.size.width * cosValue;

                    gltfScene.scene.rotateY(rotationAngle);

                    const userData = {
                      step: currentStep,
                      index: currentIndex,
                    };

                    const ballMaterial = {
                      metalness: 0.5,
                      roughness: 0.5,
                      color: "#c9c9c9",
                      normalScale: new THREE.Vector2(0.15, 0.15),
                    };
                    let ballMat = new THREE.MeshStandardMaterial(ballMaterial);
                    gltfScene.scene.traverse((node) => {
                      if (node.isMesh) {
                        node.material = ballMat;
                      }
                    });

                    gltfScene.scene.userData = userData;
                    gltfScene.scene.castShadow = true;

                    group.userData = userData;
                    group.add(gltfScene.scene);

                    setIsLoading(false);
                  }
                );
              }

              let result = 0;
              let newMeasure = 0;
              kitchen[step].groupPuzzle.forEach((item) => {
                const stepForXZ = kitchen.find(
                  (itemStep) => itemStep.stepId === item.forXZ
                );
                const stepForY = kitchen.find(
                  (itemStep) => itemStep.stepId === item.forY
                );

                const pStart = new THREE.Vector3(item.x, item.y, item.z);
                let isCounterTop = true;
                if (stepForY) {
                  isCounterTop = false;
                }

                result = setCounterTop(stepForXZ, pStart, isCounterTop);
                newMeasure += result.measure;

                result.lstPoint.forEach((point) => {
                  loadAndAddModelToGroup(
                    combinedModelGroup,
                    point,
                    stepForXZ,
                    stepForY,
                    (item.rotation * Math.PI) / 180
                  );
                });
              });

              const box = new THREE.Box3().setFromObject(combinedModelGroup);

              kitchen[step].lstModule[index].mainModule.gltf =
                combinedModelGroup;
              kitchen[step].lstModule[index].mainModule.physicalBox = box;

              kitchen[step].lstModule[index].mainModule.measure =
                newMeasure + kitchen[step].measurePlus;
              kitchen[step].measure = newMeasure + kitchen[step].measurePlus;
              kitchen[step].totalMeasure =
                newMeasure + kitchen[step].measurePlus;

              combinedModelGroup.name = "MAIN";

              display.scene.add(combinedModelGroup);
              resolve(combinedModelGroup);
              break;

            case 7:
              let doorGltf;
              kitchen[step].lstModule[index]?.lstSubModule.forEach((item) => {
                if (
                  item?.require !== true &&
                  item?.module?.subSub !== true &&
                  item?.module?.type === 1
                ) {
                  doorGltf = item.gltf;
                }
              });

              const groupsStartingWithTAYCAMRight = findGroupsStartingWith(
                doorGltf,
                "TAYNAM_RIGHT"
              );
              const groupsStartingWithTAYCAMLeft = findGroupsStartingWith(
                doorGltf,
                "TAYNAM_LEFT"
              );
              const groupsStartingWithTAYCAMCenter = findGroupsStartingWith(
                doorGltf,
                "TAYNAM_CENTER"
              );

              glftLoader.load(
                `${process.env.REACT_APP_URL}uploads/modules/${moduleData.module.glbUrl}`,
                (gltfScene) => {
                  gltfScene.scene.traverse((child) => {
                    if (child.isMesh) {
                      child.receiveShadow = true;
                      child.castShadow = true;

                      const map = child.material.map;
                      if (map) {
                        child.material = new THREE.MeshBasicMaterial({
                          map: map,
                        });
                        child.material.needsUpdate = true;
                      }
                    }
                  });

                  let taynam_list = [];
                  groupsStartingWithTAYCAMRight.forEach((item) => {
                    item.scale.set(1, 1, 1);
                    const tayNam = findObjectByName(
                      gltfScene.scene,
                      "TAYNAM_RIGHT"
                    ).clone();
                    if (!tayNam.name.includes("COVER")) {
                      const move = getSizeZ(tayNam);
                      if (item.name.includes("SCALEDOWN")) {
                        tayNam.position.z -= move;
                      } else if (item.name.includes("SCALEUP")) {
                        tayNam.position.z += move;
                      }
                    }
                    const data = {
                      parent: item.uuid,
                      taynam: tayNam.uuid,
                    };
                    taynam_list.push(data);
                    item.add(tayNam);
                  });
                  groupsStartingWithTAYCAMLeft.forEach((item) => {
                    item.scale.set(1, 1, 1);
                    const tayNam = findObjectByName(
                      gltfScene.scene,
                      "TAYNAM_LEFT"
                    ).clone();
                    if (!tayNam.name.includes("COVER")) {
                      const move = getSizeZ(tayNam);
                      if (item.name.includes("SCALEDOWN")) {
                        tayNam.position.z -= move;
                      } else if (item.name.includes("SCALEUP")) {
                        tayNam.position.z += move;
                      }
                    }
                    const data = {
                      parent: item.uuid,
                      taynam: tayNam.uuid,
                    };
                    taynam_list.push(data);

                    item.add(tayNam);
                  });
                  groupsStartingWithTAYCAMCenter.forEach((item) => {
                    item.scale.set(1, 1, 1);
                    const tayNam = findObjectByName(
                      gltfScene.scene,
                      "TAYNAM_CENTER"
                    ).clone();
                    const data = {
                      parent: item.uuid,
                      taynam: tayNam.uuid,
                    };
                    taynam_list.push(data);
                    item.add(tayNam);
                  });

                  const userData = {
                    step: currentStep,
                    index: currentIndex,
                  };
                  gltfScene.scene.userData = userData;
                  gltfScene.scene.name = "TAYNAM";

                  let newKitchen = [...kitchen];

                  newKitchen[step].lstModule[index].lstSubModule[
                    indexSub
                  ].gltf = gltfScene.scene;
                  newKitchen[step].lstModule[index].lstSubModule[
                    indexSub
                  ].listTayNam = taynam_list;

                  let newPrice = moduleData.price * taynam_list.length;
                  newKitchen[step].lstModule[index].lstSubModule[
                    indexSub
                  ].price = newPrice;
                  setKitchen(newKitchen);

                  resolve(gltfScene);
                  setIsLoading(false);
                }
              );
              break;

            default:
              setIsLoading(true);
              glftLoader.load(
                `${process.env.REACT_APP_URL}uploads/modules/${moduleData.module.glbUrl}`,
                (gltfScene) => {
                  gltfScene.scene.traverse((child) => {
                    if (child.isMesh) {
                      child.material.metalness = 0.5;
                      // child.material.roughness = 1;
                      child.castShadow = true;
                    }
                  });
                  const main = gltfScene.scene.getObjectByName("MAIN");

                  const cosValue = Math.cos(
                    (kitchen[step].position.rotation * Math.PI) / 180
                  );
                  if (
                    moduleData.module.type === TypeModule.REQUIRE_MODULE &&
                    kitchen[currentStep].dependentStep
                  ) {
                    kitchen[step].lstModule[
                      currentIndex
                    ].mainModule.dependentStep =
                      kitchen[currentStep].dependentStep;
                    const stepBaseScale = kitchen.find(
                      (step) =>
                        step.stepId === kitchen[currentStep].dependentStep
                    );

                    const scaleValueRequireModuleZ = scaleRequireModule(
                      stepBaseScale,
                      kitchen[step],
                      moduleData.module
                    );
                    gltfScene.scene.scale.set(
                      scale,
                      scale,
                      scaleValueRequireModuleZ
                    );
                    gltfScene.scene.size = {
                      width:
                        scale *
                        moduleData.module.size.width *
                        scaleValueRequireModuleZ,
                      depth: scale * moduleData.module.size.depth,
                      height: scale * moduleData.module.size.height,
                    };
                  } else if (
                    moduleData.module.type === TypeModule.LOVER_MODULE
                  ) {
                    if (kitchen[currentStep].baseScale === true) {
                      gltfScene.scene.scale.set(scale, scale, scale);
                      gltfScene.scene.size = {
                        width: scale * moduleData.module.size.width,
                        depth: scale * moduleData.module.size.depth,
                        height: scale * moduleData.module.size.height,
                      };
                    } else {
                      if (
                        moduleData.actualSize.width ==
                        moduleData.mainLover?.actualSizeMain?.width
                      ) {
                        gltfScene.scene.scale.set(scale, scale, scale);
                        console.log(moduleData);
                        gltfScene.scene.size = {
                          width: scale * moduleData?.module?.size?.width,
                          depth: scale * moduleData?.module?.size?.depth,
                          height: scale * moduleData?.module?.size?.height,
                        };
                      } else {
                        gltfScene.scene.scale.set(
                          scale,
                          scale,
                          moduleData.mainLover?.scale
                        );
                        gltfScene.scene.size = {
                          width:
                            scale *
                            moduleData.module.size.width *
                            moduleData.mainLover.scale,
                          depth: scale * moduleData.module.size.depth,
                          height: scale * moduleData.module.size.height,
                        };
                      }
                    }
                  } else {
                    if (
                      kitchen[step].lstModule[index]?.mainModule?.module
                        ?.only === true
                    ) {
                      gltfScene.scene.scale.set(
                        scale + 0.032,
                        scale,
                        scale * kitchen[step].scale
                      );
                    } else {
                      if (
                        // !isPB &&
                        isPB === false &&
                        canInside === true &&
                        kitchen[step].lstModule[index].mainModule.module
                          .type !== TypeModule.LOVER_MODULE &&
                        kitchen[step].lstModule[index].mainModule.module
                          .coverBox === true &&
                        kitchen[step].lstModule[index].mainModule.module
                          .only !== true
                      ) {
                        gltfScene.scene.scale.set(
                          scale + 0.032,
                          scale,
                          scale * kitchen[step].scale
                        );
                      } else {
                        gltfScene.scene.scale.set(
                          scale,
                          scale,
                          scale * kitchen[step].scale
                        );
                      }
                    }

                    gltfScene.scene.size = {
                      width:
                        scale *
                        moduleData.module.size.width *
                        kitchen[step].scale,
                      depth: scale * moduleData.module.size.depth,
                      height: scale * moduleData.module.size.height,
                    };
                  }

                  if (index === 0) {
                    // Đưa về trục tọa độ
                    gltfScene.scene.position.y = moduleData.module.position?.y
                      ? moduleData.module.position.y - Y / 2
                      : kitchen[step].position.y;
                    gltfScene.scene.position.x = moduleData.module.position?.x
                      ? moduleData.module.position.x - X / 2
                      : kitchen[step].position.x;
                    gltfScene.scene.position.z = moduleData.module.position?.z
                      ? moduleData.module.position.z - Z / 2
                      : kitchen[step].position.z +
                        gltfScene.scene.size.width * cosValue;
                  } else {
                    const objectPre =
                      kitchen[step].lstModule[index - 1]?.mainModule?.gltf;

                    gltfScene.scene.position.x =
                      objectPre.position.x +
                      (kitchen[step].direction.x >= 0
                        ? objectPre.size.width
                        : gltfScene.scene.size.width) *
                        kitchen[step].direction.x;
                    gltfScene.scene.position.y =
                      objectPre.position.y +
                      (kitchen[step].direction.y >= 0
                        ? objectPre.size.height
                        : gltfScene.scene.size.height) *
                        kitchen[step].direction.y;
                    gltfScene.scene.position.z =
                      objectPre.position.z +
                      (kitchen[step].direction.z >= 0
                        ? gltfScene.scene.size.width
                        : objectPre.size.width) *
                        kitchen[step].direction.z;
                  }
                  gltfScene.scene.rotateY(
                    (kitchen[step].position.rotation * Math.PI) / 180
                  );

                  if (main && moduleData.texture?.imgUrl) {
                    const isHexColor = (str) => /^#[0-9A-F]{6}$/i.test(str);
                    if (isHexColor(moduleData.texture.imgUrl)) {
                      const ballMaterial = {
                        metalness: moduleData.material?.metalness,
                        roughness: moduleData.material?.roughness,
                        color: moduleData.texture?.imgUrl,
                        normalScale: new THREE.Vector2(0.15, 0.15),
                      };
                      let ballMat = new THREE.MeshStandardMaterial(
                        ballMaterial
                      );
                      main.traverse((node) => {
                        if (node.isMesh) {
                          node.material = ballMat;
                        }
                      });
                    } else {
                      textureLoader.load(
                        `${process.env.REACT_APP_URL}uploads/images/textures/${moduleData.texture.imgUrl}`,
                        // "./assets/images/1.jpg",
                        (texture) => {
                          const ballMaterial = {
                            metalness: moduleData.material?.metalness,
                            roughness: moduleData.material?.roughness,
                            color: module.name === "" ? "#ffffff" : "#c9c9c9",
                            normalScale: new THREE.Vector2(0.15, 0.15),
                          };
                          let ballMat = new THREE.MeshStandardMaterial(
                            ballMaterial
                          );
                          main.traverse((node) => {
                            if (node.isMesh) {
                              node.material = ballMat;
                            }
                          });
                          texture.offset.set(1, 1);
                          texture.wrapS = texture.wrapT =
                            THREE.MirroredRepeatWrapping;
                          texture.repeat.set(1, 1);
                          texture.mapping = THREE.UVMapping;
                          main.traverse((node) => {
                            if (node.isMesh) {
                              const materials = Array.isArray(node.material)
                                ? node.material
                                : [node.material];
                              materials.forEach((material) => {
                                material.map = texture;
                              });
                            }
                          });
                        }
                      );
                    }
                  } else if (!moduleData.texture?.imgUrl) {
                    const ballMaterial = {
                      metalness: 0.5,
                      roughness: 0.5,
                      color: "#c9c9c9",
                      normalScale: new THREE.Vector2(0.15, 0.15),
                    };
                    let ballMat = new THREE.MeshStandardMaterial(ballMaterial);
                    main?.traverse((node) => {
                      if (node.isMesh) {
                        node.material = ballMat;
                      }
                    });
                  }

                  const userData = {
                    step: currentStep,
                    index: currentIndex,
                  };

                  gltfScene.scene.userData = userData;

                  let newKitchen = [...kitchen];
                  newKitchen[step].lstModule[index].mainModule.gltf =
                    gltfScene.scene;

                  setKitchen(newKitchen);

                  display.scene.add(gltfScene.scene);

                  resolve(gltfScene);
                  setIsLoading(false);
                }
              );
              break;
          }
        }
      }
    });
  };

  const handleShowMeasure = () => {
    for (const [i, step] of kitchen.entries()) {
      if (
        step.totalIndexDesign !== 0 &&
        step.lstModule[0].mainModule !== null &&
        step.position.x &&
        step.measure
      ) {
        drawStep(display, step, step.measure, productInfo);
      }

      for (const [i, module] of step.lstModule.entries()) {
        let showDepthHeight = false;

        if (
          module.mainModule !== null &&
          module.mainModule?.module !== null &&
          module.mainModule?.module?.type !== TypeModule.SCALE_MODULE
        ) {
          if (
            step.lstModule[i + 1]?.mainModule === null ||
            (i === 0 &&
              module.mainModule?.module?.type === TypeModule.IMPACT_MODULE) ||
            (step.lstModule[i + 1]?.mainModule !== null &&
              module.mainModule?.module?.type !== TypeModule.IMPACT_MODULE &&
              step.lstModule[i + 1]?.mainModule?.module?.type ===
                TypeModule.IMPACT_MODULE)
          ) {
            showDepthHeight = true;
          }

          draw(
            display,
            step.direction,
            module.mainModule.gltf,
            showDepthHeight,
            module.mainModule.measure.w,
            module.mainModule.measure.h,
            module.mainModule.measure.d
          );
        }
      }
    }
  };

  const handleHideMeasure = () => {
    const objectsToRemove = [];

    display.scene.traverse((object) => {
      if (object.name === "MEASURE") {
        objectsToRemove.push(object);
      }
    });

    objectsToRemove.forEach((object) => {
      display.scene.remove(object);
    });
  };

  const handleAddModule = (moduleData) => {
    if (
      moduleData?.module?.glbUrl &&
      moduleData.module.type !== TypeModule.SUBMODULE &&
      moduleData.module.type !== 7
    ) {
      let newKitchen = [...kitchen];
      kitchen[currentStep].lstModule[currentIndex].lstSubModule.forEach(
        (item, index) => {
          display.scene.remove(item.gltf);
        }
      );
      newKitchen[currentStep].lstModule[currentIndex].mainModule = moduleData;

      const totals = calculateTotalIndexDesign(
        newKitchen[currentStep].lstModule
      );

      newKitchen[currentStep].totalIndexDesign = totals[0];
      newKitchen[currentStep].totalMeasure = totals[1];

      setKitchen(newKitchen);
    } else if (moduleData?.module?.type === 7 || moduleData?.type === 7) {
      let newKitchen = [...kitchen];
      if (
        newKitchen[currentStep].lstModule[currentIndex].lstSubModule[indexSub]
          ?.listTayNam &&
        newKitchen[currentStep].lstModule[currentIndex].lstSubModule[indexSub]
          ?.module?.glbUrl !== moduleData?.module?.glbUrl
      ) {
        newKitchen[currentStep].lstModule[currentIndex].lstSubModule[
          indexSub
        ]?.listTayNam?.forEach((element) => {
          const mainObject = display.scene.getObjectByProperty(
            "uuid",
            element.parent
          );
          const taynam = display.scene.getObjectByProperty(
            "uuid",
            element.taynam
          );
          if (mainObject !== undefined) {
            mainObject.children = [];
          }
        });
      }
      // let countTN =
      //   newKitchen[currentStep].lstModule[currentIndex].lstSubModule[indexSub]
      //     ?.listTayNam?.length;
      // let newPrice = moduleData.price * countTN;
      // moduleData = { ...moduleData, price: newPrice };
      newKitchen[currentStep].lstModule[currentIndex].lstSubModule[indexSub] =
        moduleData;

      setKitchen(newKitchen);
    } else if (
      (moduleData?.module?.type === TypeModule.SUBMODULE ||
        moduleData?.type === "sub") &&
      moduleData?.type !== 7
    ) {
      let newKitchen = [...kitchen];
      // console.log(
      //   kitchen[currentStep].lstModule[currentIndex].lstSubModule[indexSub]
      // );
      // console.log(moduleData);

      if (
        newKitchen[currentStep].lstModule[currentIndex].lstSubModule[indexSub]
          ?.module?.glbUrl !== moduleData?.module?.glbUrl
      ) {
        if (moduleData.module?.subSub !== true) {
          if (moduleData.require !== true) {
            newKitchen[currentStep].lstModule[
              currentIndex
            ].lstSubModule.forEach((item, index) => {
              if (item?.require !== true) {
                display.scene.remove(item.gltf);
              }
            });
            newKitchen[currentStep].lstModule[
              currentIndex
            ].lstSubModule.forEach((item, index) => {
              if (item?.require !== true) {
                newKitchen[currentStep].lstModule[currentIndex].lstSubModule[
                  index
                ] = subNull;
              }
            });
          } else {
            newKitchen[currentStep].lstModule[
              currentIndex
            ].lstSubModule.forEach((item, index) => {
              if (item?.require === true) {
                display.scene.remove(item.gltf);
              }
            });
            newKitchen[currentStep].lstModule[
              currentIndex
            ].lstSubModule.forEach((item, index) => {
              if (item?.require === true) {
                newKitchen[currentStep].lstModule[currentIndex].lstSubModule[
                  index
                ] = subNull;
              }
            });
          }
        } else {
          display.scene.remove(
            newKitchen[currentStep].lstModule[currentIndex].lstSubModule[
              indexSub
            ]?.gltf
          );
        }
      }

      newKitchen[currentStep].lstModule[currentIndex].lstSubModule[indexSub] =
        moduleData;

      setKitchen(newKitchen);
    }
  };

  const handleUpdateModule = (moduleData) => {
    if (
      moduleData?.module?.type !== TypeModule.SUBMODULE &&
      moduleData?.module?.glbUrl
    ) {
      setKitchen((prevKitchen) => {
        let newKitchen = [...prevKitchen];

        newKitchen[currentStep].lstModule[currentIndex].mainModule = moduleData;

        if (moduleData.module.type !== TypeModule.LOVER_MODULE) {
          const totals = calculateTotalIndexDesign(
            newKitchen[currentStep].lstModule
          );

          newKitchen[currentStep].totalIndexDesign = totals[0];
          newKitchen[currentStep].totalMeasure = totals[1];
        }

        return newKitchen;
      });
    } else if (
      moduleData?.module?.type === TypeModule.SUBMODULE &&
      moduleData?.module?.glbUrl !==
        kitchen[currentStep].lstModule[currentIndex].lstSubModule[indexSub]
          ?.module?.glbUrl
    ) {
      setKitchen((prevKitchen) => {
        let newKitchen = [...prevKitchen];

        newKitchen[currentStep].lstModule[currentIndex].lstSubModule[indexSub] =
          moduleData;

        return newKitchen;
      });
    }
  };

  const handleChangeStep = (step) => {
    setCurrentStep(step);
    setExecutingStep(step);

    setCurrentIndex(0);
    setExecutingIndex(0);
    setMainModule(mainNull);
    setSubModule(subNull);
    setExecutingModule(null);

    setExecutingTotalDU(1);

    setCurrentDU(1);
    setExecutingDU(1);
  };

  const handleComplete = () => {
    if (
      mainModule &&
      currentIndex + currentDU < kitchen[currentStep].designUnit
    ) {
      setCurrentIndex(currentIndex + 1);
      setExecutingIndex(currentIndex + 1);
      setMainModule(mainNull);
      setSubModule(subNull);
      setExecutingModule(null);

      setExecutingTotalDU(executingTotalDU + 1);
      setCurrentDU(1);
      setExecutingDU(1);
    } else if (currentIndex + currentDU === kitchen[currentStep].designUnit) {
      setCurrentStep(currentStep + 1);
      setExecutingStep(currentStep + 1);
      setCurrentIndex(0);
      setExecutingIndex(0);
      setMainModule(mainNull);
      setSubModule(subNull);
      setExecutingModule(null);
      setCurrentDU(1);
      setExecutingDU(1);
    }
  };

  useEffect(() => {
    dispatch(getTrademarksAction(productInfo?._id));
    // if (
    //   productInfo._id === "6505a0ddc825350c4db83e95" ||
    //   productInfo._id === "652fadd14779fdc2254e9a95"
    // ) {
    //   setDuoiTrai(productInfo.listStep[0].designUnit);
    //   setTrenTrai(productInfo.listStep[1].designUnit);
    // } else if (
    //   productInfo._id === "64ed6cc30fb69fc4cf332358" ||
    //   productInfo._id === "652f9e1391c09661e502bc9e"
    // ) {
    //   setDuoiPhai(productInfo.listStep[0].designUnit);
    //   setDuoiTrai(productInfo.listStep[1].designUnit);
    //   setTrenPhai(productInfo.listStep[2].designUnit);
    //   setTrenTrai(productInfo.listStep[3].designUnit);
    // }

    if (productInfo && display === null) {
      display = new SceneInit("myThreeJsCanvas", productInfo);
      display.initialize(productInfo);
      display.setZoom(defaultZoom);

      // const axesHelper = new THREE.AxesHelper(2);
      // axesHelper.position.set(0, 0, 0);
      // display.scene.add(axesHelper);
      const hdrUrl = new URL("/public/assets/Sudio-HDRi.hdr", import.meta.url);
      display.loadHDRAndSetupEnvironment(hdrUrl);
      display.setBackgroundGlb(productInfo);
      display.animate();
    }

    if (display !== null && productInfo && kitchen.length === 0) {
      localStorage.setItem("typeProduct", JSON.stringify(productInfo._id));
      const md = { mainModule: null, lstSubModule: [] };
      let listStep = [];
      listStepDetail = productInfo.listStep;

      let storedFormData = JSON.parse(localStorage.getItem("formData"));
      if (storedFormData) {
        setWallHeight(storedFormData?.STH || storedFormData?.SUH || 2210);
      } else {
        setWallHeight(formData?.STH || formData?.SUH || 2210);
      }
      // if (storedFormData) {
      //   setWallHeight(storedFormData?.STH || 2210);
      // } else {
      //   setWallHeight(formData?.STH || 2210);
      // }

      formData && localStorage.setItem("formData", JSON.stringify(formData));

      productInfo.listStep.forEach((step) => {
        let measurePlus = 0;
        let newPosition = {
          ...step.position,
          x: step?.position?.x - X / 2,
          y: step?.position?.y - Y / 2,
          z: step?.position?.z - Z / 2,
        };

        let newGroupPuzzle = step?.groupPuzzle?.map((item) => ({
          ...item,
          x: item.x - X / 2,
          y: item.y - Y / 2,
          z: item.z - Z / 2,
        }));

        if (step?.groupPuzzle[0]?.forY && step?.groupPuzzle?.length > 1) {
          measurePlus = 600;
        }

        let measureOri = 0;
        const input =
          formData && formData[step?.typeSize?.width]
            ? formData[step.typeSize.width]
            : 0;
        if (step?.actualSize && step?.actualSize?.width) {
          measureOri = calculateFormula(step.actualSize.width, input);
        } else {
          measureOri =
            (parseFloat(formData?.STWL) || 0) +
            (parseFloat(formData?.STWR) || 0) +
            measurePlus -
            600;
        }

        const designUnitOfStep =
          formData && formData[step?.typeSize?.width]
            ? myRound(
                calculateFormula(
                  productInfo.formulaDesignUnit,
                  formData[step?.typeSize?.width],
                  formData[step?.typeSize?.height],
                  formData[step?.typeSize?.depth],
                  null
                )
              )
            : step.designUnit || 1;

        const scaleOfStep =
          formData && formData[step?.typeSize?.width]
            ? calculateFormula(
                productInfo.formulaScale,
                formData[step?.typeSize?.width],
                formData[step?.typeSize?.height],
                formData[step?.typeSize?.depth],
                designUnitOfStep
              )
            : step.scale;

        listStep.push({
          name: step.name,
          formulaScale: productInfo.formulaScale,
          formulaDesignUnit: productInfo.formulaDesignUnit,
          position: newPosition,
          direction: step.direction,
          typeModules: step.typeModules?.map((item) => {
            const { _id, require, startIndex } = item;
            return { _id, require, startIndex };
          }),
          baseScale: step.baseScale,
          dependentStep: step.dependentStep,
          groupPuzzle: newGroupPuzzle,
          designUnit: designUnitOfStep,
          dependentIndexDepth: step.dependentIndexDepth,
          designUnitOriginal: designUnitOfStep,
          stepId: step._id,
          scale: scaleOfStep,
          scaleOriginal: scaleOfStep,
          stepsWeightLoss: step.stepsWeightLoss,
          stepsWife: step.stepsWife,
          lstModule: Array(designUnitOfStep)
            .fill()
            .map(() => ({ ...md })),
          showBtnPlus: false,
          totalIndexDesign: 0,
          stepTotalPrice: 0,
          measure: measureOri,
          baseMeasure:
            formData &&
            formData[step?.typeSize?.width] &&
            parseFloat(formData[step.typeSize.width]),
          measureFormula: step?.actualSize?.width,
          measurePlus: measurePlus,
          measureImpact: 0,
        });
      });

      const storedKitchen = JSON.parse(localStorage.getItem("kitchen"));
      const checkChange = JSON.parse(localStorage.getItem("checkChange"));
      if (appContext.projectDetail.length !== 0) {
        kitchen = appContext.projectDetail;
      } else if (checkChange === true) {
        kitchen = listStep;
      } else {
        if (storedKitchen === null) {
          kitchen = listStep;
        } else {
          kitchen = storedKitchen;
        }
      }

      // kitchen = listStep;
    }
  }, [display, productInfo]);

  useEffect(() => {
    // dispatch(getTrademarksAction(productInfo?.typeProduct));
    dispatch(getMaterialAction(5, 1));
    dispatch(getTextureAction(50, 1));

    return () => {
      display = null;
    };
  }, []);

  useEffect(() => {
    if (kitchen[currentStep]?.lstModule[currentIndex]?.mainModule === null) {
      let newKitchen = [...kitchen];

      newKitchen[currentStep].lstModule[currentIndex] = {
        mainModule: {
          ...mainNull,
          uuid: uuidv4(),
        },
        lstSubModule: [],
      };

      const totals = calculateTotalIndexDesign(
        newKitchen[currentStep].lstModule
      );
      newKitchen[currentStep].totalIndexDesign = totals[0];
      newKitchen[currentStep].totalMeasure = totals[1];

      setKitchen(newKitchen);
    }
  }, [currentStep, currentIndex, kitchen]);

  useEffect(() => {
    setTabOption("0");

    if (currentIndex !== 0 || currentStep !== 0) {
      const executing = {
        currentStep: currentStep,
        currentIndex: currentIndex,
      };

      if (executing) {
        localStorage.setItem("executing", JSON.stringify(executing));
      }
    }
  }, [currentStep, currentIndex]);

  useEffect(() => {
    if (
      tabSelected.step !== null &&
      tabSelected.index !== null &&
      productInfo
    ) {
      const mData =
        kitchen[tabSelected.step]?.lstModule[tabSelected.index]?.mainModule;
      const lsData =
        kitchen[tabSelected.step]?.lstModule[tabSelected.index]?.lstSubModule;

      setModelClicked(null);

      const mainObject = display.scene.getObjectByProperty(
        "uuid",
        mData?.gltf?.uuid
      );

      if (mainObject) {
        setTemporaryOpacity(mainObject, 1200);
      }

      lsData?.forEach((subModule) => {
        if (
          subModule &&
          (subModule.module?.type === 7 ||
            (subModule.module?.type === TypeModule.SUBMODULE &&
              subModule.module?.subSub === false))
        ) {
          const subObject = display.scene.getObjectByProperty(
            "uuid",
            subModule?.gltf?.uuid
          );

          if (subObject) {
            setTemporaryOpacity(subObject, 1200);
          }
        }
      });
      setMainModule({
        ...mData,
      });

      setLstSubModule(lsData);

      setMainSelected({
        ...mData,
      });
    }
  }, [tabSelected]);

  useEffect(() => {
    if (modelClicked !== null) {
      if (
        kitchen[currentStep].lstModule[currentIndex]?.mainModule?.module ===
        null
      ) {
        setKitchen((prevKitchen) => {
          let newKitchen = [...prevKitchen];

          newKitchen[currentStep].lstModule[currentIndex].mainModule = null;

          const totals = calculateTotalIndexDesign(
            newKitchen[currentStep].lstModule
          );
          newKitchen[currentStep].totalIndexDesign = totals[0];
          newKitchen[currentStep].totalMeasure = totals[1];
          return newKitchen;
        });
      }
    }
  }, [modelClicked]);

  useEffect(() => {
    if (modelClicked !== null) {
      const mData =
        kitchen[modelClicked.userData.step].lstModule[
          modelClicked.userData.index
        ]?.mainModule;
      const lsData =
        kitchen[modelClicked.userData.step].lstModule[
          modelClicked.userData.index
        ]?.lstSubModule;

      setTabSelected({ step: null, index: null });
      setCurrentStep(modelClicked.userData.step);
      setCurrentIndex(modelClicked.userData.index);

      const setOpacity = (object) => {
        if (
          object &&
          (object.module?.type === TypeModule.MAIN_MODULE ||
            object.module?.type === 7 ||
            (object.module?.type === TypeModule.SUBMODULE &&
              object.module?.subSub === false))
        ) {
          const glbObject = display.scene.getObjectByProperty(
            "uuid",
            object?.gltf?.uuid
          );
          if (glbObject) {
            setTemporaryOpacity(glbObject, 1200);
          }
        }
      };

      // if (mData?.module?.type === TypeModule.SCALE_MODULE) {
      //   display.scene.traverse((object) => {
      //     if (object.name === "MATBEP") {
      //       setTemporaryOpacity(object, 1200);
      //     }
      //   });
      // }

      setOpacity(mData);

      lsData?.forEach(setOpacity);

      setMainModule({
        ...mData,
      });

      setLstSubModule(lsData);

      setMainSelected({
        ...mData,
      });
    }

    // START Xử lí click vào 1 module
    const canvas = document.getElementById("myThreeJsCanvas");
    canvas.addEventListener(
      "mousedown",
      () => {
        isMouseDown = true;
      },
      false
    );

    canvas.addEventListener(
      "click",
      (event) => {
        handleMouseDown(
          event,
          display,
          kitchen,
          setModelClicked,
          setTabSelected
        );
      },
      false
    );

    canvas.addEventListener("mousemove", (event) => {
      handleMouseMove(event, display, canvas, isMouseDown);
    });

    window.addEventListener(
      "mouseup",
      () => {
        isMouseDown = false;
        handleMouseUp();
      },
      false
    );

    // END Xử lí click vào 1 module
  }, [modelClicked]);

  useEffect(() => {
    if (productInfo?.listStep) {
      setStepDetail(productInfo.listStep[currentStep]);
    }
    if (mainModule?.module === null) {
      setMainSelected(mainNull);
    }
  }, [currentStep, productInfo]);

  useEffect(() => {
    if (
      mainSelected?.module?.type === TypeModule.LOVER_MODULE &&
      mainModule?.module?.type !== TypeModule.LOVER_MODULE
    ) {
      kitchen[currentStep]?.stepsWife.forEach((stepId) => {
        const stepWife = kitchen.find((stepWife) => stepWife.stepId === stepId);
        const itemLover = stepWife.listModuleLover?.find(
          (item) => item.moduleUuid === mainSelected?.uuid
        );
        for (const [indx, module] of stepWife.lstModule.entries()) {
          if (
            countCurrentTotalDesign(kitchen, stepWife, indx) ===
            itemLover?.totalDesign
          ) {
            for (let i = indx; i < stepWife.designUnit; i++) {
              if (stepWife.lstModule[i].mainModule != null) {
                stepWife.totalIndexDesign -=
                  stepWife.lstModule[i].mainModule?.indexDesign;
              }
              onlyRemoveModule(display, kitchen, i, stepWife);
            }
            break;
          }
        }
      });
    }

    if (mainModule?.module?.glbUrl !== mainSelected?.module?.glbUrl) {
      display.scene.remove(mainSelected?.gltf);
      kitchen[currentStep]?.lstModule[currentIndex]?.lstSubModule?.forEach(
        (sub) => {
          display.scene.remove(sub?.gltf);
        }
      );

      if (kitchen[currentStep]?.lstModule[currentIndex]?.lstSubModule) {
        kitchen[currentStep].lstModule[currentIndex].lstSubModule = [];
      }
      // kitchen[currentStep].lstModule[currentIndex].lstSubModule = [];

      if (checkChange === true) {
        loadGLTFModel(mainModule, currentIndex, currentStep).then(() => {
          lstSub?.forEach(async (item, index) => {
            if (item.require === true) {
              let subModuleData = {
                module: item.listModule[0].items[0],
                groupId: item.listModule[0]._id,
                type: item.nameCollection,
                require: item.require,
              };
              console.log(item);
              console.log(lstSub);
              const isMaterialExists = item.listModule[0].materialIds.some(
                (materialId) => materialId === subRecommended?.material?._id
              );
              console.log(isMaterialExists);
              console.log(subRecommended);
              console.log(item.listModule[0]);
              if (item.listModule[0].items[0]?.price) {
                subModuleData = {
                  ...subModuleData,
                  price: item.listModule[0].items[0]?.price,
                };
              } else if (isMaterialExists) {
                let subPrice;
                let unitPrice;
                console.log(subRecommended.material);
                if (subRecommended.material) {
                  const priceValue = subRecommended.material.priceValue;
                  // const priceValue = item?.listModule[0]?.price?.prices?.find(
                  //   (item) =>
                  //     (item.trademark === trademark.value &&
                  //       item.materialIds.includes(subRecommended.material._id)) ||
                  //     (!item.trademark &&
                  //       item.materialIds.includes(subRecommended.material._id))
                  // )?.priceValue;
                  console.log(item);
                  console.log(priceValue);

                  const unitPriceValue = await getPriceDetail(
                    subRecommended?.material?._id,
                    subModuleData.groupId,
                    trademark.value
                  );

                  unitPrice = {
                    formulaPrice: unitPriceValue?.formulaPrice,
                    priceUser: unitPriceValue?.priceUser,
                    priceValue: unitPriceValue?.priceValue,
                  };

                  if (priceValue !== undefined) {
                    subPrice = calculatePrice(
                      unitPrice?.formulaPrice,
                      mainModule.measure.w,
                      mainModule.measure.h,
                      mainModule.measure.d,
                      unitPrice?.priceValue
                    );
                  }
                }
                subModuleData = {
                  ...subModuleData,
                  price: subPrice,
                  priceId: item.listModule[0]?.price?._id,
                  material: subRecommended?.material,
                  texture: subRecommended?.texture,
                  unitPrice: unitPrice,
                  measure:
                    kitchen[currentStep].lstModule[currentIndex].mainModule
                      .measure,
                };
              }

              indexSub = index;
              handleAddModule(subModuleData);
              const loadSubRequire = loadGLTFModel(
                subModuleData,
                currentIndex,
                currentStep
              );

              loadSubRequire.then(() => {
                if (textureMB !== null) {
                  display.scene.traverse((object) => {
                    if (object.name === "MATBEP") {
                      handleChangeTexture(object, textureMB);
                      setKitchen(kitchen);
                    }
                  });
                }
              });
            }
          });

          if (
            (mainModule?.module?.type === TypeModule.LOVER_MODULE ||
              mainSelected?.module?.type === TypeModule.LOVER_MODULE) &&
            kitchen[currentStep]?.baseScale === true
          ) {
            resetBaseScale();
          }

          kitchen.forEach((step, index) => {
            refresh3D(
              canInside,
              isPB,
              display,
              index,
              productInfo,
              kitchen,
              trademark.value
            );
            refreshModuleImpact(display, kitchen, index);

            if (
              mainModule?.indexDesign !== mainSelected?.indexDesign ||
              mainModule?.module?.type !== mainSelected?.module?.type
            ) {
              const stepId = kitchen[currentStep].stepId;
              refreshModuleScale(
                display,
                index,
                kitchen,
                stepId,
                textureVB,
                trademark
              );
            }
          });
        });
      }

      setMainSelected(mainModule);

      if (kitchen[currentStep]) {
        kitchen[currentStep].stepsWife?.forEach((wife) => {
          const kitchenWife = kitchen.find((item) => item.stepId === wife);
          kitchenWife.listModuleLover = [];
        });
        let totalIndexToImpact = 0;
        for (const [index, itemModule] of kitchen[
          currentStep
        ].lstModule.entries()) {
          totalIndexToImpact += itemModule?.mainModule?.indexDesign;
          switch (itemModule.mainModule?.module?.type) {
            case 5:
              kitchen[currentStep].stepsWife?.forEach((wife) => {
                const kitchenWife = kitchen.find(
                  (item) => item.stepId === wife
                );
                const [_, impactDesign] = countImpactModulePosition(
                  kitchen,
                  currentStep
                );

                const scaleLover =
                  itemModule.mainModule?.actualSize?.width /
                  itemModule.mainModule?.indexDesign /
                  450;

                const wifeModuleInfo = {
                  moduleUuid: itemModule.mainModule?.uuid,
                  indexDesign: itemModule.mainModule?.indexDesign,
                  scale: scaleLover,
                  actualSizeMain: {
                    width: itemModule.mainModule?.actualSize?.width,
                  },
                  actualSize: {
                    width:
                      itemModule.mainModule?.actualSize?.width /
                      itemModule.mainModule?.indexDesign,
                  },
                  totalDesign:
                    totalIndexToImpact -
                    itemModule.mainModule.indexDesign +
                    impactDesign,
                  module: itemModule.mainModule.module,
                };
                kitchenWife.listModuleLover.push(wifeModuleInfo);
              });
              break;
          }
        }
      }

      kitchen[currentStep].stepsWife.forEach((stepId, indexStep) => {
        const stepWife = kitchen.find((stepWife) => stepWife.stepId === stepId);
        const itemLover = stepWife.listModuleLover?.find(
          (item) => item.moduleUuid === mainSelected?.uuid
        );

        if (stepWife.listModuleLover) {
          if (itemLover) {
            for (const [indx, module] of stepWife.lstModule.entries()) {
              if (
                countCurrentTotalDesign(kitchen, stepWife, indx) +
                  module?.mainModule?.module?.indexDesign >
                itemLover?.totalDesign
              ) {
                // if (
                //   module.mainModule.module.type === TypeModule.LOVER_MODULE &&
                //   isExistModuleWife(
                //     module.mainModule.module,
                //     mainModule.module
                //   ) === true
                // ) {
                //   break;
                // }
                for (let i = indx; i < stepWife.designUnit; i++) {
                  if (stepWife.lstModule[i].mainModule != null) {
                    stepWife.totalIndexDesign -=
                      stepWife.lstModule[i].mainModule?.indexDesign;
                  }
                  onlyRemoveModule(display, kitchen, i, stepWife);
                }
                break;
              }
            }
          } else {
            for (const itemLover of stepWife.listModuleLover) {
              for (const [indx, moduleItem] of stepWife.lstModule.entries()) {
                const resultCountCurrentTotalDesign = countCurrentTotalDesign(
                  kitchen,
                  stepWife,
                  indx
                );

                if (
                  (resultCountCurrentTotalDesign +
                    moduleItem?.mainModule?.module?.indexDesign -
                    itemLover?.totalDesign <
                    itemLover.module.indexDesign &&
                    countCurrentTotalDesign(kitchen, stepWife, indx) +
                      moduleItem?.mainModule?.module?.indexDesign >
                      itemLover?.totalDesign) ||
                  (countCurrentTotalDesign(kitchen, stepWife, indx) ===
                    itemLover?.totalDesign &&
                    moduleItem?.mainModule?.module?.type !==
                      TypeModule.LOVER_MODULE)
                ) {
                  for (let i = indx; i < stepWife.designUnit; i++) {
                    if (stepWife.lstModule[i].mainModule !== null) {
                      stepWife.totalIndexDesign -=
                        stepWife.lstModule[i].mainModule?.indexDesign;
                    }
                    onlyRemoveModule(display, kitchen, i, stepWife);
                  }
                  break;
                }
              }
            }
          }
        }
      });
    }
  }, [kitchen, mainSelected, checkChange]);

  useEffect(() => {
    console.log("KITCHEN: ", kitchen);
    setFromDataNew(formData);
    let kitchenBackUp = JSON.parse(JSON.stringify(kitchen));

    if (kitchenBackUp.length > 0) {
      kitchenBackUp.forEach((step) => {
        step.lstModule.forEach((module) => {
          if (module.mainModule && module.mainModule !== null) {
            module.mainModule.gltf = null;
            if (module.mainModule?.module?.listSubmodule) {
              module.mainModule.module.listSubmodule = undefined;
            }
          }

          if (module.lstSubModule?.length > 0) {
            module.lstSubModule.forEach((sub) => {
              if (sub && sub?.gltf !== null) {
                sub.gltf = null;
              }
            });
          }
        });
      });

      localStorage.setItem("kitchen", JSON.stringify(kitchenBackUp));
    }

    if (checkReload) {
      setTabSelected({ step: currentStep, index: currentIndex });
    }
  }, [kitchen]);

  useEffect(() => {
    let storedKitchen = JSON.parse(localStorage.getItem("kitchen"));
    let executing = JSON.parse(localStorage.getItem("executing"));
    let storedShowNextStep = JSON.parse(localStorage.getItem("showNextStep"));
    let storedCanInside = localStorage.getItem("canInside");
    let storedIsPB = localStorage.getItem("isPB");
    let storedRecommendedMain = JSON.parse(
      localStorage.getItem("recommendedMain")
    );
    let storedRecommendedSub = JSON.parse(
      localStorage.getItem("recommendedSub")
    );

    if (storedRecommendedMain) {
      setRecommended(storedRecommendedMain);
    }

    if (storedRecommendedSub) {
      setSubRecommended(storedRecommendedSub);
    }

    if (storedShowNextStep === true) {
      setShowNextStep(storedShowNextStep);
    }

    if (storedCanInside) {
      if (storedCanInside === true || storedCanInside === "true") {
        setCanInside(true);
      } else {
        setCanInside(false);
      }
    }

    if (storedIsPB) {
      if (storedIsPB === true || storedIsPB === "true") {
        setIsPB(true);
      } else {
        setIsPB(false);
      }
    }

    let storedTrademark = localStorage.getItem("trademark");

    if (storedTrademark) {
      storedTrademark = JSON.parse(storedTrademark);
      setTrademark(storedTrademark);
    }

    if (appContext.projectDetail.length !== 0) {
      async function processStepData(stepData, stepIndex) {
        setIsLoading(true);

        for (const [index, item] of stepData.lstModule.entries()) {
          if (
            item.mainModule &&
            item.mainModule !== null &&
            item.mainModule?.module !== null
          ) {
            await reloadGLTFModel(
              item.mainModule,
              index,
              stepIndex,
              display,
              appContext.projectDetail,
              setKitchen,
              isLoading,
              setIsLoading,
              isPB,
              canInside
            );

            if (item.lstSubModule.length > 0) {
              for (const [ids, sub] of item.lstSubModule.entries()) {
                await reloadGLTFModel(
                  sub,
                  index,
                  stepIndex,
                  display,
                  appContext.projectDetail,
                  setKitchen,
                  isLoading,
                  setIsLoading,
                  ids,
                  isPB,
                  canInside
                );
              }
            }
          }
        }
      }

      async function processStoredKitchen(projectDetail) {
        for (const [stepIndex, stepData] of projectDetail.entries()) {
          await processStepData(stepData, stepIndex);

          setIsLoading(false);
        }
      }

      processStoredKitchen(appContext.projectDetail);
    } else if (storedKitchen && storedTrademark) {
      async function processStepData(stepData, stepIndex) {
        setIsLoading(true);

        for (const [index, item] of stepData.lstModule.entries()) {
          if (
            item.mainModule &&
            item.mainModule !== null &&
            item.mainModule?.module !== null
          ) {
            await reloadGLTFModel(
              item.mainModule,
              index,
              stepIndex,
              display,
              kitchen,
              // appContext.projectDetail,
              setKitchen,
              isLoading,
              setIsLoading,
              isPB,
              canInside
            );

            if (item.lstSubModule.length > 0) {
              for (const [ids, sub] of item.lstSubModule.entries()) {
                await reloadGLTFModel(
                  sub,
                  index,
                  stepIndex,
                  display,
                  kitchen,
                  // appContext.projectDetail,
                  setKitchen,
                  isLoading,
                  setIsLoading,
                  ids,
                  isPB,
                  canInside
                );
              }
            }
          }
        }
      }

      async function processStoredKitchen(storedKitchen) {
        for (const [stepIndex, stepData] of storedKitchen.entries()) {
          await processStepData(stepData, stepIndex);

          setIsLoading(false);
          if (executing) {
            setCurrentStep(executing.currentStep);
            setCurrentIndex(executing.currentIndex);
            setExecutingStep(executing.currentStep);
            setExecutingIndex(executing.currentIndex);
          } else {
            setCurrentStep(0);
            setCurrentIndex(0);
            setExecutingStep(0);
            setExecutingIndex(0);
          }
        }
      }

      processStoredKitchen(storedKitchen);
    } else {
      setKitchen(storedKitchen);
    }
  }, []);

  useEffect(() => {
    if (
      mainModule &&
      mainModule.module?.glbUrl !== null &&
      kitchen[currentStep] &&
      mainModule.module?.glbUrl !==
        kitchen[currentStep]?.lstModule[currentIndex]?.mainModule?.module
          ?.glbUrl
    ) {
      handleAddModule(mainModule);
    }
  }, [mainModule]);

  useEffect(() => {
    if (mainModule?.module?.glbUrl && subModule?.module?.glbUrl !== null) {
      handleAddModule(subModule);
    }
  }, [subModule]);

  useEffect(() => {
    if (display) {
      if (
        !modelClicked &&
        !mainSelected &&
        mainModule?.module?.glbUrl &&
        prevMainModule?.module?.glbUrl !== mainModule?.module?.glbUrl
      ) {
        display.scene.remove(
          kitchen[currentStep].lstModule[currentIndex].mainModule.gltf
        );
        kitchen[currentStep].lstModule[currentIndex]?.lstSubModule.forEach(
          (sub) => {
            display.scene.remove(sub?.gltf);
          }
        );

        loadGLTFModel(mainModule, currentIndex, currentStep).then(() => {
          lstSub?.forEach((item, index) => {
            if (item.require === true) {
              let subModuleData = {
                module: item.listModule[0].items[0],
                groupId: item.listModule[0]._id,
                type: item.nameCollection,
                require: item.require,
              };
              const isMaterialExists = item.listModule[0].materialIds.some(
                (materialId) => materialId === subRecommended?.material?._id
              );

              if (item.listModule[0].items[0]?.price) {
                subModuleData = {
                  ...subModuleData,
                  price: item.listModule[0].items[0]?.price,
                };
              } else if (isMaterialExists) {
                let subPrice;
                let unitPrice;

                if (subRecommended.material) {
                  // const priceValue = item?.listModule[0]?.price?.prices?.find(
                  //   (item) =>
                  //     (item.trademark === trademark.value &&
                  //       item.materials.includes(subRecommended.material._id)) ||
                  //     (!item.trademark &&
                  //       item.materials.includes(subRecommended.material._id))
                  // )?.priceValue;

                  // unitPrice = {
                  //   formulaPrice: item.listModule[0].price.formulaPrice,
                  //   priceValue: priceValue || null,
                  // };

                  const priceValue = subRecommended.material.priceValue;
                  unitPrice = {
                    // formulaPrice: item.listModule[0]?.price?.formulaPrice,
                    formulaPrice: subRecommended.material?.formulaPrice,
                    priceValue: priceValue || null,
                  };

                  subPrice = calculatePrice(
                    unitPrice?.formulaPrice,
                    mainModule.measure.w,
                    mainModule.measure.h,
                    mainModule.measure.d,
                    unitPrice?.priceValue
                  );
                }
                subModuleData = {
                  ...subModuleData,
                  price: subPrice,
                  priceId: item.listModule[0]?.price?._id,
                  material: subRecommended?.material,
                  texture: subRecommended?.texture,
                  unitPrice: unitPrice,
                  measure:
                    kitchen[currentStep].lstModule[currentIndex].mainModule
                      .measure,
                };
              }

              indexSub = index;
              handleAddModule(subModuleData);
              loadGLTFModel(subModuleData, currentIndex, currentStep);
            }
          });

          kitchen.forEach((step, index) => {
            refresh3D(canInside, isPB, display, index, productInfo, kitchen);
            refreshModuleImpact(display, kitchen, index);
            if (
              mainModule?.indexDesign !== mainSelected?.indexDesign ||
              mainModule?.module?.type !== mainSelected?.module?.type
            ) {
              const stepId = kitchen[currentStep].stepId;
              refreshModuleScale(
                display,
                index,
                kitchen,
                stepId,
                textureVB,
                trademark
              );
            }
          });
        });
      } else if (
        mainModule?.module?.glbUrl &&
        prevMainModule?.module?.glbUrl === mainModule.module?.glbUrl &&
        (prevMainModule?.material?._id !== mainModule.material?._id ||
          prevMainModule?.texture?._id !== mainModule.texture?._id)
      ) {
        const glbObject = display.scene.getObjectByProperty(
          "uuid",
          mainModule?.gltf?.uuid
        );
        const mainObject = glbObject.getObjectByName("MAIN");

        if (mainModule.module.type === TypeModule.SCALE_MODULE) {
          if (!kitchen[currentStep].groupPuzzle[0].forY) {
            display.scene.traverse((object) => {
              if (object.name === "MATBEP") {
                handleChangeTexture(
                  object,
                  mainModule?.texture?.imgUrl,
                  mainModule?.material?.metalness,
                  mainModule?.material?.roughness
                );
              }
            });

            setTextureMB(mainModule?.texture?.imgUrl);
          } else {
            setTextureVB(mainModule?.texture?.imgUrl);
          }

          mainObject.children.forEach((item) => {
            handleChangeTexture(
              item,
              mainModule?.texture?.imgUrl,
              mainModule?.material?.metalness,
              mainModule?.material?.roughness
            );
          });
        } else {
          handleChangeTexture(
            mainObject,
            mainModule?.texture?.imgUrl,
            mainModule?.material?.metalness,
            mainModule?.material?.roughness
          );
        }

        handleUpdateModule(mainModule);
      }
    }

    for (let index = 0; index < kitchen.length; index++) {
      const step = kitchen[index];

      if (kitchen[index + 1]) {
        if (
          kitchen[executingStep] &&
          mainModule &&
          mainModule.module?.glbUrl &&
          mainModule.module?.glbUrl !== null &&
          step.totalIndexDesign === step.designUnit &&
          kitchen[index + 1]?.totalIndexDesign === 0
        ) {
          kitchen[index + 1].showBtnPlus = true;
        } else {
          kitchen[index + 1].showBtnPlus = false;
        }
      }
    }
    // }, [kitchen, mainModule, lstSub]);
  }, [mainModule, lstSub]);

  useEffect(() => {
    if (display) {
      if (
        mainModule?.module?.glbUrl &&
        (subModule?.module?.glbUrl || subModule === subNull) &&
        prevSubModule?.module?.glbUrl !== subModule?.module?.glbUrl
      ) {
        if (subModule !== subNull) {
          // console.log("CASE 4: ADD SUB");

          if (subModule !== subSelected) {
            loadGLTFModel(subModule, currentIndex);
          }
        }
      } else if (
        mainModule?.module?.glbUrl &&
        prevSubModule?.module?.glbUrl === subModule?.module?.glbUrl &&
        prevSubModule?.texture?.imgUrl !== subModule?.texture?.imgUrl
      ) {
        // console.log("CASE 4: ADD SUB TEXTURE", subModule?.texture?.imgUrl);

        const glbObject = display.scene.getObjectByProperty(
          "uuid",
          subModule?.gltf?.uuid
        );

        const subObject = glbObject.getObjectByName("DOOR");
        handleChangeTexture(
          subObject,
          subModule?.texture?.imgUrl,
          subModule?.material?.metalness,
          subModule?.material?.roughness
        );
      }
    }
  }, [subModule]);

  const value = {
    display,
    isLoading,
    lstMaterial,
    lstTexture,
    TypeModule,

    listStepDetail,

    modelClicked,
    showBoxSize,
    showNextStep,
    setKitchen,

    mainModule,
    setMainModule,
    subModule,
    setSubModule,
    subNull,
    checkReload,
    setCheckReload,
    checkChange,
    setCheckChange,
    refreshTotal,
    setRefreshTotal,

    mainSelected,
    setMainSelected,
    subSelected,
    setSubSelected,

    prevCurrentStep,
    prevCurrentIndex,

    trademark,
    trademarkRef,
    recommended,
    setRecommended,
    subRecommended,
    setSubRecommended,

    wallHeight,
    setWallHeight,

    lstTab,
    setLstTab,
    baseLstTab,
    setBaseLstTab,
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

    setCurrentDU,

    setModelClicked,
    setCurrentIndex,
    setCurrentStep,
    setShowBoxSize,
    setShowNextStep,

    setIsLoading,

    showPopupSave,
    setShowPopupSave,

    dependentStep,
    setDependentStep,
    typeModuleId,
    setTypeModuleId,
    typePrice,
    setTypePrice,
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

    tabOption,

    handleComplete,
    handleChangeStep,
    handleSetNullModule,
    handleShowMeasure,
    handleHideMeasure,

    handleZoomIn,
    handleZoomOut,
    calculateTotalIndexDesign,
  };

  return (
    <KitchenContext.Provider value={value}>
      <div className="customDesign">
        {showPopupSave && <ReviewDesign />}

        <div className="customDesign__header">
          <button
            className="btn-border-rounded"
            onClick={() => {
              navigate("/");
            }}
          >
            Về trang chủ
          </button>

          {canInside === true && (
            <TreeSelect
              value={isPB}
              dropdownStyle={{
                maxHeight: 500,
                overflow: "auto",
              }}
              style={{
                width: "180px",
              }}
              treeData={typeOption}
              placeholder="Chọn loại tủ áo"
              treeDefaultExpandAll
              onChange={handleChangeType}
              treeExpandAction="click"
            />
          )}

          <Select
            ref={trademarkRef}
            className="select-trademark"
            placeholder="Chọn nhà cung cấp"
            onChange={handleChangeTrademark}
            value={trademark?.value}
            style={{
              width: "260px",
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

          <div
            className="d-flex flex-row justify-content-end"
            style={{ gap: "80px" }}
          >
            <div
              className="d-flex flex-row align-items-center"
              style={{ gap: "8px" }}
            >
              {/* <button className="btn-noborder">
                <LuCornerUpLeft />
                Trở về
              </button>

              <button className="btn-noborder">
                <LuCornerUpRight />
                Tiếp tục
              </button>

              <button className="btn-noborder">
                <RiDeleteBinLine />
                Làm lại
              </button> */}
            </div>

            <div>
              <input
                type="color"
                id="colorPicker"
                value={bgColor}
                onChange={(e) => {
                  handleBgColorChange(e);

                  display.updateBackgroundColor(e.target.value);
                }}
              />
            </div>

            <div
              className="d-flex flex-row align-items-center"
              style={{ gap: "10px" }}
            >
              <button
                className="btn-noborder"
                onClick={() => {
                  setShowBoxSize(!showBoxSize);
                }}
              >
                Kích thước
                <i className="far fa-angle-down ms-1"></i>
              </button>

              <button
                className="btn-noborder"
                onClick={() => {
                  setShowVisible(!showVisible);
                }}
              >
                <IoEyeOutline />
                <i className="far fa-angle-down"></i>
              </button>

              {/* <button onClick={() => display.saveAsImage(productInfo)}>
                Chụp ảnh
              </button> */}

              <button
                className="btn-complete"
                onClick={() => {
                  const token = Cookies.get("token");

                  if (!isLoading) {
                    if (token) {
                      setShowVisible(false);
                      handleHideMeasure();

                      display.saveAsImage(productInfo);
                      setTimeout(() => {
                        setShowPopupSave(true);
                      }, 150);
                    } else {
                      navigate("/login");
                    }
                  }
                }}
                disabled={
                  kitchen[0]?.lstModule[0]?.mainModule?.module === null ||
                  isLoading
                    ? true
                    : false
                }
              >
                <LuSave />
                Lưu
              </button>

              {/* <button className="btn-complete">Hoàn Thành</button> */}
            </div>

            {showBoxSize && (
              <BoxSize
                setShowBoxSize={setShowBoxSize}
                type={type}
                formData={isSizeChange ? fromDataNew : formData}
              />
            )}
            {showVisible && <Visible />}
          </div>
        </div>

        <div className="customDesign__body">
          <div className="control">
            <div className="control__main">
              {/* <div className="control__main__left">
                {productInfo?.listStep?.map((item, index) => {
                  return (
                    <div
                      className={index === currentStep ? "step active" : "step"}
                      key={item._id}
                    >
                      <p>{item.name}</p>
                    </div>
                  );
                })}
              </div> */}

              <div className="control__main__right">
                <Tabs
                  onChange={handleChangeTab}
                  activeKey={tabOption}
                  type="card"
                  centered
                  items={lstTab.map((item, i) => {
                    const id = String(i);
                    return {
                      label: `${item}`,
                      key: id,
                      children:
                        i === 0 ? (
                          <MainOption key={i} />
                        ) : i !== 0 && subAPI ? (
                          <SubOption key={i} data={subAPI} />
                        ) : null,
                    };
                  })}
                />
              </div>
            </div>

            <div className="control__selectedItem">
              <SelectedItem />
            </div>
          </div>

          <div id="container__canvas">
            {isLoading ? <Loading /> : null}

            <canvas id="myThreeJsCanvas" ref={canvasRef} />

            <div className="container-zoom">
              <Zoom />
            </div>
          </div>
        </div>
      </div>
    </KitchenContext.Provider>
  );
}
