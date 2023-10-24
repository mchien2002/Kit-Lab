import callApi from "../../utils/callApi";
import { getAllStep } from "../reducers/steps.reducers";

export const getAllStepAction = () => {
  return async (dispatch) => {
    try {
      const res = await callApi(`product/type?type_product=3`, "GET");

      // console.log(res.data.data);

      await dispatch(getAllStep(res.data.data));
    } catch (err) {
      console.log(err);
    }
  };
};
