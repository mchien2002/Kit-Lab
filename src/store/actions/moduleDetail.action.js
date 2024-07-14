import callApi from "../../utils/callApi";
import {
  getLstMaterial,
  getLstSubModule,
} from "../reducers/moduleDetail.reducers";

export const getModuleDetailAction = (id) => {
  return async (dispatch) => {
    try {
      const res = await callApi(`module/${id}`, "GET");

      await dispatch(getLstMaterial(res.data.data.listMaterial));
      await dispatch(getLstSubModule(res.data.data.listSubmodule));
    } catch (err) {
      console.log(err);
    }
  };
};
