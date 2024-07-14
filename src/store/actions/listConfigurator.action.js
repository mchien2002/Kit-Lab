import Cookies from "js-cookie";
import callApi from "../../utils/callApi";
import { getListConfigurator } from "../reducers/listConfigurator.reducers";

export const getListConfiguratorAction = (configId) => {
  return async (dispatch) => {
    try {
      const token = Cookies.get("token");
      const headers = {
        authorization: `Bearer ${token}`,
      };

      const res = await callApi(
        `product/items/${configId}`,
        "GET",
        null,
        headers
      );
      // console.log(res.data.data);

      await dispatch(getListConfigurator(res.data.data));
    } catch (err) {
      console.log(err);
    }
  };
};

// export const getListConfiguratorAction = (type) => {
//   return async (dispatch) => {
//     try {
//       const token = Cookies.get("token");
//       const headers = {
//         authorization: `Bearer ${token}`,
//       };
//       const res = await callApi(`${type}products`, "GET", null, headers);
//       console.log(res.data.data);

//       await dispatch(getListConfigurator(res.data.data));
//     } catch (err) {
//       console.log(err);
//     }
//   };
// };
