import React from "react";
import "./DimensionGuide.scss";
import { Button, Modal } from "antd";

export default function DimensionGuide({ showPopupGuide, setShowPopupGuide }) {
  const close = () => {
    setShowPopupGuide(false);
  };

  return (
    <div>
      <Modal
        title="Hướng dẫn kích thước"
        open={showPopupGuide}
        onOk={close}
        onCancel={close}
        centered={true}
        footer={null}
      >
        <img
          src="https://www.whirlpool.com/is/image/content/dam/business-unit/whirlpoolv2/en-us/marketing-content/site-assets/page-content/oc-articles/guide-to-refrigerator-sizes-dimensions/guide-to-refrigerator-sizes-dimensions_Width2.jpg?fmt=png-alpha&qlt=85,0&resMode=sharp2&op_usm=1.75,0.3,2,0&scl=1&constrain=fit,1"
          alt="Dimension Guide"
          className="w-100
          "
        />
      </Modal>
    </div>
  );
}
