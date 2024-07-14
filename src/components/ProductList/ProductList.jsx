import React, { useContext, useEffect, useState } from "react";
import "./ProductList.scss";

export default function ProductList({ data, setShowProductList }) {
  return (
    <div className="product-list">
      <div className="product-list__header col-12 d-flex flex-row justify-content-between">
        <p>Product List</p>

        <i
          className="far fa-times"
          onClick={() => {
            setShowProductList(false);
          }}
        ></i>
      </div>

      <div className="product-list__main">
        {data?.map(
          (item) =>
            item?.module &&
            item?.module !== null && (
              <div className="product-card" key={item.uuid}>
                <img
                  src={`${process.env.REACT_APP_URL}uploads/virtuals/images/icons/${item.module.imgUrl}`}
                  alt={item.module.name}
                  className="product-card__image"
                />

                <div className="product-card__info">
                  <p className="name">{item?.module?.name}</p>
                  <p className="size">
                    <span className="grey">Size: </span>
                    {item?.module?.size?.width} x {item?.module?.size?.height} x{" "}
                    {item?.module?.size?.depth} mm
                  </p>
                  <p className="size">
                    <span className="grey">Material: </span>
                    {item?.material?.name}
                  </p>
                  <p className="size">
                    <span className="grey">Texture: </span>
                    {item?.texture?.name}
                  </p>
                  <p className="price">
                    {item?.price?.toLocaleString()}{" "}
                    <span className="grey"> đ</span>
                  </p>
                </div>
              </div>
            )
        )}
      </div>
    </div>
  );
}
