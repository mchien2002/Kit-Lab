import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tokenUser: "",
  detailUser: "",
  checkRegister: "",
};

export const UserReducer = createSlice({
  name: "user",
  initialState,
  reducers: {
    getTokenUser: (state, action) => {
      // state.tokenUser = action.payload;
      console.log(action.payload);
    },
    getDetailUser: (state, action) => {
      state.detailUser = action.payload;
    },
    registerUser: (state, action) => {
      state.checkRegister = action.payload;
    },
    deleteDetailUser: (state, action) => {
      state.detailUser = "";
    },
  },
});

export const { getTokenUser, getDetailUser, registerUser, deleteDetailUser } =
  UserReducer.actions;

export default UserReducer.reducer;
