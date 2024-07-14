import { usePrevious } from "@uidotdev/usehooks";
import { InputNumber, Slider } from "antd";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import * as THREE from "three";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { v4 as uuidv4 } from "uuid";
import { AppContext } from "../../App.js";
import VirtualSceneInitDemo from "../../lib/VirtualSceneInitDemo.js";
import { calculateTotalIndexDesign } from "../../utils/function.js";
import {
  convertDataVirtual,
  handleEditDesignVirtual,
  handleMouseDown,
  handleSaveDesignVirtual,
  reloadGLTFModel,
} from "../../utils/virtual.js";
import Loading from "../Loading/Loading.jsx";
import VirtualDetailDemo from "../VirtualOption/VirtualDetailDemo.jsx";
import VirtualMainOptionDemo from "../VirtualOption/VirtualMainOptionDemo.jsx";
import ProductList from "../ProductList/ProductList.jsx";
import {
  getDesignVirtualDetailAction,
  clearDesignVirtualDetailAction,
} from "../../store/actions/designVirtualDetail.action";
import "./VirtualDemo.scss";
import queryString from "query-string";
import toast from "react-hot-toast";

export const VirtualContextDemo = createContext();

const scale = 1.1;

const X = 5;
const Y = 3.08;
const Z = 5;

let sceneMeshes = [];

var display = null;
let savedKitchen = [];
// const glftLoader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();

const mainNull = {
  gltf: null,
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

let listStepDetail = [];

export default function VirtualDemo() {
  const appContext = useContext(AppContext);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const projectNameRef = useRef();

  const [defaultZoom, setDefaultZoom] = useState(35);
  const [tabOption, setTabOption] = useState("0");

  const [currentIndex, setCurrentIndex] = useState(0);
  const [clickedIndex, setClickedIndex] = useState(0);

  const [currentDU, setCurrentDU] = useState(0);

  const [onDrag, setOnDrag] = useState(false);

  const [dependentStep, setDependentStep] = useState(null);
  const [typeModuleId, setTypeModuleId] = useState(null);
  const [typePrice, setTypePrice] = useState(null);

  const [recommended, setRecommended] = useState({
    moduleType: null,
    material: null,
    texture: null,
  });

  const [rotation, setRotation] = useState(0);

  const [executingStep, setExecutingStep] = useState(0);
  const [executingIndex, setExecutingIndex] = useState(0);
  const [executingDU, setExecutingDU] = useState(0);
  const [executingTotalDU, setExecutingTotalDU] = useState(0);
  const [executingModule, setExecutingModule] = useState();

  const [checkChange, setCheckChange] = useState(false);
  const [checkSwap, setCheckSwap] = useState(false);

  const [modelClicked, setModelClicked] = useState(null);

  const [mainSelected, setMainSelected] = useState(null);

  const [tabSelected, setTabSelected] = useState({ step: null, index: null });
  const [checkReload, setCheckReload] = useState(true);

  const [trademark, setTrademark] = useState();

  const [mainModule, setMainModule] = useState(mainNull);
  const prevMainModule = usePrevious(mainModule);

  const [lstSub, setLstSub] = useState(null);
  const [lstTab, setLstTab] = useState(["Featured products"]);

  const [projectName, setProjectName] = useState();

  const [stepDetail, setStepDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [showProductList, setShowProductList] = useState(false);

  let [kitchen, setKitchen] = useState([]);

  const trademarkRef = useRef();
  const canvasRef = useRef(null);

  const { lstMaterial } = useSelector((state) => state.material);
  const { lstTexture } = useSelector((state) => state.texture);
  const { designVirtualDetail } = useSelector(
    (state) => state.designVirtualDetail
  );

  const location = useLocation();
  const { roomDetail } = location.state || {};
  const { designId, productId } = queryString.parse(location.search);

  let options = [];

  const handleRotate = (deg) => {
    kitchen[clickedIndex].gltf?.rotation.set(
      kitchen[clickedIndex].gltf.rotation._x,
      (deg * Math.PI) / 180,
      kitchen[clickedIndex].gltf.rotation._z
    );

    sceneMeshes[clickedIndex]?.rotation.set(
      sceneMeshes[clickedIndex].rotation._x,
      (deg * Math.PI) / 180,
      sceneMeshes[clickedIndex].rotation._z
    );

    setRotation(deg);
  };

  const loadGLTFModel = async (moduleData, index) => {
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
          setIsLoading(true);

          glftLoader.load(
            `${process.env.REACT_APP_URL}uploads/virtuals/modules/${moduleData.module.glbUrl}`,
            // `${moduleData.module.glbUrl}`,

            (gltfScene) => {
              let boundingBox;

              gltfScene.scene.traverse((child) => {
                if (child.isMesh) {
                  // child.material.metalness = 0;
                  // child.material.roughness = 0.55;
                  child.castShadow = true;
                  // child.receiveShadow = true;
                }

                if (!boundingBox) boundingBox = new THREE.Box3();
                boundingBox.expandByObject(child);
              });
              // const main = gltfScene.scene.getObjectByName("MAIN");

              gltfScene.scene.scale.set(scale, scale, scale);

              gltfScene.scene.position.y = -Y / 2;
              gltfScene.scene.position.x = Math.random() * 0.5;
              gltfScene.scene.position.z = Math.random() * 0.5;

              const size = new THREE.Vector3();
              boundingBox.getSize(size);

              const modelDragBox = new THREE.Mesh(
                new THREE.BoxGeometry(size.x, size.y, size.z),
                new THREE.MeshBasicMaterial({
                  transparent: true,
                  opacity: 0,
                  depthWrite: false,
                })
              );
              modelDragBox.position.copy(gltfScene.scene.position);
              modelDragBox.rotation.copy(gltfScene.scene.rotation);
              modelDragBox.scale.set(1.15, 1.15, 1.15);
              modelDragBox.geometry.translate(0, size.y / 2, 0);
              modelDragBox.geometry.computeBoundingBox();
              modelDragBox.userData.currentPosition = new THREE.Vector3();
              modelDragBox.userData.index = index;
              modelDragBox.userData._id = moduleData.module._id;
              modelDragBox.name = "BOX";

              if (sceneMeshes[index]) {
                sceneMeshes[index] = modelDragBox;
              } else {
                sceneMeshes.push(modelDragBox);
              }

              display.scene.add(modelDragBox);

              const userData = {
                _id: moduleData.module._id,
                index: index,
                currentPosition: new THREE.Vector3(),
              };

              gltfScene.scene.userData = userData;

              let newKitchen = [...kitchen];

              console.log(newKitchen[index]);

              newKitchen[index].gltf = gltfScene.scene;
              newKitchen[index].box = modelDragBox;

              setKitchen(newKitchen);

              display.scene.add(gltfScene.scene);

              if (checkSwap) {
                setModelClicked(gltfScene.scene);
              }

              resolve(gltfScene);
              setMainModule(null);
              setIsLoading(false);
            }
          );
        }
      }
    });
  };

  const handleAddModule = (moduleData) => {
    let newKitchen = [...kitchen];

    if (newKitchen[currentIndex]?.module === null) {
      newKitchen[currentIndex].module = moduleData.module;
      newKitchen[currentIndex].material = moduleData.material;
      newKitchen[currentIndex].texture = moduleData.texture;
      newKitchen[currentIndex].price = moduleData.price;

      setKitchen(newKitchen);
    }
  };

  const handleUpdateModule = (moduleData, idx) => {
    let newKitchen = [...kitchen];

    newKitchen[idx].module = moduleData.module;
    newKitchen[idx].material = moduleData.material;
    newKitchen[idx].texture = moduleData.texture;
    newKitchen[idx].price = moduleData.price;

    setKitchen(newKitchen);
  };

  useEffect(() => {
    designId && dispatch(getDesignVirtualDetailAction(designId));

    return () => {
      dispatch(clearDesignVirtualDetailAction());
    };
  }, [designId]);

  useEffect(() => {
    designVirtualDetail && setProjectName(designVirtualDetail.name);
  }, [designVirtualDetail]);

  useEffect(() => {
    if (
      display &&
      designId &&
      designVirtualDetail &&
      designVirtualDetail.items &&
      savedKitchen.length === 0
    ) {
      const fetchData = async () => {
        for (const [index, item] of designVirtualDetail.items.entries()) {
          const newNullItem = {
            ...mainNull,
            uuid: uuidv4(),
          };

          savedKitchen.push(newNullItem);

          await reloadGLTFModel(
            item,
            index,
            display,
            sceneMeshes,
            savedKitchen,
            setKitchen,
            isLoading,
            setIsLoading
          );

          if (index === designVirtualDetail.items.length - 1) {
            setCurrentIndex(designVirtualDetail.items.length);
          }
        }
      };

      fetchData();
    }
  }, [display, savedKitchen, designVirtualDetail, designId]);

  useEffect(() => {
    if (display === null) {
      display = new VirtualSceneInitDemo("myThreeJsCanvas");
      display.initialize();
      display.setZoom(defaultZoom);

      // const axesHelper = new THREE.AxesHelper(2);
      // axesHelper.position.set(0, 0, 0);
      // display.scene.add(axesHelper);
      // const hdrUrl = new URL("/public/assets/meadow_8k.hdr", import.meta.url);
      // display.loadHDRAndSetupEnvironment(hdrUrl);
      display.setBackgroundGlb(roomDetail.glbUrl);

      display.animate();
    }
  }, [display]);

  useEffect(() => {
    return () => {
      display = null;
      savedKitchen = [];
    };
  }, []);

  useEffect(() => {
    if (!kitchen[currentIndex]) {
      let newKitchen = [...kitchen];
      newKitchen[currentIndex] = {
        ...mainNull,
        uuid: uuidv4(),
      };

      setKitchen(newKitchen);
    }
  }, [mainModule, currentIndex]);

  useEffect(() => {
    if (modelClicked !== null) {
      setClickedIndex(modelClicked.userData.index);

      setRotation(
        (kitchen[modelClicked.userData.index]?.gltf?.rotation?._y * 180) /
          Math.PI
      );
    }

    // START Xử lí click vào 1 module
    const canvas = document.getElementById("myThreeJsCanvas");

    canvas.addEventListener(
      "click",
      // "dblclick",
      (event) => {
        handleMouseDown(event, display, setModelClicked);
      },
      false
    );

    // canvas.addEventListener(
    //   "click",
    //   (event) => {
    //     // setModelClicked(null);
    //     handleMouseDown(event, display, setModelClicked);
    //   },
    //   false
    // );

    // if (display) {
    //   display.dragModel(sceneMeshes, kitchen);
    // }

    // END Xử lí click vào 1 module
  }, [clickedIndex, modelClicked, currentIndex]);

  useEffect(() => {
    if (display) {
      display.dragModel(sceneMeshes, kitchen);
    }
    console.log("KITCHEN: ", kitchen);
    console.log("sceneMeshes: ", sceneMeshes);
  }, [kitchen, sceneMeshes]);

  useEffect(() => {
    if (mainModule && mainModule.module?.glbUrl !== null) {
      // handleAddModule(mainModule);

      if (checkChange === true) {
        handleAddModule(mainModule);

        loadGLTFModel(mainModule, currentIndex).then(() => {
          setCurrentIndex(currentIndex + 1);
        });
      } else if (checkSwap) {
        handleUpdateModule(mainModule, clickedIndex);

        loadGLTFModel(mainModule, clickedIndex);
      }
    }
  }, [mainModule, checkChange, checkSwap, clickedIndex]);

  const value = {
    display,
    isLoading,
    lstMaterial,
    lstTexture,
    TypeModule,
    sceneMeshes,

    listStepDetail,

    modelClicked,
    setKitchen,

    mainModule,
    setMainModule,
    checkReload,
    setCheckReload,
    checkChange,
    setCheckChange,
    checkSwap,
    setCheckSwap,

    mainSelected,
    setMainSelected,

    trademark,
    trademarkRef,
    recommended,
    setRecommended,

    lstTab,
    setLstTab,
    lstSub,
    setLstSub,
    stepDetail,
    setStepDetail,

    setCurrentDU,

    setModelClicked,
    setCurrentIndex,
    clickedIndex,
    setClickedIndex,

    setIsLoading,
    showProductList,
    setShowProductList,

    dependentStep,
    setDependentStep,
    typeModuleId,
    setTypeModuleId,
    typePrice,
    setTypePrice,

    kitchen,
    currentDU,
    currentIndex,
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
    calculateTotalIndexDesign,
  };

  return (
    <VirtualContextDemo.Provider value={value}>
      <div className="virtualDesign">
        <div className="virtualDesign__header">
          <img
            className="virtualDesign__header__logo"
            src="./assets/logo/logo.png"
            alt="logo"
            onClick={() => navigate("/")}
          />

          <div className="project-name d-flex flex-row align-items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="25"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M5.83875 19H7.26375L17.0387 9.225L15.6137 7.8L5.83875 17.575V19ZM3.83875 21V16.75L17.0387 3.575C17.2387 3.39167 17.4596 3.25 17.7012 3.15C17.9429 3.05 18.1971 3 18.4637 3C18.7304 3 18.9887 3.05 19.2387 3.15C19.4887 3.25 19.7054 3.4 19.8887 3.6L21.2637 5C21.4637 5.18333 21.6096 5.4 21.7012 5.65C21.7929 5.9 21.8387 6.15 21.8387 6.4C21.8387 6.66667 21.7929 6.92083 21.7012 7.1625C21.6096 7.40417 21.4637 7.625 21.2637 7.825L8.08875 21H3.83875ZM16.3137 8.525L15.6137 7.8L17.0387 9.225L16.3137 8.525Z"
                fill="#565E64"
              />
            </svg>

            <input
              ref={projectNameRef}
              type="text"
              placeholder={projectName || "Project Name"}
              value={projectName}
              onChange={(e) => {
                setProjectName(e.target.value);
              }}
            />
          </div>

          <div>
            {/* <button className="btn-close">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M6.4 19L5 17.6L10.6 12L5 6.4L6.4 5L12 10.6L17.6 5L19 6.4L13.4 12L19 17.6L17.6 19L12 13.4L6.4 19Z"
                  fill="#414549"
                />
              </svg>
              CLose
            </button> */}

            <button
              className="btn-save d-flex flex-row align-items-center"
              onClick={() => {
                if (projectName) {
                  const dataConvert = convertDataVirtual(kitchen);

                  if (designId) {
                    handleEditDesignVirtual(
                      projectName,
                      roomDetail._id,
                      dataConvert,
                      designId
                    );
                  } else {
                    handleSaveDesignVirtual(
                      projectName,
                      roomDetail._id,
                      dataConvert
                    );
                  }
                } else {
                  toast.error("Bạn cần nhập tên cho thiết kế !!!");
                  projectNameRef.current.focus();
                }
              }}
            >
              <svg
                className="me-1"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M21 7V19C21 19.55 20.8042 20.0208 20.4125 20.4125C20.0208 20.8042 19.55 21 19 21H5C4.45 21 3.97917 20.8042 3.5875 20.4125C3.19583 20.0208 3 19.55 3 19V5C3 4.45 3.19583 3.97917 3.5875 3.5875C3.97917 3.19583 4.45 3 5 3H17L21 7ZM19 7.85L16.15 5H5V19H19V7.85ZM12 18C12.8333 18 13.5417 17.7083 14.125 17.125C14.7083 16.5417 15 15.8333 15 15C15 14.1667 14.7083 13.4583 14.125 12.875C13.5417 12.2917 12.8333 12 12 12C11.1667 12 10.4583 12.2917 9.875 12.875C9.29167 13.4583 9 14.1667 9 15C9 15.8333 9.29167 16.5417 9.875 17.125C10.4583 17.7083 11.1667 18 12 18ZM6 10H15V6H6V10ZM5 7.85V19V5V7.85Z"
                  fill="#414549"
                />
              </svg>
              Save
            </button>
          </div>
        </div>

        <div className="virtualDesign__body">
          <div className="control">
            <div className="control__main">
              {modelClicked?.userData?._id !== undefined ? (
                <VirtualDetailDemo module={modelClicked} />
              ) : (
                // <VirtualMainOptionDemo productId={roomDetail.productId} />
                <VirtualMainOptionDemo productId={productId} />
              )}
            </div>
          </div>

          <div id="container__canvas">
            {isLoading ? <Loading /> : null}

            <canvas id="myThreeJsCanvas" ref={canvasRef} />

            {showProductList && (
              <ProductList
                data={kitchen}
                setShowProductList={setShowProductList}
              />
            )}

            {modelClicked && (
              <div className="tool-bar">
                <div className="tool-bar__main">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M9 20L7.6 18.6L9.35 16.8C7.21667 16.5167 5.45833 15.9333 4.075 15.05C2.69167 14.1667 2 13.15 2 12C2 10.6167 2.9625 9.4375 4.8875 8.4625C6.8125 7.4875 9.18333 7 12 7C14.8167 7 17.1875 7.4875 19.1125 8.4625C21.0375 9.4375 22 10.6167 22 12C22 13.0333 21.4458 13.9583 20.3375 14.775C19.2292 15.5917 17.7833 16.2 16 16.6V14.55C17.2833 14.2167 18.2708 13.8042 18.9625 13.3125C19.6542 12.8208 20 12.3833 20 12C20 11.4667 19.2875 10.8333 17.8625 10.1C16.4375 9.36667 14.4833 9 12 9C9.51667 9 7.5625 9.36667 6.1375 10.1C4.7125 10.8333 4 11.4667 4 12C4 12.4 4.425 12.8792 5.275 13.4375C6.125 13.9958 7.33333 14.4167 8.9 14.7L7.6 13.4L9 12L13 16L9 20Z"
                      fill="#565E64"
                    />
                  </svg>

                  {/* <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M9 21H5C4.45 21 3.97917 20.8042 3.5875 20.4125C3.19583 20.0208 3 19.55 3 19V5C3 4.45 3.19583 3.97917 3.5875 3.5875C3.97917 3.19583 4.45 3 5 3H9V5H5V19H9V21ZM11 23V1H13V23H11ZM15 21V19H17V21H15ZM15 5V3H17V5H15ZM19 21V19H21C21 19.55 20.8042 20.0208 20.4125 20.4125C20.0208 20.8042 19.55 21 19 21ZM19 17V15H21V17H19ZM19 13V11H21V13H19ZM19 9V7H21V9H19ZM19 5V3C19.55 3 20.0208 3.19583 20.4125 3.5875C20.8042 3.97917 21 4.45 21 5H19Z"
                      fill="#565E64"
                    />
                  </svg>

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M6 19L2 15L3.4 13.55L5 15.15V8C5 6.9 5.39167 5.95833 6.175 5.175C6.95833 4.39167 7.9 4 9 4C10.1 4 11.0417 4.39167 11.825 5.175C12.6083 5.95833 13 6.9 13 8V15C13 15.55 13.1958 16.0208 13.5875 16.4125C13.9792 16.8042 14.45 17 15 17C15.55 17 16.0208 16.8042 16.4125 16.4125C16.8042 16.0208 17 15.55 17 15V7.85L15.4 9.45L14 8L18 4L22 8L20.6 9.45L19 7.85V15C19 16.1 18.6083 17.0417 17.825 17.825C17.0417 18.6083 16.1 19 15 19C13.9 19 12.9583 18.6083 12.175 17.825C11.3917 17.0417 11 16.1 11 15V8C11 7.45 10.8042 6.97917 10.4125 6.5875C10.0208 6.19583 9.55 6 9 6C8.45 6 7.97917 6.19583 7.5875 6.5875C7.19583 6.97917 7 7.45 7 8V15.15L8.6 13.55L10 15L6 19Z"
                      fill="#565E64"
                    />
                  </svg>

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M19 19H8C7.45 19 6.97917 18.8042 6.5875 18.4125C6.19583 18.0208 6 17.55 6 17V3C6 2.45 6.19583 1.97917 6.5875 1.5875C6.97917 1.19583 7.45 1 8 1H15L21 7V17C21 17.55 20.8042 18.0208 20.4125 18.4125C20.0208 18.8042 19.55 19 19 19ZM14 8V3H8V17H19V8H14ZM4 23C3.45 23 2.97917 22.8042 2.5875 22.4125C2.19583 22.0208 2 21.55 2 21V7H4V21H15V23H4Z"
                      fill="#565E64"
                    />
                  </svg> */}

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    onClick={() => {
                      if (modelClicked) {
                        display.scene.remove(
                          kitchen[modelClicked.userData.index]?.gltf
                        );
                        display.scene.remove(
                          kitchen[modelClicked.userData.index]?.box
                        );

                        sceneMeshes.splice(modelClicked.userData.index, 1);

                        let newKitchen = [...kitchen];

                        newKitchen[modelClicked.userData.index] = null;

                        setKitchen(newKitchen);
                      }

                      setModelClicked(null);
                    }}
                  >
                    <path
                      d="M7 21C6.45 21 5.97917 20.8042 5.5875 20.4125C5.19583 20.0208 5 19.55 5 19V6H4V4H9V3H15V4H20V6H19V19C19 19.55 18.8042 20.0208 18.4125 20.4125C18.0208 20.8042 17.55 21 17 21H7ZM17 6H7V19H17V6ZM9 17H11V8H9V17ZM13 17H15V8H13V17Z"
                      fill="#565E64"
                    />
                  </svg>
                </div>

                <div className="tool-bar__sub">
                  <Slider
                    min={-180}
                    max={180}
                    value={rotation}
                    onChange={handleRotate}
                    style={{ width: "150px" }}
                  />

                  <InputNumber
                    min={-180}
                    max={180}
                    value={rotation}
                    onChange={handleRotate}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </VirtualContextDemo.Provider>
  );
}
