import callApi from "../../utils/callApi";
import { getTexture } from "../reducers/texture.reducers";

export const getTextureAction = (limit, page) => {
  return async (dispatch) => {
    try {
      const res = await callApi(
        `textures?PAGE_SIZE=${limit}&page=${page}`,
        "GET"
      );

      // console.log(res.data.data);

      await dispatch(getTexture(res.data.data));
    } catch (err) {
      console.log(err);
    }
  };
};
