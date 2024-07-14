import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  listCategory: [],
};

export const listCategoryReducer = createSlice({
  name: "listCategory",
  initialState,
  reducers: {
    getListCategory: (state, action) => {
      state.listCategory = action.payload;
    },
  },
});

export const { getListCategory } = listCategoryReducer.actions;

export default listCategoryReducer.reducer;
