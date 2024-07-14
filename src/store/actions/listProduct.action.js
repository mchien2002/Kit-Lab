import callApi from "../../utils/callApi";
import { getListProduct } from "../reducers/listProduct.reducers";

export const getListProductAction = (type) => {
  return async (dispatch) => {
    try {
      const res = await callApi(`${type}products`, "GET");
      // console.log(res.data.data);
      const filteredData = res.data.data.filter(item => item.type === 0);
      // await dispatch(getListProduct(res.data.data));
      await dispatch(getListProduct(filteredData));
    } catch (err) {
      console.log(err);
    }
  };
};
