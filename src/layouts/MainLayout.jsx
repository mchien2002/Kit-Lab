import { Dropdown, Space, message } from "antd";
import Cookies from "js-cookie";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../App";
import "./MainLayout.scss";

export default function MainLayout(props) {
  const appContext = useContext(AppContext);
  const navigate = useNavigate();
  const tokenUser = Cookies.get("token");

  const items = [
    // {
    //   label: "Trang cá nhân",
    //   key: "1",
    // },
    {
      label: "Đăng xuất",
      key: "1",
    },
  ];

  const onClick = ({ key }) => {
    // if (key === "1") {
    //   //message.info("Trang cá nhân");
    //   // navigate("/profile");
    // } else
    if (key === "1") {
      appContext.setIsLogin(false);
      Cookies.remove("token");
      navigate("/");
    }
  };

  return (
    <div className="mainLayout">
      <div className="mainLayout__header col-12 d-flex flex-row justify-content-between align-items-center">
        <img
          className="mainLayout__header__logo"
          src="./assets/logo/logo.png"
          alt=""
          onClick={() => navigate("/")}
        />

        {tokenUser ? (
          <Dropdown
            menu={{
              items,
              onClick,
            }}
          >
            <a onClick={(e) => e.preventDefault()}>
              <Space>
                <i className="far fa-user"></i>

                <i className="fas fa-angle-down"></i>
              </Space>
            </a>
          </Dropdown>
        ) : (
          <button
            className="btn-login"
            type="button"
            onClick={() => navigate("/login")}
          >
            Đăng nhập
          </button>
        )}
      </div>

      <div className="mainLayout__children">{props.children}</div>

      {/* <div className="mainLayout__footer col-12 d-flex flex-row justify-content-center align-items-center bg-dark text-light">
        <a href="mailto:lanhainfo@gmail.com">
          <i className="fal fa-envelope"></i>
        </a>

        <a href="https://www.facebook.com/noithat.lanha" target="_blank">
          <i className="fab fa-facebook-f px-3"></i>
        </a>

        <a href="https://www.lanha.vn/" target="_blank">
          <i className="fal fa-globe"></i>
        </a>
      </div> */}
    </div>
  );
}
