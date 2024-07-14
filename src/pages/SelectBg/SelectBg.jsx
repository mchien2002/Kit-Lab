import React, { useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppContext } from "../../App";
import "./SelectBg.scss";
import { getListRoomAction } from "../../store/actions/listRoom.action";
import { useDispatch, useSelector } from "react-redux";
import queryString from "query-string";

export default function SelectBg() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const location = useLocation();
  const { id } = queryString.parse(location.search);

  const { listRoom } = useSelector((state) => state.listRoom);

  useEffect(() => {
    dispatch(getListRoomAction(id));
  }, [id]);

  return (
    <div className="selectBgPage">
      <div className="bg-main">
        <p className="title">Select Cabinet Type</p>

        <div className="bg-container d-flex flex-wrap align-items-start justify-content-start">
          {listRoom?.map((item) => {
            return (
              <div
                className="col-12 col-sm-6 col-md-4 col-xl-3 p-2"
                key={item._id}
                onClick={() => {
                  navigate(`/virtual?productId=${id}`, {
                    state: {
                      roomDetail: item,
                    },
                  });
                }}
              >
                <div className="bg-card">
                  <div className="ratio ratio-4x3">
                    <img
                      className="bg-card__image"
                      src={`${process.env.REACT_APP_URL}uploads/virtuals/images/icons/${item.imgUrl}`}
                      alt="Product"
                    />
                  </div>

                  <div className="bg-card__text">
                    <span className="name">{item.name}</span>
                    <span className="hover">Design this room</span>
                    <i className="far fa-arrow-right"></i>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
