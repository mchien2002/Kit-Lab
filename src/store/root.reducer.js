import { configureStore } from "@reduxjs/toolkit";

import MemberReducer from "./reducers/member.reducers";
import UserReducer from "./reducers/user.reducers";
import CustomerReducer from "./reducers/customer.reducers";
import MeasureReducer from "./reducers/measure.reducers";
import StepsReducer from "./reducers/steps.reducers";
import ProductInfoReducer from "./reducers/productInfo.reducers";
import StepDetailReducer from "./reducers/stepDetail.reducers";
import StepEditDetailReducer from "./reducers/stepEditDetail.reducers";
import MaterialReducer from "./reducers/material.reducers";
import TextureReducer from "./reducers/texture.reducers";
import ModuleClickedReducer from "./reducers/ModuleClicked.reducers";

export default configureStore({
  reducer: {
    user: UserReducer,
    member: MemberReducer,
    customer: CustomerReducer,
    measure: MeasureReducer,
    steps: StepsReducer,
    productInfo: ProductInfoReducer,
    stepDetail: StepDetailReducer,
    stepEditDetail: StepEditDetailReducer,
    material: MaterialReducer,
    texture: TextureReducer,
    moduleClicked: ModuleClickedReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false,
    }),
});
