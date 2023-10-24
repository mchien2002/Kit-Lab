import { useEffect, useState, createContext, useRef } from "react";
import { usePrevious } from "@uidotdev/usehooks";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { Tabs } from "antd";
import { IoEyeOutline } from "react-icons/io5";
import { LuCornerUpLeft, LuCornerUpRight, LuSave } from "react-icons/lu";
import { FaChevronDown } from "react-icons/fa";
import { RiDeleteBinLine } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import SceneInit from "../../lib/SceneInit";
import { getAllStepAction } from "../../store/actions/steps.action";
import { getStepDetailAction } from "../../store/actions/stepDetail.action";
import { getStepEditDetailAction } from "../../store/actions/stepEditDetail.action";
import { getMaterialAction } from "../../store/actions/material.action";
import { getTextureAction } from "../../store/actions/texture.action";
import {
  countScale,
  countDesignUnit,
  handleChangeTexture,
  handleAddBackground,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleMouseHover,
  countBaseMeasure,
  shiftArrayElements,
  removeModule3D,
  removeLastModule,
  onlyRemoveModule,
  calculateTotalIndexDesign,
  calculateTotalPrice,
  countTotalDesign,
  countCurrentTotalDesign,
  refresh3D,
  setCounterTop,
  getGLBSize,
  refreshModuleScale,
} from "../../utils/function";
import SelectedItem from "../SelectedItem/SelectedItem.jsx";
import "./Design.scss";
import MainOption from "../Option/MainOption";
import SubOption from "../Option/SubOption";
import Loading from "../Loading/Loading";
import Zoom from "../Zoom/Zoom";
import BoxSize from "../BoxSize/BoxSize";
import { toast } from "react-hot-toast";
import Visible from "../Visible/Visible";
import { v4 as uuidv4 } from "uuid";

export const KitchenContext = createContext();

const scale = 30;

let isMouseDown = false;

var display = null;
const glftLoader = new GLTFLoader();
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

export default function Design() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [defaultZoom, setDefaultZoom] = useState(35);
  const [tabOption, setTabOption] = useState("0");

  const [cabinetLatest, setCabinetLatest] = useState(null);
  const [doorLatest, setDoorLatest] = useState(null);
  const [measureLatest, setMeasureLatest] = useState(null);

  const [currentStep, setCurrentStep] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const prevCurrentStep = usePrevious(currentStep);
  const prevCurrentIndex = usePrevious(currentIndex);

  const [currentDU, setCurrentDU] = useState(0);

  const [dependentStep, setDependentStep] = useState(null);
  const [typeModuleId, setTypeModuleId] = useState(null);

  const [recommended, setRecommended] = useState({
    moduleType: null,
    material: null,
    texture: null,
  });

  const [executingStep, setExecutingStep] = useState(0);
  const [executingIndex, setExecutingIndex] = useState(0);
  const [executingDU, setExecutingDU] = useState(0);
  const [executingTotalDU, setExecutingTotalDU] = useState(0);
  const [executingModule, setExecutingModule] = useState();

  const [DUR, setDUR] = useState(0);
  const [DUL, setDUL] = useState(0);
  const [scaleRight, setScaleRight] = useState();
  const [scaleLeft, setScaleLeft] = useState();
  const [baseMeasureRight, setBaseMeasureRight] = useState(0);
  const [baseMeasureLeft, setBaseMeasureLeft] = useState(0);

  const [modelClicked, setModelClicked] = useState(null);

  const [mainSelected, setMainSelected] = useState(null);
  const [subSelected, setSubSelected] = useState(null);

  const [tabSelected, setTabSelected] = useState({ step: null, index: null });
  let [indexSub, setIndexSub] = useState(null);

  const [mainModule, setMainModule] = useState(mainNull);
  const prevMainModule = usePrevious(mainModule);
  const [subModule, setSubModule] = useState(subNull);
  const prevSubModule = usePrevious(subModule);
  const [lstSubModule, setLstSubModule] = useState(null);
  const prevLstSubModule = usePrevious(lstSubModule);

  const [lstSub, setLstSub] = useState(null);
  const [lstTab, setLstTab] = useState(["Cabinet"]);

  const [isLoading, setIsLoading] = useState(false);

  const [showBoxSize, setShowBoxSize] = useState(false);
  const [showVisible, setShowVisible] = useState(false);
  const [showNextStep, setShowNextStep] = useState(false);

  const { stepDetail } = useSelector((state) => state.stepDetail);
  const { lstMaterial } = useSelector((state) => state.material);
  const { lstTexture } = useSelector((state) => state.texture);
  const lstMeasure = JSON.parse(localStorage.getItem("measure"));
  const productInfo = JSON.parse(localStorage.getItem("productInfo"));
  const [kitchen, setKitchen] = useState([]);

  const onChange = (key) => {
    if (!isLoading) {
      setTabOption(key);
      if (parseInt(key) !== 0) {
        setIndexSub(key - 1);
        // setIndexSub(parseInt(key));

        if (tabSelected.step !== null) {
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

  const getSizeModule = (module) => {
    // Get the bounding box of the model
    const boundingBox = new THREE.Box3().setFromObject(module);

    // Calculate the vertices of the bounding box
    const minPoint = boundingBox.min;
    const maxPoint = boundingBox.max;

    const boxVertices = [
      {
        o: new THREE.Vector3(minPoint.x, minPoint.y, minPoint.z),
        x: new THREE.Vector3(minPoint.x + 5, minPoint.y, minPoint.z),
        z: new THREE.Vector3(minPoint.x, minPoint.y, minPoint.z + 5),
      },
      {
        o: new THREE.Vector3(minPoint.x, minPoint.y, maxPoint.z),
        x: new THREE.Vector3(minPoint.x + 5, minPoint.y, maxPoint.z),
        z: new THREE.Vector3(minPoint.x, minPoint.y, maxPoint.z + 5),
      },
      {
        o: new THREE.Vector3(maxPoint.x, minPoint.y, maxPoint.z),
        x: new THREE.Vector3(maxPoint.x + 5, minPoint.y, maxPoint.z),
        z: new THREE.Vector3(maxPoint.x, minPoint.y, maxPoint.z + 5),
      },
      {
        o: new THREE.Vector3(maxPoint.x, minPoint.y, minPoint.z),
        x: new THREE.Vector3(maxPoint.x + 5, minPoint.y, minPoint.z),
        z: new THREE.Vector3(maxPoint.x, minPoint.y, minPoint.z + 5),
      },
      {
        o: new THREE.Vector3(minPoint.x, maxPoint.y, minPoint.z),
        x: new THREE.Vector3(minPoint.x + 5, maxPoint.y, minPoint.z),
        z: new THREE.Vector3(minPoint.x, maxPoint.y, minPoint.z + 5),
      },
      {
        o: new THREE.Vector3(minPoint.x, maxPoint.y, maxPoint.z),
        x: new THREE.Vector3(minPoint.x + 5, maxPoint.y, maxPoint.z),
        z: new THREE.Vector3(minPoint.x, maxPoint.y, maxPoint.z + 5),
      },
      {
        o: new THREE.Vector3(maxPoint.x, maxPoint.y, maxPoint.z),
        x: new THREE.Vector3(maxPoint.x + 5, maxPoint.y, maxPoint.z),
        z: new THREE.Vector3(maxPoint.x, maxPoint.y, maxPoint.z + 5),
      },
      {
        o: new THREE.Vector3(maxPoint.x, maxPoint.y, minPoint.z),
        x: new THREE.Vector3(maxPoint.x + 5, maxPoint.y, minPoint.z),
        z: new THREE.Vector3(maxPoint.x, maxPoint.y, minPoint.z + 5),
      },
    ];

    return boxVertices;
  };

  const draw = (arr, width, height, depth) => {
    const group = new THREE.Group();

    const material = new THREE.LineBasicMaterial({
      color: 0x00ffff,
      linewidth: 10,
      linecap: "round",
      linejoin: "round",
    });

    let linesData = [
      [
        { startIdx: arr[1].o, endIdx: arr[1].z },
        { startIdx: arr[2].o, endIdx: arr[2].z },
        { startIdx: arr[1].z, endIdx: arr[2].z, text: `${width}mm` },
      ],
      [
        { startIdx: arr[2].o, endIdx: arr[2].x },
        { startIdx: arr[6].o, endIdx: arr[6].x },
        { startIdx: arr[2].x, endIdx: arr[6].x, text: `${height}mm` },
      ],
      [
        { startIdx: arr[2].o, endIdx: arr[2].x },
        { startIdx: arr[3].o, endIdx: arr[3].x },
        { startIdx: arr[2].x, endIdx: arr[3].x, text: `${depth}mm` },
      ],
    ];

    const fontLoader = new FontLoader();
    fontLoader.load("./fonts/roboto.json", (font) => {
      const textOptions = {
        font: font,
        size: 1,
        height: 0.1,
        curveSegments: 12,
        bevelEnabled: false,
      };

      const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });

      linesData.forEach((data) => {
        data.forEach((item) => {
          const points = [item.startIdx, item.endIdx];

          // const geometry = new THREE.BufferGeometry().setFromPoints(points);
          var tubeGeometry = new THREE.TubeGeometry(
            new THREE.CatmullRomCurve3(points),
            512, // path segments
            0.15, // THICKNESS
            5, //Roundness of Tube
            false //closed
          );
          const line = new THREE.Line(tubeGeometry, material);

          // line.name = "MEASURE";
          group.add(line);

          if (item.text) {
            const textGeometry = new TextGeometry(item.text, textOptions);
            const textMesh = new THREE.Mesh(textGeometry, textMaterial);

            const midPoint = points[0]
              .clone()
              .add(points[1])
              .multiplyScalar(0.5);
            // textMesh.position.copy(midPoint);
            // textMesh.name = "MEASURE";
            midPoint.x += 1;
            midPoint.y += 1;
            midPoint.z += 1;

            textMesh.position.copy(midPoint);

            group.add(textMesh);
          }
        });
      });

      group.name = "MEASURE";
      group.visible = false;
      setMeasureLatest(group);
      display.scene.add(group);
      display.listGroupMeasure.push(group);
    });
  };

  const resetBaseScale = () => {
    const listStepReset = kitchen.filter((item) => item.baseScale === true);

    listStepReset.forEach((step) => {
      let widthReset = step.designUnitOriginal * 425 * step.scaleOriginal + 600;
      let DU = step.designUnit;
      step.lstModule.forEach((module) => {
        if (module.mainModule?.module?.type === TypeModule.LOVER_MODULE) {
          widthReset -= 800;
          DU -= module.mainModule?.module?.indexDesign;
        }
      });

      const newScale = countScale(widthReset, DU);
      step.scale = newScale;

      let lstStepDependent = kitchen.filter(
        (item) => item?.position?.rotation === step.position.rotation
      );

      lstStepDependent.forEach((item) => {
        item.scale = newScale;
      });
    });
  };

  const loadGLTFModel = async (moduleData, index) => {
    return new Promise((resolve) => {
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
                `https://api.lanha.vn/profiles/module-glb/${moduleData.module.glbUrl}`,
                (gltfScene) => {
                  if (
                    kitchen[currentStep].lstModule[index].mainModule.module
                      .type === TypeModule.LOVER_MODULE
                  ) {
                    gltfScene.scene.scale.set(scale, scale, scale);
                  } else {
                    gltfScene.scene.scale.set(
                      scale,
                      scale,
                      scale * kitchen[currentStep].scale
                    );
                  }

                  gltfScene.scene.rotateY(
                    (kitchen[currentStep].position.rotation * Math.PI) / 180
                  );
                  gltfScene.scene.position.set(
                    kitchen[currentStep].lstModule[index].mainModule.gltf
                      .position.x,
                    kitchen[currentStep].lstModule[index].mainModule.gltf
                      .position.y,
                    kitchen[currentStep].lstModule[index].mainModule.gltf
                      .position.z
                  );

                  kitchen[currentStep].lstModule[index].lstSubModule[
                    indexSub
                  ].gltf = gltfScene.scene;

                  const userData = {
                    step: currentStep,
                    index: currentIndex,
                  };
                  gltfScene.scene.userData = userData;

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
                  `https://api.lanha.vn/profiles/module-glb/${moduleData.module.glbUrl}`,
                  (gltfScene) => {
                    const cosValue = Math.cos(rotationAngle);
                    var [widthGlb, depthGlb, heightGlb] = getGLBSize(
                      gltfScene.scene
                    );

                    const heightScale =
                      Math.abs(
                        scale *
                          (forStepY?.position.y +
                            productInfo.camera.rotateY -
                            (point.start.y + productInfo.camera.rotateY))
                      ) / heightGlb;

                    const widthScale =
                      ((point.end.x + point.endSize.width - point.start.x) *
                        forStepXZ.direction.x +
                        (point.end.z - point.start.z) * forStepXZ.direction.z) /
                      widthGlb;

                    gltfScene.scene.scale.x = scale;
                    gltfScene.scene.scale.y = heightScale ? heightScale : scale;
                    gltfScene.scene.scale.z = widthScale;

                    var [widthGlbScaled, depthGlbScaled, heightGlbScaled] =
                      getGLBSize(gltfScene.scene);

                    gltfScene.scene.size = {
                      width: widthGlbScaled,
                      depth: depthGlbScaled,
                      height: heightGlbScaled,
                    };

                    gltfScene.scene.position.x =
                      point.start.x * forStepXZ.direction.x;
                    gltfScene.scene.position.y =
                      point.start.y * scale + productInfo.camera.rotateY;
                    gltfScene.scene.position.z =
                      point.start.z * forStepXZ.direction.z +
                      gltfScene.scene.size.width * cosValue;

                    gltfScene.scene.rotateY(rotationAngle);

                    const userData = {
                      step: currentStep,
                      index: currentIndex,
                    };

                    gltfScene.scene.userData = userData;
                    gltfScene.scene.castShadow = true;

                    group.userData = userData;
                    group.add(gltfScene.scene);

                    setIsLoading(false);
                  }
                );
              }

              kitchen[currentStep].groupPuzzle.forEach((item) => {
                const stepForXZ = kitchen.find(
                  (itemStep) => itemStep.stepId === item.forXZ
                );
                const stepForY = kitchen.find(
                  (itemStep) => itemStep.stepId === item.forY
                );

                const pStart = new THREE.Vector3(
                  item.x * scale,
                  item.y,
                  item.z * scale
                );
                let isCounterTop = true;
                if (stepForY) {
                  isCounterTop = false;
                }

                let listPoint = setCounterTop(stepForXZ, pStart, isCounterTop);
                // console.log(listPoint);

                listPoint.forEach((point) => {
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

              kitchen[currentStep].lstModule[index].mainModule.gltf =
                combinedModelGroup;
              kitchen[currentStep].lstModule[index].mainModule.physicalBox =
                box;

              combinedModelGroup.name = "MAIN";

              display.scene.add(combinedModelGroup);
              resolve(combinedModelGroup);
              break;

            default:
              setIsLoading(true);
              glftLoader.load(
                `https://api.lanha.vn/profiles/module-glb/${moduleData.module.glbUrl}`,
                (gltfScene) => {
                  const main = gltfScene.scene.getObjectByName("MAIN");
                  var tempIndex = currentIndex;
                  let widthGlb, depthGlb, heightGlb;
                  var objectPre;
                  const sineValue = Math.sin(
                    (kitchen[currentStep].position.rotation * Math.PI) / 180
                  );
                  const cosValue = Math.cos(
                    (kitchen[currentStep].position.rotation * Math.PI) / 180
                  );
                  if (
                    moduleData.module.type === TypeModule.REQUIRE_MODULE &&
                    typeModuleId.dependentStep
                  ) {
                    kitchen[currentStep].lstModule[
                      currentIndex
                    ].mainModule.dependentStep = typeModuleId.dependentStep;
                    const stepBaseScale = kitchen.find(
                      (step) => step.stepId == typeModuleId.dependentStep
                    );

                    const differenceX =
                      (stepBaseScale.position.x * stepBaseScale.direction.x -
                        kitchen[currentStep].position.x *
                          kitchen[currentStep].direction.x) *
                      scale;
                    const differenceY =
                      (stepBaseScale.position.y * stepBaseScale.direction.y -
                        kitchen[currentStep].position.y *
                          kitchen[currentStep].direction.y) *
                      scale;
                    const differenceZ =
                      (stepBaseScale.position.z * stepBaseScale.direction.z -
                        kitchen[currentStep].position.z *
                          kitchen[currentStep].direction.z) *
                      scale;
                    const scaleValueRequireModuleZ =
                      (differenceX +
                        differenceY +
                        differenceZ +
                        stepBaseScale.lstModule[0].mainModule.gltf.size.width /
                          stepBaseScale.lstModule[0].mainModule.indexDesign) /
                      (moduleData.module.size.width * scale);
                    gltfScene.scene.scale.set(
                      scale,
                      scale,
                      scaleValueRequireModuleZ * scale
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
                    gltfScene.scene.scale.set(scale, scale, scale);
                    gltfScene.scene.size = {
                      width: scale * moduleData.module.size.width,
                      depth: scale * moduleData.module.size.depth,
                      height: scale * moduleData.module.size.height,
                    };
                  } else {
                    gltfScene.scene.scale.set(
                      scale,
                      scale,
                      scale * kitchen[currentStep].scale
                    );
                    gltfScene.scene.size = {
                      width:
                        scale *
                        moduleData.module.size.width *
                        kitchen[currentStep].scale,
                      depth: scale * moduleData.module.size.depth,
                      height: scale * moduleData.module.size.height,
                    };
                  }

                  if (index == 0) {
                    // Đưa về trục tọa độ
                    gltfScene.scene.position.y =
                      kitchen[currentStep].position.y * scale +
                      productInfo.camera.rotateY;
                    gltfScene.scene.position.x =
                      kitchen[currentStep].position.x * scale;
                    gltfScene.scene.position.z =
                      kitchen[currentStep].position.z * scale +
                      gltfScene.scene.size.width * cosValue;
                  } else {
                    const objectPre =
                      kitchen[currentStep].lstModule[index - 1]?.mainModule
                        ?.gltf;

                    gltfScene.scene.position.x =
                      objectPre.position.x +
                      (kitchen[currentStep].direction.x >= 0
                        ? objectPre.size.width
                        : gltfScene.scene.size.width) *
                        kitchen[currentStep].direction.x;
                    gltfScene.scene.position.y =
                      objectPre.position.y +
                      (kitchen[currentStep].direction.y >= 0
                        ? objectPre.size.height
                        : gltfScene.scene.size.height) *
                        kitchen[currentStep].direction.y;
                    gltfScene.scene.position.z =
                      objectPre.position.z +
                      (kitchen[currentStep].direction.z >= 0
                        ? gltfScene.scene.size.width
                        : objectPre.size.width) *
                        kitchen[currentStep].direction.z;
                  }
                  gltfScene.scene.rotateY(
                    (kitchen[currentStep].position.rotation * Math.PI) / 180
                  );

                  // const boxVertices = getSizeModule(gltfScene.scene);
                  // const w = 425 * scaleLeft * moduleData.indexDesign;
                  // draw(boxVertices, w, 800, 600);

                  if (main) {
                    textureLoader.load(
                      moduleData.texture?.imgUrl,
                      (texture) => {
                        main.traverse((node) => {
                          if (node.isMesh) {
                            texture.wrapS = THREE.RepeatWrapping;
                            texture.wrapT = THREE.RepeatWrapping;

                            let desiredWidth = 2400;
                            let desiredHeight = 1200;
                            let originalWidth = texture.image.width;
                            let originalHeight = texture.image.height;
                            let scaleWidth = desiredWidth / originalWidth;
                            let scaleHeight = desiredHeight / originalHeight;
                            texture.repeat.set(scaleWidth, scaleHeight);

                            node.material.map = texture;
                          }
                        });
                      }
                    );
                  }

                  const userData = {
                    step: currentStep,
                    index: currentIndex,
                  };

                  gltfScene.scene.userData = userData;
                  gltfScene.scene.castShadow = true;

                  kitchen[currentStep].lstModule[index].mainModule.gltf =
                    gltfScene.scene;
                  setKitchen(kitchen);
                  display.scene.add(gltfScene.scene);
                  // console.log("Xong rồi nè");
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

  const handleAddModule = (moduleData) => {
    if (
      moduleData?.module?.glbUrl &&
      moduleData.module.type != 1
      // &&
      // moduleData.module.type != 3
    ) {
      console.log("MAIN");
      let newKitchen = [...kitchen];

      newKitchen[currentStep].lstModule[currentIndex].mainModule = moduleData;

      newKitchen[currentStep].totalIndexDesign = calculateTotalIndexDesign(
        newKitchen[currentStep].lstModule
      );
      newKitchen[currentStep].stepTotalPrice = calculateTotalPrice(
        newKitchen[currentStep].lstModule
      );

      setKitchen(newKitchen);
    } else if (
      moduleData?.module?.type === TypeModule.SUBMODULE ||
      moduleData?.type === "sub"
    ) {
      let newKitchen = [...kitchen];

      if (
        newKitchen[currentStep].lstModule[currentIndex].lstSubModule[indexSub]
          ?.module?.glbUrl !== moduleData?.module?.glbUrl
      ) {
        display.scene.remove(
          kitchen[currentStep].lstModule[currentIndex].lstSubModule[indexSub]
            ?.gltf
        );
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
      console.log("UPDATE MAIN");
      setKitchen((prevKitchen) => {
        let newKitchen = [...prevKitchen];

        newKitchen[currentStep].lstModule[currentIndex].mainModule = moduleData;

        newKitchen[currentStep].totalIndexDesign = calculateTotalIndexDesign(
          newKitchen[currentStep].lstModule
        );
        newKitchen[currentStep].stepTotalPrice = calculateTotalPrice(
          newKitchen[currentStep].lstModule
        );

        return newKitchen;
      });
    } else if (
      moduleData?.module?.type === TypeModule.SUBMODULE &&
      moduleData?.module?.glbUrl !==
        kitchen[currentStep].lstModule[currentIndex].lstSubModule[indexSub]
          ?.module?.glbUrl
    ) {
      console.log("UPDATE SUB");
      setKitchen((prevKitchen) => {
        let newKitchen = [...prevKitchen];

        newKitchen[currentStep].lstModule[currentIndex].lstSubModule[indexSub] =
          moduleData;

        return newKitchen;
      });
    }
  };

  const handleChangeStep = () => {
    setCurrentStep(executingStep + 1);
    setExecutingStep(executingStep + 1);

    setCurrentIndex(0);
    setExecutingIndex(0);
    setCabinetLatest(null);
    setDoorLatest(null);
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
      setCabinetLatest(null);
      setDoorLatest(null);
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
      setCabinetLatest(null);
      setDoorLatest(null);
      setMainModule(mainNull);
      setSubModule(subNull);
      setExecutingModule(null);
      setCurrentDU(1);
      setExecutingDU(1);
    }
  };

  useEffect(() => {
    if (productInfo && display === null) {
      display = new SceneInit("myThreeJsCanvas", productInfo);
      display.initialize(productInfo);
      display.setZoom(defaultZoom);

      // const axesHelper = new THREE.AxesHelper(100);
      // axesHelper.position.set(0, -30, 0);
      // display.scene.add(axesHelper);

      display.setBackgroundGlb(productInfo);
      display.animate();
    }

    if (productInfo && kitchen.length === 0) {
      dispatch(getStepDetailAction(productInfo.listStep[currentStep]?._id));

      const md = { mainModule: null, lstSubModule: [] };
      var listStep = [];

      productInfo.listStep.forEach((step) => {
        listStep.push({
          name: step.name,
          position: step.position,
          direction: step.direction,
          scale: step.scale,
          baseScale: step.baseScale,
          groupPuzzle: step.groupPuzzle,
          designUnit: step.designUnit,
          designUnitOriginal: step.designUnit,
          stepId: step._id,
          scale: step.scale,
          scaleOriginal: step.scale,
          stepsWeightLoss: step.stepsWeightLoss,
          stepsWife: step.stepsWife,
          lstModule: Array(step.designUnit)
            .fill()
            .map(() => ({ ...md })),
          totalIndexDesign: 0,
          stepTotalPrice: 0,
        });
      });

      setKitchen(listStep);
    }
  }, [display, productInfo]);

  useEffect(() => {
    dispatch(getMaterialAction(5, 1));
    dispatch(getTextureAction(100, 1));

    setScaleLeft(1);
    setScaleRight(1);

    setBaseMeasureLeft(
      countBaseMeasure(
        lstMeasure?.duoiTrai,
        countDesignUnit(lstMeasure?.duoiTrai)
      )
    );
    setBaseMeasureRight(
      countBaseMeasure(
        lstMeasure?.duoiPhai,
        countDesignUnit(lstMeasure?.duoiPhai)
      )
    );

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

      newKitchen[currentStep].totalIndexDesign = calculateTotalIndexDesign(
        newKitchen[currentStep].lstModule
      );
      newKitchen[currentStep].stepTotalPrice = calculateTotalPrice(
        newKitchen[currentStep].lstModule
      );

      setKitchen(newKitchen);
    }
  }, [currentStep, currentIndex, kitchen]);

  useEffect(() => {
    setTabOption("0");
  }, [currentStep, currentIndex]);

  function setTemporaryOpacity(group, duration) {
    const targetOpacity = 0.2;
    const endOpacity = 1;
    const startTime = performance.now();
    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);
      let opacity;

      if (progress < 0.5) {
        opacity = 1 - (1 - targetOpacity) * (progress * 2);
      } else {
        opacity =
          targetOpacity + (endOpacity - targetOpacity) * ((progress - 0.5) * 2);
      }

      group.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
          const originalMaterial = child.material;
          const temporaryMaterial = originalMaterial.clone();
          temporaryMaterial.transparent = true;
          temporaryMaterial.opacity = opacity;
          child.material = temporaryMaterial;
        }
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }

  useEffect(() => {
    if (tabSelected.step !== null && tabSelected.index !== null) {
      const mData =
        kitchen[tabSelected.step].lstModule[tabSelected.index]?.mainModule;
      const lsData =
        kitchen[tabSelected.step].lstModule[tabSelected.index]?.lstSubModule;

      setModelClicked(null);

      const mainObject = display.scene.getObjectByProperty(
        "uuid",
        mData?.gltf?.uuid
      );

      if (mainObject) {
        setTemporaryOpacity(mainObject, 1000);
      }

      lsData.forEach((subModule) => {
        const subObject = display.scene.getObjectByProperty(
          "uuid",
          subModule?.gltf?.uuid
        );

        if (subObject) {
          setTemporaryOpacity(subObject, 1000);
        }
      });

      // const glbObject = display.scene.getObjectByProperty(
      //   "uuid",
      //   mData?.gltf?.uuid
      // );

      // if (glbObject) {
      //   setTemporaryOpacity(glbObject, 0.3);
      //   setTimeout(() => {
      //     setTemporaryOpacity(glbObject, 1)
      //   }, 1000);
      // }
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

          newKitchen[currentStep].totalIndexDesign = calculateTotalIndexDesign(
            newKitchen[currentStep].lstModule
          );

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

      const mainObject = display.scene.getObjectByProperty(
        "uuid",
        mData?.gltf?.uuid
      );

      if (mainObject) {
        setTemporaryOpacity(mainObject, 1000);
      }

      lsData.forEach((subModule) => {
        const subObject = display.scene.getObjectByProperty(
          "uuid",
          subModule?.gltf?.uuid
        );

        if (subObject) {
          setTemporaryOpacity(subObject, 1000);
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
        handleMouseDown(event, display, setModelClicked, setTabSelected);
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
      dispatch(getStepDetailAction(productInfo.listStep[currentStep]?._id));
    }
  }, [currentStep]);

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
            countCurrentTotalDesign(stepWife, indx) === itemLover?.totalDesign
          ) {
            for (let i = indx; i < stepWife.designUnit; i++) {
              if (stepWife.lstModule[i].mainModule != null) {
                stepWife.totalIndexDesign -=
                  stepWife.lstModule[i].mainModule?.indexDesign;
              }
              onlyRemoveModule(display, stepWife.lstModule, i);
            }
            break;
          }
        }
      });
    }

    if (mainModule?.module?.glbUrl !== mainSelected?.module?.glbUrl) {
      display.scene.remove(mainSelected?.gltf);
      kitchen[currentStep]?.lstModule[currentIndex]?.lstSubModule?.forEach(
        (sub, index) => {
          const test = sub;
          display.scene.remove(sub.gltf);
        }
      );
      if (kitchen[currentStep]?.lstModule[currentIndex]?.lstSubModule) {
        kitchen[currentStep].lstModule[currentIndex].lstSubModule = [];
      }
      kitchen[currentStep].lstModule[currentIndex].lstSubModule = [];
      if (mainModule?.indexDesign !== mainSelected?.indexDesign) {
        if (
          kitchen[currentStep].totalIndexDesign >
          kitchen[currentStep].designUnit
        ) {
          removeLastModule(display, kitchen[currentStep]);
        }
      }

      const taskLoad = loadGLTFModel(mainModule, currentIndex);
      taskLoad.then((module) => {
        kitchen[currentStep].lstModule[
          currentIndex
        ].mainModule.module.listSubmodule.forEach((item, index) => {
          if (item.require === true) {
            const subModuleData = {
              module: item.listModule[0],
            };
            indexSub = index;
            handleAddModule(subModuleData);
            loadGLTFModel(subModuleData, currentIndex);
          }
        });

        console.log("Tất cả tác vụ đã hoàn thành.", module);

        if (
          mainModule?.module?.type === TypeModule.LOVER_MODULE ||
          mainSelected?.module?.type === TypeModule.LOVER_MODULE
        ) {
          resetBaseScale();
        }
        kitchen.forEach((_, index) => {
          refresh3D(display, index, productInfo, kitchen);

          if (
            mainModule?.indexDesign !== mainSelected?.indexDesign ||
            mainModule?.module?.type !== mainSelected?.module?.type
          ) {
            const stepId = kitchen[currentStep].stepId;

            refreshModuleScale(display, index, productInfo, kitchen, stepId);
          }
        });
      });

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
            case 2:
              if (
                kitchen[currentStep].lstModule[index - 1]?.mainModule.module
                  .type === TypeModule.IMPACT_MODULE
              ) {
                break;
              } else {
                kitchen[currentStep].stepsWeightLoss.forEach((step) => {
                  const stepLoss = kitchen.find(
                    (kitchenItem) => kitchenItem.stepId === step
                  );
                  const newDesignUnit =
                    totalIndexToImpact - itemModule.mainModule.indexDesign;
                  if (newDesignUnit <= stepLoss.designUnitOriginal) {
                    stepLoss.designUnit = newDesignUnit;
                  } else {
                    stepLoss.designUnit = stepLoss.designUnitOriginal;
                  }
                  for (let i = stepLoss.lstModule.length - 1; i >= 0; i--) {
                    if (
                      stepLoss.lstModule[i].mainModule != null &&
                      stepLoss.totalIndexDesign > stepLoss.designUnit
                    ) {
                      stepLoss.totalIndexDesign -=
                        stepLoss.lstModule[i].mainModule.indexDesign;
                      onlyRemoveModule(display, stepLoss.lstModule, i);
                    }
                  }
                });
              }
              break;

            case 5:
              kitchen[currentStep].stepsWife?.forEach((wife) => {
                const kitchenWife = kitchen.find((item) => item.stepId == wife);

                const wifeModuleInfo = {
                  moduleUuid: itemModule.mainModule?.uuid,
                  totalDesign:
                    totalIndexToImpact - itemModule.mainModule.indexDesign,
                  module: itemModule.mainModule.module,
                };
                kitchenWife.listModuleLover.push(wifeModuleInfo);
              });
              break;

            default:
              if (itemModule.mainModule !== null) {
                kitchen[currentStep].stepsWeightLoss.forEach((step) => {
                  const stepLoss = kitchen.find(
                    (kitchenItem) => kitchenItem.stepId === step
                  );
                  stepLoss.designUnit = stepLoss.designUnitOriginal;
                });
              }
              break;
          }
        }
      }

      kitchen[currentStep]?.stepsWife.forEach((stepId) => {
        const stepWife = kitchen.find((stepWife) => stepWife.stepId === stepId);
        const itemLover = stepWife.listModuleLover?.find(
          (item) => item.moduleUuid === mainSelected?.uuid
        );
        if (stepWife.listModuleLover) {
          if (itemLover) {
            for (const [indx, module] of stepWife.lstModule.entries()) {
              if (
                countCurrentTotalDesign(stepWife, indx) +
                  module?.mainModule?.module?.indexDesign >
                itemLover?.totalDesign
              ) {
                for (let i = indx; i < stepWife.designUnit; i++) {
                  if (stepWife.lstModule[i].mainModule != null) {
                    stepWife.totalIndexDesign -=
                      stepWife.lstModule[i].mainModule?.indexDesign;
                  }
                  onlyRemoveModule(display, stepWife.lstModule, i);
                }
              }
            }
          } else {
            for (const itemLover of stepWife.listModuleLover) {
              for (const [indx, moduleItem] of stepWife.lstModule.entries()) {
                if (
                  countCurrentTotalDesign(stepWife, indx) +
                    moduleItem?.mainModule?.module?.indexDesign -
                    itemLover?.totalDesign <
                    itemLover.module.indexDesign &&
                  countCurrentTotalDesign(stepWife, indx) +
                    moduleItem?.mainModule?.module?.indexDesign >
                    itemLover?.totalDesign
                ) {
                  for (let i = indx; i < stepWife.designUnit; i++) {
                    if (stepWife.lstModule[i].mainModule != null) {
                      stepWife.totalIndexDesign -=
                        stepWife.lstModule[i].mainModule?.indexDesign;
                    }
                    onlyRemoveModule(display, stepWife.lstModule, i);
                  }
                  break;
                }
              }
            }
          }
        }
      });
    }
  }, [kitchen, mainSelected]);

  useEffect(() => {
    console.log("KITCHENS: ", kitchen);
  }, [kitchen]);

  useEffect(() => {
    if (
      mainModule &&
      mainModule.module?.glbUrl !== null &&
      mainModule.module?.glbUrl !==
        kitchen[currentStep]?.lstModule[currentIndex]?.mainModule?.module
          ?.glbUrl
    ) {
      handleAddModule(mainModule);
      console.log("handleAddModule");

      // if (kitchen[currentStep].lstModule[currentIndex]?.lstSubModule.length !==
      //   0) {
      //   setTimeout(() => {
      //     if (
      //       mainModule?.module?.glbUrl &&
      //       subModule.module === null
      //     ) {
      //       let newKitchen = [...kitchen];

      //       newKitchen[currentStep].lstModule[currentIndex].lstSubModule = [];

      //       setKitchen(newKitchen);
      //     }
      //   }, 1000);
      // }
    }
  }, [mainModule]);

  useEffect(() => {
    setLstTab(() => {
      const newItems =
        stepDetail?.typeModules
          .find((module) => module.require === mainModule?.module?.require)
          ?.listModule?.find((md) => md._id === mainModule?.module?._id)
          ?.listSubmodule?.map((item) => item.nameCollection) || [];

      const updatedLstTab = ["Cabinet", ...newItems];

      return updatedLstTab;
    });

    setLstSub(
      stepDetail?.typeModules
        .find((module) => module.require === mainModule?.module?.require)
        ?.listModule?.find((md) => md._id === mainModule?.module?._id)
        ?.listSubmodule
    );
  }, [mainModule, stepDetail]);

  useEffect(() => {
    if (mainModule?.module?.glbUrl && subModule?.module?.glbUrl !== null) {
      console.log("ADD sub");
      console.log(subModule);

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
        console.log("CASE 3: ADD MAIN");

        display.scene.remove(
          kitchen[currentStep].lstModule[currentIndex].mainModule.gltf
        );
        kitchen[currentStep].lstModule[currentIndex]?.lstSubModule.forEach(
          (sub) => {
            display.scene.remove(sub?.gltf);
          }
        );

        loadGLTFModel(mainModule, currentIndex);
      } else if (
        mainModule?.module?.glbUrl &&
        prevMainModule?.module?.glbUrl === mainModule.module?.glbUrl &&
        (prevMainModule?.material?.icon !== mainModule.material?.icon ||
          prevMainModule?.texture?.imgUrl !== mainModule.texture?.imgUrl)
      ) {
        console.log("CASE 3: ADD MAIN TEXTURE");

        const glbObject = display.scene.getObjectByProperty(
          "uuid",
          mainModule?.gltf?.uuid
        );
        const mainObject = glbObject.getObjectByName("MAIN");

        handleChangeTexture(mainObject, mainModule?.texture?.imgUrl);
        handleUpdateModule(mainModule);
      }
    }

    if (
      executingModule !== null &&
      mainModule &&
      mainModule.module?.glbUrl &&
      mainModule.module?.glbUrl !== null &&
      kitchen[executingStep].totalIndexDesign ===
        kitchen[executingStep].designUnit
    ) {
      setShowNextStep(true);
    } else {
      setShowNextStep(false);
    }
  }, [kitchen, mainModule]);

  useEffect(() => {
    if (display) {
      if (
        mainModule?.module?.glbUrl &&
        (subModule?.module?.glbUrl || subModule === subNull) &&
        prevSubModule?.module?.glbUrl !== subModule?.module?.glbUrl
      ) {
        if (subModule !== subNull) {
          console.log("CASE 4: ADD SUB");

          if (subModule !== subSelected) {
            loadGLTFModel(subModule, currentIndex);
          }
        }
      } else if (
        mainModule?.module?.glbUrl &&
        prevSubModule?.module?.glbUrl === subModule?.module?.glbUrl &&
        prevSubModule?.texture?.imgUrl !== subModule?.texture?.imgUrl
      ) {
        console.log("CASE 4: ADD SUB TEXTURE");

        const glbObject = display.scene.getObjectByProperty(
          "uuid",
          subModule?.gltf?.uuid
        );

        const subObject = glbObject.getObjectByName("DOOR");

        handleChangeTexture(subObject, subModule.texture.imgUrl);
      }
    }
  }, [kitchen, subModule]);

  const value = {
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

    setCabinetLatest,
    setDoorLatest,
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

    tabOption,

    handleComplete,
    handleChangeStep,
    handleSetNullModule,

    handleZoomIn,
    handleZoomOut,
    calculateTotalIndexDesign,
  };

  return (
    <KitchenContext.Provider value={value}>
      <div className="customDesign">
        <div className="customDesign__header">
          <button
            className="btn-border-rounded"
            onClick={() => {
              navigate("/");
            }}
          >
            Về trang chủ
          </button>

          <div
            className="d-flex flex-row justify-content-end"
            style={{ gap: "80px" }}
          >
            <div
              className="d-flex flex-row align-items-center"
              style={{ gap: "8px" }}
            >
              <button className="btn-noborder">
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
              </button>
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

              <button className="btn-border-rounded">
                <LuSave />
                Lưu
              </button>

              <button className="btn-complete">Hoàn Thành</button>
            </div>

            {showBoxSize && <BoxSize setShowBoxSize={setShowBoxSize} />}
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
                  onChange={onChange}
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
                          <MainOption />
                        ) : i !== 0 && lstSub ? (
                          <SubOption data={lstSub[i - 1]} />
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

            <canvas id="myThreeJsCanvas" />

            <div className="container-zoom">
              <Zoom />
            </div>
          </div>
        </div>
      </div>
    </KitchenContext.Provider>
  );
}
