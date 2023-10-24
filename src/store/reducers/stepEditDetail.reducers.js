import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  stepEditDetail: null,
};

export const StepEditReducer = createSlice({
  name: "stepEdit",
  initialState,
  reducers: {
    getStepEditDetail: (state, action) => {
      state.stepEditDetail = action.payload;
    },
  },
});

export const { getStepEditDetail } = StepEditReducer.actions;

export default StepEditReducer.reducer;
