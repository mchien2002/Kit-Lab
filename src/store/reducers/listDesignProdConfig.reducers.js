import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  listDesignProdConfig: [],
};

export const ListDesignProdConfigReducer = createSlice({
  name: "listDesignProdConfig",
  initialState,
  reducers: {
    getListDesignProdConfigReducer: (state, action) => {
      state.listDesignProdConfig = action.payload;
    },
  },
});

export const { getListDesignProdConfigReducer } = ListDesignProdConfigReducer.actions;

export default ListDesignProdConfigReducer.reducer;
