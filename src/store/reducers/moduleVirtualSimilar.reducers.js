import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  listModuleVirtualSimilar: [],
};

export const listModuleVirtualSimilarReducer = createSlice({
  name: "listModuleVirtualSimilar",
  initialState,
  reducers: {
    getListModuleVirtualSimilar: (state, action) => {
      state.listModuleVirtualSimilar = action.payload;
    },
  },
});

export const { getListModuleVirtualSimilar } = listModuleVirtualSimilarReducer.actions;

export default listModuleVirtualSimilarReducer.reducer;
