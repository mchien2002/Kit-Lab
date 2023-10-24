import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  lstMeasure: [],
};

export const MeasureReducer = createSlice({
  name: "measure",
  initialState,
  reducers: {
    setMeasure: (state, action) => {
      state.lstMeasure = action.payload;

      console.log(action.payload);
    },
  },
});

export const { setMeasure } = MeasureReducer.actions;

export default MeasureReducer.reducer;
