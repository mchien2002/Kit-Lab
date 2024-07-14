import callApi from "../../utils/callApi";
import { getMaterial } from "../reducers/material.reducers";
import Cookies from "js-cookie";


export const getMaterialAction = (limit, page) => {
  return async (dispatch) => {
    try {
      const token = Cookies.get("token");
      const headers = {
        authorization: `Bearer ${token}`,
      };
      const res = await callApi(
        `materials?PAGE_SIZE=${limit}&page=${page}`,
        "GET",
        null,
        headers
      );
      // console.log(res.data.data);

      await dispatch(getMaterial(res.data.data));
    } catch (err) {
      console.log(err);
    }
  };
};
