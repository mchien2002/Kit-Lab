import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  listModuleVirtual: [],
};

export const listModuleVirtualReducer = createSlice({
  name: "listModuleVirtual",
  initialState,
  reducers: {
    getListModuleVirtual: (state, action) => {
      state.listModuleVirtual = action.payload;
    },
  },
});

export const { getListModuleVirtual } = listModuleVirtualReducer.actions;

export default listModuleVirtualReducer.reducer;
