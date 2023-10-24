import React, { useEffect, useState } from "react";
import "./HomePage.scss";
import Cookie from "js-cookie";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const [isLogin, setIsLogin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookie.get("token");

    if (token) {
      setIsLogin(true);
    } else {
      setIsLogin(false);
    }
  }, [Cookie.get("token")]);

  return (
    <div className="homepage col-12 px-4 text-center my-auto">
      <h2>
        Xin chào, hãy chọn nội thất bạn <br /> muốn thiết kế
      </h2>

      <div className="option-container col-12 d-flex flex-wrap mt-5">
        <div
          className="col-3 d-flex flex-column px-3"
          onClick={() => navigate("/size-info")}
        >
          <img
            src="./assets/images/option/tu-bep.png"
            alt="tu-bep"
            className="w-100"
          />
          <p className="option-name">Tủ bếp</p>
        </div>

        <div className="col-3 d-flex flex-column px-3">
          <img
            src="./assets/images/option/tu-ao.png"
            alt="tu-ao"
            className="w-100"
          />
          <p className="option-name">Tủ áo</p>
        </div>

        <div className="col-3 d-flex flex-column px-3">
          <img
            src="./assets/images/option/p-khach.png"
            alt="p-khach"
            className="w-100"
          />
          <p className="option-name">Phòng khách</p>
        </div>

        <div className="col-3 d-flex flex-column px-3">
          <img
            src="./assets/images/option/p-ngu.png"
            alt="p-ngu"
            className="w-100"
          />
          <p className="option-name">Phòng ngủ</p>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
