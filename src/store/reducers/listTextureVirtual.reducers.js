import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  listTextureVirtual: [],
};

export const listTextureVirtualReducer = createSlice({
  name: "listTextureVirtual",
  initialState,
  reducers: {
    getListTextureVirtual: (state, action) => {
      state.listTextureVirtual = action.payload;
    },
  },
});

export const { getListTextureVirtual } = listTextureVirtualReducer.actions;

export default listTextureVirtualReducer.reducer;
