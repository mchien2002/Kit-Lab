import Cookies from "js-cookie";
import callApi from "../../utils/callApi";
import { getModuleVirtualDetail } from "../reducers/moduleVirtualDetail.reducers";

export const getModuleVirtualDetailAction = (moduleId) => {
  return async (dispatch) => {
    try {
      const token = Cookies.get("token");
      const headers = {
        authorization: `Bearer ${token}`,
      };
      const res = await callApi(
        `virtual/module/${moduleId}`,
        "GET",
        null,
        headers
      );
      console.log(res.data.data);

      await dispatch(getModuleVirtualDetail(res.data.data));
    } catch (err) {
      console.log(err);
    }
  };
};
