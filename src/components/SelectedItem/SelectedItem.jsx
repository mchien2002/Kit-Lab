import { useContext, useEffect, useRef, useState } from "react";
import { animateScroll as scroll } from "react-scroll";
import { KitchenContext } from "../Design/Design";
import TabSelected from "../TabSelected/TabSelected";
import "./SelectedItem.scss";

export default function SelectedItem() {
  const context = useContext(KitchenContext);
  const [totalPrice, setTotalPrice] = useState(0);

  const selectedRef = useRef(null);

  const calculateTotalPrice = (lstModule) => {
    return lstModule.reduce((totalPrice, item) => {
      if (item.stepTotalPrice) {
        return totalPrice + item.stepTotalPrice;
      }

      return totalPrice;
    }, 0);
  };

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
  // }, [context.modelClicked, context.mainSelected, context.currentStep]);

  useEffect(() => {
    setTotalPrice(calculateTotalPrice(context.kitchen));
  }, [context.kitchen]);

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
        {context.kitchen?.map((item, index) => {
          return (
            <div key={index}>
              {index < context.executingStep ? (
                <div id={`item${index}`}>
                  <TabSelected data={item} step={index} done={true} />
                </div>
              ) : index === context.executingStep ? (
                <div id={`item${index}`}>
                  <TabSelected data={item} step={index} eStep={index} />
                </div>
              ) : index === context.executingStep + 1 ? (
                <div id={`item${index}`}>
                  <TabSelected
                    data={item}
                    step={index}
                    showNextStep={context.showNextStep}
                  />
                </div>
              ) : index > context.executingStep + 1 ? (
                <TabSelected data={item} step={index} />
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="selectedItem__footer d-flex flex-row align-items-end justify-content-between">
        <div>
          <i className="fas fa-tag"></i>
          <span>Đơn giá</span>
        </div>

        <p className="selectedItem__footer__total">
          {totalPrice.toLocaleString("vi-VN")}Đ
        </p>
      </div>
    </div>
  );
}
