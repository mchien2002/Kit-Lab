import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  productInfo: {},
};

export const StepReducer = createSlice({
  name: "step",
  initialState,
  reducers: {
    getAllStep: (state, action) => {
      state.productInfo = action.payload;
    },
  },
});

export const { getAllStep } = StepReducer.actions;

export default StepReducer.reducer;
