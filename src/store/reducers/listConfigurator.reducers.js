import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  listConfigurator: [],
};

export const ListConfiguratorReducer = createSlice({
  name: "listConfigurator",
  initialState,
  reducers: {
    getListConfigurator: (state, action) => {
      state.listConfigurator = action.payload;
    },
  },
});

export const { getListConfigurator } = ListConfiguratorReducer.actions;

export default ListConfiguratorReducer.reducer;
