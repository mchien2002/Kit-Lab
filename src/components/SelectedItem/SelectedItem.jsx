import { useContext, useEffect, useRef, useState } from "react";
import { animateScroll as scroll } from "react-scroll";
// import { KitchenContext } from "../Virtual/Virtual";
import { KitchenContext } from "../Design/Design";
import TabSelected from "../TabSelected/TabSelected";
import "./SelectedItem.scss";
import { calculateTotalPrice, roundNumber } from "../../utils/function";

export default function SelectedItem() {
  const context = useContext(KitchenContext);
  const [totalPrice, setTotalPrice] = useState(0);

  const selectedRef = useRef(null);

  useEffect(() => {
    // if (context.modelClicked || context.mainSelected) {
    // const selectedItem = selectedRef.current.querySelector(
    //   `#item${context.currentStep}`
    // );
    // if (selectedItem) {
    //   const scrollOffset = context.currentStep * 40;
    //   scroll.scrollTo(scrollOffset, {
    //     containerId: "selectedContainer",
    //     duration: 500,
    //     // smooth: "easeInOutQuart",
    //     behavior: "smooth",
    //   });
    // }
    // }

    const selectedItem = document.getElementById(`item${context.currentStep}`);
    if (selectedItem) {
      selectedItem.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [context.currentStep]);

  useEffect(() => {
    setTotalPrice(calculateTotalPrice(context.kitchen));
  }, [
    context.kitchen,
    //context.isLoading,
    context.refreshTotal,
    //context.mainModule,
    //context.subModule,
    // context.mainSelected,
  ]);

  return (
    <div className="selectedItem">
      <div className="selectedItem__header d-flex flex-row align-items-end">
        <i className="far fa-shopping-bag pe-2 pb-1"></i>
        <p>Đã chọn</p>
      </div>

      <div
        id="selectedContainer"
        ref={selectedRef}
        className="selectedItem__main"
      >
       

        {context?.kitchen?.map((item, index) => {
          return (
            <div key={index} id={`item${index}`}>
              <TabSelected
                data={context?.kitchen[index]}
                step={index}
                showNextStep={item.showBtnPlus}
              />
            </div>
          );
        })}
      </div>

      <div className="selectedItem__footer d-flex flex-row align-items-end justify-content-between">
        <div>
          <i className="fas fa-tag"></i>
          <span>Tổng giá</span>
        </div>

        {totalPrice ? (
          <p className="selectedItem__footer__total">
            {roundNumber(totalPrice)?.toLocaleString("vi-VN")}Đ
          </p>
        ) : (
          <p className="selectedItem__footer__total">0Đ</p>
        )}
      </div>
    </div>
  );
}
