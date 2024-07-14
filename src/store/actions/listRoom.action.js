import Cookies from "js-cookie";
import callApi from "../../utils/callApi";
import { getListRoom } from "../reducers/listRoom.reducers";

export const getListRoomAction = (productId) => {
  return async (dispatch) => {
    try {
      const token = Cookies.get("token");
      const headers = {
        authorization: `Bearer ${token}`,
      };

      const res = await callApi(
        `virtual/rooms?filter_by_product=${productId}`,
        "GET",
        null,
        headers
      );
      // console.log(res.data.data);

      await dispatch(getListRoom(res.data.data));
    } catch (err) {
      console.log(err);
    }
  };
};

// export const getListRoomAction = (type) => {
//   return async (dispatch) => {
//     try {
//       const token = Cookies.get("token");
//       const headers = {
//         authorization: `Bearer ${token}`,
//       };
//       const res = await callApi(`${type}products`, "GET", null, headers);
//       console.log(res.data.data);

//       await dispatch(getListRoom(res.data.data));
//     } catch (err) {
//       console.log(err);
//     }
//   };
// };
