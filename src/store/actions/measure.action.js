import { setMeasure } from "../reducers/measure.reducers";

export const setMeasureAction = (data) => {
  return async (dispatch) => {
    await dispatch(setMeasure(data));

    console.log("SET MEASURE");
  };
};
