import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  stepDetail: null,
};

export const StepDetailReducer = createSlice({
  name: "step",
  initialState,
  reducers: {
    getStepDetail: (state, action) => {
      state.stepDetail = action.payload;
    },
  },
});

export const { getStepDetail } = StepDetailReducer.actions;

export default StepDetailReducer.reducer;
