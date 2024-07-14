import * as THREE from "three";
import { DragControls } from "three/examples/jsm/controls/DragControls.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { AmmoPhysics } from "three/examples/jsm/physics/AmmoPhysics.js";

const X = 5.099999880382116;
const Y = 3.3000010476221315;
const Z = 5.100000903247968;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let cube1;
let cube2;
let cube1BB;
let cube2BB;
let block;

// let sceneMeshes = [];
let modelGroup1;
let modelGroup2;
let modelDragBox1;
let modelDragBox2;
let modelReady;

let wallLeft;
let limitX;

let mousePoint;

export default class DemoInit {
  constructor(canvasId) {
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
    this.meshes = [];
  }

  initialize() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      this.fov,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );

    this.camera.position.x = 0;
    this.camera.position.y = 0;
    this.camera.position.z = 30;

    // NOTE: Specify a canvas which is already created in the HTML.
    const canvas = document.getElementById(this.canvasId);
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      // NOTE: Anti-aliasing smooths out the edges.
      antialias: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.scene.background = new THREE.Color(0x8f999e);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.6;

    document
      .getElementById("container__canvas")
      .appendChild(this.renderer.domElement);

    this.clock = new THREE.Clock();
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.enabled = false;
    // this.controls.dispose();

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
    this.scene.add(this.spotLight);

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
          this.directionalLight = new THREE.DirectionalLight(0xe9f1ff, 0.5);
          this.directionalLight.position.set(10, 0, 0);
          // this.directionalLight.castShadow = true;
          // this.directionalLight.shadow.bias = -0.00001;
          // this.directionalLight.shadow.normalBias = 0.1;
        } else {
          this.directionalLight = new THREE.DirectionalLight(0xe9f1ff, 1.5);
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

    const backGroundLoader = new GLTFLoader();

    const dLoader = new DRACOLoader();
    dLoader.setDecoderPath(
      "https://www.gstatic.com/draco/versioned/decoders/1.5.6/"
    );
    dLoader.setDecoderConfig({ type: "js" });
    backGroundLoader.setDRACOLoader(dLoader);

    // backGroundLoader.load("./assets/glb/sofa_001.glb", (gltfScene) => {
    // backGroundLoader.load("./assets/glb/tobias_002.glb", (gltfScene) => {
    //   gltfScene.scene.position.set(-1, -Y / 2, 0);
    //   gltfScene.scene.rotation.set(0, -Math.PI / 2, 0);

    //   gltfScene.scene.traverse(function (child) {
    //     if (child instanceof THREE.Group) {
    //       modelGroup1 = child;

    //       console.log(modelGroup1);
    //     }
    //     if (child.isMesh) {
    //       child.castShadow = true;
    //       child.frustumCulled = false;
    //       child.geometry.computeVertexNormals();
    //     }
    //   });

    //   this.scene.add(gltfScene.scene);

    //   modelDragBox1 = new THREE.Mesh(
    //     new THREE.BoxGeometry(2, 1, 1),
    //     new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.9 })
    //   );
    //   modelDragBox1.position.set(-1, -Y / 2, 0);
    //   // modelDragBox1.geometry.translate(0, 0.5, 0);
    //   modelDragBox1.geometry.computeBoundingBox();
    //   modelDragBox1.userData.currentPosition = new THREE.Vector3();
    //   this.scene.add(modelDragBox1);
    //   this.meshes.push(modelDragBox1);

    //   console.log(modelDragBox1);
    // });

    // backGroundLoader.load("./assets/glb/tobias_002.glb", (gltfScene) => {
    backGroundLoader.load("./assets/glb/arni.glb", (gltfScene) => {
      let boundingBox;

      gltfScene.scene.position.set(-1, -Y / 2, 0);

      gltfScene.scene.traverse(function (child) {
        if (child instanceof THREE.Group) {
          modelGroup1 = child;
          console.log(modelGroup1);
        }
        if (child.isMesh) {
          child.castShadow = true;
          child.frustumCulled = false;
          child.geometry.computeVertexNormals();

          // Tính toán bounding box
          if (!boundingBox) boundingBox = new THREE.Box3();
          boundingBox.expandByObject(child);
        }
      });

      this.scene.add(gltfScene.scene);

      // Tạo và định hình lại modelDragBox dựa trên kích thước của bounding box
      const size = new THREE.Vector3();
      boundingBox.getSize(size);

      modelDragBox1 = new THREE.Mesh(
        new THREE.BoxGeometry(size.x, size.y, size.z),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
      );
      // modelDragBox1.position.set(boundingBox.getCenter(new THREE.Vector3()));
      modelDragBox1.position.set(-1, -Y / 2, 0);
      modelDragBox1.rotation.set(0, -Math.PI / 2, 0);
      modelDragBox1.geometry.computeBoundingBox();
      modelDragBox1.userData.currentPosition = new THREE.Vector3();
      modelDragBox1.geometry.translate(0, size.y / 2, 0);
      this.scene.add(modelDragBox1);
      this.meshes.push(modelDragBox1);

      console.log(modelDragBox1);
    });

    // backGroundLoader.load("./assets/glb/sofa_001.glb", (gltfScene) => {
    backGroundLoader.load("./assets/glb/arni.glb", (gltfScene) => {
      let boundingBox;

      gltfScene.scene.position.set(3, -Y / 2, 3);

      gltfScene.scene.traverse(function (child) {
        if (child instanceof THREE.Group) {
          modelGroup2 = child;

          console.log(modelGroup2);
        }
        if (child.isMesh) {
          child.castShadow = true;
          child.frustumCulled = false;
          child.geometry.computeVertexNormals();

          if (!boundingBox) boundingBox = new THREE.Box3();
          boundingBox.expandByObject(child);
        }
      });

      // this.scene.add(gltfScene.scene);

      // Tạo và định hình lại modelDragBox dựa trên kích thước của bounding box
      const size = new THREE.Vector3();
      boundingBox.getSize(size);

      modelDragBox2 = new THREE.Mesh(
        new THREE.BoxGeometry(size.x, size.y, size.z),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.9 })
      );
      modelDragBox2.position.copy(modelGroup2.position);
      // modelDragBox2.geometry.translate(0, 0.5, 0);
      modelDragBox2.geometry.computeBoundingBox();

      // this.scene.add(modelDragBox2);
      // this.meshes.push(modelDragBox2);

      console.log(modelDragBox2);

      //test
      wallLeft = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 4, 55),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.9 })
      );
      wallLeft.position.set(-2.2, 0, 2);
      wallLeft.geometry.computeBoundingBox();
      this.scene.add(wallLeft);
      //test

      modelReady = true;
    });

    const dragControls = new DragControls(
      this.meshes,
      this.camera,
      this.renderer.domElement
    );
    dragControls.deactivate();
    dragControls.activate();

    dragControls.addEventListener("hoveron", function () {
      // boxHelper.visible = true;
      // this.controls.enabled = false;
    });
    dragControls.addEventListener("hoveroff", function () {
      // boxHelper.visible = false;
      // this.controls.enabled = true;
    });
    dragControls.addEventListener("drag", function (event) {
      event.object.position.x = mousePoint.x;
      event.object.position.z = mousePoint.z;
      event.object.position.y = -Y / 2;

      intersectObjMas(event.object, wallLeft);

      event.object.userData.currentPosition.copy(event.object.position);

      function intersectObjMas(firstObject, secondObject) {
        var firstBB = new THREE.Box3().setFromObject(firstObject);
        var secondBB = new THREE.Box3().setFromObject(secondObject);

        var collision = firstBB.intersectsBox(secondBB);

        if (collision) {
          event.object.position.x = event.object.userData.currentPosition.x;
          // event.object.position.z = mousePoint.z;
          // console.log(event.object.userData.currentPosition);
        }
      }
    });
    dragControls.addEventListener("dragstart", function () {
      // boxHelper.visible = true;
      // this.controls.enabled = false;
    });
    dragControls.addEventListener("dragend", function () {
      // boxHelper.visible = false;
      // this.controls.enabled = true;
    });

    let composer = new EffectComposer(this.renderer);

    const renderPass = new RenderPass(this.scene, this.camera);
    composer.addPass(renderPass);

    let outlinePass = new OutlinePass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      this.scene,
      this.camera
    );
    outlinePass.edgeStrength = 5;
    outlinePass.edgeGlow = 0.9;
    outlinePass.edgeThickness = 4;
    outlinePass.pulsePeriod = 9;
    outlinePass.visibleEdgeColor.set("#ffffff");
    outlinePass.hiddenEdgeColor.set("#190a05");
    composer.addPass(outlinePass);
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

  collision() {
    if (modelDragBox1 && wallLeft) {
      const bb1 = modelDragBox1.geometry.boundingBox.clone();
      bb1.applyMatrix4(modelDragBox1.matrixWorld);

      const bb2 = modelDragBox2.geometry.boundingBox.clone();
      bb2.applyMatrix4(modelDragBox2.matrixWorld);

      const bbwl = wallLeft.geometry.boundingBox.clone();
      bbwl.applyMatrix4(wallLeft.matrixWorld);

      // if (bb1 && bb2 & bb1.intersectsBox(bb2)) {
      if (bb1.intersectsBox(bbwl)) {
        block = true;
        limitX = modelDragBox1.position.x;

        console.log("Va cham");
        console.log(modelDragBox1.position.x);
      } else if (bb2.intersectsBox(bbwl)) {
        block = true;
        limitX = modelDragBox2.position.x;
        console.log("Va cham");
      } else {
        block = false;
        limitX = undefined;
      }
    }
  }

  animate(textGeometry) {
    // this.collision();
    // this.drag();

    if (modelReady) {
      modelGroup1.position.copy(modelDragBox1.position);
      modelGroup2.position.copy(modelDragBox2.position);
      modelGroup1.rotation.y = modelDragBox1.rotation.y;

      // modelGroup1.rotation.y += 0.01;
    }

    window.requestAnimationFrame(this.animate.bind(this));
    this.render();
    this.stats.update();
    this.controls.update();
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

  setBackgroundGlb() {
    const backGroundLoader = new GLTFLoader();

    const dLoader = new DRACOLoader();
    dLoader.setDecoderPath(
      "https://www.gstatic.com/draco/versioned/decoders/1.5.6/"
    );
    dLoader.setDecoderConfig({ type: "js" });
    backGroundLoader.setDRACOLoader(dLoader);

    backGroundLoader.load(
      // `${process.env.REACT_APP_URL}uploads/virtuals/modules/${productEviroment.background.glb}`,
      // "./assets/glb/LIVINGROOM.glb",
      "./assets/glb/room_001.glb",
      (gltfScene) => {
        gltfScene.scene.traverse((child) => {
          if (child.isMesh) {
            // if (child.name !== "roof") {
            //   child.castShadow = true;
            //   child.receiveShadow = true;
            // }

            if (child.name === "wall_left") {
              console.log(child);
            }
          }
        });

        gltfScene.scene.position.set(-X / 2, -Y / 2, -Z / 2);
        gltfScene.scene.scale.set(4, 1.5, 3);

        gltfScene.scene.rotateY(-Math.PI / 2);
        gltfScene.scene.name = "BACKGROUND";

        this.scene.add(gltfScene.scene);
      }
    );
  }

  // setBackgroundGlb() {
  //   const backgroundColor = new THREE.Color("rgb(255, 255, 255)");

  //   const materialStandard = new THREE.MeshStandardMaterial({
  //     color: backgroundColor, // Màu sắc của mặt phẳng
  //     transparent: true,
  //     opacity: 0.2,
  //     roughness: 0.5, // Độ "đổ bóng" của bề mặt (0 là mịn, 1 là đục)
  //     metalness: 0, // Độ kim loại của bề mặt (0 là không kim loại, 1 là hoàn toàn kim loại)
  //   });
  //   // Tạo mặt phẳng XZ và gán vật liệu backgroundXZ
  //   const size = 10;
  //   const planeGeometry = new THREE.PlaneGeometry(size, size);
  //   const planeXZ = new THREE.Mesh(planeGeometry, materialStandard);

  //   planeXZ.rotation.x = Math.PI * -0.5; // Xoay mặt phẳng theo trục X để hiện đúng hướng

  //   planeXZ.position.x = 0;
  //   planeXZ.position.y = -Y / 2 - 0.01;
  //   planeXZ.position.z = 0;

  //   planeXZ.traverse((child) => {
  //     if (child.isMesh) {
  //       child.material.metalness = 0.5;
  //       child.receiveShadow = true;
  //       child.castShadow = true;
  //     }
  //   });

  //   this.scene.add(planeXZ);
  // }
}
