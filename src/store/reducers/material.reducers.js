import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  lstMaterial: [],
};

export const MaterialReducer = createSlice({
  name: "material",
  initialState,
  reducers: {
    getMaterial: (state, action) => {
      state.lstMaterial = action.payload;
    },
  },
});

export const { getMaterial } = MaterialReducer.actions;

export default MaterialReducer.reducer;
