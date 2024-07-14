import { useContext } from "react";
import {
  calculatePriceUnit,
  handleHide,
  handleShow,
  roundNumber,
} from "../../utils/function";
import { KitchenContext } from "../Design/Design";
import "./KitchenItem.scss";
import { useState } from "react";

export default function KitchenItem({ data }) {
  const context = useContext(KitchenContext);

  const [showPopup, setShowPopup] = useState(false);
  let totalPriceStep = 0;

  return (
    <div key={data.stepId} className="kitchen-item d-flex flex-column h-100">
      <div className="additional-text-container d-flex justify-content-between align-items-center">
        <p className="col-3">Sản phẩm</p>
        <p className="col-2 ps-1">Thông tin</p>
        <p className="col-1 pr-2">Đơn vị</p>
        <p className="col-1">Khối lượng</p>
        <p className="col-1 ps-5">Đơn giá</p>
        <p className="col-1 ps-5 ">Thành tiền</p>
        <p className="col-2 ps-5">Tổng</p>
      </div>

      <div className="kitchen-table">
        <div className="kitchen-table__content">
          {data.lstModule
            .filter(
              (item) =>
                item.mainModule !== null && item.mainModule?.module !== null
            )
            .map((item) => {
              let totalPriceItem = 0;

              if (item.mainModule.price) {
                totalPriceItem += item.mainModule.price;
                totalPriceStep += item.mainModule.price;
              }

              return (
                <div
                  key={item._id}
                  className="kitchen-item__details d-flex flex-row align-items-center justify-content-between"
                >
                  <div className="d-flex flex-column col">
                    <div className="module-container d-flex flex-row col-12 mb-1 ">
                      <div className="col-4">
                        <img
                          className="details__image "
                          alt="Main"
                          src={`${process.env.REACT_APP_URL}uploads/images/icons/${item.mainModule?.module?.imgUrl}`}
                        />

                        <div className="details__module ">
                          <p className="details__module__name">
                            {item.mainModule?.type} /{" "}
                            {item.mainModule?.module?.name}
                          </p>
                        </div>
                      </div>
                      <div className="details__module__horizontal-text col">
                        <span className="col-2">
                          {item.mainModule?.material?._id
                            ? item.mainModule?.material?.name
                            : "Chưa chọn vật liệu"}
                          {item.mainModule?.texture?._id && (
                            <p className="details__module__texture">
                              {/^#[0-9A-F]{6}$/i.test(
                                item.mainModule?.texture?.iconUrl
                              ) ? (
                                <div
                                  className="color-box"
                                  style={{
                                    backgroundColor:
                                      item.mainModule?.texture?.iconUrl,
                                    width: "15px",
                                    height: "15px",
                                    display: "inline-block",
                                    marginRight: "5px",
                                    borderRadius: "50%",
                                  }}
                                ></div>
                              ) : (
                                <img
                                  className="texture-icon"
                                  src={`${process.env.REACT_APP_URL}uploads/images/icons/${item.mainModule?.texture?.iconUrl}`}
                                  alt={item.mainModule?.texture?.name}
                                />
                              )}
                              {item.mainModule?.texture?.name}
                            </p>
                          )}
                        </span>
                        <span className="col-1">
                          {item.mainModule?.module?.infoMeasure}
                        </span>
                        <span className="col-1">
                          {item?.mainModule?.unitPrice
                            ? (
                                item.mainModule?.price /
                                calculatePriceUnit(
                                  item?.mainModule?.unitPrice?.priceUser,
                                  item.mainModule.measure.w,
                                  item.mainModule.measure.h,
                                  item.mainModule.measure.d,
                                  item.mainModule?.unitPrice?.priceValue
                                )
                              )?.toFixed(3)
                            : "null"}
                        </span>
                        <span className="col-1">
                          {item.mainModule?.unitPrice ? (
                            <span>
                              {calculatePriceUnit(
                                item?.mainModule?.unitPrice?.priceUser,
                                item.mainModule.measure.w,
                                item.mainModule.measure.h,
                                item.mainModule.measure.d,
                                item.mainModule?.unitPrice?.priceValue
                              )?.toLocaleString("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              })}
                            </span>
                          ) : (
                            <span>null</span>
                          )}
                        </span>

                        <span className="col-1">
                          {item.mainModule?.module.name ===
                          "BT-MODULE2-13-BEP" ? (
                            <span>Liên hệ sale</span>
                          ) : item.mainModule?.price ? (
                            <span>
                              {item.mainModule?.price?.toLocaleString("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              })}
                            </span>
                          ) : (
                            <span>null</span>
                          )}
                        </span>
                      </div>
                    </div>

                    {item.lstSubModule.length > 0 &&
                      item.lstSubModule
                        .filter(
                          (sub) => sub !== null
                          // (sub) => sub !== null && sub.measure !== undefined
                        )
                        .map((sub, index) => {
                          if (sub.price) {
                            totalPriceItem += sub.price;
                            totalPriceStep += sub.price;
                          }

                          return (
                            <div
                              key={index}
                              className="module-container d-flex flex-row col mb-1"
                            >
                              <div className="  ps-5 col-4">
                                <img
                                  className="details__image"
                                  alt="Sub"
                                  src={`${process.env.REACT_APP_URL}uploads/images/icons/${sub.module?.imgUrl}`}
                                />

                                <div className="details__module">
                                  <p className="details__module__name">
                                    {sub?.type} / {sub?.module?.name}
                                  </p>
                                </div>
                              </div>
                              <div className="col-8">
                                <div className="details__module__horizontal-text col">
                                  <span className="col-2">
                                    {sub.material !== null
                                      ? sub.material?.name
                                      : sub.price === null
                                      ? "Chưa chọn vật liệu"
                                      : ""}
                                    {sub?.texture?._id && (
                                      <p className="details__module__texture">
                                        {/^#[0-9A-F]{6}$/i.test(
                                          sub?.texture?.iconUrl
                                        ) ? (
                                          <div
                                            className="color-box"
                                            style={{
                                              backgroundColor:
                                                sub?.texture?.iconUrl,
                                              width: "15px",
                                              height: "15px",
                                              display: "inline-block",
                                              marginRight: "5px",
                                              borderRadius: "50%",
                                            }}
                                          ></div>
                                        ) : (
                                          <img
                                            className="texture-icon"
                                            src={`${process.env.REACT_APP_URL}uploads/images/icons/${sub?.texture?.iconUrl}`}
                                            alt={sub?.texture?.name}
                                          />
                                        )}
                                        {sub?.texture?.name}
                                      </p>
                                    )}
                                  </span>

                                  <span className="col-1">
                                    {sub?.module?.infoMeasure}
                                  </span>
                                  <span className="col-1">
                                    <span className="col-1">
                                      {sub.price !== null &&
                                      (sub.material === null ||
                                        sub.material === undefined)
                                        ? sub.module.type === 7
                                          ? sub.listTayNam.length
                                          : "1"
                                        : sub?.unitPrice
                                        ? (
                                            sub?.price /
                                            calculatePriceUnit(
                                              sub?.unitPrice?.priceUser,
                                              sub.measure.w,
                                              sub.measure.h,
                                              sub.measure.d,
                                              sub?.unitPrice?.priceValue
                                            )
                                          )?.toFixed(3) || "0"
                                        : "null"}
                                    </span>
                                  </span>

                                  <span className="col-1">
                                    {sub?.unitPrice?.priceValue
                                      ? sub?.unitPrice?.priceValue?.toLocaleString(
                                          "vi-VN",
                                          {
                                            style: "currency",
                                            currency: "VND",
                                          }
                                        )
                                      : sub.price !== null &&
                                        (sub.material === null ||
                                          sub.material === undefined)
                                      ? sub.module.type === 7
                                        ? (
                                            sub.price / sub.listTayNam.length
                                          ).toLocaleString("vi-VN", {
                                            style: "currency",
                                            currency: "VND",
                                          })
                                        : sub?.price?.toLocaleString("vi-VN", {
                                            style: "currency",
                                            currency: "VND",
                                          })
                                      : null}
                                  </span>

                                  <span className="col-1">
                                    {sub?.price
                                      ? sub?.price?.toLocaleString("vi-VN", {
                                          style: "currency",
                                          currency: "VND",
                                        })
                                      : "0"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                  </div>

                  <p className="module-price col-2 ps-5">
                    {Math.floor(totalPriceItem).toLocaleString("vi-VN")}Đ
                  </p>
                </div>
              );
            })}
        </div>

        <div className="kitchen-item__totalprice d-flex flex-row justify-content-between align-items-center">
          <p className="kitchen-item__totalprice__label">Thành tiền:</p>
          <p className="kitchen-item__totalprice__number">
            {totalPriceStep.toLocaleString("vi-VN")}Đ
          </p>
        </div>
      </div>
    </div>
  );
}
