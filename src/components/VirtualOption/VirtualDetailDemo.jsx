import { Breadcrumb, Input, Select, Tooltip } from "antd";
import { useContext, useEffect, useState } from "react";
import { dataDemo } from "../../utils/data.js";
import { handleChangeTextureVirtual } from "../../utils/function.js";
import { VirtualContextDemo } from "../Virtual/VirtualDemo.jsx";
import "./VirtualDetailDemo.scss";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation, Thumbs } from "swiper/modules";

import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import { useDispatch, useSelector } from "react-redux";
import { getModuleVirtualDetailAction } from "../../store/actions/moduleVirtualDetail.action.js";
import { getListTextureVirtualAction } from "../../store/actions/listTextureVirtual.action.js";
import { getListModuleVirtualSimilarAction } from "../../store/actions/moduleVirtualSimilar.action.js";
import MoreTexture from "../MoreTexture/MoreTexture.jsx";

const { Search } = Input;

const settings = {
  dots: true,
  infinite: false,
  centerMode: false,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
};

export default function VirtualDetailDemo({ module }) {
  const {
    display,
    isLoading,
    mainModule,
    setMainModule,
    setCheckChange,
    setIsLoading,
    kitchen,
    setKitchen,
    modelClicked,
    setModelClicked,
    sceneMeshes,
    checkSwap,
    setCheckSwap,
  } = useContext(VirtualContextDemo);

  const dispatch = useDispatch();

  const [material, setMaterial] = useState();
  const [texture, setTexture] = useState();
  const [price, setPrice] = useState(0);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  const [showMoreTexture, setShowMoreTexture] = useState(false);

  const { moduleVirtualDetail } = useSelector(
    (state) => state.moduleVirtualDetail
  );
  const { listModuleVirtualSimilar } = useSelector(
    (state) => state.listModuleVirtualSimilar
  );
  const { listTextureVirtual } = useSelector(
    (state) => state.listTextureVirtual
  );

  const { listModuleVirtual } = useSelector((state) => state.listModuleVirtual);

  const handleChangeMain = async (md) => {
    setCheckChange(true);

    setMainModule({
      module: {
        _id: md._id,
        glbUrl: md.glbUrl,
        name: md.name,
        imgUrl: md.imgsUrl[0],
        size: md.size,
      },
      material: {
        _id: md.materialDefault._id,
        name: md.materialDefault.name,
      },
      texture: {
        _id: md.textureDefault._id,
        name: md.textureDefault.name,
      },
      price: md.price,
    });
  };

  const handleChangeOption = (texture) => {
    const mainObject =
      kitchen[module.userData.index].gltf.getObjectByName("MAIN");

    handleChangeTextureVirtual(mainObject, texture.imgUrl, 1, 0.8);
  };

  const handleSwapModule = async (md) => {
    display.scene.remove(kitchen[module.userData.index]?.gltf);
    display.scene.remove(kitchen[module.userData.index]?.box);

    setCheckChange(false);
    setCheckSwap(true);
    setMainModule({
      module: {
        _id: md._id,
        glbUrl: md.glbUrl,
        name: md.name,
        imgUrl: md.imgsUrl[0],
        size: md.size,
      },
      material: {
        _id: md.materialDefault._id,
        name: md.materialDefault.name,
      },
      texture: {
        _id: md.textureDefault._id,
        name: md.textureDefault.name,
      },
      price: md.price,
    });
  };

  useEffect(() => {
    dispatch(getModuleVirtualDetailAction(module?.userData?._id));
    dispatch(getListModuleVirtualSimilarAction(module?.userData?._id));

    dispatch(
      getListTextureVirtualAction(
        kitchen[module?.userData?.index]?.material?._id
      )
    );
  }, [module]);

  useEffect(() => {
    setPrice(moduleVirtualDetail.price);
  }, [moduleVirtualDetail]);

  return (
    <div className="module-detail">
      <section className="col-12">
        {/* <Slider {...settings}>
          {listTexture?.map((project) => {
            return (
              <div
                key={project.id}
                className="projectContainer__item"
                style={{
                  "--dotImg": `url(${project.imgUrl})`,

                }}
              >
                <img
                  src={project.imgUrl}
                  alt={project.name}
                  className="w-100"
                />

                <p className="projectContainer__item__name">{project.name}</p>
              </div>
            );
          })}
        </Slider> */}

        {/* <Swiper
          style={{
            "--swiper-navigation-color": "#fff",
            "--swiper-pagination-color": "#fff",
          }}
          spaceBetween={10}
          navigation={true}
          modules={[FreeMode, Navigation, Thumbs]}
          className="mySwiper2"
        >
          <SwiperSlide>
            <img src="https://swiperjs.com/demos/images/nature-1.jpg" />
          </SwiperSlide>
          <SwiperSlide>
            <img src="https://swiperjs.com/demos/images/nature-2.jpg" />
          </SwiperSlide>
          <SwiperSlide>
            <img src="https://swiperjs.com/demos/images/nature-3.jpg" />
          </SwiperSlide>
          <SwiperSlide>
            <img src="https://swiperjs.com/demos/images/nature-4.jpg" />
          </SwiperSlide>
         </Swiper> */}

        {/* <Swiper
          spaceBetween={10}
          slidesPerView={4}
          freeMode={true}
          watchSlidesProgress={true}
          modules={[FreeMode, Navigation, Thumbs]}
          onSwiper={setThumbsSwiper}
          className="mySwiper"
        >
          <SwiperSlide>
            <img src="https://swiperjs.com/demos/images/nature-1.jpg" />
          </SwiperSlide>
          <SwiperSlide>
            <img src="https://swiperjs.com/demos/images/nature-2.jpg" />
          </SwiperSlide>
          <SwiperSlide>
            <img src="https://swiperjs.com/demos/images/nature-3.jpg" />
          </SwiperSlide>
          <SwiperSlide>
            <img src="https://swiperjs.com/demos/images/nature-4.jpg" />
          </SwiperSlide>
        </Swiper> */}
      </section>

      <section>
        <div className="d-flex flex-row justify-content-between align-items-center">
          <div className="d-flex flex-row justify-content-between align-items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              onClick={() => setModelClicked(null)}
              style={{ cursor: "pointer" }}
            >
              <path
                d="M7.825 13L13.425 18.6L12 20L4 12L12 4L13.425 5.4L7.825 11H20V13H7.825Z"
                fill="#565E64"
              />
            </svg>
            <span className="virtualOption__title ms-3">Product Detail</span>
          </div>

          {/* <i className="expand fas fa-angle-double-left"></i> */}
        </div>

        <div className="breadcrumb-container">
          <Breadcrumb
            className="my-2"
            separator=">"
            items={[
              {
                title: "All product",
              },
              {
                title: "Living room",
              },
              {
                title: "Sofa",
              },
              {
                title: "Detail",
              },
            ]}
          />
        </div>
      </section>

      <div className="line"></div>

      {showMoreTexture ? (
        <section className="module-detail__body d-flex flex-column">
          <MoreTexture
            module={module}
            setShowMoreTexture={setShowMoreTexture}
          />
        </section>
      ) : (
        <section className="module-detail__body d-flex flex-column">
          <div className="col-12 d-flex flex-row">
            <div className="col-6 pe-3">
              <img
                className="detail-icon"
                src={`${process.env.REACT_APP_URL}uploads/virtuals/images/icons/${moduleVirtualDetail.imgsUrl}`}
                alt="icon"
              />
            </div>

            <div className="col-6 h-100 d-flex flex-column justify-content-between">
              <div>
                <p className="detail-name">{moduleVirtualDetail?.name}</p>
                <p className="detail-material">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path
                      d="M7.99996 9.3335L0.666626 5.3335L7.99996 1.3335L15.3333 5.3335L7.99996 9.3335ZM7.99996 12.0002L1.04996 8.21683L2.44996 7.45016L7.99996 10.4835L13.55 7.45016L14.95 8.21683L7.99996 12.0002ZM7.99996 14.6668L1.04996 10.8835L2.44996 10.1168L7.99996 13.1502L13.55 10.1168L14.95 10.8835L7.99996 14.6668ZM7.99996 7.81683L12.55 5.3335L7.99996 2.85016L3.44996 5.3335L7.99996 7.81683Z"
                      fill="#565E64"
                    />
                  </svg>
                  {moduleVirtualDetail?.materialDefault?.name}
                </p>
                <p className="detail-texture">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path
                      d="M2.93333 14.0001C2.72222 13.9557 2.525 13.8418 2.34167 13.6585C2.15833 13.4751 2.04444 13.2779 2 13.0668L13.0667 2.00012C13.3 2.05568 13.5 2.16957 13.6667 2.34179C13.8333 2.51401 13.95 2.71123 14.0167 2.93346L2.93333 14.0001ZM2 9.80012V7.93346L7.93333 2.00012H9.8L2 9.80012ZM2 4.66679V3.33346C2 2.96679 2.13056 2.6529 2.39167 2.39179C2.65278 2.13068 2.96667 2.00012 3.33333 2.00012H4.66667L2 4.66679ZM11.3333 14.0001L14 11.3335V12.6668C14 13.0335 13.8694 13.3473 13.6083 13.6085C13.3472 13.8696 13.0333 14.0001 12.6667 14.0001H11.3333ZM6.2 14.0001L14 6.20012V8.06679L8.06667 14.0001H6.2Z"
                      fill="#565E64"
                    />
                  </svg>
                  {moduleVirtualDetail?.textureDefault?.name}
                </p>
                <p className="detail-size">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path
                      d="M2.66671 12.0001C2.30004 12.0001 1.98615 11.8696 1.72504 11.6085C1.46393 11.3473 1.33337 11.0335 1.33337 10.6668V5.33346C1.33337 4.96679 1.46393 4.6529 1.72504 4.39179C1.98615 4.13068 2.30004 4.00012 2.66671 4.00012H13.3334C13.7 4.00012 14.0139 4.13068 14.275 4.39179C14.5362 4.6529 14.6667 4.96679 14.6667 5.33346V10.6668C14.6667 11.0335 14.5362 11.3473 14.275 11.6085C14.0139 11.8696 13.7 12.0001 13.3334 12.0001H2.66671ZM2.66671 10.6668H13.3334V5.33346H11.3334V8.00012H10V5.33346H8.66671V8.00012H7.33337V5.33346H6.00004V8.00012H4.66671V5.33346H2.66671V10.6668Z"
                      fill="#565E64"
                    />
                  </svg>
                  {moduleVirtualDetail?.size?.width} x{" "}
                  {moduleVirtualDetail?.size?.height} x{" "}
                  {moduleVirtualDetail?.size?.depth} mm
                </p>

                <div className="detail-rating">
                  {Array(4)
                    .fill()
                    .map((item, index) => {
                      return (
                        <svg
                          key={index}
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                        >
                          <path
                            d="M3.88337 14L4.96671 9.31671L1.33337 6.16671L6.13337 5.75004L8.00004 1.33337L9.86671 5.75004L14.6667 6.16671L11.0334 9.31671L12.1167 14L8.00004 11.5167L3.88337 14Z"
                            fill="#FFDB62"
                          />
                        </svg>
                      );
                    })}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path
                      d="M8.00004 4.75004V9.95004L10.1 11.2334L9.55004 8.83337L11.4 7.23337L8.96671 7.01671L8.00004 4.75004ZM3.88337 14L4.96671 9.31671L1.33337 6.16671L6.13337 5.75004L8.00004 1.33337L9.86671 5.75004L14.6667 6.16671L11.0334 9.31671L12.1167 14L8.00004 11.5167L3.88337 14Z"
                      fill="#FFDB62"
                    />
                  </svg>

                  <span className="rating-number">4.2</span>
                  <span className="rating-more">42 Rating</span>
                </div>

                <p className="detail-desc">
                  {moduleVirtualDetail?.description}
                </p>
              </div>
              <p className="detail-price">
                {kitchen[module?.userData?.index]?.price?.toLocaleString()}
                <span className="detail-price__sign">đ</span>
              </p>
            </div>
          </div>

          <p className="section-heading mt-3">Material</p>
          <div className="col-12 d-flex flex-wrap" style={{ gap: "6px" }}>
            {moduleVirtualDetail?.materials?.map((mItem, index) => {
              const checked =
                kitchen[module?.userData?.index]?.material?._id ===
                mItem.material._id;

              return (
                <div
                  key={mItem._id}
                  className={checked ? "material-item active" : "material-item"}
                >
                  <input
                    disabled={isLoading}
                    name="module-material"
                    type="radio"
                    value={mItem.imgUrl}
                    checked={checked}
                    onChange={() => {
                      dispatch(getListTextureVirtualAction(mItem.material._id));

                      let newKitchen = [...kitchen];

                      newKitchen[module?.userData?.index].material = {
                        _id: mItem.material._id,
                        name: mItem.material.name,
                      };
                      newKitchen[module?.userData?.index].price =
                        mItem.priceValue;

                      setKitchen(newKitchen);
                    }}
                  />

                  <p className="material-item__name">{mItem.material.name}</p>
                </div>
              );
            })}
          </div>

          <p className="section-heading mt-3">
            Texture
            <span className="texture-name">
              {kitchen[module?.userData?.index]?.texture?.name}
            </span>
          </p>
          <div className="col-12 d-flex flex-wrap" style={{ gap: "6px" }}>
            {listTextureVirtual?.slice(0, 18)?.map((tItem) => {
              const checked =
                kitchen[module?.userData?.index]?.texture?._id === tItem._id;

              return (
                <div
                  key={tItem._id}
                  className={checked ? "texture-item active" : "texture-item"}
                >
                  <div
                    style={{
                      "--url": `url(${process.env.REACT_APP_URL}uploads/virtuals/images/icons/${tItem.iconUrl})`,
                    }}
                  >
                    <input
                      disabled={isLoading}
                      name="module-texture"
                      type="radio"
                      value={tItem.imgUrl}
                      checked={checked}
                      onChange={() => {
                        // setTexture(tItem._id);
                        handleChangeOption(tItem);

                        let newKitchen = [...kitchen];

                        newKitchen[module?.userData?.index].texture = {
                          _id: tItem._id,
                          name: tItem.name,
                          iconUrl: tItem.iconUrl,
                          imgUrl: tItem.imgUrl,
                        };

                        setKitchen(newKitchen);
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <button
            className="btn-moreTexture"
            onClick={() => {
              setShowMoreTexture(true);
            }}
          >
            More texture
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
            >
              <path
                d="M9.45 9.00012L6 5.55012L7.05 4.50012L11.55 9.00012L7.05 13.5001L6 12.4501L9.45 9.00012Z"
                fill="#FFC914"
              />
            </svg>
          </button>

          {/* <div className="line my-2"></div> */}
          <hr />

          <p className="section-heading">Similar Product</p>
          <div className="module-option col-12">
            {listModuleVirtualSimilar?.map((item, index) => (
              <div
                key={index}
                id={index}
                className="col-12 col-md-6 col-lg-4 px-1 pb-3"
              >
                <div className="module-card h-100">
                  <div
                    className="module-item"
                    disabled={isLoading}
                    onClick={async () => {
                      handleSwapModule(item);
                      setIsLoading(false);
                    }}
                  >
                    <div className="module-item__overlay">
                      {/* <i className="far fa-plus"></i> */}

                      <i className="far fa-repeat-alt" title="Swap"></i>
                    </div>

                    <img
                      src={`${process.env.REACT_APP_URL}uploads/virtuals/images/icons/${item.imgsUrl[0]}`}
                      alt={`${item.name}`}
                      className="w-100"
                    />
                  </div>

                  <div className="info">
                    <span className="info__name">{item.name}</span>

                    <div style={{ height: "fit-content" }}>
                      <span className="info__size">
                        {item?.size?.width}x{item?.size?.height}x
                        {item?.size?.depth} mm
                      </span>

                      <Tooltip
                        placement="topLeft"
                        title={item?.description}
                        arrow={true}
                      >
                        <span className="info__desc">{item?.description}</span>
                      </Tooltip>

                      <span className="info__price">
                        {item?.price?.toLocaleString()}

                        <span className="info__price__sign">đ</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
