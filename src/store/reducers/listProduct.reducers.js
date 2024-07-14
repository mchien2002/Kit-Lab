import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  listProduct: [],
};

export const ListProductReducer = createSlice({
  name: "listProduct",
  initialState,
  reducers: {
    getListProduct: (state, action) => {
      state.listProduct = action.payload;
    },
  },
});

export const { getListProduct } = ListProductReducer.actions;

export default ListProductReducer.reducer;
