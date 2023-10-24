import { setModuleClicked,setTexture } from "../reducers/ModuleClicked.reducers";

export const setModuleClickedAction = (data) => {
  return async (dispatch) => {
    await dispatch(setModuleClicked(data));
  };
};

export const setTextureAction = (data) => {
  return async (dispatch) => {
    await dispatch(setTexture(data));
  };
};
