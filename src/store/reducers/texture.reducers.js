import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  lstTexture: [],
};

export const TextureReducer = createSlice({
  name: "texture",
  initialState,
  reducers: {
    getTexture: (state, action) => {
      state.lstTexture = action.payload;
    },
  },
});

export const { getTexture } = TextureReducer.actions;

export default TextureReducer.reducer;
