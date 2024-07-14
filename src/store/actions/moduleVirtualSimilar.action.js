import Cookies from "js-cookie";
import callApi from "../../utils/callApi";
import { getListModuleVirtualSimilar } from "../reducers/moduleVirtualSimilar.reducers";

export const getListModuleVirtualSimilarAction = (moduleId) => {
  return async (dispatch) => {
    try {
      const token = Cookies.get("token");
      const headers = {
        authorization: `Bearer ${token}`,
      };
      const res = await callApi(
        `virtual/modules?recommed_by_module=${moduleId}`,
        "GET",
        null,
        headers
      );
      // console.log(res.data.data);

      await dispatch(getListModuleVirtualSimilar(res.data.data));
    } catch (err) {
      console.log(err);
    }
  };
};
