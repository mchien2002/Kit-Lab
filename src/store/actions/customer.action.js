import callApi from "../../utils/callApi";
import { getCustomer } from "../reducers/customer.reducers";

export const getCustomerUserAction = (token) => {
  const add = async (dispatch) => {
    try {
      const res = await callApi(
        `api/62de1bd5fcc56b09934ee278/customer?access_token=${token}&limit=1000`,
        "GET",
      );
      await dispatch(getCustomer(res.data));
    } catch (err) {
      // console.log("true");
    }
  };
  return add;
};

export const addCustomerUserAction = (token, data) => {
  const add = async (dispatch) => {
    try {
      await callApi(
        `api/62de1bd5fcc56b09934ee278/customer?access_token=${token}`,
        "POST",
        data,
      );
      const res = await callApi(
        `api/62de1bd5fcc56b09934ee278/customer?access_token=${token}&limit=1000`,
        "GET",
      );
      await dispatch(getCustomer(res.data));
    } catch (err) {
      // console.log("true");
    }
  };
  return add;
};

export const deleteCustomerAction = (token, id) => {
  const add = async (dispatch) => {
    try {
      await callApi(
        `api/62de1bd5fcc56b09934ee278/customer/${id}?access_token=${token}`,
        "DELETE",
      );
      const res = await callApi(
        `api/62de1bd5fcc56b09934ee278/customer?access_token=${token}&limit=1000`,
        "GET",
      );
      await dispatch(getCustomer(res.data));
    } catch (err) {
      console.log(err);
    }
  };
  return add;
};

export const editCustomerAction = (token, id, data) => {
  const add = async (dispatch) => {
    try {
      await callApi(
        `api/62de1bd5fcc56b09934ee278/customer/${id}?access_token=${token}`,
        "PUT",
        data,
      );
      const res = await callApi(
        `api/62de1bd5fcc56b09934ee278/customer?access_token=${token}&limit=1000`,
        "GET",
      );
      await dispatch(getCustomer(res.data));
    } catch (err) {
      console.log(err);
    }
  };
  return add;
};
