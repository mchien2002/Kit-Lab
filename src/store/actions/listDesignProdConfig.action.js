import Cookies from "js-cookie";
import callApi from "../../utils/callApi";
import { getListDesignProdConfigReducer } from "../reducers/listDesignProdConfig.reducers";

export const getListDesignProdConfigAction = () => {
  return async (dispatch) => {
    try {
      const token = Cookies.get("token");
      const ownerId = Cookies.get("owner");
      const headers = {
        authorization: `Bearer ${token}`,
      };

      if (token) {
        const res = await callApi(
          `designs?owner_id=${ownerId}`,
          "GET",
          "",
          headers
        );

        await dispatch(getListDesignProdConfigReducer(res.data.data));
      }
    } catch (err) {
      console.log(err);
    }
  };
};
