import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  trademarks: null,
};

export const TrademarksReducer = createSlice({
  name: "step",
  initialState,
  reducers: {
    getTrademarks: (state, action) => {
      state.trademarks = action.payload;
    },
  },
});

export const { getTrademarks } = TrademarksReducer.actions;

export default TrademarksReducer.reducer;
