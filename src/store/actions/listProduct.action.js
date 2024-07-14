import callApi from "../../utils/callApi";
import { getListProduct } from "../reducers/listProduct.reducers";

export const getListProductAction = (type) => {
  return async (dispatch) => {
    try {
      const res = await callApi(`${type}products`, "GET");
      // console.log(res.data.data);

      await dispatch(getListProduct(res.data.data));
    } catch (err) {
      console.log(err);
    }
  };
};
