import callApi from "../../utils/callApi";
import {
  getTokenUser,
  getDetailUser,
  registerUser,
} from "../reducers/user.reducers";
import Cookies from "js-cookie";

export const getTokenUserAction = (username, password) => {
  return async (dispatch) => {
    try {
      const res = await callApi(`customer/login`, "POST", {
        username,
        password,
      });

      if (res.data) {
        console.log(">>>> " + JSON.stringify(res.data));

        Cookies.set("token", res.data.data.token);

        await dispatch(getTokenUser(res.data.data.token));

        // const detailUser = await callApi(
        //   `api/profile?access_token=${res.data.token}`,
        //   "GET"
        // );
        // await dispatch(getDetailUser(detailUser.data));
        // return res.data;
      }
      // else {
      //   await dispatch(getTokenUser(res));
      //   Cookies.set("token", "123");
      //   return res;
      // }
    } catch (err) {
      console.log(err);
    }
  };
};

export const saveTokenToReduxAction = (token) => {
  const add = async (dispatch) => {
    try {
      await dispatch(getTokenUser(token));
    } catch (err) {
      // console.log("true");
    }
  };
  return add;
};

export const getDetailUserAction = (token) => {
  const add = async (dispatch) => {
    try {
      const res = await callApi(`api/profile?access_token=${token}`, "GET");
      if (res.data) {
        await dispatch(getDetailUser(res.data));
      }
      return res;
    } catch (err) {
      // console.log("true");
    }
  };
  return add;
};

export const registerUserAction = (data) => {
  const add = async (dispatch) => {
    try {
      const res = await callApi(`signup`, "POST", data);
      await dispatch(registerUser(res));
      return res.data;
    } catch (err) {
      // console.log("true");
    }
  };
  return add;
};
