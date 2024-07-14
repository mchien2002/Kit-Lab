import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  listRoom: [],
};

export const ListRoomReducer = createSlice({
  name: "listRoom",
  initialState,
  reducers: {
    getListRoom: (state, action) => {
      state.listRoom = action.payload;
    },
  },
});

export const { getListRoom } = ListRoomReducer.actions;

export default ListRoomReducer.reducer;
