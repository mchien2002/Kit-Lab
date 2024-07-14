import queryString from "query-string";
import React, { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { AppContext } from "../../App";
import CardStyle from "../../components/CardStyle/CardStyle";
import FormType from "../../components/FormType/FormType";
import { getListConfiguratorAction } from "../../store/actions/listConfigurator.action";
import "./SizeInfo.scss";

export default function SizeInfo() {
  const appContext = useContext(AppContext);

  const dispatch = useDispatch();
  const location = useLocation();
  const { id } = queryString.parse(location.search);

  const { listConfigurator } = useSelector((state) => state.listConfigurator);

  const [type, setType] = useState({
    index: 0,
    _id: listConfigurator[0]?._id,
  });

  useEffect(() => {
    dispatch(getListConfiguratorAction(id));
  }, [id]);

  useEffect(() => {
    setType({ index: 0, _id: listConfigurator[0]?._id });
    appContext.setCanInside(listConfigurator[0]?.canInside);
  }, [listConfigurator]);

  return (
    <div className="sizeInfoPage col-12">
      <div className="col-12 d-flex flex-row">
        <div className="col-7 pe-3 pe-xxl-5">
          <div className="container__type col-12 d-flex flex-column">
            <p className="title">Chọn loại tủ bạn muốn thiết kế</p>
            <div className="col-12 d-flex flex-wrap">
              {listConfigurator?.map((item, index) => {
                return (
                  <div
                    key={item._id}
                    className={`card-type col-6 d-flex flex-column ${
                      type.index === index ? "active" : ""
                    }`}
                    onClick={() => {
                      setType({ index: index, _id: item._id });
                      appContext.setCanInside(item.canInside);
                    }}
                  >
                    <CardStyle name={item.name} imgSrc={item.imgUrl} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="container__form col-5 ps-2">
          <FormType type={type} listConfigurator={listConfigurator} />
        </div>
      </div>
    </div>
  );
}
