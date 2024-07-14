import callApi from "../../utils/callApi";
import { getTexture } from "../reducers/texture.reducers";
import Cookies from "js-cookie";

export const getTextureAction = (limit, page) => {
  return async (dispatch) => {
    try {
      const token = Cookies.get("token");
      const headers = {
        authorization: `Bearer ${token}`,
      };
      const res = await callApi(
        `textures?PAGE_SIZE=${limit}&page=${page}`,
        "GET",
        null,
        headers
      );

      // console.log(res.data.data);

      await dispatch(getTexture(res.data.data));
    } catch (err) {
      console.log(err);
    }
  };
};
