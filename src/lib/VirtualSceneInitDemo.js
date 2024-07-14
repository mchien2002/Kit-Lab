import * as THREE from "three";
import { DragControls } from "three/examples/jsm/controls/DragControls.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";

const X = 5;
const Y = 3.08;
const Z = 5;

const raycaster = new THREE.Raycaster(); // create once
const mouse = new THREE.Vector2();
let mousePoint;

let wallLeftBB;
let wallLeftBB1;
let wallLeftBB2;
let wallRightBB;
let wallRightBB1;
let wallRightBB2;
let wallBottomBB;
let wallBottomBB1;
let wallBottomBB2;

export default class VirtualSceneInitDemo {
  constructor(canvasId, productInfo) {
    // NOTE: Core components to initialize Three.js app.
    this.scene = undefined;
    this.camera = undefined;
    this.renderer = undefined;
    this.groupMeasure = new THREE.Group();
    this.listGroupMeasure = [];
    this.rotationAngle = 0;

    // NOTE: Camera params;
    // this.fov = productInfo.camera.fov;
    this.fov = 15;
    this.nearPlane = 1;
    this.farPlane = 1000;
    this.canvasId = canvasId;

    // NOTE: Additional components.
    this.clock = undefined;
    this.stats = undefined;
    this.controls = undefined;

    // NOTE: Lighting is basically required.
    this.ambientLight = undefined;
    this.directionalLight = undefined;
    this.hemisphereLight = undefined;
  }

  initialize(productInfo) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      this.fov,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );

    this.camera.position.x = 7.5;
    this.camera.position.y = 0;
    this.camera.position.z = 0;
    // this.camera.position.z = 7.75;

    // NOTE: Specify a canvas which is already created in the HTML.
    const canvas = document.getElementById(this.canvasId);
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      // NOTE: Anti-aliasing smooths out the edges.
      antialias: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.scene.background = new THREE.Color(0xf3f2f2);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.8;
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    document
      .getElementById("container__canvas")
      .appendChild(this.renderer.domElement);

    this.clock = new THREE.Clock();
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.dispose();

    //Khóa sử dụng chuột phải để di chuyển vị trí camera
    this.controls.enablePan = false;

    this.stats = Stats();
    // document.body.appendChild(this.stats.dom);

    // ambient light which is for the whole scene
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    // this.ambientLight = new THREE.AmbientLight(0xfff9e7, 1);
    this.scene.add(this.ambientLight);

    // this.spotLight = new THREE.SpotLight(0xe9f1ff, 1);
    this.spotLight = new THREE.SpotLight(0xffffff, 1);
    this.spotLight.position.set(0, 10, 0);
    this.spotLight.target.position.set(0, 0, 0);
    this.spotLight.angle = Math.PI / 4;
    this.spotLight.penumbra = 0.5;
    this.spotLight.distance = 20;
    this.spotLight.decay = 5;
    // this.scene.add(this.spotLight);

    Array(3)
      .fill()
      .map((item, index) => {
        if (index === 0) {
          // this.directionalLight = new THREE.DirectionalLight(0xe9f1ff, 0.75);
          this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.75);
          this.directionalLight.position.set(1, 1, 1);
          this.directionalLight.castShadow = true;
          this.directionalLight.shadow.bias = -0.00001;
          this.directionalLight.shadow.normalBias = 0.1;
        } else if (index === 1) {
          // this.directionalLight = new THREE.DirectionalLight(0xe9f1ff, 0.5);
          // this.directionalLight.position.set(10, 0, 0);
          // this.directionalLight.castShadow = true;
          // this.directionalLight.shadow.bias = -0.00001;
          // this.directionalLight.shadow.normalBias = 0.1;
        } else {
          // this.directionalLight = new THREE.DirectionalLight(0xe9f1ff, 1);
          this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
          this.directionalLight.position.set(10, 8, 0);
          this.directionalLight.castShadow = true;
          this.directionalLight.shadow.bias = -0.00001;
          this.directionalLight.shadow.normalBias = 0.1;
        }
        this.scene.add(this.directionalLight);
      });

    // if window resizes
    window.addEventListener("resize", () => this.onWindowResize(), false);
    canvas.addEventListener("mousemove", (event) => {
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
      raycaster.setFromCamera(mouse, this.camera);
      const intersects = raycaster.intersectObjects(this.scene.children, true);

      if (intersects.length > 0) {
        mousePoint = intersects[0].point;
        // console.log(intersects[0].point);
      }
    });
  }

  loadHDRAndSetupEnvironment(hdrUrl) {
    // new RGBELoader().load(hdrUrl, (hdrmap) => {
    //   hdrmap.mapping = THREE.EquirectangularRefractionMapping;
    //   hdrmap.exposure = 0.0001;
    //   // const backgroundImage = textureLoader.load("./assets/bg3d.jpg");
    //   // this.scene.background = backgroundImage;
    //   this.scene.background = hdrmap;
    //   this.scene.environment = hdrmap;
    // });
  }

  animate(textGeometry) {
    // if (this.listGroupMeasure.length > 0) {
    //   this.listGroupMeasure.forEach((group) => {
    //     group.children.forEach((child) => {
    //       if (child instanceof THREE.Mesh) {
    //         const cameraPosition = this.camera.position;
    //         child.lookAt(cameraPosition);
    //       }
    //     });
    //   });
    // }

    window.requestAnimationFrame(this.animate.bind(this));
    this.render();
    this.stats.update();
    this.controls.update();
  }

  dragModel(objects, kitchen) {
    const dragControls = new DragControls(
      objects,
      this.camera,
      this.renderer.domElement
    );

    dragControls.addEventListener("drag", function (event) {
      event.object.position.x = mousePoint.x;
      event.object.position.z = mousePoint.z;
      event.object.position.y = -Y / 2;

      wallLeftBB1 && intersectObjMasZ(event.object, wallLeftBB1);
      wallLeftBB2 && intersectObjMasZ(event.object, wallLeftBB2);

      wallRightBB1 && intersectObjMasZ(event.object, wallRightBB1);
      wallRightBB2 && intersectObjMasZ(event.object, wallRightBB2);

      wallBottomBB1 && intersectObjMasX(event.object, wallBottomBB1);
      wallBottomBB2 && intersectObjMasX(event.object, wallBottomBB2);

      event.object.userData.currentPosition.copy(event.object.position);
      kitchen[event.object.userData.index]?.gltf?.position.copy(
        event.object.position
      );

      function intersectObjMasX(firstObject, secondObject) {
        var firstBB = new THREE.Box3().setFromObject(firstObject);

        var collision = firstBB.intersectsBox(secondObject);

        if (collision) {
          event.object.position.x = event.object.userData.currentPosition.x;

          if (kitchen[event.object.userData.index]?.gltf?.position) {
            kitchen[event.object.userData.index].gltf.position.x =
              event.object.userData.currentPosition.x;
          }

          // event.object.position.z = mousePoint.z;
          // console.log(event.object.userData.currentPosition);
        }
      }

      function intersectObjMasZ(firstObject, secondObject) {
        var firstBB = new THREE.Box3().setFromObject(firstObject);

        var collision = firstBB.intersectsBox(secondObject);

        if (collision) {
          event.object.position.z = event.object.userData.currentPosition.z;

          if (kitchen[event.object.userData.index]?.gltf?.position) {
            kitchen[event.object.userData.index].gltf.position.z =
              event.object.userData.currentPosition.z;
          }

          // event.object.position.z = mousePoint.z;
          // console.log(event.object.userData.currentPosition);
        }
      }
    });

    // dragControls.addEventListener("dragstart", function () {
    //   // console.log(modelClicked);
    //   // setOnDrag(true);
    // });

    // dragControls.addEventListener("dragend", function () {
    //   // if (modelClicked) {
    //   //   setModelClicked(modelClicked);
    //   // }
    //   // console.log(modelClicked);
    //   // setTimeout(() => {
    //   //   setOnDrag(false);
    //   //   console.log(onDrag);
    //   // }, 500);
    // });

    // dragControls.addEventListener("hoveron", function () {
    //   boxHelper.visible = true
    //   orbitControls.enabled = false
    //   setOnDrag(true);
    // });

    // dragControls.addEventListener("hoveroff", function () {
    //   // boxHelper.visible = false
    //   // orbitControls.enabled = true
    //   setTimeout(() => {
    //     setOnDrag(false);
    //     console.log(onDrag);
    //   }, 500);
    // });
  }

  updateBackgroundColor(color) {
    const colorConvert = color.toString(16);
    this.scene.background = new THREE.Color(colorConvert);
  }

  render() {
    // NOTE: Update uniform data on each render.
    // this.uniforms.u_time.value += this.clock.getDelta();
    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // Hàm để thay đổi độ zoom
  zoomIn() {
    if (this.camera.fov > 20) {
      this.camera.fov -= 5;
      this.camera.updateProjectionMatrix();
    }
  }

  zoomOut() {
    if (this.camera.fov < 70) {
      this.camera.fov += 5;
      this.camera.updateProjectionMatrix();
    }
  }

  // Bạn có thể thêm hàm này để thiết lập một giá trị zoom cụ thể
  setZoom(fov) {
    this.camera.fov = fov;
    this.camera.updateProjectionMatrix();
  }

  setBackgroundGlb(productEviroment) {
    const backGroundLoader = new GLTFLoader();
    const textureLoader = new THREE.TextureLoader();

    const dLoader = new DRACOLoader();
    dLoader.setDecoderPath(
      "https://www.gstatic.com/draco/versioned/decoders/1.5.6/"
    );
    dLoader.setDecoderConfig({ type: "js" });
    backGroundLoader.setDRACOLoader(dLoader);

    backGroundLoader.load(
      `${process.env.REACT_APP_URL}uploads/virtuals/modules/${productEviroment}`,
      // "./assets/glb/ROOM_009.glb",
      (gltfScene) => {
        gltfScene.scene.traverse((child) => {
          if (child.isMesh) {
            if (child.name !== "roof") {
              // child.castShadow = true;
              child.receiveShadow = true;
            }

            if (child.name !== "floor") {
              const map = child.material.map;
              child.material = new THREE.MeshBasicMaterial({ map: map });
              child.material.needsUpdate = true;
            }
          }
        });

        const wl1 = gltfScene.scene.getObjectByName("wall_left_01");
        if (wl1) {
          const boundingBox1 = new THREE.Box3().setFromObject(wl1);

          const size1 = new THREE.Vector3();
          boundingBox1.getSize(size1);

          const wallLeft1 = new THREE.Mesh(
            new THREE.BoxGeometry(size1.x, size1.y, size1.z),
            new THREE.MeshBasicMaterial({
              transparent: true,
              opacity: 0,
              depthWrite: false,
            })
          );

          // wallLeft.position.copy(wl.position);
          wallLeft1.position.set(
            wl1.position.x,
            wl1.position.y - 0.15,
            wl1.position.z
          );
          wallLeft1.geometry.computeBoundingBox();
          wallLeftBB1 = new THREE.Box3().setFromObject(wallLeft1);
          this.scene.add(wallLeft1);
        }

        const wl2 = gltfScene.scene.getObjectByName("wall_left_02");
        if (wl2) {
          const boundingBox2 = new THREE.Box3().setFromObject(wl2);

          const size2 = new THREE.Vector3();
          boundingBox2.getSize(size2);

          const wallLeft2 = new THREE.Mesh(
            new THREE.BoxGeometry(size2.x, size2.y, size2.z),
            new THREE.MeshBasicMaterial({
              transparent: true,
              opacity: 0,
              depthWrite: false,
            })
          );

          // wallLeft.position.copy(wl.position);
          wallLeft2.position.set(
            wl2.position.x,
            wl2.position.y - 0.15,
            wl2.position.z
          );
          wallLeft2.geometry.computeBoundingBox();
          wallLeftBB2 = new THREE.Box3().setFromObject(wallLeft2);
          this.scene.add(wallLeft2);
        }

        const wr1 = gltfScene.scene.getObjectByName("wall_right_01");
        if (wr1) {
          const boundingBoxR1 = new THREE.Box3().setFromObject(wr1);
          const sizeR1 = new THREE.Vector3();
          boundingBoxR1.getSize(sizeR1);

          const wallRight1 = new THREE.Mesh(
            new THREE.BoxGeometry(sizeR1.x, sizeR1.y, sizeR1.z),
            new THREE.MeshBasicMaterial({
              transparent: true,
              opacity: 0,
              depthWrite: false,
            })
          );
          wallRight1.position.set(
            wr1.position.x,
            wr1.position.y - 0.15,
            wr1.position.z
          );
          wallRight1.geometry.computeBoundingBox();
          wallRightBB1 = new THREE.Box3().setFromObject(wallRight1);
          this.scene.add(wallRight1);
        }

        const wr2 = gltfScene.scene.getObjectByName("wall_right_02");
        if (wr2) {
          const boundingBoxR2 = new THREE.Box3().setFromObject(wr2);
          const sizeR2 = new THREE.Vector3();
          boundingBoxR2.getSize(sizeR2);

          const wallRight2 = new THREE.Mesh(
            new THREE.BoxGeometry(sizeR2.x, sizeR2.y, sizeR2.z),
            new THREE.MeshBasicMaterial({
              transparent: true,
              opacity: 0,
              depthWrite: false,
            })
          );
          wallRight2.position.set(
            wr2.position.x,
            wr2.position.y - 0.15,
            wr2.position.z
          );
          wallRight2.geometry.computeBoundingBox();
          wallRightBB2 = new THREE.Box3().setFromObject(wallRight2);
          this.scene.add(wallRight2);
        }

        const wb1 = gltfScene.scene.getObjectByName("wall_bottom_01");
        if (wb1) {
          const boundingBoxB1 = new THREE.Box3().setFromObject(wb1);
          const sizeB1 = new THREE.Vector3();
          boundingBoxB1.getSize(sizeB1);

          const wallBottom1 = new THREE.Mesh(
            new THREE.BoxGeometry(sizeB1.x, sizeB1.y, sizeB1.z),
            new THREE.MeshBasicMaterial({
              transparent: true,
              opacity: 0,
              depthWrite: false,
            })
          );
          // wallBottom.position.copy(wb.position);
          wallBottom1.position.set(
            wb1.position.x,
            wb1.position.y - 0.15,
            wb1.position.z
          );
          wallBottom1.geometry.computeBoundingBox();
          wallBottomBB1 = new THREE.Box3().setFromObject(wallBottom1);
          this.scene.add(wallBottom1);
        }

        const wb2 = gltfScene.scene.getObjectByName("wall_bottom_02");
        if (wb2) {
          const boundingBoxB2 = new THREE.Box3().setFromObject(wb2);
          const sizeB2 = new THREE.Vector3();
          boundingBoxB2.getSize(sizeB2);

          const wallBottom2 = new THREE.Mesh(
            new THREE.BoxGeometry(sizeB2.x, sizeB2.y, sizeB2.z),
            new THREE.MeshBasicMaterial({
              transparent: true,
              opacity: 0,
              depthWrite: false,
            })
          );
          // wallBottom.position.copy(wb.position);
          wallBottom2.position.set(
            wb2.position.x,
            wb2.position.y - 0.15,
            wb2.position.z
          );
          wallBottom2.geometry.computeBoundingBox();
          wallBottomBB2 = new THREE.Box3().setFromObject(wallBottom2);
          this.scene.add(wallBottom2);
        }

        const fl = gltfScene.scene.getObjectByName("floor");
        const boundingBoxFL = new THREE.Box3().setFromObject(fl);
        const sizeFL = new THREE.Vector3();
        boundingBoxFL.getSize(sizeFL);

        const backgroundColor = new THREE.Color("rgb(255, 255, 255)");

        const floor = new THREE.Mesh(
          new THREE.BoxGeometry(sizeFL.x, sizeFL.y, sizeFL.z),
          new THREE.MeshStandardMaterial({
            color: backgroundColor, // Màu sắc của mặt phẳng
            transparent: true,
            opacity: 0.5,
            roughness: 0.5, // Độ "đổ bóng" của bề mặt (0 là mịn, 1 là đục)
            metalness: 0.5, // Độ kim loại của bề mặt (0 là không kim loại, 1 là hoàn toàn kim loại)
          })
          // new THREE.MeshBasicMaterial({
          //   // transparent: true,
          //   opacity: 0,
          //   // depthWrite: false,
          // })
        );
        // floor.position.copy(fl.position);
        floor.position.set(
          fl.position.x,
          fl.position.y - Y / 2 + 0.01,
          fl.position.z
        );
        floor.receiveShadow = true;
        floor.castShadow = true;
        floor.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        floor.geometry.computeBoundingBox();
        // this.scene.add(floor);

        gltfScene.scene.position.set(0, -Y / 2, 0);
        gltfScene.scene.scale.set(1, 1, 1);
        gltfScene.scene.name = "BACKGROUND";

        this.scene.add(gltfScene.scene);
      }
    );
  }
}
