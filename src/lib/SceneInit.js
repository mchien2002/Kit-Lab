import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export default class SceneInit {
  constructor(canvasId, productInfo) {
    // NOTE: Core components to initialize Three.js app.
    this.scene = undefined;
    this.camera = undefined;
    this.renderer = undefined;
    this.groupMeasure = new THREE.Group();
    this.listGroupMeasure = [];
    // this.focusPoint = new THREE.Vector3(
    //   productInfo.camera.focusPoint.x,
    //   productInfo.camera.focusPoint.y,
    //   productInfo.camera.focusPoint.z
    // );
    this.rotationAngle = 0;

    // NOTE: Camera params;
    this.fov = productInfo.camera.fov;
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
  }

  initialize(productInfo) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      this.fov,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );
    this.camera.position.x = productInfo.camera.position.x;
    this.camera.position.y = productInfo.camera.position.y;
    this.camera.position.z = productInfo.camera.position.z;

    // NOTE: Specify a canvas which is already created in the HTML.
    const canvas = document.getElementById(this.canvasId);
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      // NOTE: Anti-aliasing smooths out the edges.
      antialias: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;

    document
      .getElementById("container__canvas")
      .appendChild(this.renderer.domElement);

    this.clock = new THREE.Clock();
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.controls.minAzimuthAngle =
      (productInfo.controller.minAzimuthAngle * Math.PI) / 180; // Góc tối thiểu theo chiều phương ngang (trục Y)
    this.controls.maxAzimuthAngle =
      (productInfo.controller.maxAzimuthAngle * Math.PI) / 180; // Góc tối đa theo chiều phương ngang (trục Y)
    this.controls.minPolarAngle =
      (productInfo.controller.minPolarAngle * Math.PI) / 180; // Góc tối thiểu theo chiều phương thẳng đứng (trục X)
    this.controls.maxPolarAngle =
      (productInfo.controller.maxPolarAngle * Math.PI) / 180; // Góc tối đa theo chiều phương thẳng đứng (trục X)

    // Giới hạn khoảng cách tối thiểu và tối đa của camera đến trung tâm scene
    this.controls.minDistance = productInfo.controller.minDistance;
    this.controls.maxDistance = productInfo.controller.maxDistance;

    //Khóa sử dụng chuột phải để di chuyển vị trí camera
    // this.controls.enablePan = false;

    this.stats = Stats();

    productInfo.lights.forEach((lightItem) => {
      this.directionalLight = new THREE.DirectionalLight(
        lightItem.color,
        lightItem.lightStrong
      );
      this.directionalLight.castShadow = true;
      this.directionalLight.position.set(
        lightItem.position.x,
        lightItem.position.y,
        lightItem.position.z
      );
      this.scene.add(this.directionalLight);
    });

    // if window resizes
    window.addEventListener("resize", () => this.onWindowResize(), false);
  }

  animate(textGeometry) {
    // this.camera.lookAt(this.focusPoint);
    if (this.listGroupMeasure.length > 0) {
      this.listGroupMeasure.forEach((group) => {
        group.children.forEach((child) => {
          if (child instanceof THREE.Mesh) {
            const cameraPosition = this.camera.position;
            child.lookAt(cameraPosition);
          }
        });
      });
    }
    window.requestAnimationFrame(this.animate.bind(this));
    this.render();
    this.stats.update();
    this.controls.update();
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
    backGroundLoader.load(
      `https://api.lanha.vn/profiles/module-glb/${productEviroment.background.glb}`,
      (gltfScene) => {
        gltfScene.scene.position.set(
          productEviroment.background.position.x - 1,
          productEviroment.background.position.y - 30,
          productEviroment.background.position.z - 1
        );
        gltfScene.scene.scale.set(
          productEviroment.background.scale.x,
          productEviroment.background.scale.y,
          productEviroment.background.scale.z
        );
        gltfScene.scene.rotateY(
          productEviroment.background.rotateY * (Math.PI / 180)
        );
        gltfScene.scene.name = "BACKGROUND";
        this.scene.add(gltfScene.scene);
      }
    );
  }
}
