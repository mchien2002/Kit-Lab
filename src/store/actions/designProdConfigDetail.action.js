import Cookies from "js-cookie";
import callApi from "../../utils/callApi";
import { getDesignProdConfigDetailReducer } from "../reducers/designProdConfigDetail.reducers";

export const getDesignProdConfigDetailReducerAction = (id) => {
  return async (dispatch) => {
    try {
      const token = Cookies.get("token");
      const headers = {
        authorization: `Bearer ${token}`,
      };

      const res = await callApi(`design/${id}`, "GET", "", headers);

      await dispatch(getDesignProdConfigDetailReducer(res.data.data));
    } catch (err) {
      console.log(err);
    }
  };
};
