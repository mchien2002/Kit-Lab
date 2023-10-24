import callApi from "../../utils/callApi";
import { getMaterial } from "../reducers/material.reducers";

export const getMaterialAction = (limit, page) => {
  return async (dispatch) => {
    try {
      const res = await callApi(
        `materials?PAGE_SIZE=${limit}&page=${page}`,
        "GET"
      );
      // console.log(res.data.data);

      await dispatch(getMaterial(res.data.data));
    } catch (err) {
      console.log(err);
    }
  };
};
