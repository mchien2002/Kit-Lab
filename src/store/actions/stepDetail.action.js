import callApi from "../../utils/callApi";
import { getStepDetail } from "../reducers/stepDetail.reducers";

export const getStepDetailAction = (stepId) => {
  return async (dispatch) => {
    try {
      if (stepId !== null) {
        const res = await callApi(`step/${stepId}`, "GET");

        dispatch(getStepDetail(res.data.data));
      }
    } catch (err) {
      console.log(err);
    }
  };
};
