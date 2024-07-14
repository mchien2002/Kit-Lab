import Cookies from "js-cookie";
import callApi from "../../utils/callApi";
import { getListModuleVirtual } from "../reducers/moduleVirtual.reducers";

export const getListModuleVirtualAction = (productId, ftCategory, ftName) => {
  return async (dispatch) => {
    try {
      const token = Cookies.get("token");
      const headers = {
        authorization: `Bearer ${token}`,
      };
      const productQuery = productId ? `recommed_by_product=${productId}` : "";
      const filterCategory = ftCategory
        ? `filter_by_category=${ftCategory}`
        : "";
      const filterName = ftName ? `filter_by_name=${ftName}` : "";
      const res = await callApi(
        `virtual/modules?${productQuery}${filterCategory}${filterName}`,
        "GET",
        null,
        headers
      );
      console.log(res.data.data);

      await dispatch(getListModuleVirtual(res.data.data));
    } catch (err) {
      console.log(err);
    }
  };
};
