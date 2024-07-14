import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  moduleVirtualDetail: [],
};

export const moduleVirtualDetailReducer = createSlice({
  name: "moduleVirtualDetail",
  initialState,
  reducers: {
    getModuleVirtualDetail: (state, action) => {
      state.moduleVirtualDetail = action.payload;
    },
  },
});

export const { getModuleVirtualDetail } = moduleVirtualDetailReducer.actions;

export default moduleVirtualDetailReducer.reducer;
