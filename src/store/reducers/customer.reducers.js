import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  listCustomer: [],
};

export const CustomerReducer = createSlice({
  name: "customer",
  initialState,
  reducers: {
    getCustomer: (state, action) => {
      state.listCustomer = action.payload;
    },
  },
});

export const { getCustomer } = CustomerReducer.actions;

export default CustomerReducer.reducer;
