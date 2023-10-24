import Cookie from "js-cookie";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MainLayout.scss";

export default function MainLayout(props) {
  const navigate = useNavigate();
  const tokenUser = Cookie.get("token");

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
          <i
            className="far fa-user"
            onClick={() => {
              Cookie.remove("token");
              navigate("/");
            }}
          ></i>
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

      <div className="mainLayout__footer col-12 d-flex flex-row justify-content-center align-items-center bg-dark text-light">
        <i className="fal fa-envelope"></i>

        <i className="fab fa-facebook-f px-3"></i>

        <i className="fal fa-globe"></i>
      </div>
    </div>
  );
}
