import Cookies from "js-cookie";
import callApi from "../../utils/callApi";
import { getTrademarks } from "../reducers/trademarks.reducers";

export const getTrademarksAction = (typeProduct) => {
  return async (dispatch) => {
    try {
      const token = Cookies.get("token");
      const headers = {
        authorization: `Bearer ${token}`,
      };

      const res = await callApi(
        `trademarks?typeProduct=${typeProduct}`,
        "GET",
        null,
        headers
      );

      dispatch(getTrademarks(res.data.data));
    } catch (err) {
      console.log(err);
    }
  };
};
