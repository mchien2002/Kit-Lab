import callApi from "../../utils/callApi";
import { getMember } from "../reducers/member.reducers";

export const getMemberAction = (token) => {
  const add = async (dispatch) => {
    try {
      const res = await callApi(
        `api/62de1bd5fcc56b09934ee278/wlin_hoi_vien?access_token=${token}&limit=1000`,
        "GET",
      );
      await dispatch(getMember(res.data));
    } catch (err) {
      console.log(err);
    }
  };
  return add;
};

export const editMemberAction = (token, id, data) => {
  const add = async (dispatch) => {
    try {
      const res1 = await callApi(
        `api/62de1bd5fcc56b09934ee278/wlin_hoi_vien/${id}?access_token=${token}`,
        "PUT",
        data,
      );
      const res = await callApi(
        `api/62de1bd5fcc56b09934ee278/wlin_hoi_vien?access_token=${token}&limit=1000`,
        "GET",
      );
      await dispatch(getMember(res.data));
      return res1;
    } catch (err) {
      console.log(err);
    }
  };
  return add;
};

export const addMemberAction = (token, data) => {
  const add = async (dispatch) => {
    try {
      const res1 = await callApi(
        `api/62de1bd5fcc56b09934ee278/wlin_hoi_vien?access_token=${token}`,
        "POST",
        data,
      );
      const res = await callApi(
        `api/62de1bd5fcc56b09934ee278/wlin_hoi_vien?access_token=${token}&limit=1000`,
        "GET",
      );
      await dispatch(getMember(res.data));
      return res1;
    } catch (err) {
      console.log(err);
    }
  };
  return add;
};

export const deleteMemberAction = (token, id) => {
  const add = async (dispatch) => {
    try {
      const res1 = await callApi(
        `api/62de1bd5fcc56b09934ee278/wlin_hoi_vien/${id}?access_token=${token}`,
        "DELETE",
      );
      const res = await callApi(
        `api/62de1bd5fcc56b09934ee278/wlin_hoi_vien?access_token=${token}&limit=1000`,
        "GET",
      );
      await dispatch(getMember(res.data));
      return res1;
    } catch (err) {
      console.log(err);
    }
  };
  return add;
};

export const searchMemberAction = async (token, text) => {
  try {
    const res = await callApi(
      `api/62de1bd5fcc56b09934ee278/wlin_hoi_vien?access_token=${token}&q={"$text":{"$search":"${text}"}}&limit=1000`,
      "GET",
    );
    return res.data;
  } catch (err) {
    console.log(err);
  }
};
