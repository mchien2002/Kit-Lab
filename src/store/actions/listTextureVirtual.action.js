import Cookies from "js-cookie";
import callApi from "../../utils/callApi";
import { getListTextureVirtual } from "../reducers/listTextureVirtual.reducers";

export const getListTextureVirtualAction = (materialId) => {
  return async (dispatch) => {
    try {
      const token = Cookies.get("token");
      const headers = {
        authorization: `Bearer ${token}`,
      };

      const res = await callApi(
        `virtual/textures?filter_by_material=${materialId}`,
        "GET",
        null,
        headers
      );

      // console.log(res.data.data);

      await dispatch(getListTextureVirtual(res.data.data));
    } catch (err) {
      console.log(err);
    }
  };
};
