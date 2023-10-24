import * as THREE from "three";
import callApi from "./callApi";
import Cookie from "js-cookie";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const glftLoader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();

const TypeModule = {
  MAIN_MODULE: 0,
  SUBMODULE: 1,
  IMPACT_MODULE: 2,
  SCALE_MODULE: 3,
  REQUIRE_MODULE: 4,
  LOVER_MODULE: 5,
  NULL_MODULE: 6,
};

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

let clickedObject = null;
let check = false;
const subY = -50;

function myRound(number) {
  const decimalPart = number - Math.floor(number);
  return decimalPart >= 0.5 ? Math.ceil(number) : Math.floor(number);
}

export function countDesignUnit(width) {
  const w = (width - 600) / 425;
  return myRound(w);
}

export function countBaseMeasure(width, designUnit) {
  const base = (width - 600) / designUnit;

  return base;
}

export function countScale(width, DU) {
  const w = (width - 600) / DU;

  const scale = w / 425;
  return scale;
}

// export function setTemporaryOpacity(group, opacity) {
//   group.traverse(function (child) {
//     if (child instanceof THREE.Mesh) {
//       var originalMaterial = child.material;
//       var temporaryMaterial = originalMaterial.clone();
//       temporaryMaterial.transparent = true;
//       temporaryMaterial.opacity = opacity;
//       child.material = temporaryMaterial;
//     }
//   });
// }

export const calculateTotalIndexDesign = (lstModule) => {
  return lstModule.reduce((total, item) => {
    if (item.mainModule && item.mainModule.indexDesign) {
      return total + item.mainModule.indexDesign;
    }

    return total;
  }, 0);
};

export const calculateTotalPrice = (lstModule) => {
  return lstModule.reduce((totalPrice, item) => {
    if (item.mainModule && item.mainModule.price) {
      return totalPrice + item.mainModule.price;
    }

    return totalPrice;
  }, 0);
};

export function findFirstNull(arr) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].mainModule === null) {
      return i;
    }
  }
  return -1;
}

export function getListModule(stepDetail, currentKitchen) {
  currentKitchen?.listModuleLover?.forEach((itemLover) => {
    if (itemLover.totalDesign === currentKitchen.totalIndexDesign) {
      return itemLover.module.listWifeModule;
    }
  });
  if (
    stepDetail?.typeModules.find((module) => module.require === false)
      .listModule
  ) {
    return stepDetail?.typeModules.find((module) => module.require === false)
      .listModule;
  } else {
    return [];
  }
}

export function removeModule3D(display, idx, width, kitchen) {
  kitchen.lstModule.forEach((module, i) => {
    if (i >= idx) {
      if (i === idx) {
        display.scene.remove(module?.mainModule?.gltf);
        module?.lstSubModule.forEach((subModule) => {
          display.scene.remove(subModule?.gltf);
        });

        module.lstSubModule = [];
      } else if (i > idx && module?.mainModule?.gltf?.position) {
        const mainObject = display.scene.getObjectByProperty(
          "uuid",
          module?.mainModule?.gltf?.uuid
        );

        mainObject.position.x =
          module.mainModule.gltf.position.x + width * kitchen.direction.x;
        mainObject.position.z =
          module.mainModule.gltf.position.z + width * kitchen.direction.z;

        if (module.lstSubModule.length !== 0) {
          module.lstSubModule.forEach((subModule) => {
            const subObject = display.scene.getObjectByProperty(
              "uuid",
              subModule?.gltf?.uuid
            );

            subObject.position.x =
              subModule.gltf.position.x + width * kitchen.direction.x;
            subObject.position.z =
              subModule.gltf.position.z + width * kitchen.direction.z;
          });
        }
      }
    }
  });
}

export const getGLBSize = (glbModule) => {
  const boundingBox = new THREE.Box3().setFromObject(glbModule);

  const size = new THREE.Vector3();
  boundingBox.getSize(size);
  const width = size.z;
  const height = size.y;
  const depth = size.x;
  return [width, depth, height];
};

export const setCounterTop = (stepForXZ, pStart, isCounterTop) => {
  const lstModule = stepForXZ.lstModule;
  let lstPoint = [];
  let start = new THREE.Vector3(pStart.x, pStart.y, pStart.z);
  let end = null;
  let endSize = null;
  let stepId = stepForXZ._id;

  if (isCounterTop) {
    for (const [i, module] of lstModule.entries()) {
      if (module.mainModule !== null) {
        if (
          i !== 0 &&
          lstModule[i].mainModule.module.type === TypeModule.MAIN_MODULE &&
          (lstModule[i - 1].mainModule.module.type ===
            TypeModule.IMPACT_MODULE ||
            lstModule[i - 1].mainModule.module.type === TypeModule.LOVER_MODULE)
        ) {
          start = new THREE.Vector3(
            module.mainModule.gltf.position.x,
            pStart.y,
            module.mainModule.gltf.position.z -
              module.mainModule.gltf.size.width * stepForXZ.direction.z
          );
        }

        if (
          module.mainModule.module.type === TypeModule.MAIN_MODULE ||
          module.mainModule.module.type === TypeModule.REQUIRE_MODULE
        ) {
          end = new THREE.Vector3(
            module.mainModule.gltf.position.x,
            pStart.y,
            module.mainModule.gltf.position.z
          );
          endSize = module.mainModule.gltf.size;
        }

        if (module.mainModule.module.type === TypeModule.LOVER_MODULE) {
          lstPoint.push({
            start: start,
            end: end,
            endSize: endSize,
            stepId: stepId,
          });
        }

        if (
          i === lstModule.length - 1 ||
          module.mainModule.module.type === TypeModule.IMPACT_MODULE
        ) {
          lstPoint.push({
            start: start,
            end: end,
            endSize: endSize,
            stepId: stepId,
          });
          break;
        }
      } else {
        lstPoint.push({
          start: start,
          end: end,
          endSize: endSize,
          stepId: stepId,
        });
        break;
      }
    }
  } else {
    for (const [i, module] of lstModule.entries()) {
      if (module.mainModule !== null) {
        if (module.mainModule.module.type !== TypeModule.IMPACT_MODULE) {
          end = new THREE.Vector3(
            module.mainModule.gltf.position.x,
            pStart.y,
            module.mainModule.gltf.position.z
          );
          endSize = module.mainModule.gltf.size;
        }

        if (
          i === lstModule.length - 1 ||
          module.mainModule.module.type === TypeModule.IMPACT_MODULE
        ) {
          lstPoint.push({
            start: start,
            end: end,
            endSize: endSize,
            stepId: stepId,
          });
          break;
        }
      } else {
        lstPoint.push({
          start: start,
          end: end,
          endSize: endSize,
          stepId: stepId,
        });
        break;
      }
    }
  }

  return lstPoint;
};

export function refreshModuleScale(
  display,
  currentStep,
  productInfo,
  kitchen,
  stepId
) {
  if (kitchen[currentStep]?.groupPuzzle?.length > 0) {
    let change = false;
    kitchen[currentStep].groupPuzzle.forEach((puzzle) => {
      if (puzzle.forXZ === stepId) {
        change = true;
      }
    });

    if (change) {
      for (let i = 0; i < kitchen[currentStep].lstModule.length; i++) {
        if (kitchen[currentStep].lstModule[i].mainModule !== null) {
          const md = kitchen[currentStep].lstModule[i].mainModule;

          const combinedModelGroup = new THREE.Group();
          const scale = 30;
          let isCounterTop = true;

          function loadAndAddModelToGroup(
            group,
            point,
            forStepXZ,
            forStepY,
            puzzle,
            isCounterTop,
            indexGroup
          ) {
            if (isCounterTop) {
              display.scene.remove(
                kitchen[currentStep].lstModule[i].mainModule.gltf
              );

              glftLoader.load(
                `https://api.lanha.vn/profiles/module-glb/${md.module.glbUrl}`,
                (gltfScene) => {
                  const cosValue = Math.cos((puzzle.rotation * Math.PI) / 180);
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

                  gltfScene.scene.rotateY((puzzle.rotation * Math.PI) / 180);

                  const userData = {
                    step: currentStep,
                    index: i,
                  };

                  gltfScene.scene.userData = userData;
                  gltfScene.scene.castShadow = true;

                  textureLoader.load(md?.texture?.imgUrl, (texture) => {
                    gltfScene.scene.traverse((node) => {
                      if (node.isMesh) {
                        texture.wrapS = THREE.RepeatWrapping;
                        texture.wrapT = THREE.RepeatWrapping;

                        let desiredWidth = 2400 * 5;
                        let desiredHeight = 1200 * 5;
                        let originalWidth = texture.image.width;
                        let originalHeight = texture.image.height;
                        let scaleWidth = desiredWidth / originalWidth;
                        let scaleHeight = desiredHeight / originalHeight;

                        texture.repeat.set(scaleWidth, scaleHeight);

                        node.material.map = texture;
                      }
                    });
                  });

                  group.userData = userData;

                  group.add(gltfScene.scene);
                }
              );
            } else {
              let childGroup =
                kitchen[currentStep].lstModule[i].mainModule.gltf.children[
                  indexGroup
                ];

              const widthScale =
                ((point.end.x + point.endSize.width - point.start.x) *
                  forStepXZ.direction.x +
                  (point.end.z - point.start.z) * forStepXZ.direction.z) /
                kitchen[currentStep].lstModule[i].mainModule.module.size.width;

              childGroup.scale.z = widthScale;

              childGroup.position.z =
                puzzle.z +
                md.module.size.width * widthScale * forStepXZ.direction.z;
            }
          }

          let id = 0;
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
                item,
                isCounterTop,
                id
              );
            });

            id++;
          });

          if (isCounterTop) {
            const box = new THREE.Box3().setFromObject(combinedModelGroup);

            kitchen[currentStep].lstModule[i].mainModule.gltf =
              combinedModelGroup;
            kitchen[currentStep].lstModule[i].mainModule.physicalBox = box;
            combinedModelGroup.name = "MAIN";
            display.scene.add(combinedModelGroup);
          }
        }
      }
    }
  }
}

export function refresh3D(display, currentStep, productInfo, kitchen) {
  if (kitchen[currentStep]?.groupPuzzle?.length > 0) {
  } else {
    let totalX =
      kitchen[currentStep].position.x * 30 * kitchen[currentStep].direction.x;
    let totalY =
      kitchen[currentStep].position.y * 30 * kitchen[currentStep].direction.y;
    let totalZ =
      kitchen[currentStep].position.z * 30 * kitchen[currentStep].direction.z;
    const sineValue = Math.sin(
      (kitchen[currentStep].position.rotation * Math.PI) / 180
    );
    const cosValue = Math.cos(
      (kitchen[currentStep].position.rotation * Math.PI) / 180
    );

    for (let i = 0; i < kitchen[currentStep].lstModule.length; i++) {
      const md = kitchen[currentStep].lstModule[i];
      const mainObject = display.scene.getObjectByProperty(
        "uuid",
        md.mainModule?.gltf.uuid
      );
      if (mainObject) {
        if (md.mainModule?.module?.type === TypeModule.LOVER_MODULE) {
          mainObject.scale.z = 30;
          mainObject.size = {
            width: 30 * md.mainModule.module.size.width,
            depth: 30 * md.mainModule.module.size.depth,
            height: 30 * md.mainModule.module.size.height,
          };
        } else if (
          md.mainModule?.module?.type === TypeModule.REQUIRE_MODULE &&
          md.mainModule.dependentStep
        ) {
          const stepBaseScale = kitchen.find(
            (step) => step.stepId == md.mainModule.dependentStep
          );

          const differenceX =
            (stepBaseScale.position.x * stepBaseScale.direction.x -
              kitchen[currentStep].position.x *
                kitchen[currentStep].direction.x) *
            30;
          const differenceY =
            (stepBaseScale.position.y * stepBaseScale.direction.y -
              kitchen[currentStep].position.y *
                kitchen[currentStep].direction.y) *
            30;
          const differenceZ =
            (stepBaseScale.position.z * stepBaseScale.direction.z -
              kitchen[currentStep].position.z *
                kitchen[currentStep].direction.z) *
            30;
          const scaleValueRequireModuleZ =
            (differenceX +
              differenceY +
              differenceZ +
              stepBaseScale.lstModule[0].mainModule.gltf.size.width /
                stepBaseScale.lstModule[0].mainModule.indexDesign) /
            (md.mainModule.module.size.width * 30);
          mainObject.scale.set(30, 30, scaleValueRequireModuleZ * 30);
          mainObject.size = {
            width:
              30 * md.mainModule.module.size.width * scaleValueRequireModuleZ,
            depth: 30 * md.mainModule.module.size.depth,
            height: 30 * md.mainModule.module.size.height,
          };
        } else {
          mainObject.scale.z = 30 * kitchen[currentStep].scale;
          mainObject.size = {
            width:
              30 * md.mainModule.module.size.width * kitchen[currentStep].scale,
            depth: 30 * md.mainModule.module.size.depth,
            height: 30 * md.mainModule.module.size.height,
          };
        }

        if (i !== 0) {
          const objectPre =
            kitchen[currentStep].lstModule[i - 1]?.mainModule?.gltf;
          mainObject.position.x =
            objectPre.position.x +
            (kitchen[currentStep].direction.x >= 0
              ? objectPre.size.width
              : mainObject.size.width) *
              kitchen[currentStep].direction.x;
          mainObject.position.y =
            objectPre.position.y +
            (kitchen[currentStep].direction.y >= 0
              ? objectPre.size.height
              : mainObject.size.height) *
              kitchen[currentStep].direction.y;
          mainObject.position.z =
            objectPre.position.z +
            (kitchen[currentStep].direction.z >= 0
              ? mainObject.size.width
              : objectPre.size.width) *
              kitchen[currentStep].direction.z;
        } else {
          mainObject.position.y =
            kitchen[currentStep].position.y * 30 + productInfo.camera.rotateY;
          mainObject.position.x = kitchen[currentStep].position.x * 30;
          mainObject.position.z =
            kitchen[currentStep].position.z * 30 +
            mainObject.size.width * cosValue;
        }
        md.mainModule.gltf = mainObject;

        if (md.lstSubModule.length > 0) {
          md.lstSubModule.forEach((sub) => {
            if (sub.gltf) {
              const subObject = display.scene.getObjectByProperty(
                "uuid",
                sub.gltf.uuid
              );
              if (md.mainModule.module.type === TypeModule.LOVER_MODULE) {
                subObject.scale.z = 30;
              } else {
                subObject.scale.z = 30 * kitchen[currentStep].scale;
              }
              subObject.position.set(
                mainObject.position.x,
                mainObject.position.y,
                mainObject.position.z
              );

              sub.gltf = subObject;
            }
          });
        }
      }
    }
  }
}

export function countCurrentTotalDesign(currentStep, currentIndex) {
  let currentTotalDesign = 0;

  if (currentStep.lstModule[currentIndex]?.mainModule === null) {
    for (let i = 0; i <= currentIndex; i++) {
      if (currentStep.lstModule[i].mainModule?.module != null) {
        currentTotalDesign += currentStep.lstModule[i].mainModule?.indexDesign;
      }
    }
  } else {
    for (let i = 0; i < currentIndex; i++) {
      if (currentStep.lstModule[i].mainModule?.module != null) {
        currentTotalDesign += currentStep.lstModule[i].mainModule?.indexDesign;
      }
    }
  }

  return currentTotalDesign;
}
export function countTotalDesign(currentStep, currentIndex) {
  if (currentStep.lstModule[currentIndex]?.mainModule === null) {
    return currentStep.totalIndexDesign;
  } else {
    return currentStep.totalIndexDesign - 1;
  }
}

export function onlyRemoveModule(display, lstModule, idx) {
  if (lstModule[idx]?.mainModule != null) {
    display.scene.remove(lstModule[idx].mainModule?.gltf);
    lstModule[idx].lstSubModule.forEach((item) => {
      display.scene.remove(item?.module?.gltf);
    });
    lstModule[idx].mainModule = null;
    lstModule[idx].lstSubModule = [];
  }
}

export function removeLastModule(display, stepData) {
  for (let i = stepData.lstModule.length - 1; i >= 0; i--) {
    if (stepData.lstModule[i]?.mainModule?.gltf) {
      //Delete main
      display.scene.remove(stepData.lstModule[i].mainModule.gltf);

      stepData.totalIndexDesign =
        stepData.totalIndexDesign -
        stepData.lstModule[i].mainModule.indexDesign;

      stepData.lstModule[i].mainModule = null;

      //Delete sub
      stepData.lstModule[i]?.lstSubModule?.forEach((item) => {
        display.scene.remove(item?.gltf);

        stepData.lstModule[i].lstSubModule = [];
      });

      return;
    }
  }
}

export const getPrice = async (
  typeModuleId,
  typeIndex,
  materialId,
  trademarkId
) => {
  try {
    const token = Cookie.get("token");
    const headers = {
      authorization: `Bearer ${token}`,
    };

    const queryParams = new URLSearchParams({
      typeModuleId,
      typeIndex,
      materialId,
      trademarkId,
    });

    const apiUrl = `price?${queryParams.toString()}`;

    const res = await callApi(apiUrl, "GET", "", headers);

    // console.log("PRICE: ");
    // console.log(res);

    if (res.data?.data?.price) {
      return res.data.data.price;
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const handleChangeTexture = (module, url, scale) => {
  return new Promise((resolve, reject) => {
    url &&
      textureLoader.load(
        url,
        (newTexture) => {
          module?.traverse((child) => {
            if (child.isMesh) {
              const materials = Array.isArray(child.material)
                ? child.material
                : [child.material];
              materials.forEach((material) => {
                newTexture.wrapS = THREE.RepeatWrapping;
                newTexture.wrapT = THREE.RepeatWrapping;

                let desiredWidth = 2400 * (scale || 1);
                let desiredHeight = 1200 * (scale || 1);
                let originalWidth = newTexture.image.width;
                let originalHeight = newTexture.image.height;
                let scaleWidth = desiredWidth / originalWidth;
                let scaleHeight = desiredHeight / originalHeight;
                newTexture.repeat.set(scaleWidth, scaleHeight);

                material.map = newTexture;
              });
            }
          });

          resolve();
        },
        undefined,
        (error) => {
          reject(error);
        }
      );
  });
};

const getTopLevelObject = (object) => {
  if (object.userData?.step !== undefined) {
    return object;
  } else {
    return getTopLevelObject(object.parent);
  }
};

const handleFocusModule = (setModelClicked, setTabSelected) => {
  let parent = clickedObject.parent;

  while (parent) {
    if (
      parent instanceof THREE.Group &&
      parent.name !== "BACKGROUND" &&
      parent.name !== "MEASURE"
    ) {
      let clicked = getTopLevelObject(parent);

      setModelClicked(clicked);
      setTabSelected({
        step: null,
        index: null,
      });

      break;
    }
    parent = parent.parent;
  }
};

export const handleMouseDown = (
  event,
  display,
  setModelClicked,
  setTabSelected
) => {
  const canvasBounds = event.target.getBoundingClientRect();

  // Tọa độ chuột trong cửa sổ trình duyệt
  const mouseX = event.clientX;
  const mouseY = event.clientY;

  // Tọa độ gốc của thẻ canvas trong cửa sổ trình duyệt
  const canvasX = canvasBounds.left;
  const canvasY = canvasBounds.top;

  // Kích thước của thẻ canvas
  const canvasWidth = canvasBounds.width;
  const canvasHeight = canvasBounds.height;

  // Tọa độ chuột trong không gian canvas
  const normalizedMouseX = (mouseX - canvasX) / canvasWidth;
  const normalizedMouseY = 1 - (mouseY - canvasY) / canvasHeight;

  // Chuyển đổi tọa độ chuột sang không gian Three.js
  mouse.x = normalizedMouseX * 2 - 1;
  mouse.y = normalizedMouseY * 2 - 1;

  // Tìm kiếm các khối va chạm với tia từ vị trí chuột
  raycaster.setFromCamera(mouse, display.camera);
  const intersects = raycaster.intersectObjects(display.scene.children, true);

  if (intersects.length > 0) {
    // Lưu trữ đối tượng được nhấp vào
    clickedObject = intersects[0].object;

    handleFocusModule(setModelClicked, setTabSelected);
  }
};

export const handleMouseMove = (event, display, canvas, isMouseDown) => {
  if (!isMouseDown) {
    const canvasBounds = event.target.getBoundingClientRect();

    // Tọa độ chuột trong cửa sổ trình duyệt
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    // Tọa độ gốc của thẻ canvas trong cửa sổ trình duyệt
    const canvasX = canvasBounds.left;
    const canvasY = canvasBounds.top;

    // Kích thước của thẻ canvas
    const canvasWidth = canvasBounds.width;
    const canvasHeight = canvasBounds.height;

    // Tọa độ chuột trong không gian canvas
    const normalizedMouseX = (mouseX - canvasX) / canvasWidth;
    const normalizedMouseY = 1 - (mouseY - canvasY) / canvasHeight;

    // Chuyển đổi tọa độ chuột sang không gian Three.js
    mouse.x = normalizedMouseX * 2 - 1;
    mouse.y = normalizedMouseY * 2 - 1;

    // Tìm kiếm các khối va chạm với tia từ vị trí chuột
    var intersects = null;
    if (display) {
      raycaster.setFromCamera(mouse, display.camera);
      intersects = raycaster.intersectObjects(display.scene.children, true);
    }

    if (intersects?.length > 0) {
      // Lưu trữ đối tượng được hover
      clickedObject = intersects[0].object;

      let hoverGroup = null;
      let parent = clickedObject.parent;

      while (parent) {
        if (
          parent instanceof THREE.Group &&
          parent.name !== "BACKGROUND" &&
          parent.name !== "MEASURE"
        ) {
          hoverGroup = parent;

          canvas.style.cursor = "pointer";
          break;
        }

        canvas.style.cursor = "default";

        parent = parent.parent;
      }
    }
  }
};

export const handleMouseUp = () => {
  clickedObject = null;
};

export const handleHide = (display, name) => {
  display.scene.traverse((object) => {
    if (object.name === name) {
      // Ẩn mô hình
      object.visible = false;
      object.castShadow = false;
      object.userData.interactable = false;
    }
  });
};

export const handleShow = (display, name) => {
  display.scene.traverse((object) => {
    if (object.name === name) {
      // Ẩn mô hình
      object.visible = true;
      object.userData.interactable = true;
    }
  });
};
