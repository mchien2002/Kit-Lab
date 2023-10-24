import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  listMember: [],
};

export const MemberReducer = createSlice({
  name: "Member",
  initialState,
  reducers: {
    getMember: (state, action) => {
      state.listMember = action.payload;
    },
  },
});

export const { getMember } = MemberReducer.actions;

export default MemberReducer.reducer;
