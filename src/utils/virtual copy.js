import * as THREE from "three";

const raycaster = new THREE.Raycaster(); // create once
var mouse = new THREE.Vector2();

let clickedObject = null;

const getTopLevelObject = (object) => {
  if (object.userData?.step !== undefined) {
    return object;
  } else {
    return getTopLevelObject(object.parent);
  }
};

let clicked = null;

let wallLeft;
let wallRight;
let wallBottom;
let wallLeftBox;
let wallRightBox;
let wallBottomBox;

const handleDragModule = (canvas, point, display, kitchen, setModelClicked) => {
  if (clicked) {
    const moduleBox = new THREE.Box3(
      new THREE.Vector3(),
      new THREE.Vector3()
    ).setFromObject(clicked);

    const collisionL = wallLeftBox.intersectsBox(moduleBox); //kiem tra va cham voi tuong ben trai
    const collisionR = wallRightBox.intersectsBox(moduleBox); //kiem tra va cham voi tuong ben phai
    const collisionB = wallBottomBox.intersectsBox(moduleBox); //kiem tra va cham voi tuong phia sau

    // console.log(clicked.name);
    // console.log("MOVE");
    // console.log(collisionL);

    if (
      kitchen[clicked.userData.step]?.lstModule[clicked.userData.index]
        ?.mainModule?.gltf?.position
    ) {
      canvas.style.cursor = "move";

      //va cham ben trai
      if (collisionL) {
        if (!collisionB) {
          if (
            point.x >
            kitchen[clicked.userData.step].lstModule[clicked.userData.index]
              .mainModule.gltf.position.x
          ) {
            kitchen[clicked.userData.step].lstModule[
              clicked.userData.index
            ].mainModule.gltf.position.set(
              point.x,
              kitchen[clicked.userData.step].lstModule[clicked.userData.index]
                .mainModule.gltf.position.y,
              point.z
            );
            // kitchen[clicked.userData.step].lstModule[
            //   clicked.userData.index
            // ].mainModule.gltf.position.set(
            //   point.x,
            //   kitchen[clicked.userData.step].lstModule[clicked.userData.index]
            //     .mainModule.gltf.position.y,
            //   point.z
            // );
          } else {
            kitchen[clicked.userData.step].lstModule[
              clicked.userData.index
            ].mainModule.gltf.position.setZ(
              kitchen[clicked.userData.step].lstModule[clicked.userData.index]
                .mainModule.gltf.userData.position.z
            );
            // kitchen[clicked.userData.step].lstModule[
            //   clicked.userData.index
            // ].mainModule.gltf.position.setZ(point.z);
          }

          return;
        }
      }

      //va cham ben phai
      if (collisionR) {
        if (!collisionB) {
          if (
            point.x <
            kitchen[clicked.userData.step].lstModule[clicked.userData.index]
              .mainModule.gltf.position.x
          ) {
            kitchen[clicked.userData.step].lstModule[
              clicked.userData.index
            ].mainModule.gltf.position.set(
              point.x,
              kitchen[clicked.userData.step].lstModule[clicked.userData.index]
                .mainModule.gltf.position.y,
              point.z
            );
          } else {
            kitchen[clicked.userData.step].lstModule[
              clicked.userData.index
            ].mainModule.gltf.position.setZ(point.z);
          }

          return;
        }
      }

      //va cham phia sau
      if (collisionB) {
        if (!collisionL && !collisionR) {
          if (
            point.z >
            kitchen[clicked.userData.step].lstModule[clicked.userData.index]
              .mainModule.gltf.position.z
          ) {
            kitchen[clicked.userData.step].lstModule[
              clicked.userData.index
            ].mainModule.gltf.position.set(
              point.x,
              kitchen[clicked.userData.step].lstModule[clicked.userData.index]
                .mainModule.gltf.position.y,
              point.z
            );
          } else {
            kitchen[clicked.userData.step].lstModule[
              clicked.userData.index
            ].mainModule.gltf.position.setX(point.x);
          }

          return;
        }

        if (collisionL) {
          if (
            point.x >
              kitchen[clicked.userData.step].lstModule[clicked.userData.index]
                .mainModule.gltf.position.x &&
            point.z >
              kitchen[clicked.userData.step].lstModule[clicked.userData.index]
                .mainModule.gltf.position.z
          ) {
            kitchen[clicked.userData.step].lstModule[
              clicked.userData.index
            ].mainModule.gltf.position.set(
              point.x,
              kitchen[clicked.userData.step].lstModule[clicked.userData.index]
                .mainModule.gltf.position.y,
              point.z
            );

            return;
          } else if (
            point.x >
              kitchen[clicked.userData.step].lstModule[clicked.userData.index]
                .mainModule.gltf.position.x &&
            point.z <
              kitchen[clicked.userData.step].lstModule[clicked.userData.index]
                .mainModule.gltf.position.z
          ) {
            kitchen[clicked.userData.step].lstModule[
              clicked.userData.index
            ].mainModule.gltf.position.setX(point.x);
          } else if (
            point.x <
              kitchen[clicked.userData.step].lstModule[clicked.userData.index]
                .mainModule.gltf.position.x &&
            point.z >
              kitchen[clicked.userData.step].lstModule[clicked.userData.index]
                .mainModule.gltf.position.z
          ) {
            kitchen[clicked.userData.step].lstModule[
              clicked.userData.index
            ].mainModule.gltf.position.setZ(point.z);
          }
        }

        if (collisionR) {
          if (
            point.x <
              kitchen[clicked.userData.step].lstModule[clicked.userData.index]
                .mainModule.gltf.position.x &&
            point.z >
              kitchen[clicked.userData.step].lstModule[clicked.userData.index]
                .mainModule.gltf.position.z
          ) {
            kitchen[clicked.userData.step].lstModule[
              clicked.userData.index
            ].mainModule.gltf.position.set(
              point.x,
              kitchen[clicked.userData.step].lstModule[clicked.userData.index]
                .mainModule.gltf.position.y,
              point.z
            );

            return;
          } else if (
            point.x >
              kitchen[clicked.userData.step].lstModule[clicked.userData.index]
                .mainModule.gltf.position.x &&
            point.z >
              kitchen[clicked.userData.step].lstModule[clicked.userData.index]
                .mainModule.gltf.position.z
          ) {
            kitchen[clicked.userData.step].lstModule[
              clicked.userData.index
            ].mainModule.gltf.position.setZ(point.z);
          } else if (
            point.x <
              kitchen[clicked.userData.step].lstModule[clicked.userData.index]
                .mainModule.gltf.position.x &&
            point.z <
              kitchen[clicked.userData.step].lstModule[clicked.userData.index]
                .mainModule.gltf.position.z
          ) {
            kitchen[clicked.userData.step].lstModule[
              clicked.userData.index
            ].mainModule.gltf.position.setX(point.x);
          }
        }
      }

      //khong co va cham
      if (!collisionL && !collisionR && !collisionB) {
        kitchen[clicked.userData.step].lstModule[
          clicked.userData.index
        ].mainModule.gltf.position.set(
          point.x,

          kitchen[clicked.userData.step].lstModule[clicked.userData.index]
            .mainModule.gltf.position.y,
          point.z
        );

        kitchen[clicked.userData.step].lstModule[
          clicked.userData.index
        ].mainModule.gltf.userData.position = point;

        return;
      }
    }
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

    let parent = clickedObject.parent;

    if (clicked === null) {
      wallLeft = display.scene.getObjectByName("wall_left");
      wallRight = display.scene.getObjectByName("wall_right");
      wallBottom = display.scene.getObjectByName("wall_bottom");

      wallLeftBox = new THREE.Box3(
        new THREE.Vector3(),
        new THREE.Vector3()
      ).setFromObject(wallLeft);
      wallRightBox = new THREE.Box3(
        new THREE.Vector3(),
        new THREE.Vector3()
      ).setFromObject(wallRight);
      wallBottomBox = new THREE.Box3(
        new THREE.Vector3(),
        new THREE.Vector3()
      ).setFromObject(wallBottom);

      // console.log("WALL BOX");

      clicked = clickedObject;

      while (parent) {
        if (
          parent instanceof THREE.Group &&
          parent.name !== "BACKGROUND" &&
          parent.name !== "SKIRTING_TILE" &&
          parent.name !== "WALL" &&
          parent.name !== "FLOOR" &&
          parent.name !== "MEASURE"
        ) {
          clicked = getTopLevelObject(parent);

          setModelClicked(clicked);

          // console.log(clicked);

          break;
        }
        parent = parent.parent;
      }
    }
  }
};

export const handleMouseMove = (
  event,
  canvas,
  display,
  kitchen,
  setModelClicked
) => {
  // console.log("move in main");
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
  let intersects = null;
  if (display) {
    raycaster.setFromCamera(mouse, display.camera);
    intersects = raycaster.intersectObjects(display.scene.children, true);
  }

  if (intersects[0] && clickedObject) {
    for (let i = 0; i < intersects.length; i++) {
      // if (!intersects[i].object.userData.ground) continue;

      handleDragModule(
        canvas,
        intersects[i].point,
        display,
        kitchen,
        setModelClicked
      );
    }
  }
};

export const handleMouseUp = (canvas) => {
  clickedObject = null;
  canvas.style.cursor = "default";
};
