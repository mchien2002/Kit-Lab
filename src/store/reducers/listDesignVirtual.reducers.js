import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  listDesignVirtual: [],
};

export const listDesignVirtualReducer = createSlice({
  name: "listDesignVirtual",
  initialState,
  reducers: {
    getListDesignVirtual: (state, action) => {
      state.listDesignVirtual = action.payload;
    },
  },
});

export const { getListDesignVirtual } = listDesignVirtualReducer.actions;

export default listDesignVirtualReducer.reducer;
