import Cookies from "js-cookie";
import callApi from "../../utils/callApi";
import { getListCategory } from "../reducers/listCategory.reducers";

export const getListCategoryAction = (typeId) => {
  return async (dispatch) => {
    try {
      const token = Cookies.get("token");
      const headers = {
        authorization: `Bearer ${token}`,
      };
      const res = await callApi(
        `categories?type=${typeId}`,
        "GET",
        null,
        headers
      );
      // console.log(res.data.data);

      await dispatch(getListCategory(res.data.data));
    } catch (err) {
      console.log(err);
    }
  };
};
