import Cookies from "js-cookie";
import callApi from "../../utils/callApi";
import {
  getDesignVirtualDetail,
  clearDesignVirtualDetail,
} from "../reducers/designVirtualDetail.reducers";

export const getDesignVirtualDetailAction = (designId) => {
  return async (dispatch) => {
    try {
      const token = Cookies.get("token");
      const headers = {
        authorization: `Bearer ${token}`,
      };
      const res = await callApi(
        `virtual/design/${designId}`,
        "GET",
        null,
        headers
      );
      console.log(res.data.data);

      await dispatch(getDesignVirtualDetail(res.data.data));
    } catch (err) {
      console.log(err);
    }
  };
};

export const clearDesignVirtualDetailAction = () => {
  return async (dispatch) => {
    try {
      dispatch(clearDesignVirtualDetail());
    } catch (err) {
      console.log(err);
    }
  };
};
