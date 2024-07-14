import React from "react";
import "./DimensionGuide.scss";
import { Button, Modal } from "antd";

export default function DimensionGuide({ showPopupGuide, setShowPopupGuide ,imgSrc }) {
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
          src={`https://d3uqk2lgpw4rim.cloudfront.net/uploads/images/icons/${imgSrc}`}
          alt="Dimension Guide"
          className="w-100
          "
        />
      </Modal>
    </div>
  );
}
