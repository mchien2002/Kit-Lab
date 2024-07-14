import Cookies from "js-cookie";
import React, { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import { AppContext } from "../../App";
import { getListDesignProdConfigAction } from "../../store/actions/listDesignProdConfig.action";
import { getListProductAction } from "../../store/actions/listProduct.action";
import { getListDesignVirtualAction } from "../../store/actions/listDesignVirtual.action";
import { getProjectById, getTimeAgo } from "../../utils/function";
import "./HomePage.scss";
import { getDesignUnit } from "../../utils/getData";

const fakeType = [
  {
    id: 0,
    endPoint: "",
    name: "Product Configurator",
    image: "./assets/images/option/product.png",
  },
  {
    id: 1,
    endPoint: "virtual/",
    name: "Virtual Design",
    image: "./assets/images/option/virtual.png",
  },
];

const ProductStatus = { DEVELOPING: 0, PENDING: 1, PUBLISH: 2 };

export const logOut = () => {
  Cookies.remove("token");
  window.location.href = "/";
};

export default function HomePage() {
  const appContext = useContext(AppContext);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [type, setType] = useState({ id: 0, endPoint: "" });
  const [listAllDesign, setListAllDesign] = useState();
  const [qtyDesign, setQtyDesign] = useState(6);

  // const imgData = JSON.parse(localStorage.getItem("imgData"));

  let kitchen;
  const { listDesignProdConfig } = useSelector(
    (state) => state.listDesignProdConfig
  );
  const { listProduct } = useSelector((state) => state.listProduct);
  const { listDesignVirtual } = useSelector((state) => state.listDesignVirtual);
  const kitchenStorage = localStorage.getItem("kitchen");

  // if (kitchenStorage) {
  //   kitchen = JSON.parse(kitchenStorage);
  // }

  const clickDesignProdConfig = async (id) => {
    const project = await getProjectById(id, appContext.setProjectDetail);
    const dataProduct = await getDesignUnit([], project.data.data.productId);
    navigate("/custom-design", {
      state: { productData: dataProduct.data.data },
    });
  };

  const settings = {
    dots: true,
    infinite: false,
    centerMode: false,
    speed: 500,
    // slidesToShow: listDesignProdConfig.length > 3 ? 3 : listDesignProdConfig.length + 1,
    slidesToShow: 3,
    slidesToScroll: 1,
  };

  useEffect(() => {
    if (appContext.isLogin) {
      dispatch(getListDesignVirtualAction());
      dispatch(getListDesignProdConfigAction());
    }
  }, [appContext.isLogin]);

  useEffect(() => {
    dispatch(getListProductAction(type.endPoint));
  }, [type]);

  useEffect(() => {
    const newListDesignProdConfig = listDesignProdConfig.map((item) => ({
      ...item,
      tag: "Product Configurator",
    }));

    const newListDesignVirtual = listDesignVirtual.map((item) => ({
      ...item,
      tag: "Virtual Design",
    }));

    const mergedList = [...newListDesignProdConfig, ...newListDesignVirtual];
    mergedList.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    console.log(mergedList);
    setListAllDesign(mergedList);
  }, [listDesignProdConfig, listDesignVirtual]);

  return (
    <main className="homepage col-12 my-auto">
      <section className="featured col-12 d-flex flex-row">
        <div className="featured-left col-3 d-flex flex-column">
          {fakeType.map((item, index) => {
            return (
              <div
                key={index}
                className={index === type.id ? "type-card active" : "type-card"}
                onClick={() => setType({ id: index, endPoint: item.endPoint })}
              >
                <div className="type-card__text">
                  <span>{item.name}</span>

                  {index === type.id ? (
                    <i className="fas fa-check"></i>
                  ) : (
                    <i className="fas fa-arrow-right"></i>
                  )}
                </div>

                <img
                  className="type-card__image"
                  src={item.image}
                  alt={item.name}
                />
              </div>
            );
          })}
        </div>

        <div className="featured-right col-9">
          {type.endPoint !== "virtual/" ? (
            <div>
              <p className="intro">
                {/* Virtually customize products before making a purchase. You can
                see how light and shadow are projected on your furniture, as
                well as the texture of the fabric. Let's choose the room you
                want to design. */}
                Trình bày sản phẩm hấp dẫn nhất, cho phép thiết kế toàn bộ căn
                phòng và khuyến khích khách hàng mua theo bộ. Bây giờ, hãy cùng
                chọn căn phòng bạn muốn thiết kế.
              </p>

              <div className="col-12 d-flex flex-wrap">
                {listProduct?.map((item) => {
                  if (item.status === ProductStatus.PUBLISH)
                    return (
                      <div
                        className="col-6 col-md-4 col-xl-3 p-2"
                        key={item._id}
                        onClick={() => {
                          navigate(`/size-info?id=${item._id}`);
                        }}
                      >
                        <div className="room-card">
                          <div className="ratio ratio-4x3">
                            <img
                              className="room-card__image"
                              src={`${process.env.REACT_APP_URL}uploads/images/icons/${item.imgUrl}`}
                              alt="Product"
                            />
                          </div>

                          <div className="room-card__text">
                            <span>{item.name}</span>
                            <i className="far fa-arrow-right"></i>
                          </div>
                        </div>
                      </div>
                    );
                })}
              </div>
            </div>
          ) : (
            <div>
              <div className="col-12 d-flex flex-wrap">
                <p className="intro">
                  {/* Provide the best possible presentation of products, allowing
                  to design entire rooms and encouraging your customers to buy
                  complete sets. Let's choose the room you want to design. */}
                  Bạn có thể tùy chỉnh sản phẩm một cách trực quan trước khi mua
                  hàng. Bạn sẽ thấy ánh sáng và bóng đổ mô phỏng trên đồ nội
                  thất của mình, cũng như cảm nhận được chất liệu vải. Bây giờ,
                  hãy cùng chọn nội thất bạn muốn thiết kế.
                </p>

                <div className="col-12 d-flex flex-wrap">
                  {listProduct?.map((item) => {
                    // if (item.status === ProductStatus.PUBLISH)
                    return (
                      <div
                        className="col-6 col-md-4 col-xl-3 p-2"
                        key={item._id}
                        onClick={() => {
                          navigate(`/select-bg?id=${item._id}`);
                        }}
                      >
                        <div className="room-card">
                          <div className="ratio ratio-4x3">
                            <img
                              className="room-card__image"
                              src={`${process.env.REACT_APP_URL}uploads/virtuals/images/icons/${item.imgUrl}`}
                              alt="Product"
                            />
                          </div>

                          <div className="room-card__text">
                            <span>{item.name}</span>
                            <i className="far fa-arrow-right"></i>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {listAllDesign?.length !== 0 && (
        <section className="my-design">
          <div className="d-flex flex-row justify-content-between">
            <p className="my-design__heading">Thiết kế của tôi</p>
            <p
              className="my-design__all"
              onClick={() => {
                if (qtyDesign > 6) {
                  setQtyDesign(6);
                } else {
                  setQtyDesign(listAllDesign.length);
                }
              }}
            >
              {qtyDesign === 6 ? "Xem thêm" : "Thu gọn"}
            </p>
          </div>

          <div className="d-flex flex-wrap">
            {listAllDesign &&
              listAllDesign.slice(0, qtyDesign).map((design) => {
                return (
                  <div className="col-2 p-1" key={design._id}>
                    <div
                      className="my-design__card  h-100"
                      onClick={() => {
                        if (design.tag === "Virtual Design") {
                          navigate(`/virtual?designId=${design._id}`, {
                            state: {
                              roomDetail: design.room,
                            },
                          });
                        } else {
                          clickDesignProdConfig(design._id);
                        }
                      }}
                    >
                      <div className="ratio ratio-4x3">
                        <img
                          className="card-image"
                          src={`${process.env.REACT_APP_URL}uploads/${
                            design.picUrl ? "" : "virtuals/"
                          }images/icons/${design.picUrl || design.room.imgUrl}`}
                          alt="room"
                        />
                      </div>

                      <div
                        className="d-flex flex-column justify-content-between"
                        style={{ flexGrow: 1 }}
                      >
                        <div>
                          <p className="card-tag">{design.tag}</p>
                          <p className="card-name">{design.name}</p>
                        </div>
                        <span className="card-time">
                          {getTimeAgo(design.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </section>
      )}
    </main>
  );
}
