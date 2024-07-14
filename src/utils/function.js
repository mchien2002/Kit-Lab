import { saveAs } from "file-saver";
import Cookie from "js-cookie";
import toast from "react-hot-toast";
import * as THREE from "three";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import callApi from "./callApi";
import { getListWifeModule, getModuleDetail, getPriceDetail } from "./getData";

const glftLoader = new GLTFLoader();
const dLoader = new DRACOLoader();
dLoader.setDecoderPath(
  "https://www.gstatic.com/draco/versioned/decoders/1.5.6/"
);
dLoader.setDecoderConfig({ type: "js" });
glftLoader.setDRACOLoader(dLoader);
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

const X = 5.099999880382116;
const Y = 3.3000010476221315;
const Z = 5.100000903247968;

const wBase = 0.4489413250236321;

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

let clickedObject = null;

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

export const reloadGLTFModel = async (
  moduleData,
  index,
  curStep,
  display,
  kitchen,
  setKitchen,
  isLoading,
  setIsLoading,
  idxSub,
  isPB,
  canInside
) => {
  let step = curStep;

  return new Promise((resolve) => {
    if (!isLoading) {
      if (moduleData && moduleData.module?.glbUrl) {
        switch (moduleData.module.type) {
          case 1:
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

                if (
                  isPB === false &&
                  canInside === true &&
                  kitchen[step].lstModule[index].mainModule.module.coverBox ===
                    true &&
                  kitchen[step].lstModule[index].mainModule.module.type !==
                    TypeModule.LOVER_MODULE
                ) {
                  if (!kitchen[step].baseScale) {
                    gltfScene.scene.scale.set(
                      scale,
                      scale - 0.04,
                      scale *
                        kitchen[step].lstModule[index]?.mainModule?.gltf?.scale
                          ?.z -
                        0.066 /
                          kitchen[step].lstModule[index]?.mainModule
                            ?.indexDesign
                    );

                    gltfScene.scene.position.set(
                      kitchen[step].lstModule[index].mainModule.gltf.position
                        .x + 0.015,
                      kitchen[step].lstModule[index].mainModule.gltf.position
                        .y + 0.02,
                      kitchen[step].lstModule[index].mainModule.gltf.position
                        .z + 0.004
                    );
                  } else {
                    gltfScene.scene.scale.set(
                      scale,
                      scale - 0.02,
                      scale *
                        kitchen[step].lstModule[index]?.mainModule?.gltf?.scale
                          ?.z -
                        0.066 /
                          kitchen[step].lstModule[index]?.mainModule
                            ?.indexDesign
                    );

                    gltfScene.scene.position.set(
                      kitchen[step].lstModule[index].mainModule.gltf.position
                        .x + 0.015,
                      kitchen[step].lstModule[index].mainModule.gltf.position
                        .y + 0.02,
                      kitchen[step].lstModule[index].mainModule.gltf.position
                        .z + 0.004
                    );
                  }
                } else {
                  gltfScene.scene.scale.set(
                    scale,
                    scale,
                    scale *
                      kitchen[step].lstModule[index]?.mainModule?.gltf?.scale?.z
                  );

                  gltfScene.scene.position.set(
                    kitchen[step].lstModule[index].mainModule.gltf.position.x,
                    kitchen[step].lstModule[index].mainModule.gltf.position.y,
                    kitchen[step].lstModule[index].mainModule.gltf.position.z
                  );
                }

                gltfScene.scene.rotateY(
                  (kitchen[step].position.rotation * Math.PI) / 180
                );

                const door = gltfScene.scene.getObjectByName("DOOR");

                if (moduleData.texture?.imgUrl) {
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
                    let ballMat = new THREE.MeshStandardMaterial(ballMaterial);
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
                        door?.traverse((node) => {
                          if (node.isMesh) {
                            node.material = ballMat;
                          }
                        });
                        texture.offset.set(1, 1);
                        texture.wrapS = texture.wrapT =
                          THREE.MirroredRepeatWrapping;

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
                } else {
                  if (moduleData.module.subSub !== true) {
                    const ballMaterial = {
                      metalness: 0.5,
                      roughness: 0.5,
                      color: "#c9c9c9",
                      normalScale: new THREE.Vector2(0.15, 0.15),
                    };
                    let ballMat = new THREE.MeshStandardMaterial(ballMaterial);
                    door?.traverse((node) => {
                      if (node.isMesh) {
                        node.material = ballMat;
                      }
                    });
                  }
                }

                const userData = {
                  step: curStep,
                  index: index,
                };
                gltfScene.scene.userData = userData;

                let newKitchen = [...kitchen];

                if (
                  newKitchen[step].lstModule[index].lstSubModule[idxSub]
                    ?.gltf !== null
                ) {
                  display.scene.remove(
                    newKitchen[step].lstModule[index].lstSubModule[idxSub]?.gltf
                  );
                }

                newKitchen[step].lstModule[index].lstSubModule[idxSub].gltf =
                  gltfScene.scene;

                setKitchen(newKitchen);

                display.scene.add(gltfScene.scene);
                resolve(gltfScene);
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
                      child.material.metalness = 0.5;
                      child.receiveShadow = true;
                      child.castShadow = true;
                    }
                  });

                  const cosValue = Math.cos(rotationAngle);
                  var [widthGlb, depthGlb, heightGlb] = getGLBSize(
                    gltfScene.scene
                  );

                  const heightScale =
                    Math.abs(forStepY?.position.y - point.start.y) / heightGlb;

                  const widthScale =
                    ((point.end.x + point.endSize.width - point.start.x) *
                      forStepXZ.direction.x +
                      (point.end.z - point.start.z) * forStepXZ.direction.z) /
                    widthGlb;

                  gltfScene.scene.scale.y = heightScale ? heightScale : 1;
                  gltfScene.scene.scale.z = widthScale;

                  if (moduleData?.texture?.imgUrl) {
                    textureLoader.load(
                      `${process.env.REACT_APP_URL}uploads/images/textures/${moduleData.texture.imgUrl}`,
                      (texture) => {
                        gltfScene.scene.traverse((node) => {
                          if (node.isMesh) {
                            texture.wrapS = THREE.RepeatWrapping;
                            texture.wrapT = THREE.RepeatWrapping;

                            let desiredWidth = 1200 * widthScale;
                            let desiredHeight = 600;
                            // let desiredWidth = 2400 * widthScale;
                            // let desiredHeight = 1200;
                            let originalWidth = texture.image.width;
                            let originalHeight = texture.image.height;
                            let scaleWidth = desiredWidth / originalWidth;
                            let scaleHeight = desiredHeight / originalHeight;

                            texture.repeat.set(scaleWidth, scaleHeight);

                            node.material.map = texture;
                          }
                        });
                        // setIsLoading(false);
                      }
                    );
                  }

                  if (!forStepY) {
                    display.scene.traverse((object) => {
                      if (object.name === "MATBEP") {
                        handleChangeTexture(
                          object,
                          moduleData?.texture?.imgUrl
                        );
                      }
                    });
                  }

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
                    step: curStep,
                    index: index,
                  };

                  gltfScene.scene.userData = userData;
                  gltfScene.scene.castShadow = true;

                  group.userData = userData;
                  group.add(gltfScene.scene);
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

            let newKitchen = [...kitchen];
            if (
              newKitchen[step] &&
              newKitchen[step].lstModule[index].mainModule.gltf !== null
            ) {
              display.scene.remove(
                newKitchen[step]?.lstModule[index]?.mainModule?.gltf
              );
            }
            newKitchen[step].lstModule[index].mainModule.gltf =
              combinedModelGroup;
            newKitchen[step].lstModule[index].mainModule.measure =
              newMeasure + newKitchen[step].measurePlus;
            newKitchen[step].measure =
              newMeasure + newKitchen[step].measurePlus;
            newKitchen[step].totalMeasure =
              newMeasure + newKitchen[step].measurePlus;

            setKitchen(newKitchen);

            combinedModelGroup.name = "MAIN";

            display.scene.add(combinedModelGroup);

            setIsLoading(false);

            resolve(combinedModelGroup);

            break;

          case 7:
            let doorGltf;
            kitchen[step].lstModule[index]?.lstSubModule.forEach((item) => {
              if (
                item.require !== true &&
                item.module.subSub !== true &&
                item.module.type === 1
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
                    //child.material.metalness = 0.5;
                    //child.material.roughness = 0.05;
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
                  step: step,
                  index: index,
                };
                gltfScene.scene.userData = userData;
                gltfScene.scene.name = "TAYNAM";

                let newKitchen = [...kitchen];

                newKitchen[step].lstModule[index].lstSubModule[idxSub].gltf =
                  gltfScene.scene;
                newKitchen[step].lstModule[index].lstSubModule[
                  idxSub
                ].listTayNam = taynam_list;

                setKitchen(newKitchen);

                resolve(gltfScene);
                setIsLoading(false);
              }
            );
            break;

          default:
            if (kitchen[step]?.position && kitchen[step]?.direction) {
              glftLoader.load(
                `${process.env.REACT_APP_URL}uploads/modules/${moduleData.module.glbUrl}`,
                (gltfScene) => {
                  gltfScene.scene.traverse((child) => {
                    if (child.isMesh) {
                      //child.material.metalness = 0.5;
                      // child.material.roughness = 0.5;
                      child.castShadow = true;
                    }
                  });
                  const main = gltfScene.scene.getObjectByName("MAIN");

                  const cosValue = Math.cos(
                    (kitchen[step].position.rotation * Math.PI) / 180
                  );

                  if (
                    moduleData.module.type === TypeModule.REQUIRE_MODULE &&
                    kitchen[step].dependentStep
                  ) {
                    kitchen[step].lstModule[index].mainModule.dependentStep =
                      kitchen[step].dependentStep;
                    const stepBaseScale = kitchen.find(
                      (stepItem) =>
                        stepItem.stepId === kitchen[step].dependentStep
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
                    if (kitchen[step].baseScale === true) {
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
                        gltfScene.scene.size = {
                          width: scale * moduleData.module.size.width,
                          depth: scale * moduleData.module.size.depth,
                          height: scale * moduleData.module.size.height,
                        };
                      } else {
                        gltfScene.scene.scale.set(
                          scale,
                          scale,
                          moduleData.mainLover.scale
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
                    gltfScene.scene.scale.set(
                      scale,
                      scale,
                      scale * kitchen[step].scale
                    );
                    gltfScene.scene.size = {
                      width:
                        scale *
                        moduleData.module.size?.width *
                        kitchen[step].scale,
                      depth: scale * moduleData.module.size?.depth,
                      height: scale * moduleData.module.size?.height,
                    };
                  }

                  if (index === 0) {
                    // Đưa về trục tọa độ
                    const [moving, _] = countImpactModulePosition(
                      kitchen,
                      step
                    );

                    gltfScene.scene.position.y = moduleData?.module?.position?.y
                      ? moduleData?.module?.position?.y - Y / 2
                      : kitchen[step].position.y;
                    gltfScene.scene.position.x =
                      (moduleData?.module?.position?.x
                        ? moduleData?.module?.position?.x - X / 2
                        : kitchen[step].position.x) + moving;
                    gltfScene.scene.position.z =
                      (moduleData?.module?.position?.z
                        ? moduleData?.module?.position?.z - Z / 2
                        : kitchen[step].position.z) +
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
                    step: curStep,
                    index: index,
                  };

                  gltfScene.scene.userData = userData;

                  let newKitchen = [...kitchen];
                  if (
                    newKitchen[step].lstModule[index].mainModule.gltf !== null
                  ) {
                    display?.scene?.remove(
                      newKitchen[step].lstModule[index].mainModule.gltf
                    );
                  }
                  newKitchen[step].lstModule[index].mainModule.gltf =
                    gltfScene.scene;

                  setKitchen(newKitchen);

                  display?.scene?.add(gltfScene.scene);
                  resolve(gltfScene);
                }
              );
            }
            break;
        }
      } else {
        resolve();
      }
    }
  });
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
      x: new THREE.Vector3(minPoint.x + 0.05, minPoint.y, minPoint.z),
      z: new THREE.Vector3(minPoint.x, minPoint.y, minPoint.z + 0.05),
    },
    {
      o: new THREE.Vector3(minPoint.x, minPoint.y, maxPoint.z),
      x: new THREE.Vector3(minPoint.x + 0.05, minPoint.y, maxPoint.z),
      z: new THREE.Vector3(minPoint.x, minPoint.y, maxPoint.z + 0.05),
    },
    {
      o: new THREE.Vector3(maxPoint.x, minPoint.y, maxPoint.z),
      x: new THREE.Vector3(maxPoint.x + 0.05, minPoint.y, maxPoint.z),
      z: new THREE.Vector3(maxPoint.x, minPoint.y, maxPoint.z + 0.05),
    },
    {
      o: new THREE.Vector3(maxPoint.x, minPoint.y, minPoint.z),
      x: new THREE.Vector3(maxPoint.x + 0.05, minPoint.y, minPoint.z),
      z: new THREE.Vector3(maxPoint.x, minPoint.y, minPoint.z + 0.05),
    },
    {
      o: new THREE.Vector3(minPoint.x, maxPoint.y, minPoint.z),
      x: new THREE.Vector3(minPoint.x + 0.05, maxPoint.y, minPoint.z),
      z: new THREE.Vector3(minPoint.x, maxPoint.y, minPoint.z + 0.05),
    },
    {
      o: new THREE.Vector3(minPoint.x, maxPoint.y, maxPoint.z),
      x: new THREE.Vector3(minPoint.x + 0.05, maxPoint.y, maxPoint.z),
      z: new THREE.Vector3(minPoint.x, maxPoint.y, maxPoint.z + 0.05),
    },
    {
      o: new THREE.Vector3(maxPoint.x, maxPoint.y, maxPoint.z),
      x: new THREE.Vector3(maxPoint.x + 0.05, maxPoint.y, maxPoint.z),
      z: new THREE.Vector3(maxPoint.x, maxPoint.y, maxPoint.z + 0.05),
    },
    {
      o: new THREE.Vector3(maxPoint.x, maxPoint.y, minPoint.z),
      x: new THREE.Vector3(maxPoint.x + 0.05, maxPoint.y, minPoint.z),
      z: new THREE.Vector3(maxPoint.x, maxPoint.y, minPoint.z + 0.05),
    },
  ];

  return boxVertices;
};

export const drawStep1 = (display, step, width) => {
  let arr;
  let wData;
  let subDepth;
  let subMeasure;

  let addHeight = step.lstModule[0].mainModule?.module?.size?.height;
  let addWidth = step.lstModule[0].mainModule?.module?.size?.width;
  let addDepth = step.lstModule[0].mainModule?.module?.size?.depth;

  const startStep = step.lstModule[0].mainModule?.gltf?.position;
  let endStep;

  if (step.totalIndexDesign === step.designUnit) {
    const idx = findFirstNull(step.lstModule);

    endStep = {
      x:
        step.lstModule[idx - 1].mainModule.gltf.position.x +
        step.lstModule[idx - 1].mainModule.gltf.size.width,
      y: step.lstModule[idx - 1].mainModule.gltf.position.y,
      z: step.lstModule[idx - 1].mainModule.gltf.position.z,
    };
  } else {
    endStep = {
      x: step.position.x + (width / 450) * wBase,
      y: step.position.y,
      z: step.position.z,
    };
  }

  const productInfo = JSON.parse(localStorage.getItem("productInfo"));

  //RIGHT
  if (step.position.rotation === -90) {
    if (productInfo.typeProduct === 3 || productInfo.typeProduct === 4) {
      //Bep L
      subDepth = step.lstModule[0].mainModule.module.size.depth;
      subMeasure = step.lstModule[0].mainModule.measure.d;
    } else {
      //Bep I
      subDepth = 0;
      subMeasure = 0;
    }

    arr = [
      {
        o: new THREE.Vector3(startStep.x, startStep.y, startStep.z + addDepth),
        x: new THREE.Vector3(
          startStep.x + 0.5,
          startStep.y,
          startStep.z + addDepth
        ),
        z: new THREE.Vector3(
          startStep.x,
          startStep.y,
          startStep.z + addDepth + 0.5
        ),
      },
      {
        o: new THREE.Vector3(
          endStep.x - subDepth,
          endStep.y,
          endStep.z + addDepth
        ),
        x: new THREE.Vector3(
          endStep.x + 0.5 - subDepth,
          endStep.y,
          endStep.z + addDepth
        ),
        z: new THREE.Vector3(
          endStep.x - subDepth,
          endStep.y,
          endStep.z + addDepth + 0.5
        ),
      },
    ];

    wData = [
      { startIdx: arr[0].o, endIdx: arr[0].z },
      { startIdx: arr[1].o, endIdx: arr[1].z },
      {
        startIdx: arr[0].z,
        endIdx: arr[1].z,
        text: `${roundNumber(width - subMeasure)}mm`,
      },
    ];
  } else {
    //LEFT
    arr = [
      {
        o: new THREE.Vector3(
          step.position.x + addDepth,
          step.position.y,
          step.position.z
        ),
        x: new THREE.Vector3(
          step.position.x + addDepth + 0.5,
          step.position.y,
          step.position.z
        ),
        z: new THREE.Vector3(
          step.position.x + addDepth,
          step.position.y,
          step.position.z + 0.5
        ),
      },
      {
        o: new THREE.Vector3(
          step.position.x + addDepth,
          step.position.y,
          step.position.z + (width / 450) * wBase
        ),
        x: new THREE.Vector3(
          step.position.x + addDepth + 0.5,
          step.position.y,
          step.position.z + (width / 450) * wBase
        ),
        z: new THREE.Vector3(
          step.position.x + addDepth,
          step.position.y,
          step.position.z + (width / 450) * wBase + 0.5
        ),
      },
    ];

    wData = [
      { startIdx: arr[0].o, endIdx: arr[0].x },
      { startIdx: arr[1].o, endIdx: arr[1].x },
      {
        startIdx: arr[0].x,
        endIdx: arr[1].x,
        text: `${roundNumber(width)}mm`,
      },
    ];
  }

  const group = new THREE.Group();
  const material = new THREE.LineBasicMaterial({
    color: 0xffc436,
    linewidth: 0.1,
    linecap: "round",
    linejoin: "round",
  });

  let linesData = [wData];
  const fontLoader = new FontLoader();
  fontLoader.load("./fonts/roboto.json", (font) => {
    const textOptions = {
      font: font,
      size: 0.05,
      height: 0.05,
      curveSegments: 12,
      bevelEnabled: false,
    };
    const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    linesData.forEach((data) => {
      data.forEach((item) => {
        const points = [item.startIdx, item.endIdx];

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        // const line = new THREE.Line(tubeGeometry, material);
        const line = new THREE.Line(geometry, material);
        group.add(line);
        if (item.text) {
          const textGeometry = new TextGeometry(item.text, textOptions);
          const textMesh = new THREE.Mesh(textGeometry, textMaterial);
          const midPoint = new THREE.Vector3(
            (points[0].x + points[1].x) / 2 + 0.01,
            (points[0].y + points[1].y) / 2 + 0.01,
            (points[0].z + points[1].z) / 2 + 0.01
          );
          textMesh.position.copy(midPoint);
          group.add(textMesh);
        }
      });
    });
    group.name = "MEASURE";
    display.scene.add(group);
    display.listGroupMeasure.push(group);
  });
};

export const drawStep = (display, step, width, productInfo) => {
  let arr;
  let wData;
  let subDepth;
  let subMeasure;

  let addHeight = step.lstModule[0].mainModule?.module?.size?.height;
  let addWidth = step.lstModule[0].mainModule?.module?.size?.width;
  let addDepth = step.lstModule[0].mainModule?.module?.size?.depth;

  //RIGHT
  if (step.position.rotation === -90) {
    if (
      productInfo.typeProduct === "64ed6cc30fb69fc4cf332358" ||
      productInfo.typeProduct === "652f9e1391c09661e502bc9e"
    ) {
      //Bep L
      subDepth = step.lstModule[0].mainModule.module.size.depth;
      subMeasure = step.lstModule[0].mainModule.measure.d;
    } else {
      //Bep I
      subDepth = 0;
      subMeasure = 0;
    }

    arr = [
      {
        o: new THREE.Vector3(
          step.position.x,
          step.position.y,
          step.position.z + addDepth
        ),
        x: new THREE.Vector3(
          step.position.x + 0.5,
          step.position.y,
          step.position.z + addDepth
        ),
        z: new THREE.Vector3(
          step.position.x,
          step.position.y,
          step.position.z + addDepth + 0.5
        ),
      },
      {
        o: new THREE.Vector3(
          step.position.x + (width / 450) * wBase - subDepth,
          step.position.y,
          step.position.z + addDepth
        ),
        x: new THREE.Vector3(
          step.position.x + 0.5 + (width / 450) * wBase - subDepth,
          step.position.y,
          step.position.z + addDepth
        ),
        z: new THREE.Vector3(
          step.position.x + (width / 450) * wBase - subDepth,
          step.position.y,
          step.position.z + addDepth + 0.5
        ),
      },
    ];

    wData = [
      { startIdx: arr[0].o, endIdx: arr[0].z },
      { startIdx: arr[1].o, endIdx: arr[1].z },
      {
        startIdx: arr[0].z,
        endIdx: arr[1].z,
        text: `${roundNumber(width - subMeasure)}mm`,
      },
    ];
  } else {
    //LEFT
    arr = [
      {
        o: new THREE.Vector3(
          step.position.x + addDepth,
          step.position.y,
          step.position.z
        ),
        x: new THREE.Vector3(
          step.position.x + addDepth + 0.5,
          step.position.y,
          step.position.z
        ),
        z: new THREE.Vector3(
          step.position.x + addDepth,
          step.position.y,
          step.position.z + 0.5
        ),
      },
      {
        o: new THREE.Vector3(
          step.position.x + addDepth,
          step.position.y,
          step.position.z + (width / 450) * wBase
        ),
        x: new THREE.Vector3(
          step.position.x + addDepth + 0.5,
          step.position.y,
          step.position.z + (width / 450) * wBase
        ),
        z: new THREE.Vector3(
          step.position.x + addDepth,
          step.position.y,
          step.position.z + (width / 450) * wBase + 0.5
        ),
      },
    ];

    wData = [
      { startIdx: arr[0].o, endIdx: arr[0].x },
      { startIdx: arr[1].o, endIdx: arr[1].x },
      {
        startIdx: arr[0].x,
        endIdx: arr[1].x,
        text: `${roundNumber(width)}mm`,
      },
    ];
  }

  const group = new THREE.Group();
  const material = new THREE.LineBasicMaterial({
    color: 0xffc436,
    linewidth: 0.1,
    linecap: "round",
    linejoin: "round",
  });

  let linesData = [wData];
  const fontLoader = new FontLoader();
  fontLoader.load("./fonts/roboto.json", (font) => {
    const textOptions = {
      font: font,
      size: 0.05,
      height: 0.05,
      curveSegments: 12,
      bevelEnabled: false,
    };
    const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    linesData.forEach((data) => {
      data.forEach((item) => {
        const points = [item.startIdx, item.endIdx];

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        // const line = new THREE.Line(tubeGeometry, material);
        const line = new THREE.Line(geometry, material);
        group.add(line);
        if (item.text) {
          const textGeometry = new TextGeometry(item.text, textOptions);
          const textMesh = new THREE.Mesh(textGeometry, textMaterial);
          const midPoint = new THREE.Vector3(
            (points[0].x + points[1].x) / 2 + 0.01,
            (points[0].y + points[1].y) / 2 + 0.01,
            (points[0].z + points[1].z) / 2 + 0.01
          );
          textMesh.position.copy(midPoint);
          group.add(textMesh);
        }
      });
    });
    group.name = "MEASURE";
    display.scene.add(group);
    display.listGroupMeasure.push(group);
  });
};

export function scaleRequireModule(stepBaseScale, stepCurrent, moduleData) {
  const differenceX =
    (stepBaseScale.position.x * stepBaseScale.direction.x -
      (moduleData.position?.x
        ? moduleData.position.x - X / 2
        : stepCurrent.position.x) *
        stepCurrent.direction.x) *
    scale;
  const differenceY =
    (stepBaseScale.position.y * stepBaseScale.direction.y -
      (moduleData.position?.y
        ? moduleData.position.y - Y / 2
        : stepCurrent.position.y) *
        stepCurrent.direction.y) *
    scale;
  const differenceZ =
    (stepBaseScale.position.z * stepBaseScale.direction.z -
      (moduleData.position?.z
        ? moduleData.position.z - Z / 2
        : stepCurrent.position.z) *
        stepCurrent.direction.z) *
    scale;
  const scaleValueRequireModuleZ =
    (differenceX +
      differenceY +
      differenceZ +
      stepBaseScale.lstModule[0].mainModule.gltf.size.width /
        stepBaseScale.lstModule[0].mainModule.indexDesign) /
    moduleData.size.width;
  return scaleValueRequireModuleZ;
}

export const draw = (
  display,
  direction,
  module,
  showDepthHeight,
  width,
  height,
  depth
) => {
  const arr = getSizeModule(module);

  const group = new THREE.Group();
  const material = new THREE.LineBasicMaterial({
    color: 0x00ffff,
    linewidth: 0.1,
    linecap: "round",
    linejoin: "round",
  });
  let wData = [
    { startIdx: arr[1].o, endIdx: arr[1].z },
    { startIdx: arr[2].o, endIdx: arr[2].z },
    {
      startIdx: arr[1].z,
      endIdx: arr[2].z,
      text: `${roundNumber(width * direction.x + depth * direction.z)}mm`,
    },
  ];
  let hData;
  let dData;
  if (showDepthHeight) {
    if (direction.x === 0) {
      hData = [
        { startIdx: arr[2].o, endIdx: arr[2].x },
        { startIdx: arr[6].o, endIdx: arr[6].x },
        { startIdx: arr[2].x, endIdx: arr[6].x, text: `${height}mm` },
      ];
    } else {
      hData = [
        { startIdx: arr[2].o, endIdx: arr[2].z },
        { startIdx: arr[6].o, endIdx: arr[6].z },
        { startIdx: arr[2].z, endIdx: arr[6].z, text: `${height}mm` },
      ];
    }
  }

  dData = [
    { startIdx: arr[2].o, endIdx: arr[2].x },
    { startIdx: arr[3].o, endIdx: arr[3].x },
    {
      startIdx: arr[2].x,
      endIdx: arr[3].x,
      text: `${roundNumber(width * direction.z + depth * direction.x)}mm`,
    },
  ];

  let linesData = [wData, hData, dData];
  const fontLoader = new FontLoader();
  fontLoader.load("./fonts/roboto.json", (font) => {
    const textOptions = {
      font: font,
      size: 0.05,
      height: 0.05,
      curveSegments: 12,
      bevelEnabled: false,
    };
    const textMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    linesData.forEach((data) => {
      data?.forEach((item) => {
        const points = [item.startIdx, item.endIdx];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        // const line = new THREE.Line(tubeGeometry, material);
        const line = new THREE.Line(geometry, material);
        group.add(line);
        if (item.text) {
          const textGeometry = new TextGeometry(item.text, textOptions);
          const textMesh = new THREE.Mesh(textGeometry, textMaterial);
          const midPoint = new THREE.Vector3(
            (points[0].x + points[1].x) / 2 + 0.01,
            (points[0].y + points[1].y) / 2 + 0.01,
            (points[0].z + points[1].z) / 2 + 0.01
          );
          textMesh.position.copy(midPoint);
          group.add(textMesh);
        }
      });
    });
    group.name = "MEASURE";
    display.scene.add(group);
    display.listGroupMeasure.push(group);
  });
};

export function roundNumber(number) {
  if (typeof number === "number" && !isNaN(number)) {
    return Number(number.toFixed(0));
  }
}

export function roundNumberFloat(number) {
  if (typeof number === "number" && !isNaN(number)) {
    return Number(number.toFixed(1));
  }
}

export function myRound(number) {
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

  // const scale = w / 425;
  const scale = w / 450;
  return scale;
}

export function checkRegionImpactModuleIsLeft(lstModule, currentIndex) {
  if (currentIndex === 0) {
    return true;
  } else {
    if (
      lstModule &&
      lstModule[0]?.mainModule?.module?.type === TypeModule.IMPACT_MODULE
    ) {
      for (let index = 0; index <= currentIndex; index++) {
        if (
          lstModule[index]?.mainModule?.module?.type ===
          TypeModule.IMPACT_MODULE
        ) {
          if (
            lstModule[index - 1]?.mainModule?.module &&
            lstModule[index - 1].mainModule.module.type !==
              TypeModule.IMPACT_MODULE
          ) {
            return false;
          }
        }
      }
      return true;
    } else {
      return false;
    }
  }
}

export function countImpactModulePosition(kitchen, currentStep) {
  let countMoving = 0;
  let impactLeft = 0;
  let countMeasure = 0;
  const parentStep = kitchen.find((item) =>
    item.stepsWeightLoss.includes(kitchen[currentStep].stepId)
  );
  if (parentStep) {
    for (const [index, module] of parentStep?.lstModule?.entries()) {
      if (module?.mainModule?.module?.type === 2) {
        if (checkRegionImpactModuleIsLeft(parentStep.lstModule, index)) {
          countMoving += module?.mainModule?.gltf?.size?.width;
          impactLeft += module?.mainModule?.module?.indexDesign;
          countMeasure += module?.mainModule?.module?.measure?.width;
        }
      }
    }
  }
  return [countMoving, impactLeft, countMeasure];
}

export function fetchGroupItem(group, currentIndex, kitchen, currentStep) {
  if (group.only === true) {
    if (group.startIndex === -1) {
      const parentStep = kitchen.find((item) =>
        item.stepsWeightLoss.includes(kitchen[currentStep].stepId)
      );
      const existImpactModule = parentStep?.lstModule.findIndex(
        (item) => item.mainModule?.module?.type === TypeModule.IMPACT_MODULE
      );
      if (
        checkRegionImpactModuleIsLeft(
          parentStep?.lstModule,
          existImpactModule
        ) === false &&
        existImpactModule !== -1
      ) {
        return null;
      }
      const newGroupItems = group.items
        .map((item) => {
          const [_, impactDesign] = countImpactModulePosition(
            kitchen,
            currentStep
          );
          if (
            item.indexDesign !==
            kitchen[currentStep].designUnitOriginal -
              countCurrentTotalDesign(
                kitchen,
                kitchen[currentStep],
                currentIndex
              ) -
              impactDesign
          ) {
            return null;
          } else {
            const modifiedModule = {
              ...item,
              only: true,
              startIndex: group.startIndex,
              position: group.position,
            };
            return modifiedModule;
          }
        })
        .filter((item) => item !== null);
      const updatedGroup = {
        ...group,
        items: newGroupItems,
      };
      if (updatedGroup.items.length > 0) {
        return updatedGroup;
      } else {
        return null;
      }
    } else {
      const parentStep = kitchen.find((item) =>
        item.stepsWeightLoss.includes(kitchen[currentStep].stepId)
      );
      const existImpactModule = parentStep?.lstModule.indexOf(
        (item) => item.mainModule?.module?.type === TypeModule.IMPACT_MODULE
      );

      if (
        group.startIndex === currentIndex &&
        checkRegionImpactModuleIsLeft(
          parentStep?.lstModule,
          existImpactModule
        ) === false
      ) {
        const modifiedItems = group.items.map((originalModule) => {
          const modifiedModule = {
            ...originalModule,
            only: true,
            startIndex: group.startIndex,
            position: group.position,
          };
          return modifiedModule;
        });

        const modifiedGroup = {
          ...group,
          items: modifiedItems,
        };
        return modifiedGroup;
      } else {
        return null;
      }
    }
  } else {
    return group;
  }
}

export function refreshModuleImpact(display, kitchen, currentStep) {
  let impactLeft = 0;
  let imapctRight = 0;
  const stepLoss = kitchen.filter((kitchenItem) =>
    kitchen[currentStep].stepsWeightLoss?.includes(kitchenItem.stepId)
  );

  for (const [index, module] of kitchen[currentStep].lstModule.entries()) {
    if (module?.mainModule?.module?.type === TypeModule.IMPACT_MODULE) {
      if (
        checkRegionImpactModuleIsLeft(kitchen[currentStep].lstModule, index)
      ) {
        impactLeft += module.mainModule.module.indexDesign;
      } else {
        imapctRight = countCurrentTotalDesign(
          kitchen,
          kitchen[currentStep],
          index
        );
        break;
      }
    }
  }

  stepLoss.forEach((element) => {
    if (element.groupPuzzle.length === 0) {
      if (imapctRight === 0 || element.designUnitOriginal <= imapctRight) {
        element.designUnit = element.designUnitOriginal;
        // element.measure = element.baseMeasure;
        element.measureImpact = 0;
      } else {
        element.designUnit = imapctRight;
        // element.measure =
        //   element.baseMeasure -
        //   (element.designUnitOriginal - imapctRight) * element.scale * 425;
        element.measureImpact =
          (element.designUnitOriginal - imapctRight) * element.scale * 425;
      }
      element.designUnit -= impactLeft;
      // element.measure -= impactLeft * element.scale * 425;
      element.measureImpact += impactLeft * element.scale * 425;

      for (let i = element?.lstModule?.length - 1; i >= 0; i--) {
        if (
          element.lstModule[i].mainModule != null &&
          element.totalIndexDesign > element.designUnit &&
          element.lstModule[0].mainModule.module?.only !== true
        ) {
          element.totalIndexDesign -=
            element.lstModule[i].mainModule.indexDesign;
          onlyRemoveModule(display, kitchen, i, element);
        }
      }
    }
  });
}

export function findModuleInList(
  list,
  mainModuleIndexDesign,
  mainModuleType,
  indexDesignDepth
) {
  for (const group of list) {
    const foundItem = {
      groupId: group._id,
      actualSize: group.actualSize,
      priceId: group.price,
      position: group.position,
      module: group.items.find(
        (item) =>
          item.indexDesign === mainModuleIndexDesign &&
          item.type === mainModuleType &&
          item.indexDesignDepth === indexDesignDepth
      ),
    };

    if (foundItem.module) return foundItem;
  }

  return null; // Trả về null nếu không tìm thấy
}

export function changeModuleDepthInStep(
  moduleChange,
  currentStep,
  currentIndex,
  kitchen,
  display,
  stepDetail,
  listStepDetail,
  trademarkId,
  setRefreshTotal
) {
  kitchen[currentStep].lstModule.forEach(async (itemModule, index) => {
    if (itemModule?.mainModule?.module) {
      const itemRemove = itemModule.mainModule.gltf;
      if (index !== currentIndex) {
        let newModuleChangeDetail;

        const listModuleInStep = await getListModule(
          kitchen,
          currentStep,
          index,
          stepDetail
        );
        const newModuleChange = findModuleInList(
          listModuleInStep,
          itemModule.mainModule.module.indexDesign,
          itemModule.mainModule.module.type,
          moduleChange.indexDesignDepth
        );

        if (newModuleChange) {
          newModuleChangeDetail = await getModuleDetail(
            newModuleChange.module._id,
            trademarkId
          );
        }

        let unitPrice;
        if (
          itemModule.mainModule.material &&
          itemModule.mainModule.material?._id
        ) {
          const unitPriceValue = await getPriceDetail(
            itemModule.mainModule.material?._id,
            newModuleChange.groupId,
            trademarkId
          );

          unitPrice = {
            formulaPrice: unitPriceValue?.formulaPrice,
            priceUser: unitPriceValue?.priceUser,
            priceValue: unitPriceValue?.priceValue,
          };
        }

        cloneModuleGLTF(
          display,
          newModuleChange,
          itemModule,
          index,
          kitchen,
          currentStep,
          trademarkId,
          unitPrice
        ).then(() => {
          let oldColorSub = { material: null, texture: null };

          display.scene.remove(itemRemove);
          itemModule.lstSubModule.forEach((sub) => {
            display.scene.remove(sub?.gltf);

            if (sub?.material) {
              oldColorSub = {
                ...oldColorSub,
                material: sub?.material,
              };
            }
            if (sub?.texture) {
              oldColorSub = {
                ...oldColorSub,
                texture: sub?.texture,
              };
            }
          });
          itemModule.lstSubModule = [];

          newModuleChangeDetail.listSubmodule.forEach(async (item, index) => {
            if (item.require === true) {
              const subModuleData = {
                module: item.listModule[0].items[0],
                groupId: item.listModule[0]._id,
                material: oldColorSub?.material,
                texture: oldColorSub?.texture,
                // priceId: item.listModule[0].price,
              };

              let unitPrice;
              if (oldColorSub?.material && oldColorSub?.material?._id) {
                const unitPriceValue = await getPriceDetail(
                  oldColorSub?.material?._id,
                  item.listModule[0]._id,
                  trademarkId
                );

                unitPrice = {
                  formulaPrice: unitPriceValue?.formulaPrice,
                  priceUser: unitPriceValue?.priceUser,
                  priceValue: unitPriceValue?.priceValue,
                };
              }

              cloneModuleGLTF(
                display,
                subModuleData,
                itemModule,
                index,
                kitchen,
                currentStep,
                trademarkId,
                unitPrice
              ).then((result) => {
                setRefreshTotal(Math.random() * 100);
              });
            }
          });
        });
      }
    }
  });

  if (kitchen[currentStep].dependentIndexDepth) {
    const dependentStep = kitchen.find(
      (item) => item.stepId === kitchen[currentStep].dependentIndexDepth
    );
    dependentStep.lstModule.forEach(async (itemModule, index) => {
      if (itemModule?.mainModule?.module) {
        const itemRemove = itemModule.mainModule.gltf;
        const listModuleInStep = await getListModule(
          kitchen,
          kitchen.indexOf(dependentStep),
          index,
          listStepDetail[kitchen.indexOf(dependentStep)]
        );
        const newModuleChange = findModuleInList(
          listModuleInStep,
          itemModule.mainModule.module.indexDesign,
          itemModule.mainModule.module.type,
          moduleChange.indexDesignDepth
        );
        let newModuleChangeDetail;

        if (newModuleChange) {
          newModuleChangeDetail = await getModuleDetail(
            newModuleChange.module._id,
            trademarkId
          );
        }

        let unitPriceValue;
        let unitPrice;

        if (
          itemModule.mainModule.material &&
          itemModule.mainModule.material?._id
        ) {
          unitPriceValue = await getPriceDetail(
            itemModule.mainModule.material?._id,
            newModuleChange.groupId,
            trademarkId
          );

          unitPrice = {
            formulaPrice: unitPriceValue?.formulaPrice,
            priceUser: unitPriceValue?.priceUser,
            priceValue: unitPriceValue?.priceValue,
          };
        }

        cloneModuleGLTF(
          display,
          newModuleChange,
          itemModule,
          index,
          kitchen,
          kitchen.indexOf(dependentStep),
          trademarkId,
          unitPrice
        ).then(() => {
          let oldColorSub = { material: null, texture: null };

          display.scene.remove(itemRemove);
          itemModule.lstSubModule.forEach(async (sub) => {
            display.scene.remove(sub?.gltf);

            if (sub?.material) {
              oldColorSub = {
                ...oldColorSub,
                material: sub?.material,
              };
            }
            if (sub?.texture) {
              oldColorSub = {
                ...oldColorSub,
                texture: sub?.texture,
              };
            }
          });
          itemModule.lstSubModule = [];

          newModuleChangeDetail.listSubmodule.forEach(async (item, index) => {
            if (item.require === true) {
              const subModuleData = {
                module: item.listModule[0].items[0],
                groupId: item.listModule[0]._id,
                material: oldColorSub?.material,
                texture: oldColorSub?.texture,
                // priceId: item.listModule[0].price,
              };

              let unitPriceValue;
              let unitPrice;
              if (oldColorSub?.material && oldColorSub?.material?._id) {
                unitPriceValue = await getPriceDetail(
                  oldColorSub.material._id,
                  item.listModule[0]._id,
                  trademarkId
                );

                unitPrice = {
                  formulaPrice: unitPriceValue?.formulaPrice,
                  priceUser: unitPriceValue?.priceUser,
                  priceValue: unitPriceValue?.priceValue,
                };
              }

              cloneModuleGLTF(
                display,
                subModuleData,
                itemModule,
                index,
                kitchen,
                kitchen.indexOf(dependentStep),
                trademarkId,
                unitPrice
              ).then((result) => {
                setRefreshTotal(Math.random() * 100);
              });
            }
          });
        });
      }
    });
  }
}

export async function cloneModuleGLTF(
  display,
  moduleChange,
  moduleChanged,
  index,
  kitchen,
  currentStep,
  trademarkId,
  unitPriceValue
) {
  return new Promise((resolve, reject) => {
    const glftLoader = new GLTFLoader();
    const dLoader = new DRACOLoader();
    dLoader.setDecoderPath(
      "https://www.gstatic.com/draco/versioned/decoders/1.5.6/"
    );
    dLoader.setDecoderConfig({ type: "js" });
    glftLoader.setDRACOLoader(dLoader);
    glftLoader.load(
      `${process.env.REACT_APP_URL}uploads/modules/${moduleChange?.module?.glbUrl}`,
      async (gltfScene) => {
        gltfScene.scene.traverse((child) => {
          if (child.isMesh) {
            child.material.metalness = 0.5;
            // child.material.roughness = 0.5;
            child.castShadow = true;
          }
        });

        if (moduleChanged?.mainModule?.gltf) {
          if (moduleChange.module.type === TypeModule.SUBMODULE) {
            gltfScene.scene.position.set(
              moduleChanged.mainModule.gltf.position.x,
              moduleChanged.mainModule.gltf.position.y,
              moduleChanged.mainModule.gltf.position.z
            );
            gltfScene.scene.scale.set(
              moduleChanged.mainModule.gltf.scale.x,
              moduleChanged.mainModule.gltf.scale.y,
              moduleChanged.mainModule.gltf.scale.z
            );
            gltfScene.scene.rotateY(
              (kitchen[currentStep].position.rotation * Math.PI) / 180
            );

            const door = gltfScene.scene.getObjectByName("DOOR");

            if (moduleChange?.texture?.imgUrl) {
              const isHexColor = (str) => /^#[0-9A-F]{6}$/i.test(str);
              if (isHexColor(moduleChange?.texture?.imgUrl)) {
                const color = parseInt(
                  moduleChange.texture?.imgUrl.substring(1),
                  16
                );
                const ballMaterial = {
                  metalness: moduleChange.material.metalness,
                  roughness: moduleChange.material.roughness,
                  color: color,
                  normalScale: new THREE.Vector2(0.15, 0.15),
                };
                let ballMat = new THREE.MeshStandardMaterial(ballMaterial);
                gltfScene.scene.traverse((node) => {
                  if (node.isMesh) {
                    node.material = ballMat;
                  }
                });
              } else {
                textureLoader.load(
                  `${process.env.REACT_APP_URL}uploads/images/textures/${moduleChange.texture.imgUrl}`,
                  (texture) => {
                    const ballMaterial = {
                      metalness: moduleChange.material?.metalness,
                      roughness: moduleChange.material?.roughness,
                      color: "#c9c9c9",
                      normalScale: new THREE.Vector2(0.15, 0.15),
                    };
                    let ballMat = new THREE.MeshStandardMaterial(ballMaterial);
                    door.traverse((node) => {
                      if (node.isMesh) {
                        node.material = ballMat;
                      }
                    });
                    texture.offset.set(1, 1);
                    texture.wrapS = texture.wrapT =
                      THREE.MirroredRepeatWrapping;
                    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
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
            }

            const newMeasure = moduleChanged.mainModule.measure;

            // const priceValue = moduleChange.priceId.prices.find(
            //   (item) =>
            //     (item.trademark === trademarkId &&
            //       item.materials.includes(
            //         moduleChanged?.mainModule?.material?._id
            //       )) ||
            //     (!item.trademark &&
            //       item.materials.includes(
            //         moduleChanged?.mainModule?.material?._id
            //       ))
            // )?.priceValue;

            // const unitPrice = {
            //   formulaPrice: moduleChange.priceId.formulaPrice,
            //   priceValue: priceValue || null,
            // };

            let unitPrice;
            let newPrice;

            if (unitPriceValue) {
              unitPrice = {
                formulaPrice: unitPriceValue?.formulaPrice,
                priceUser: unitPriceValue?.priceUser,
                priceValue: unitPriceValue?.priceValue,
              };

              newPrice = calculatePrice(
                unitPrice.formulaPrice,
                newMeasure.w,
                newMeasure.h,
                newMeasure.d,
                unitPrice.priceValue
              );
            }

            const newSub = {
              gltf: gltfScene.scene,
              module: moduleChange.module,
              measure: newMeasure,
              material: moduleChange?.material,
              texture: moduleChange?.texture,
              priceId: moduleChange.priceId,
              unitPrice: unitPrice,
              price: newPrice,
              groupId: moduleChange.groupId,
            };

            moduleChanged.lstSubModule.push(newSub);
            gltfScene.scene.userData = moduleChanged.mainModule.gltf.userData;

            display.scene.add(gltfScene.scene);

            resolve(gltfScene);
          } else {
            const main = gltfScene.scene.getObjectByName("MAIN");

            if (index === 0) {
              if (
                moduleChange.module.type === TypeModule.REQUIRE_MODULE &&
                kitchen[currentStep].dependentStep
              ) {
                const stepBaseScale = kitchen.find(
                  (step) => step.stepId === kitchen[currentStep].dependentStep
                );

                const scaleValueRequireModuleZ = scaleRequireModule(
                  stepBaseScale,
                  kitchen[currentStep],
                  moduleChange.module
                );
                gltfScene.scene.scale.set(
                  scale,
                  scale,
                  scaleValueRequireModuleZ
                );
                gltfScene.scene.size = {
                  width:
                    scale *
                    moduleChange.module.size.width *
                    scaleValueRequireModuleZ,
                  depth: scale * moduleChange.module.size.depth,
                  height: scale * moduleChange.module.size.height,
                };
              }

              const [moving, _] = countImpactModulePosition(
                kitchen,
                currentStep
              );

              gltfScene.scene.position.y = moduleChange.module.position?.y
                ? moduleChange.module.position.y - Y / 2
                : moduleChanged.mainModule.module.position?.y
                ? kitchen[currentStep].position.y
                : moduleChanged.mainModule.gltf.position.y;
              gltfScene.scene.position.x = moduleChange.module.position?.x
                ? moduleChange.module.position.x - X / 2
                : moduleChanged.mainModule.module.position?.x
                ? kitchen[currentStep].position.x +
                  moving * kitchen[currentStep].direction.x
                : moduleChanged.mainModule.gltf.position.x;
              gltfScene.scene.position.z = moduleChange.module.position?.z
                ? moduleChange.module.position.z - Z / 2
                : moduleChanged.mainModule.module.position?.z
                ? kitchen[currentStep].position.z +
                  (gltfScene.scene.size.width + moving) *
                    kitchen[currentStep].direction.z
                : moduleChanged.mainModule.gltf.position.z;
            } else {
              gltfScene.scene.position.set(
                moduleChanged.mainModule.gltf.position.x,
                moduleChanged.mainModule.gltf.position.y,
                moduleChanged.mainModule.gltf.position.z
              );
            }

            gltfScene.scene.scale.set(
              moduleChanged.mainModule.gltf.scale.x,
              moduleChanged.mainModule.gltf.scale.y,
              moduleChanged.mainModule.gltf.scale.z
            );
            gltfScene.scene.rotateY(
              (kitchen[currentStep].position.rotation * Math.PI) / 180
            );

            if (main && moduleChanged.mainModule?.texture?.imgUrl) {
              textureLoader.load(
                `${process.env.REACT_APP_URL}uploads/images/textures/${moduleChanged.mainModule?.texture?.imgUrl}`,
                (texture) => {
                  texture.offset.set(1, 1);
                  texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping;

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

            const resultMeasureWidth = calculateMeasure(
              moduleChange.actualSize.width,
              0,
              0,
              0,
              kitchen[currentStep].scale,
              moduleChange.module.indexDesign
            );

            console.log(moduleChange);
            console.log(moduleChanged);

            const newMeasure = {
              w: resultMeasureWidth,
              h: moduleChanged.mainModule.measure.h,
              d: parseFloat(moduleChange.module.actutalSize.depth),
            };

            // const priceValue = moduleChange.priceId.prices.find(
            //   (item) =>
            //     (item.trademark === trademarkId &&
            //       item.materials.includes(
            //         moduleChanged?.mainModule?.material?._id
            //       )) ||
            //     (!item.trademark &&
            //       item.materials.includes(
            //         moduleChanged?.mainModule?.material?._id
            //       ))
            // )?.priceValue;

            // const unitPrice = {
            //   formulaPrice: moduleChange.priceId.formulaPrice,
            //   priceValue: priceValue || null,
            // };

            let unitPrice;
            let newPrice;

            if (unitPriceValue) {
              unitPrice = {
                formulaPrice: unitPriceValue?.formulaPrice,
                priceUser: unitPriceValue?.priceUser,
                priceValue: unitPriceValue?.priceValue,
              };

              newPrice = calculatePrice(
                unitPrice.formulaPrice,
                newMeasure.w,
                newMeasure.h,
                newMeasure.d,
                unitPrice.priceValue
              );
            }

            gltfScene.scene.userData = moduleChanged.mainModule.gltf.userData;
            gltfScene.scene.size = moduleChanged.mainModule.gltf.size;

            moduleChanged.mainModule.module = moduleChange.module;
            moduleChanged.mainModule.groupId = moduleChange.groupId;
            moduleChanged.mainModule.gltf = gltfScene.scene;
            moduleChanged.mainModule.measure = newMeasure;
            moduleChanged.mainModule.priceId = moduleChange.priceId;
            moduleChanged.mainModule.unitPrice = unitPrice;
            moduleChanged.mainModule.price = newPrice;

            display.scene.add(gltfScene.scene);

            resolve(gltfScene);
          }
        }
      }
    );
  });
}

export async function getListModule(
  kitchen,
  currentStep,
  currentIndex,
  stepDetail
) {
  let moduleList;
  let listWifeModule;

  if (kitchen[currentStep]?.listModuleLover?.length > 0) {
    const currentTotalDesign = countCurrentTotalDesign(
      kitchen,
      kitchen[currentStep],
      currentIndex
    );

    for (const itemLover of kitchen[currentStep].listModuleLover) {
      if (itemLover.totalDesign === currentTotalDesign) {
        listWifeModule = await getListWifeModule(itemLover.module._id);

        moduleList = listWifeModule?.listModule;
      }
    }
  }

  if (
    !listWifeModule &&
    stepDetail?.typeModules.some((module) => {
      return module.require === true && module.startIndex === currentIndex;
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

  return moduleList;
}

export function checkIndexDepthModule(kitchen, currentStep, cabinet) {
  if (kitchen[currentStep]?.dependentIndexDepth) {
    const dependentStep = kitchen.find(
      (item) => item.stepId === kitchen[currentStep].dependentIndexDepth
    );
    if (dependentStep.lstModule[0].mainModule?.module) {
      if (
        dependentStep.lstModule[0]?.mainModule?.module?.indexDesignDepth !==
        cabinet.indexDesignDepth
      ) {
        return false;
      }
    }
  }

  if (kitchen[currentStep]?.lstModule[0]?.mainModule?.module) {
    if (
      kitchen[currentStep]?.lstModule[0]?.mainModule?.module
        ?.indexDesignDepth !== cabinet.indexDesignDepth
    ) {
      return false;
    }
  }
  return true;
}

export function checkImpactModule(kitchen, currentStep, currentIndex, cabinet) {
  const listStepLossWeight = kitchen.filter((item) =>
    kitchen[currentStep].stepsWeightLoss?.includes(item.stepId)
  );
  let typeModuleRequire = [];
  listStepLossWeight.forEach((step) => {
    const typeModuleRQItem = step?.typeModules?.filter(
      (item) => item.startIndex !== null
    );
    typeModuleRQItem.forEach((item) => {
      typeModuleRequire.push(item);
    });
  });
  for (const itemType of typeModuleRequire) {
    if (itemType?.startIndex === currentIndex && itemType?.require === true) {
      if (cabinet.type === TypeModule.IMPACT_MODULE) {
        return false;
      } else if (cabinet.type === TypeModule.LOVER_MODULE) {
        return false;
      }
    }
  }
  if (kitchen[currentStep]?.lstModule[currentIndex - 1]?.mainModule?.module) {
    if (
      !checkRegionImpactModuleIsLeft(
        kitchen[currentStep].lstModule,
        currentIndex - 1
      ) &&
      kitchen[currentStep]?.lstModule[currentIndex - 1]?.mainModule?.module
        ?.type === TypeModule.IMPACT_MODULE &&
      cabinet.type !== TypeModule.IMPACT_MODULE &&
      currentIndex !== 0
    ) {
      return false;
    } else if (
      kitchen[currentStep]?.lstModule[currentIndex + 1]?.mainModule?.module &&
      cabinet.type === TypeModule.IMPACT_MODULE
    ) {
      if (
        kitchen[currentStep]?.lstModule[currentIndex - 1]?.mainModule?.module
          ?.type !== TypeModule.IMPACT_MODULE &&
        kitchen[currentStep]?.lstModule[currentIndex + 1]?.mainModule?.module
          ?.type !== TypeModule.IMPACT_MODULE
      ) {
        return false;
      }
    }
  }
  return true;
}

export const calculateTotalIndexDesign = (lstModule) => {
  return lstModule.reduce(
    (totals, item) => {
      if (item.mainModule && item.mainModule.indexDesign) {
        totals[0] += item.mainModule.indexDesign;

        if (item.mainModule.measure?.w) {
          totals[1] += item.mainModule.measure.w;
        }
      }

      return totals;
    },
    [0, 0]
  );
};

export const calculateTotalPrice = (kitchen) => {
  return kitchen.reduce((totalPrice, step) => {
    if (step.lstModule) {
      totalPrice += step.lstModule.reduce((moduleTotal, main) => {
        if (main.mainModule && main.mainModule.price) {
          moduleTotal += main.mainModule.price;
        }

        if (main.lstSubModule && main.lstSubModule.length > 0) {
          moduleTotal += main.lstSubModule.reduce((subModuleTotal, sub) => {
            if (sub?.price) {
              subModuleTotal += sub.price;
            }
            return subModuleTotal;
          }, 0);
        }

        return moduleTotal;
      }, 0);
    }

    return totalPrice;
  }, 0);
};

export const calculateTotalPriceVirtual = (kitchen) => {
  return kitchen.reduce((totalPrice, module) => {
    if (module?.module && module?.price) {
      totalPrice += module.price;
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

export function findFirstMainNull(arr) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].mainModule?.module === null) {
      return i;
    }
  }
  return -1;
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
  let measure = 0;

  if (isCounterTop) {
    for (const [i, module] of lstModule.entries()) {
      if (module.mainModule && module.mainModule !== null) {
        if (lstModule[i].mainModule.module.type !== TypeModule.IMPACT_MODULE) {
          measure += module.mainModule.measure.w;
        }

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

        if (
          module.mainModule.module.type === TypeModule.LOVER_MODULE &&
          end !== null
        ) {
          lstPoint.push({
            start: start,
            end: end,
            endSize: endSize,
            stepId: stepId,
          });
        }

        if (
          i !== 0 &&
          (i === lstModule.length - 1 ||
            module.mainModule.module.type === TypeModule.IMPACT_MODULE) &&
          end !== null
        ) {
          if (
            lstModule[i - 1].mainModule.module.type !== TypeModule.LOVER_MODULE
          ) {
            lstPoint.push({
              start: start,
              end: end,
              endSize: endSize,
              stepId: stepId,
            });
          }

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
    let existStart = false;

    for (const [i, module] of lstModule.entries()) {
      if (module.mainModule && module.mainModule !== null) {
        if (lstModule[i].mainModule.module.type !== TypeModule.IMPACT_MODULE) {
          measure += module.mainModule.measure.w;
        }

        if (
          !existStart &&
          i !== 0 &&
          lstModule[i].mainModule.module.type !== TypeModule.IMPACT_MODULE &&
          lstModule[i - 1].mainModule.module.type === TypeModule.IMPACT_MODULE
        ) {
          existStart = true;

          start = new THREE.Vector3(
            module.mainModule.gltf.position.x,
            pStart.y,
            module.mainModule.gltf.position.z -
              module.mainModule.gltf.size.width * stepForXZ.direction.z
          );
        }

        if (
          module.mainModule.module.type === TypeModule.MAIN_MODULE ||
          module.mainModule.module.type === TypeModule.REQUIRE_MODULE ||
          module.mainModule.module.type === TypeModule.LOVER_MODULE
        ) {
          end = new THREE.Vector3(
            module.mainModule.gltf.position.x,
            pStart.y,
            module.mainModule.gltf.position.z
          );
          endSize = module.mainModule.gltf.size;
        }

        if (
          i !== 0 &&
          (i === lstModule.length - 1 ||
            (module.mainModule.module.type === TypeModule.IMPACT_MODULE &&
              lstModule[i - 1].mainModule.module.type !==
                TypeModule.IMPACT_MODULE))
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

  const result = {
    lstPoint: lstPoint,
    measure: measure,
  };

  return result;
};

export async function refreshModuleScale(
  display,
  currentStep,
  kitchen,
  stepId,
  textureVB,
  trademarkId
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

          function loadAndAddModelToGroup(
            group,
            point,
            forStepXZ,
            forStepY,
            puzzle,
            counterTop,
            indexGroup
          ) {
            if (counterTop) {
              if (point.end !== null) {
                display.scene.remove(
                  kitchen[currentStep].lstModule[i].mainModule.gltf
                );

                glftLoader.load(
                  `${process.env.REACT_APP_URL}uploads/modules/${md.module.glbUrl}`,
                  (gltfScene) => {
                    gltfScene.scene.traverse((child) => {
                      if (child.isMesh) {
                        child.material.metalness = 0.5;
                        child.receiveShadow = true;
                        // child.castShadow = true;
                      }
                    });

                    const cosValue = Math.cos(
                      (puzzle.rotation * Math.PI) / 180
                    );
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

                    gltfScene.scene.rotateY((puzzle.rotation * Math.PI) / 180);

                    const userData = {
                      step: currentStep,
                      index: i,
                    };

                    gltfScene.scene.userData = userData;
                    gltfScene.scene.castShadow = true;

                    if (md?.texture?.imgUrl) {
                      textureLoader.load(
                        `${process.env.REACT_APP_URL}uploads/images/textures/${md.texture.imgUrl}`,
                        (texture) => {
                          gltfScene.scene.traverse((node) => {
                            if (node.isMesh) {
                              texture.wrapS = THREE.RepeatWrapping;
                              texture.wrapT = THREE.RepeatWrapping;

                              let desiredWidth = 1200 * widthScale;
                              let desiredHeight = 600;
                              // let desiredWidth = 2400 * widthScale;
                              // let desiredHeight = 1200;
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

                    display.scene.traverse((object) => {
                      if (object.name === "MATBEP") {
                        handleChangeTexture(
                          object,
                          md?.texture?.imgUrl,
                          md?.material?.metalness,
                          md?.material?.roughness
                        );
                      }
                    });

                    group.userData = userData;

                    group.add(gltfScene.scene);
                  }
                );
              }
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
                point.start.z +
                md.module.size.width * widthScale * forStepXZ.direction.z;

              childGroup.rotation.set(0, (puzzle.rotation * Math.PI) / 180, 0);

              const [moving, _] = countImpactModulePosition(
                kitchen,
                currentStep
              );
              childGroup.position.x = puzzle.x + moving;

              if (textureVB !== null) {
                handleChangeTexture(
                  childGroup,
                  textureVB,
                  md?.material?.metalness,
                  md?.material?.roughness
                );
              }
            }
          }

          let id = 0;
          let isCounterTop = true;
          let result = null;
          let newMeasure = 0;

          kitchen[currentStep].groupPuzzle.forEach((item) => {
            const stepForXZ = kitchen.find(
              (itemStep) => itemStep.stepId === item.forXZ
            );
            const stepForY = kitchen.find(
              (itemStep) => itemStep.stepId === item.forY
            );
            const pStart = new THREE.Vector3(item.x, item.y, item.z);

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
                item,
                isCounterTop,
                id
              );
            });

            id++;
          });

          if (kitchen[currentStep].lstModule[i].mainModule?.material !== null) {
            let measuareTemp = {
              w: newMeasure + kitchen[currentStep].measurePlus,
              h: 5,
              d: 610,
            };

            const newPrice = calculatePrice(
              md.unitPrice.formulaPrice,
              measuareTemp.w,
              measuareTemp.h,
              measuareTemp.d,
              md.unitPrice.priceValue
            );

            kitchen[currentStep].lstModule[i].mainModule.price = newPrice;
          }

          kitchen[currentStep].lstModule[i].mainModule.measure =
            newMeasure + kitchen[currentStep].measurePlus;
          kitchen[currentStep].measure =
            newMeasure + kitchen[currentStep].measurePlus;
          kitchen[currentStep].totalMeasure =
            newMeasure + kitchen[currentStep].measurePlus;

          if (isCounterTop) {
            display.scene.remove(
              kitchen[currentStep].lstModule[i].mainModule.gltf
            );

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

export async function refreshMBVBScale(
  display,
  currentStep,
  productInfo,
  kitchen,
  stepId,
  textureVB
) {
  if (kitchen[currentStep]?.groupPuzzle?.length > 0) {
    for (let i = 0; i < kitchen[currentStep].lstModule.length; i++) {
      if (kitchen[currentStep].lstModule[i].mainModule !== null) {
        const md = kitchen[currentStep].lstModule[i].mainModule;

        const combinedModelGroup = new THREE.Group();

        function loadAndAddModelToGroup(
          group,
          point,
          forStepXZ,
          forStepY,
          puzzle,
          counterTop,
          indexGroup
        ) {
          if (counterTop) {
            if (point.end !== null) {
              display.scene.remove(
                kitchen[currentStep].lstModule[i].mainModule.gltf
              );

              glftLoader.load(
                `${process.env.REACT_APP_URL}uploads/modules/${md.module.glbUrl}`,
                (gltfScene) => {
                  gltfScene.scene.traverse((child) => {
                    if (child.isMesh) {
                      child.material.metalness = 0.5;
                      child.receiveShadow = true;
                      // child.castShadow = true;
                    }
                  });

                  const cosValue = Math.cos((puzzle.rotation * Math.PI) / 180);
                  var [widthGlb, depthGlb, heightGlb] = getGLBSize(
                    gltfScene.scene
                  );
                  const heightScale =
                    Math.abs(forStepY?.position.y - point.start.y) / heightGlb;
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

                  gltfScene.scene.rotateY((puzzle.rotation * Math.PI) / 180);

                  const userData = {
                    step: currentStep,
                    index: i,
                  };

                  gltfScene.scene.userData = userData;
                  gltfScene.scene.castShadow = true;

                  if (md?.texture?.imgUrl) {
                    textureLoader.load(
                      `${process.env.REACT_APP_URL}uploads/images/textures/${md.texture.imgUrl}`,
                      (texture) => {
                        gltfScene.scene.traverse((node) => {
                          if (node.isMesh) {
                            texture.wrapS = THREE.RepeatWrapping;
                            texture.wrapT = THREE.RepeatWrapping;

                            let desiredWidth = 1200 * widthScale;
                            let desiredHeight = 600;
                            // let desiredWidth = 2400 * widthScale;
                            // let desiredHeight = 1200;
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

                  display.scene.traverse((object) => {
                    if (object.name === "MATBEP") {
                      handleChangeTexture(
                        object,
                        md?.texture?.imgUrl,
                        md?.material?.metalness,
                        md?.material?.roughness
                      );
                    }
                  });

                  group.userData = userData;

                  group.add(gltfScene.scene);
                }
              );
            }
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
              point.start.z +
              md.module.size.width * widthScale * forStepXZ.direction.z;
            childGroup.rotation.set(0, (puzzle.rotation * Math.PI) / 180, 0);
            const [moving, _] = countImpactModulePosition(kitchen, currentStep);
            childGroup.position.x = puzzle.x + moving;

            if (textureVB !== null) {
              // console.log(textureVB);
              handleChangeTexture(
                childGroup,
                textureVB,
                md?.material?.metalness,
                md?.material?.roughness
              );
            }

            // console.log(point.start);
            // console.log(
            //   md.module.size.width * widthScale * forStepXZ.direction.z
            // );
          }
        }

        let id = 0;
        let isCounterTop = true;
        let result = null;
        let newMeasure = 0;
        kitchen[currentStep].groupPuzzle.forEach((item) => {
          const stepForXZ = kitchen.find(
            (itemStep) => itemStep.stepId === item.forXZ
          );
          const stepForY = kitchen.find(
            (itemStep) => itemStep.stepId === item.forY
          );
          const pStart = new THREE.Vector3(item.x, item.y, item.z);

          if (stepForY) {
            isCounterTop = false;
          }

          result = setCounterTop(stepForXZ, pStart, isCounterTop);
          newMeasure += result.measure;
          // console.log(result);

          result.lstPoint.forEach((point) => {
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

        if (kitchen[currentStep].lstModule[i].mainModule?.material !== null) {
          const newPrice = calculatePrice(
            md.unitPrice.formulaPrice,
            newMeasure.w,
            newMeasure.h,
            newMeasure.d,
            md.unitPrice.priceValue
          );

          kitchen[currentStep].lstModule[i].mainModule.price = newPrice;
        }

        kitchen[currentStep].lstModule[i].mainModule.measure = newMeasure;

        if (isCounterTop) {
          display.scene.remove(
            kitchen[currentStep].lstModule[i].mainModule.gltf
          );

          // console.log(kitchen[currentStep].lstModule[i].mainModule.gltf);

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

const scale = 1;
export function refresh3D(
  canInside,
  isPB,
  display,
  currentStep,
  productInfo,
  kitchen,
  idTrademark
) {
  if (kitchen[currentStep]?.groupPuzzle?.length > 0) {
    // for (let i = 0; i < kitchen[currentStep].lstModule.length; i++) {
    //   const md = kitchen[currentStep].lstModule[i];
    //   if (md.mainModule !== null) {
    //     display.scene.traverse((object) => {
    //       if (object.name === "MATBEP") {
    //         handleChangeTexture(object, md?.texture?.imgUrl);
    //       }
    //     });
    //   }
    // }
  } else {
    for (let i = 0; i < kitchen[currentStep].lstModule.length; i++) {
      let md = kitchen[currentStep].lstModule[i];
      const resultCountCurrentTotalDesignWithoutImpact =
        countCurrentTotalDesignWithoutImpact(kitchen, kitchen[currentStep], i);

      if (md.mainModule !== null) {
        if (i === 0) {
          const newMeasure = calculateFormula(
            kitchen[currentStep].measureFormula,
            kitchen[currentStep].baseMeasure,
            0,
            md.mainModule.module?.measure?.d,
            0
          );

          kitchen[currentStep].measure =
            newMeasure - kitchen[currentStep].measureImpact;
        }

        if (
          resultCountCurrentTotalDesignWithoutImpact +
            md.mainModule?.module?.indexDesign >
            kitchen[currentStep].designUnit &&
          countCurrentTotalDesignWithoutImpact(
            kitchen,
            kitchen[currentStep],
            i
          ) +
            md.mainModule?.module?.indexDesign >
            kitchen[currentStep].designUnit &&
          md.mainModule?.module
        ) {
          if (md.mainModule?.module) {
            kitchen[currentStep].totalIndexDesign =
              resultCountCurrentTotalDesignWithoutImpact;
            onlyRemoveModule(display, kitchen, i, kitchen[currentStep]);
            removeBehindModule(display, kitchen, currentStep, i);
            break;
          }
        }

        let mainObject = display.scene.getObjectByProperty(
          "uuid",
          md.mainModule?.gltf?.uuid
        );
        if (mainObject) {
          const [moving, impactLeft] = countImpactModulePosition(
            kitchen,
            currentStep
          );
          if (impactLeft > 0 && md.mainModule.module.only === true && i === 0) {
            kitchen[currentStep].totalIndexDesign -=
              kitchen[currentStep].lstModule[i].mainModule.module.indexDesign;
            onlyRemoveAccumulate(display, kitchen, i, kitchen[currentStep]);
            const newMD = kitchen[currentStep].lstModule[i];
            const newMainObject = display.scene.getObjectByProperty(
              "uuid",
              newMD.mainModule?.gltf?.uuid
            );
            if (newMainObject) {
              newMainObject.position.y = newMD.mainModule.module.position?.y
                ? newMD.mainModule.module.position.y - Y / 2
                : kitchen[currentStep].position.y;
              newMainObject.position.x = newMD.mainModule.module.position?.x
                ? newMD.mainModule.module.position.x - X / 2
                : kitchen[currentStep].position.x +
                  moving * kitchen[currentStep].direction.x;
              newMainObject.position.z = newMD.mainModule.module.position?.z
                ? newMD.mainModule.module.position.z - Z / 2
                : kitchen[currentStep].position.z +
                  (newMainObject.size.width + moving) *
                    kitchen[currentStep].direction.z;
            }
            if (kitchen[currentStep].lstModule[i].mainModule === null) {
              continue;
            }
            md = kitchen[currentStep].lstModule[i];
            mainObject = display.scene.getObjectByProperty(
              "uuid",
              md.mainModule?.gltf?.uuid
            );
          }

          if (
            md.mainModule.module.only === true &&
            md.mainModule.module.startIndex === -1 &&
            kitchen[currentStep].designUnit -
              kitchen[currentStep].totalIndexDesign >
              0
          ) {
            kitchen[currentStep].totalIndexDesign -=
              kitchen[currentStep].lstModule[i].mainModule.module.indexDesign;
          }

          if (md.mainModule?.module?.type === TypeModule.LOVER_MODULE) {
            // mainObject.scale.z = scale;
            // mainObject.size = {
            //   width: md.mainModule.module.size.width,
            //   depth: md.mainModule.module.size.depth,
            //   height: md.mainModule.module.size.height,
            // };
          } else if (
            md.mainModule?.module?.type === TypeModule.REQUIRE_MODULE &&
            md.mainModule.dependentStep
          ) {
            const stepBaseScale = kitchen.find(
              (step) => step.stepId === md.mainModule.dependentStep
            );

            const scaleValueRequireModuleZ = scaleRequireModule(
              stepBaseScale,
              kitchen[currentStep],
              md.mainModule.module
            );
            mainObject.scale.set(scale, scale, scaleValueRequireModuleZ);
            mainObject.size = {
              width: md.mainModule.module.size.width * scaleValueRequireModuleZ,
              depth: md.mainModule.module.size.depth,
              height: md.mainModule.module.size.height,
            };
          } else {
            mainObject.scale.z = kitchen[currentStep].scale;
            mainObject.size = {
              width:
                md.mainModule.module.size.width * kitchen[currentStep].scale,
              depth: md.mainModule.module.size.depth,
              height: md.mainModule.module.size.height,
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
            const [moving, _] = countImpactModulePosition(kitchen, currentStep);
            mainObject.position.y = md.mainModule.module.position?.y
              ? md.mainModule.module.position.y - Y / 2
              : kitchen[currentStep].position.y;
            mainObject.position.x = md.mainModule.module.position?.x
              ? md.mainModule.module.position.x - X / 2
              : kitchen[currentStep].position.x +
                moving * kitchen[currentStep].direction.x;
            mainObject.position.z = md.mainModule.module.position?.z
              ? md.mainModule.module.position.z - Z / 2
              : kitchen[currentStep].position.z +
                (mainObject.size.width + moving) *
                  kitchen[currentStep].direction.z;
          }
          md.mainModule.gltf = display.scene.getObjectByProperty(
            "uuid",
            kitchen[currentStep].lstModule[i].mainModule?.gltf?.uuid
          );

          if (md.lstSubModule.length > 0) {
            md.lstSubModule.forEach((sub) => {
              if (sub && sub.gltf && sub?.module?.type !== 7) {
                const subObject = display.scene.getObjectByProperty(
                  "uuid",
                  sub.gltf.uuid
                );

                if (subObject && md.mainModule?.module?.only !== true) {
                  if (
                    md.mainModule?.module?.coverBox === true &&
                    md.mainModule?.module?.type !== TypeModule.LOVER_MODULE
                  ) {
                    if (
                      isPB === false &&
                      canInside === true &&
                      sub.type === "Cửa"
                    ) {
                      if (!kitchen[currentStep].baseScale) {
                        subObject.scale.set(
                          scale,
                          scale - 0.04,
                          scale * md.mainModule?.gltf?.scale?.z -
                            0.066 / md.mainModule?.indexDesign
                        );
                      } else {
                        subObject.scale.set(
                          scale,
                          scale - 0.02,
                          scale * md.mainModule?.gltf?.scale?.z -
                            0.066 / md.mainModule?.indexDesign
                        );
                      }

                      subObject.position.set(
                        md.mainModule.gltf.position.x + 0.015,
                        md.mainModule.gltf.position.y + 0.02,
                        md.mainModule.gltf.position.z + 0.004
                      );
                    } else {
                      subObject.scale.z = md.mainModule.gltf.scale.z;

                      subObject.position.set(
                        md.mainModule.gltf.position.x,
                        md.mainModule.gltf.position.y,
                        md.mainModule.gltf.position.z
                      );
                    }
                  } else {
                    subObject.scale.z = md.mainModule.gltf.scale.z;

                    subObject.position.set(
                      md.mainModule.gltf.position.x,
                      md.mainModule.gltf.position.y,
                      md.mainModule.gltf.position.z
                    );
                  }
                } else if (subObject) {
                  subObject.scale.z = md.mainModule.gltf.scale.z;

                  // subObject.position.set(
                  //   md.mainModule.gltf.position.x,
                  //   md.mainModule.gltf.position.y,
                  //   md.mainModule.gltf.position.z
                  // );
                }
                sub.gltf = subObject;
              }
            });
          }
        }
      }
    }
  }
}

export function changeWardrobeType(display, kitchen, canInside, isPB) {
  const currentStep = 0;

  kitchen.forEach((step) => {
    if (step.totalIndexDesign !== 0) {
      for (let i = 0; i < step.lstModule.length; i++) {
        let md = step.lstModule[i];

        if (
          md.mainModule !== null &&
          md.mainModule?.module !== null &&
          md.mainModule?.module.only !== true
        ) {
          if (md.mainModule?.module?.type === TypeModule.LOVER_MODULE) {
          } else if (
            md.mainModule?.module?.type === TypeModule.REQUIRE_MODULE &&
            md.mainModule.dependentStep
          ) {
          } else {
            let mainObject = display.scene.getObjectByProperty(
              "uuid",
              md.mainModule?.gltf?.uuid
            );

            if (
              isPB === false &&
              canInside === true &&
              md.mainModule.module.coverBox === true &&
              md.mainModule.module.type !== TypeModule.LOVER_MODULE
            ) {
              mainObject.scale.x = scale + 0.032;
            } else {
              mainObject.scale.x = scale;
            }

            mainObject.scale.z = kitchen[currentStep].scale;
            mainObject.size = {
              width:
                md.mainModule.module.size.width * kitchen[currentStep].scale,
              depth: md.mainModule.module.size.depth,
              height: md.mainModule.module.size.height,
            };
          }

          if (md.lstSubModule.length > 0) {
            md.lstSubModule.forEach((sub) => {
              if (sub && sub.gltf && sub?.module?.type !== 7) {
                const subObject = display.scene.getObjectByProperty(
                  "uuid",
                  sub.gltf.uuid
                );

                if (subObject) {
                  if (md.mainModule?.module?.type !== TypeModule.LOVER_MODULE) {
                    if (
                      sub.type === "Cửa" &&
                      isPB === false &&
                      canInside === true &&
                      md.mainModule.module.coverBox === true &&
                      md.mainModule.module.type !== TypeModule.LOVER_MODULE
                    ) {
                      if (!step.baseScale) {
                        subObject.scale.set(
                          scale,
                          scale - 0.04,
                          scale * md.mainModule?.gltf?.scale?.z -
                            0.066 / md.mainModule?.indexDesign
                        );
                      } else {
                        subObject.scale.set(
                          scale,
                          scale - 0.02,
                          scale * md.mainModule?.gltf?.scale?.z -
                            0.066 / md.mainModule?.indexDesign
                        );
                      }

                      subObject.position.set(
                        md.mainModule.gltf.position.x + 0.015,
                        md.mainModule.gltf.position.y + 0.02,
                        md.mainModule.gltf.position.z + 0.004
                      );
                    } else {
                      subObject.scale.set(
                        scale,
                        scale,
                        md.mainModule.gltf.scale.z
                      );

                      subObject.position.set(
                        md.mainModule.gltf.position.x,
                        md.mainModule.gltf.position.y,
                        md.mainModule.gltf.position.z
                      );
                    }
                  } else {
                    subObject.scale.z = md.mainModule.gltf.scale.z;

                    subObject.position.set(
                      md.mainModule.gltf.position.x,
                      md.mainModule.gltf.position.y,
                      md.mainModule.gltf.position.z
                    );
                  }

                  sub.gltf = subObject;
                }
              }
            });
          }
        }
      }
    }
  });
}

export async function isExistModuleWife(oldModule, newLover) {
  const listWifeModule = await getListWifeModule(newLover._id);
  const isExist = listWifeModule.listModule.some((item) => {
    item.forEach((element) => element._id === oldModule._id);
  });
  if (isExist) {
    return true;
  } else {
    return false;
  }
}

export function countCurrentTotalDesign(kitchen, currentStep, currentIndex) {
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
  const [_, impactDesign] = countImpactModulePosition(
    kitchen,
    kitchen.indexOf(currentStep)
  );
  return currentTotalDesign + impactDesign;
}

export function countTotalDesignWithEdit(kitchen, currentStep, currentIndex) {
  let currentTotalDesign = 0;

  for (let i = 0; i < currentStep.lstModule.length; i++) {
    if (
      currentStep.lstModule[i].mainModule?.module != null &&
      i !== currentIndex
    ) {
      currentTotalDesign += currentStep.lstModule[i].mainModule?.indexDesign;
    }
  }

  const [_, impactDesign] = countImpactModulePosition(
    kitchen,
    kitchen.indexOf(currentStep)
  );
  return currentTotalDesign + impactDesign;
}

export function countCurrentTotalDesignLover(
  kitchen,
  currentStep,
  currentIndex,
  totalDesign
) {
  let currentTotalDesign = 0;
  let currentTotalDesignLover = 0;

  const [_, impactDesign] = countImpactModulePosition(
    kitchen,
    kitchen.indexOf(currentStep)
  );

  if (currentStep.lstModule[currentIndex]?.mainModule === null) {
    for (let i = 0; i < currentIndex; i++) {
      if (currentStep.lstModule[i].mainModule?.module !== null) {
        currentTotalDesign += currentStep.lstModule[i].mainModule?.indexDesign;

        if (currentTotalDesign + impactDesign > totalDesign) {
          currentTotalDesignLover +=
            currentStep.lstModule[i].mainModule?.indexDesign;
        }
      }
    }
  } else {
    for (let i = 0; i < currentIndex; i++) {
      if (currentStep.lstModule[i].mainModule?.module !== null) {
        currentTotalDesign += currentStep.lstModule[i].mainModule?.indexDesign;

        if (currentTotalDesign + impactDesign > totalDesign) {
          currentTotalDesignLover +=
            currentStep.lstModule[i].mainModule?.indexDesign;
        }
      }
    }
  }

  // if (currentStep.lstModule[currentIndex]?.mainModule === null) {
  //   for (let i = 0; i <= currentIndex; i++) {
  //     if (currentStep.lstModule[i].mainModule?.module !== null) {
  //       currentTotalDesign += currentStep.lstModule[i].mainModule?.indexDesign;

  //       if (currentTotalDesign + impactDesign > totalDesign) {
  //         currentTotalDesignLover +=
  //           currentStep.lstModule[i].mainModule?.indexDesign;
  //       }
  //     }
  //   }
  // } else {
  //   for (let i = 0; i <= currentIndex; i++) {
  //     if (currentStep.lstModule[i].mainModule?.module !== null) {
  //       currentTotalDesign += currentStep.lstModule[i].mainModule?.indexDesign;

  //       if (currentTotalDesign + impactDesign > totalDesign) {
  //         currentTotalDesignLover +=
  //           currentStep.lstModule[i].mainModule?.indexDesign;
  //       }
  //     }
  //   }
  // }

  return currentTotalDesignLover;
}

export function countCurrentTotalDesignWithoutImpact(
  kitchen,
  currentStep,
  currentIndex
) {
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
  if (currentStep.lstModule[currentIndex].mainModule === null) {
    return currentStep.totalIndexDesign;
  } else if (currentStep.lstModule[currentIndex]?.mainModule?.module === null) {
    return currentStep.totalIndexDesign - 1;
  } else {
    return (
      currentStep.totalIndexDesign -
      currentStep.lstModule[currentIndex]?.mainModule.module.indexDesign
    );
  }
}

export function onlyRemoveAccumulate(display, kitchen, idx, currentStep) {
  if (currentStep?.lstModule[idx]?.mainModule != null) {
    currentStep?.stepsWife?.forEach((stepItem) => {
      const stepWife = kitchen.find((stepWife) => stepWife.stepId === stepItem);
      const itemLover = stepWife.listModuleLover?.find(
        (item) =>
          item.moduleUuid === currentStep.lstModule[idx]?.mainModule?.uuid
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

    display.scene.remove(currentStep.lstModule[idx].mainModule?.gltf);
    currentStep.lstModule[idx].lstSubModule.forEach((item) => {
      display.scene.remove(item?.gltf);
    });

    currentStep.lstModule.splice(idx, 1);
    currentStep.lstModule.push({
      mainModule: null,
      lstModule: [],
    });

    currentStep.lstModule?.forEach((module) => {
      if (module.mainModule?.gltf) {
        module.mainModule.gltf.userData.index--;
        module.lstSubModule?.forEach((sub) => {
          if (sub.gltf?.userData) {
            sub.gltf.userData.index--;
          }
        });
      }
    });
  }
}

export function onlyRemoveModule(display, kitchen, idx, currentStep) {
  if (currentStep?.lstModule[idx]?.mainModule != null) {
    currentStep?.stepsWife?.forEach((stepItem) => {
      const stepWife = kitchen.find((stepWife) => stepWife.stepId === stepItem);
      const itemLover = stepWife.listModuleLover?.find(
        (item) =>
          item.moduleUuid === currentStep.lstModule[idx]?.mainModule?.uuid
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

    display.scene.remove(currentStep.lstModule[idx].mainModule?.gltf);
    currentStep.lstModule[idx].lstSubModule.forEach((item) => {
      display.scene.remove(item?.gltf);
    });

    currentStep.lstModule[idx].mainModule = null;
    currentStep.lstModule[idx].lstSubModule = [];
  }
}

export function removeBehindModule(
  display,
  kitchen,
  currentStep,
  currentIndex
) {
  for (let i = currentIndex + 1; i < kitchen[currentStep].designUnit; i++) {
    if (kitchen[currentStep].lstModule[i].mainModule !== null) {
      display.scene.remove(kitchen[currentStep].lstModule[i].mainModule?.gltf);

      if (kitchen[currentStep].lstModule[i].lstSubModule.length !== 0) {
        kitchen[currentStep].lstModule[i].lstSubModule?.forEach((subModule) => {
          display.scene.remove(subModule?.gltf);
        });
      }

      kitchen[currentStep].lstModule[i].mainModule = null;
      kitchen[currentStep].lstModule[i].lstSubModule = [];
    } else {
      const totals = calculateTotalIndexDesign(kitchen[currentStep].lstModule);
      kitchen[currentStep].totalIndexDesign = totals[0];
      kitchen[currentStep].totalMeasure = totals[1];

      break;
    }
  }
}

export const findUnitPrice = (data, groupId, materialId, trademarkId) => {
  console.log(groupId);
  console.log(materialId);
  console.log(data);
  console.log(trademarkId);
  if (materialId) {
    let unitPrice = { formulaPrice: null, priceValue: null };

    const listPrices = data.find((group) => group._id === groupId)?.price;
    console.log(listPrices);
    if (listPrices) {
      const priceValue = listPrices.prices.find(
        (item) =>
          (item.trademark._id === trademarkId &&
            item.material._id == materialId) ||
          (!item.trademarkId && item.materialId == materialId)
      )?.priceValue;

      unitPrice = {
        formulaPrice: listPrices.formulaPrice,
        priceValue: priceValue || null,
      };
    }

    return unitPrice;
  }
};

export function calculatePrice(formula, width, height, depth, priceValue) {
  const processedFormula = formula
    .replace(new RegExp("HEIGH", "g"), height || 0)
    .replace(new RegExp("DEPTH", "g"), depth || 0)
    .replace(new RegExp("WIDTH", "g"), width || 0)
    .replace(new RegExp("UNIT_PRICE", "g"), priceValue || 0);
  const price = eval(processedFormula);

  return price;
}

export function calculatePriceUnit(formula, width, height, depth, priceUnit) {
  const processedFormula = formula
    .replace(new RegExp("HEIGH", "g"), height || 0)
    .replace(new RegExp("DEPTH", "g"), depth || 0)
    .replace(new RegExp("WIDTH", "g"), width || 0)
    .replace(new RegExp("STANDARD_UNIT_PRICE", "g"), priceUnit || 0);
  const price = eval(processedFormula);

  return price;
}

export function calculateFormula(formula, width, height, depth, designUnit) {
  const processedFormula = formula
    .replace(new RegExp("HEIGH", "g"), height)
    .replace(new RegExp("DEPTH", "g"), depth)
    .replace(new RegExp("WIDTH", "g"), width)
    .replace(new RegExp("DU", "g"), designUnit);

  const result = eval(processedFormula);

  return result;
}

export function calculateMeasure(
  formula,
  width,
  height,
  depth,
  scale,
  indexDesign
) {
  const processedFormula = formula
    .replace(new RegExp("HEIGH", "g"), height)
    .replace(new RegExp("DEPTH", "g"), depth)
    .replace(new RegExp("WIDTH", "g"), width)
    .replace(new RegExp("SCALE", "g"), scale)
    .replace(new RegExp("INDEX_DESIGN", "g"), indexDesign);
  const measure = eval(processedFormula);

  return measure;
}

const hexToRgb = (hex) => {
  const decimalColor = parseInt(hex.substring(1), 16);
  return decimalColor;
};

export const handleChangeTexture = (module, url, metaness, roughness) => {
  const isHexColor = (str) => /^#[0-9A-F]{6}$/i.test(str);
  if (isHexColor(url)) {
    const color = hexToRgb(url);
    return new Promise((resolve, reject) => {
      if (!color) {
        reject("Color is required.");
        return;
      }

      const ballMaterial = {
        metalness: metaness,
        roughness: roughness,
        color: color,
        normalScale: new THREE.Vector2(0.15, 0.15),
      };
      let ballMat = new THREE.MeshStandardMaterial(ballMaterial);
      module?.traverse((node) => {
        if (node.isMesh) {
          node.material = ballMat;
        }
      });

      resolve();
    });
  } else {
    return new Promise((resolve, reject) => {
      url &&
        textureLoader.load(
          `${process.env.REACT_APP_URL}uploads/images/textures/${url}`,
          (newTexture) => {
            const ballMaterial = {
              metalness: metaness,
              roughness: roughness,
              color: module.name === "" ? "#e5e5e5" : "#c9c9c9",
              normalScale: new THREE.Vector2(0.15, 0.15),
            };
            let ballMat = new THREE.MeshStandardMaterial(ballMaterial);
            module?.traverse((node) => {
              if (node.isMesh) {
                node.material = ballMat;
              }
            });
            newTexture.offset.set(1, 1);
            newTexture.wrapS = newTexture.wrapT = THREE.MirroredRepeatWrapping;
            // newTexture.repeat.set(1, 1);
            if (module.name === "MATBEP") {
              newTexture.repeat.set(2, 1);
            } else {
              newTexture.repeat.set(module.scale.z, 1);
            }
            console.log(module);

            newTexture.mapping = THREE.UVMapping;
            module?.traverse((node) => {
              if (node.isMesh) {
                const materials = Array.isArray(node.material)
                  ? node.material
                  : [node.material];
                materials.forEach((material) => {
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
  }
};

export const handleChangeTextureVirtual = (
  module,
  url,
  metalness,
  roughness
) => {
  return new Promise((resolve, reject) => {
    url &&
      textureLoader.load(
        `${process.env.REACT_APP_URL}uploads/virtuals/images/textures/${url}`,
        (newTexture) => {
          const ballMaterial = {
            metalness: metalness,
            roughness: roughness,
            color: module.name === "" ? "#e5e5e5" : "#c9c9c9",
            normalScale: new THREE.Vector2(0.15, 0.15),
          };
          let ballMat = new THREE.MeshStandardMaterial(ballMaterial);
          module?.traverse((node) => {
            if (node.isMesh) {
              node.material = ballMat;
            }
          });
          newTexture.offset.set(1, 1);
          newTexture.wrapS = newTexture.wrapT = THREE.MirroredRepeatWrapping;
          newTexture.repeat.set(4, 4);

          newTexture.mapping = THREE.UVMapping;
          module?.traverse((node) => {
            if (node.isMesh) {
              const materials = Array.isArray(node.material)
                ? node.material
                : [node.material];
              materials.forEach((material) => {
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

export const handleDeleteTexture = (module, metaness, roughness) => {
  return new Promise((resolve, reject) => {
    textureLoader.load(
      `./assets/images/TEXTURE_1700309678845.jpg`,
      (newTexture) => {
        const ballMaterial = {
          metalness: metaness,
          roughness: roughness,
          color: "#c9c9c9",
          normalScale: new THREE.Vector2(0.15, 0.15),
        };
        let ballMat = new THREE.MeshStandardMaterial(ballMaterial);
        module?.traverse((node) => {
          if (node.isMesh) {
            node.material = ballMat;
          }
        });
        module?.traverse((child) => {
          if (child.isMesh) {
            const materials = Array.isArray(child.material)
              ? child.material
              : [child.material];
            materials.forEach((material) => {
              if (metaness) {
                material.metalness = metaness;
              }
              if (roughness) {
                material.roughness = roughness;
              }

              newTexture.wrapS = THREE.RepeatWrapping;
              newTexture.wrapT = THREE.RepeatWrapping;

              let desiredWidth = 1200;
              let desiredHeight = 600;
              let originalWidth = newTexture.image.width;
              let originalHeight = newTexture.image.height;
              let scaleWidth = desiredWidth / originalWidth;
              let scaleHeight = desiredHeight / originalHeight;

              newTexture.repeat.set(module.scale.z * scaleWidth, scaleHeight);
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

export function setTemporaryOpacity(group, duration) {
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
    } else {
    }
  }

  requestAnimationFrame(animate);
}

const getTopLevelObject = (object) => {
  if (object.userData?.step !== undefined) {
    return object;
  } else {
    return getTopLevelObject(object.parent);
  }
};

const handleFocusModule = (
  display,
  kitchen,
  setModelClicked,
  setTabSelected
) => {
  let parent = clickedObject.parent;

  while (parent) {
    if (
      parent instanceof THREE.Group &&
      parent.name !== "BACKGROUND" &&
      parent.name !== "SKIRTING_TILE" &&
      parent.name !== "WALL" &&
      parent.name !== "FLOOR" &&
      parent.name !== "MEASURE"
    ) {
      let clicked = getTopLevelObject(parent);

      setModelClicked(clicked);
      setTabSelected({
        step: null,
        index: null,
      });

      // console.log("CLICK", clicked);

      // const mData =
      //   kitchen[clicked.userData.step]?.lstModule[clicked.userData.index]
      //     ?.mainModule;
      // const lsData =
      //   kitchen[clicked.userData.step]?.lstModule[clicked.userData.index]
      //     ?.lstSubModule;

      // const setOpacity = (object) => {
      //   const glbObject = display.scene.getObjectByProperty(
      //     "uuid",
      //     object?.gltf?.uuid
      //   );
      //   if (glbObject) {
      //     setTemporaryOpacity(glbObject, 1000);
      //   }
      // };

      // setOpacity(mData);

      // lsData?.forEach(setOpacity);

      break;
    }
    parent = parent.parent;
  }
};

export const handleMouseDown = (
  event,
  display,
  kitchen,
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

    handleFocusModule(display, kitchen, setModelClicked, setTabSelected);
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
          parent.name !== "SKIRTING_TILE" &&
          parent.name !== "WALL" &&
          parent.name !== "FLOOR" &&
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
    if (object.name === name||object.name.includes("TAYNAM")) {
      // Ẩn mô hình
      object.visible = false;
      object.castShadow = false;
      object.userData.interactable = false;
    }
  });
};



export const handleShow = (display, name) => {
  display.scene.traverse((object) => {
    if (object.name === name||object.name.includes("TAYNAM")) {
      // Ẩn mô hình
      object.visible = true;
      object.userData.interactable = true;
    }
  });
};

export const handleSaveDesign = async (name) => {
  const token = Cookie.get("token");
  const owner = Cookie.get("owner");
  const typeProduct = JSON.parse(localStorage.getItem("typeProduct"));
  const trademark = JSON.parse(localStorage.getItem("trademark"));
  const imgData = JSON.parse(localStorage.getItem("imgData"));
  const inputData = JSON.parse(localStorage.getItem("formData"));
  const canInsideString = localStorage.getItem("canInside");
  const isPBString = localStorage.getItem("isPB");
  // Chuyển đổi chuỗi thành boolean
  const canInside = canInsideString === "true";
  const isPB = isPBString === "true";

  const kitchen = {
    info: {
      formData: inputData,
      canInside: canInside,
      isPB: isPB,
    },
    data: JSON.parse(localStorage.getItem("kitchen")),
  };

  // Tách phần dữ liệu base64 từ chuỗi
  const base64Data = imgData.split(",")[1];

  // Chuyển đổi base64 thành mảng dữ liệu
  const binaryString = window.atob(base64Data);
  const dataArray = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    dataArray[i] = binaryString.charCodeAt(i);
  }

  // Tạo Blob từ mảng dữ liệu
  const blob = new Blob([dataArray], { type: "image/jpeg" });

  // Tạo đối tượng File từ Blob
  const file = new File([blob], "img.jpg", { type: "image/jpeg" });
  const formData = new FormData();
  formData.append("pic_file", file);
  formData.append("name", name);
  formData.append("productId", typeProduct);
  formData.append("trademarkId", trademark.value);
  formData.append("premium", false);
  formData.append("ownerId", owner);
  formData.append("kitchen", JSON.stringify(kitchen));

  try {
    const headers = {
      authorization: `Bearer ${token}`,
    };

    const res = await callApi(`design`, "POST", formData, headers);

    if (res.status) {
      toast.success("Lưu thành công");
    } else {
      toast.error("Tên thiết kế đã tồn tại");
    }
  } catch (err) {
    console.log(err);
    toast.error("Tên thiết kế đã tồn tại");
  }
};

export const handleSaveImage = () => {
  const imgData = JSON.parse(localStorage.getItem("imgData"));

  saveAs(imgData, "lanha-design.jpg");
};

export const getProjectById = async (id, setProjectDetail) => {
  const token = Cookie.get("token");

  localStorage.removeItem("executing");
  localStorage.removeItem("showNextStep");
  localStorage.removeItem("recommendedMain");
  localStorage.removeItem("recommendedSub");

  try {
    const headers = {
      authorization: `Bearer ${token}`,
    };

    const res = await callApi(`design/${id}`, "GET", "", headers);

    if (res) {
      setProjectDetail(res.data.data.kitchen.data);

      const trademark = {
        value: res.data.data.trademarkId,
        // label: res.data.data.trademark.name,
      };

      localStorage.setItem(
        "imgData",
        JSON.stringify(
          `${process.env.REACT_APP_URL}uploads/images/icons/${res.data.data.picUrl}`
        )
      );
      localStorage.setItem("formData", JSON.stringify(res.data.data.kitchen.info.formData));
      localStorage.setItem("canInside", res.data.data.kitchen.info.canInside);
      localStorage.setItem("isPB", res.data.data.kitchen.info.isPB);
      localStorage.setItem("projectName", JSON.stringify(res.data.data.name));
      localStorage.setItem(
        "kitchen",
        JSON.stringify(res.data.data.kitchen.data)
      );
      localStorage.setItem("trademark", JSON.stringify(trademark));
      localStorage.setItem(
        "typeProduct",
        JSON.stringify(res.data.data.productId)
      );
    }
    return res;
  } catch (err) {
    console.log(err);
    return null;
  }
};

export const checkModuleAvailability = (
  kitchen,
  currentStep,
  currentIndex,
  cabinet,
  group
) => {
  if (
    cabinet.type === TypeModule.LOVER_MODULE &&
    kitchen[currentStep]?.baseScale === true
  ) {
    let checkIndexDesign = 0;
    kitchen[currentStep].lstModule.forEach((item, index) => {
      if (item.mainModule !== null && index !== currentIndex) {
        checkIndexDesign += item.mainModule.indexDesign;
      }
    });
    checkIndexDesign += cabinet.indexDesign;

    if (checkIndexDesign > kitchen[currentStep].designUnit - 1) {
      let check = true;
      kitchen[currentStep].lstModule.forEach((item, index) => {
        if (index !== currentIndex && item.mainModule !== null) {
          if (item.mainModule?.module.type !== TypeModule.LOVER_MODULE) {
            check = false;
          }
        }
      });
      if (check) {
        let measureCount = 0;
        kitchen[currentStep].lstModule.forEach((item, index) => {
          if (index !== currentIndex && item.mainModule !== null) {
            measureCount += item.mainModule.measure.w;
          }
        });
        if (
          measureCount + parseFloat(group.actualSize?.width) !==
          parseFloat(kitchen[currentStep].measure)
        ) {
          return false;
        }
      } else {
        // let measureCount = 0;
        // kitchen[currentStep].lstModule.forEach((item, index) => {
        //   if (index !== currentIndex && item.mainModule !== null) {
        //     if (item.mainModule?.module.type === TypeModule.LOVER_MODULE) {
        //       measureCount += item.mainModule.measure.w;
        //     } else {
        //       measureCount += item.mainModule.indexDesign * 350;
        //     }
        //   }
        // });
        // if (
        //   measureCount + parseFloat(group.actualSize?.width) >
        //   parseFloat(kitchen[currentStep].measure)
        // ) {
        //   return false;
        // }
      }
    } else {
      let check = true;
      kitchen[currentStep].lstModule.forEach((item, index) => {
        if (index !== currentIndex && item.mainModule !== null) {
          if (item.mainModule?.module.type !== TypeModule.LOVER_MODULE) {
            check = false;
          }
        }
      });
      if (check) {
        let measureCount = 0;
        kitchen[currentStep].lstModule.forEach((item, index) => {
          if (index !== currentIndex && item.mainModule !== null) {
            measureCount += item.mainModule.measure.w;
          }
        });
        if (
          measureCount + parseFloat(group.actualSize?.width) >=
          parseFloat(kitchen[currentStep].measure)
        ) {
          return false;
        }
      }
    }
  }
  return true;
};

export function getTimeAgo(createDate) {
  const currentDate = new Date();
  const postDate = new Date(createDate);
  postDate.setHours(postDate.getHours() + 7);

  const timeDifference = currentDate.getTime() - postDate.getTime();
  const seconds = Math.floor(timeDifference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);

  // if (weeks > 0) {
  //   return `${weeks} weeks ago`;
  // } else if (days > 0) {
  //   return `${days} days ago`;
  // } else if (hours > 0) {
  //   return `${hours} hours ago`;
  // } else if (minutes > 0) {
  //   return `${minutes} minutes ago`;
  // } else {
  //   return `${seconds} seconds ago`;
  // }
  if (weeks > 0) {
    return `${weeks} tuần trước`;
  } else if (days > 0) {
    return `${days} ngày trước`;
  } else if (hours > 0) {
    return `${hours} giờ trước`;
  } else if (minutes > 0) {
    return `${minutes} phút trước`;
  } else {
    return `${seconds} giây trước`;
  }
}
