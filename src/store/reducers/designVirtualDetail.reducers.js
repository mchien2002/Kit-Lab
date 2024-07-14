import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  designVirtualDetail: [],
};

export const designVirtualDetailReducer = createSlice({
  name: "designVirtualDetail",
  initialState,
  reducers: {
    getDesignVirtualDetail: (state, action) => {
      state.designVirtualDetail = action.payload;
    },
    clearDesignVirtualDetail: (state, action) => {
      state.designVirtualDetail = [];
    },
  },
});

export const { getDesignVirtualDetail, clearDesignVirtualDetail } =
  designVirtualDetailReducer.actions;

export default designVirtualDetailReducer.reducer;
