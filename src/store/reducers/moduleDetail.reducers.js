import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  lstMaterial: [],
  lstSubModule: [],
};

export const ModuleDetailReducer = createSlice({
  name: "moduleMaterial",
  initialState,
  reducers: {
    getLstMaterial: (state, action) => {
      state.lstMaterial = action.payload;
    },
    getLstSubModule: (state, action) => {
      state.lstSubModule = action.payload;
    },
  },
});

export const { getLstMaterial, getLstSubModule } =
  ModuleDetailReducer.actions;

export default ModuleDetailReducer.reducer;
