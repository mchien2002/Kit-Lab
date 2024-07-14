import { configureStore } from "@reduxjs/toolkit";

import MemberReducer from "./reducers/member.reducers";
import UserReducer from "./reducers/user.reducers";
import MeasureReducer from "./reducers/measure.reducers";
import StepsReducer from "./reducers/steps.reducers";
import ProductInfoReducer from "./reducers/productInfo.reducers";
import ListDesignProdConfigReducer from "./reducers/listDesignProdConfig.reducers";
import DesignProdConfigDetailReducer from "./reducers/designProdConfigDetail.reducers";
import StepDetailReducer from "./reducers/stepDetail.reducers";
import StepEditDetailReducer from "./reducers/stepEditDetail.reducers";
import MaterialReducer from "./reducers/material.reducers";
import TextureReducer from "./reducers/texture.reducers";
import TrademarksReducer from "./reducers/trademarks.reducers";
import ModuleDetailReducer from "./reducers/moduleDetail.reducers";
import ListProductReducer from "./reducers/listProduct.reducers";
import ListRoomReducer from "./reducers/listRoom.reducers";
import ListConfiguratorReducer from "./reducers/listConfigurator.reducers";
import ListCategoryReducer from "./reducers/listCategory.reducers";
import ListTextureVirtualReducer from "./reducers/listTextureVirtual.reducers";
import ListModuleVirtualReducer from "./reducers/moduleVirtual.reducers";
import ListModuleVirtualSimilarReducer from "./reducers/moduleVirtualSimilar.reducers";
import ListDesignVirtualReducer from "./reducers/listDesignVirtual.reducers";
import DesignVirtualDetailReducer from "./reducers/designVirtualDetail.reducers";
import ModuleVirtualDetailReducer from "./reducers/moduleVirtualDetail.reducers";

export default configureStore({
  reducer: {
    user: UserReducer,
    member: MemberReducer,
    measure: MeasureReducer,
    steps: StepsReducer,
    productInfo: ProductInfoReducer,
    listDesignProdConfig: ListDesignProdConfigReducer,
    designProdConfigDetail: DesignProdConfigDetailReducer,
    stepDetail: StepDetailReducer,
    stepEditDetail: StepEditDetailReducer,
    material: MaterialReducer,
    moduleDetail: ModuleDetailReducer,
    texture: TextureReducer,
    trademarks: TrademarksReducer,
    listProduct: ListProductReducer,
    listRoom: ListRoomReducer,
    listConfigurator: ListConfiguratorReducer,
    listCategory: ListCategoryReducer,
    listTextureVirtual: ListTextureVirtualReducer,
    listModuleVirtual: ListModuleVirtualReducer,
    listModuleVirtualSimilar: ListModuleVirtualSimilarReducer,
    listDesignVirtual: ListDesignVirtualReducer,
    designVirtualDetail: DesignVirtualDetailReducer,
    moduleVirtualDetail: ModuleVirtualDetailReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false,
    }),
});
