import callApi from "../../utils/callApi";
import { getProductInfo } from "../reducers/productInfo.reducers";

export const getProductInfoAction = (data) => {
  return (dispatch) => {
    dispatch(getProductInfo(data));

  };
};
