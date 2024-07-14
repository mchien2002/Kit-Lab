import Cookies from "js-cookie";
import toast from "react-hot-toast";
import * as THREE from "three";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import callApi from "./callApi";
import { moduleVirtualDetailReducer } from "../store/reducers/moduleVirtualDetail.reducers";

const raycaster = new THREE.Raycaster(); // create once
var mouse = new THREE.Vector2();

let clickedObject = null;
let clicked = null;

const X = 5;
const Y = 3.08;
const Z = 5;

const getTopLevelObject = (object) => {
  if (object.userData?.step !== undefined) {
    return object;
  } else {
    return getTopLevelObject(object.parent);
  }
};

export const handleMouseDown = (event, display, setModelClicked) => {
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
    clicked = null;

    // console.log(clickedObject);

    if (
      clicked === null &&
      (clickedObject.name === "BOX" || clickedObject.name === "MAIN")
    ) {
      clicked = clickedObject;

      setModelClicked(clicked);
    } else {
      setModelClicked(null);
    }
  }
};

export const convertDataVirtual = (data) => {
  let newData = [];

  data.forEach((item) => {
    if (item.module !== null) {
      let newItem = {
        position: item.gltf.position,
        rotation: {
          x: item.gltf.rotation._x,
          y: item.gltf.rotation._y,
          z: item.gltf.rotation._z,
        },
        scale: item.gltf.scale,
        moduleId: item.module._id,
        textureId: item.texture._id,
      };
      newData.push(newItem);
    }
  });

  return newData;
};

export const handleSaveDesignVirtual = async (name, roomId, items) => {
  const token = Cookies.get("token");
  const owner = Cookies.get("owner");

  const data = {
    name: name,
    ownerId: owner,
    roomId: roomId,
    items: items,
  };

  try {
    const headers = {
      authorization: `Bearer ${token}`,
    };

    const res = await callApi(`virtual/design`, "POST", data, headers);

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

export const handleEditDesignVirtual = async (
  name,
  roomId,
  items,
  designId
) => {
  const token = Cookies.get("token");
  const owner = Cookies.get("owner");

  const data = {
    name: name,
    ownerId: owner,
    roomId: roomId,
    items: items,
  };

  try {
    const headers = {
      authorization: `Bearer ${token}`,
    };

    const res = await callApi(
      `virtual/design/${designId}`,
      "PUT",
      data,
      headers
    );

    if (res.status) {
      toast.success("Cập nhật thành công");
    } else {
      toast.error("Cập nhật không thành công");
    }
  } catch (err) {
    console.log(err);
    toast.error("Cập nhật không thành công");
  }
};

export const reloadGLTFModel = async (
  moduleData,
  index,
  display,
  sceneMeshes,
  kitchen,
  setKitchen,
  isLoading,
  setIsLoading
) => {
  return new Promise((resolve) => {
    const glftLoader = new GLTFLoader();
    const dLoader = new DRACOLoader();
    dLoader.setDecoderPath(
      "https://www.gstatic.com/draco/versioned/decoders/1.5.6/"
    );
    dLoader.setDecoderConfig({ type: "js" });
    glftLoader.setDRACOLoader(dLoader);

    if (!isLoading) {
      if (moduleData && moduleData.module?.glbUrl) {
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
            const main = gltfScene.scene.getObjectByName("MAIN");
            gltfScene.scene.scale.copy(moduleData.scale);
            gltfScene.scene.position.copy(moduleData.position);

            gltfScene.scene.rotation.set(
              moduleData.rotation.x,
              moduleData.rotation.y,
              moduleData.rotation.z
            );

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
            modelDragBox.position.copy(moduleData.position);
            modelDragBox.rotation.set(
              moduleData.rotation.x,
              moduleData.rotation.y,
              moduleData.rotation.z
            );
            modelDragBox.scale.set(1.15, 1.15, 1.15);
            modelDragBox.geometry.translate(0, size.y / 2, 0);
            modelDragBox.geometry.computeBoundingBox();
            modelDragBox.userData.currentPosition = new THREE.Vector3();
            modelDragBox.userData.index = index;
            modelDragBox.userData._id = moduleData.module._id;
            modelDragBox.name = "BOX";

            sceneMeshes.push(modelDragBox);
            display.scene.add(modelDragBox);

            const userData = {
              _id: moduleData.module._id,
              index: index,
              currentPosition: new THREE.Vector3(),
            };

            gltfScene.scene.userData = userData;

            let newKitchen = [...kitchen];

            // if (newKitchen[index].gltf !== null) {
            //   console.log("REMOVE");

            //   // display?.scene?.remove(newKitchen[index].gltf);
            //   // display?.scene?.remove(newKitchen[index].box);
            // }

            newKitchen[index].gltf = gltfScene.scene;
            newKitchen[index].box = modelDragBox;
            newKitchen[index].module = moduleData.module;
            newKitchen[index].material = moduleData.material;
            newKitchen[index].texture = moduleData.texture;
            newKitchen[index].price = moduleData.priceValue;

            setKitchen(newKitchen);

            display.scene.add(gltfScene.scene);

            resolve(gltfScene);
            setIsLoading(false);
          }
        );
      }
    }
  });
};
