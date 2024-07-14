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
let wallRightBB;
let wallBottomBB;

let uuid;

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

    this.camera.position.x = 7.75;
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

    // this.scene.background = new THREE.Color(0x8f999e);
    this.scene.background = new THREE.Color(0xffffff);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.5;
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

    // ambient light which is for the whole scene
    //this.ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.ambientLight = new THREE.AmbientLight(0xfff9e7, 1);
    this.scene.add(this.ambientLight);

    this.spotLight = new THREE.SpotLight(0xe9f1ff, 1.5);
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
          this.directionalLight = new THREE.DirectionalLight(0xe9f1ff, 0.75);
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
          this.directionalLight = new THREE.DirectionalLight(0xe9f1ff, 1);
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

      intersectObjMasZ(event.object, wallLeftBB);
      intersectObjMasZ(event.object, wallRightBB);
      intersectObjMasX(event.object, wallBottomBB);

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

    dragControls.addEventListener("dragstart", function () {});

    dragControls.addEventListener("dragend", function () {});
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

    // backGroundLoader.load("./assets/glb/room_test.glb", (gltfScene) => {
    //   gltfScene.scene.position.set(0, -Y / 2, 0);
    //   gltfScene.scene.rotation.set(0, -Math.PI / 2, 0);
    //   gltfScene.scene.scale.set(1, 1, 1);

    //   this.scene.add(gltfScene.scene);
    // });

    backGroundLoader.load(
      // `${process.env.REACT_APP_URL}uploads/virtuals/modules/${productEviroment.background.glb}`,
      // "./assets/glb/room_test3.glb",
      "./assets/glb/ROOM_007.glb",
      (gltfScene) => {
        gltfScene.scene.traverse((child) => {
          if (child.isMesh) {
            if (child.name !== "roof") {
              // child.castShadow = true;
              child.receiveShadow = true;
            }

            const map = child.material.map;
            child.material = new THREE.MeshBasicMaterial({ map: map });
            child.material.needsUpdate = true;
          }
        });

        const wl = gltfScene.scene.getObjectByName("wall_left");
        const boundingBox = new THREE.Box3().setFromObject(wl);

        const size = new THREE.Vector3();
        boundingBox.getSize(size);

        const wallLeft = new THREE.Mesh(
          new THREE.BoxGeometry(size.x, size.y, size.z),
          new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0,
            depthWrite: false,
          })
        );

        // wallLeft.position.copy(wl.position);
        wallLeft.position.set(
          wl.position.x,
          wl.position.y - 0.15,
          wl.position.z
        );
        wallLeft.geometry.computeBoundingBox();
        wallLeftBB = new THREE.Box3().setFromObject(wallLeft);
        this.scene.add(wallLeft);

        const wr = gltfScene.scene.getObjectByName("wall_right");
        const boundingBoxR = new THREE.Box3().setFromObject(wr);
        const sizeR = new THREE.Vector3();
        boundingBoxR.getSize(sizeR);

        const wallRight = new THREE.Mesh(
          new THREE.BoxGeometry(sizeR.x, sizeR.y, sizeR.z),
          new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 1,
            depthWrite: false,
          })
        );
        wallRight.position.set(
          wr.position.x,
          wr.position.y - 0.15,
          wr.position.z
        );
        wallRight.geometry.computeBoundingBox();
        wallRightBB = new THREE.Box3().setFromObject(wallRight);
        this.scene.add(wallRight);

        const wb = gltfScene.scene.getObjectByName("wall_bottom");
        const boundingBoxB = new THREE.Box3().setFromObject(wb);
        const sizeB = new THREE.Vector3();
        boundingBoxB.getSize(sizeB);

        const wallBottom = new THREE.Mesh(
          new THREE.BoxGeometry(sizeB.x, sizeB.y, sizeB.z),
          new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0,
            depthWrite: false,
          })
        );
        // wallBottom.position.copy(wb.position);
        wallBottom.position.set(
          wb.position.x,
          wb.position.y - 0.15,
          wb.position.z
        );
        wallBottom.geometry.computeBoundingBox();
        wallBottomBB = new THREE.Box3().setFromObject(wallBottom);
        this.scene.add(wallBottom);

        // const fl = gltfScene.scene.getObjectByName("floor");
        // console.log(fl);
        // const boundingBoxFL = new THREE.Box3().setFromObject(fl);
        // const sizeFL = new THREE.Vector3();
        // boundingBoxFL.getSize(sizeFL);

        // const floor = new THREE.Mesh(
        //   new THREE.BoxGeometry(sizeFL.x, sizeFL.y, sizeFL.z),
        //   new THREE.MeshBasicMaterial({
        //     transparent: true,
        //     opacity: 1,
        //     depthWrite: false,
        //   })
        // );
        // // floor.position.copy(fl.position);
        // floor.position.set(
        //   fl.position.x,
        //   fl.position.y - Y / 2 + 0.01,
        //   fl.position.z
        // );
        // floor.receiveShadow = true;
        // floor.castShadow = true;
        // floor.traverse((child) => {
        //   if (child.isMesh) {
        //     child.castShadow = true;
        //     child.receiveShadow = true;
        //   }
        // });
        // floor.geometry.computeBoundingBox();
        // this.scene.add(floor);

        gltfScene.scene.position.set(0, -Y / 2, 0);
        gltfScene.scene.scale.set(1, 1, 1);
        gltfScene.scene.name = "BACKGROUND";
        uuid = gltfScene.scene.uuid;

        this.scene.add(gltfScene.scene);
      }
    );
  }
}
