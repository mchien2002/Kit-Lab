import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment";
import { getGLBSize } from "../utils/function";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { FlakesTexture } from "three/examples/jsm/textures/FlakesTexture";

const X = 5.099999880382116;
const Y = 3.3000010476221315;
const Z = 5.100000903247968;

export default class SceneInit {
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

    this.camera.position.x = productInfo.camera.position.x;
    this.camera.position.y = productInfo.camera.position.y - 0.5;
    this.camera.position.z = productInfo.camera.position.z;

    // NOTE: Specify a canvas which is already created in the HTML.
    const canvas = document.getElementById(this.canvasId);
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      // NOTE: Anti-aliasing smooths out the edges.
      antialias: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // this.renderer.outputEncoding = THREE.sRGBEncoding;
    // this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // this.renderer.toneMappingExposure = 1.8;


    this.scene.background = new THREE.Color(0xf2f2f2);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    document
      .getElementById("container__canvas")
      .appendChild(this.renderer.domElement);

    this.clock = new THREE.Clock();
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    // // Giới hạn khoảng cách tối thiểu và tối đa của camera đến trung tâm scene
    // this.controls.minDistance = productInfo.controller.minDistance;
    // this.controls.maxDistance = productInfo.controller.maxDistance;

    //Khóa sử dụng chuột phải để di chuyển vị trí camera
    // this.controls.enablePan = false;

    this.stats = Stats();
    // document.body.appendChild(this.stats.dom);

    // ambient light which is for the whole scene
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(this.ambientLight);

    Array(2)
      .fill()
      .map((item, index) => {
        if (index === 0) {
          this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
          this.directionalLight.castShadow = true;
          this.directionalLight.position.set(30, 100, 100);
          this.directionalLight.shadow.bias = -0.00001;
          this.directionalLight.shadow.normalBias = 0.1;
        } else {
          this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
          this.directionalLight.castShadow = true;
          this.directionalLight.position.set(100, 100, 30);
          this.directionalLight.shadow.bias = -0.00001;
          this.directionalLight.shadow.normalBias = 0.1;
        }
        this.scene.add(this.directionalLight);
      });

    // if window resizes
    window.addEventListener("resize", () => this.onWindowResize(), false);
  }

  loadHDRAndSetupEnvironment(hdrUrl) {
    new RGBELoader().load(hdrUrl, (hdrmap) => {
      hdrmap.mapping = THREE.EquirectangularRefractionMapping;
      // this.scene.background = hdrmap
      // hdrmap.exposure = 0.0001;
      this.scene.environment = hdrmap;
      //this.animate();
    });
  }

  animate(textGeometry) {
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

  saveAsImage(productInfo) {
    this.camera.position.x = productInfo.camera.position.x;
    this.camera.position.y = productInfo.camera.position.y - 0.5;
    this.camera.position.z = productInfo.camera.position.z;

    setTimeout(() => {
      this.render();
      try {
        let strMime = "image/jpeg";
        let imgData = this.renderer.domElement.toDataURL(strMime);

        localStorage.setItem("imgData", JSON.stringify(imgData));
      } catch (e) {
        console.log(e);
        return;
      }
    }, 150);
  }

  // showBorder() {
  //   const backGroundLoader = new GLTFLoader();

  //   backGroundLoader.load("./assets/glb/khungtu-test.glb", (gltfScene) => {
  //     gltfScene.scene.position.set(
  //       -1.969999940191058 - 0.02,
  //       // 1.05,
  //       0.35,
  //       -2.550000451623984
  //     );
  //     gltfScene.scene.scale.set(1, 1, 3.04);
  //     gltfScene.scene.rotateY(-Math.PI / 2);

  //     const textureLoader = new THREE.TextureLoader();
  //     textureLoader.load("./assets/demo/img/ke-tivi-1.jpg", (newTexture) => {
  //       gltfScene.scene.traverse((child) => {
  //         if (child.isMesh) {
  //           const materials = Array.isArray(child.material)
  //             ? child.material
  //             : [child.material];

  //           materials.forEach((material) => {
  //             newTexture.wrapS = THREE.RepeatWrapping;
  //             newTexture.wrapT = THREE.RepeatWrapping;

  //             let desiredWidth = 1200 * 3;
  //             let desiredHeight = 600;
  //             // let desiredWidth = 5120;
  //             // let desiredHeight = 5120;
  //             let originalWidth = newTexture.image.width;
  //             let originalHeight = newTexture.image.height;
  //             let scaleWidth = desiredWidth / originalWidth;
  //             let scaleHeight = desiredHeight / originalHeight;
  //             newTexture.repeat.set(scaleWidth, scaleHeight);

  //             material.map = newTexture;
  //           });
  //         }
  //       });
  //     });

  //     this.scene.add(gltfScene.scene);
  //   });

  //   backGroundLoader.load("./assets/glb/khungtu-test.glb", (gltfScene) => {
  //     gltfScene.scene.position.set(
  //       -1.969999940191058 - 0.02,
  //       // 1.05,
  //       0.35,
  //       -2.550000451623984
  //     );
  //     gltfScene.scene.scale.set(1, 1, 2);
  //     gltfScene.scene.rotateY(-Math.PI / 2);
  //     gltfScene.scene.rotateX(-Math.PI / 2);

  //     const textureLoader = new THREE.TextureLoader();
  //     textureLoader.load("./assets/demo/img/ke-tivi-1.jpg", (newTexture) => {
  //       gltfScene.scene.traverse((child) => {
  //         if (child.isMesh) {
  //           const materials = Array.isArray(child.material)
  //             ? child.material
  //             : [child.material];

  //           materials.forEach((material) => {
  //             newTexture.wrapS = THREE.RepeatWrapping;
  //             newTexture.wrapT = THREE.RepeatWrapping;

  //             let desiredWidth = 1200 * 3;
  //             let desiredHeight = 600;
  //             // let desiredWidth = 5120;
  //             // let desiredHeight = 5120;
  //             let originalWidth = newTexture.image.width;
  //             let originalHeight = newTexture.image.height;
  //             let scaleWidth = desiredWidth / originalWidth;
  //             let scaleHeight = desiredHeight / originalHeight;
  //             newTexture.repeat.set(scaleWidth, scaleHeight);

  //             material.map = newTexture;
  //           });
  //         }
  //       });
  //     });

  //     this.scene.add(gltfScene.scene);
  //   });

  //   backGroundLoader.load("./assets/glb/khungtu-test.glb", (gltfScene) => {
  //     gltfScene.scene.position.set(
  //       // -1.969999940191058 - 0.03,
  //       1.03,
  //       // 1.05,
  //       0.35,
  //       -2.550000451623984
  //     );
  //     gltfScene.scene.scale.set(1, 1, 2);
  //     gltfScene.scene.rotateY(-Math.PI / 2);
  //     gltfScene.scene.rotateX(-Math.PI / 2);

  //     const textureLoader = new THREE.TextureLoader();
  //     textureLoader.load("./assets/demo/img/ke-tivi-1.jpg", (newTexture) => {
  //       gltfScene.scene.traverse((child) => {
  //         if (child.isMesh) {
  //           const materials = Array.isArray(child.material)
  //             ? child.material
  //             : [child.material];

  //           materials.forEach((material) => {
  //             newTexture.wrapS = THREE.RepeatWrapping;
  //             newTexture.wrapT = THREE.RepeatWrapping;

  //             let desiredWidth = 1200 * 3;
  //             let desiredHeight = 600;
  //             // let desiredWidth = 5120;
  //             // let desiredHeight = 5120;
  //             let originalWidth = newTexture.image.width;
  //             let originalHeight = newTexture.image.height;
  //             let scaleWidth = desiredWidth / originalWidth;
  //             let scaleHeight = desiredHeight / originalHeight;
  //             newTexture.repeat.set(scaleWidth, scaleHeight);

  //             material.map = newTexture;
  //           });
  //         }
  //       });
  //     });

  //     this.scene.add(gltfScene.scene);
  //   });
  // }

  setBackgroundGlb() {
    const backgroundColor = new THREE.Color("rgb(255, 255, 255)");

    const materialStandard = new THREE.MeshStandardMaterial({
      color: backgroundColor, // Màu sắc của mặt phẳng
      transparent: true,
      opacity: 0.2,
      roughness: 0.5, // Độ "đổ bóng" của bề mặt (0 là mịn, 1 là đục)
      metalness: 0, // Độ kim loại của bề mặt (0 là không kim loại, 1 là hoàn toàn kim loại)
    });
    // Tạo mặt phẳng XZ và gán vật liệu backgroundXZ
    const size = 10;
    const planeGeometry = new THREE.PlaneGeometry(size, size);
    const planeXZ = new THREE.Mesh(planeGeometry, materialStandard);

    planeXZ.rotation.x = Math.PI * -0.5; // Xoay mặt phẳng theo trục X để hiện đúng hướng

    planeXZ.position.x = 0;
    planeXZ.position.y = -Y / 2 - 0.01;
    planeXZ.position.z = 0;

    planeXZ.traverse((child) => {
      if (child.isMesh) {
        child.material.metalness = 0.5;
        child.receiveShadow = true;
        child.castShadow = true;
      }
    });

    this.scene.add(planeXZ);
  }
}
