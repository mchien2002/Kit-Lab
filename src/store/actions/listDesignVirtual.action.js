import Cookies from "js-cookie";
import callApi from "../../utils/callApi";
import { getListDesignVirtual } from "../reducers/listDesignVirtual.reducers";

export const getListDesignVirtualAction = () => {
  return async (dispatch) => {
    try {
      const token = Cookies.get("token");
      const ownerId = Cookies.get("owner");
      const headers = {
        authorization: `Bearer ${token}`,
      };
      const res = await callApi(
        `virtual/designs?filter_by_owner=${ownerId}`,
        "GET",
        null,
        headers
      );
      // console.log(res.data.data);

      await dispatch(getListDesignVirtual(res.data.data));
    } catch (err) {
      console.log(err);
    }
  };
};
