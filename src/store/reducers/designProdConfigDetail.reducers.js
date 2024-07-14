import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  designProdConfigDetail: [],
};

export const DesignProdConfigDetailReducer = createSlice({
  name: "designProdConfigDetail",
  initialState,
  reducers: {
    getProjectDetailReducer: (state, action) => {
      state.designProdConfigDetail = action.payload;
    },
  },
});

export const { getDesignProdConfigDetailReducer } = DesignProdConfigDetailReducer.actions;

export default DesignProdConfigDetailReducer.reducer;
