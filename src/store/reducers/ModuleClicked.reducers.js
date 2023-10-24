import { createSlice } from "@reduxjs/toolkit";
import * as THREE from "three";

const initialState = {
  listModuleClicked: {},
};

export const ModuleClickedReducer = createSlice({
  name: "moduleClicked",
  initialState,
  reducers: {
    setModuleClicked: (state, action) => {
      console.log(action);
      state.listModuleClicked = action.payload;
    },
    setMeasure: (state, action) => {
      state.listMeasure = action.payload;
    },
    setTexture: (state, action) => {
      console.log(action);

      state.listModuleClicked.traverse((node) => {
        if (node.isMesh) {
          const texture = new THREE.TextureLoader().load(action.payload);
          const materials = Array.isArray(node.material)
            ? node.material
            : [node.material];
          materials.forEach((material) => {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;

            // let desiredWidth = 2400;
            // let desiredHeight = 1200;
            // let originalWidth = texture.image.width;
            // let originalHeight = texture.image.height;
            // let scaleWidth = desiredWidth / originalWidth;
            // let scaleHeight = desiredHeight / originalHeight;
            // texture.repeat.set(scaleWidth, scaleHeight);

            texture.repeat.set(1, 1);

            material.map = texture;
          });
        }
      });
    },
  },
});

export const { setModuleClicked, setTexture } = ModuleClickedReducer.actions;

export default ModuleClickedReducer.reducer;
