import callApi from "../../utils/callApi";
import { getStepEditDetail } from "../reducers/stepEditDetail.reducers";

export const getStepEditDetailAction = (stepEditId) => {
  return async (dispatch) => {
    try {
      if (stepEditId) {
        const res = await callApi(`step/${stepEditId}`, "GET");

        console.log("STEP DETAIL EDIT: ");
        console.log(res.data.data);

        await dispatch(getStepEditDetail(res.data.data));
      }
    } catch (err) {
      console.log(err);
    }
  };
};
