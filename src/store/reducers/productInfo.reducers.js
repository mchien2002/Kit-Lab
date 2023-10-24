import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  productInfo: {},
};

export const ProductInfoReducer = createSlice({
  name: "productInfo",
  initialState,
  reducers: {
    getProductInfo: (state, action) => {
      state.productInfo = action.payload;
    },
  },
});

export const { getProductInfo } = ProductInfoReducer.actions;

export default ProductInfoReducer.reducer;
