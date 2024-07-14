import Cookies from "js-cookie";
import React, { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../App";
import Loading from "../../components/Loading/Loading";
import callApi from "../../utils/callApi";
import "./LoginPage.scss";

export default function LoginPage() {
  const appContext = useContext(AppContext);
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState();
  const [showpass, setShowpass] = useState(false);
  const [showError, setShowError] = useState(false);

  const currentPathname = window.location.pathname;

  const login = async (data) => {
    try {
      setIsLoading(true);
      const res = await callApi(`customer/login`, "POST", data);

      if (res.data) {
        appContext.setIsLogin(true);

        Cookies.set("token", res.data.data.token);
        Cookies.set("owner", res.data.data._id);

        if (currentPathname === "/login") {
          navigate("/");
        }
      } else {
        setShowError(true);
      }
    } catch (err) {
      console.log(err);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    login(data);
  };

  const handleClick = () => {
    handleSubmit(onSubmit)((data) => {
      if (!data.name) {
        setError("name", {
          type: "manual",
          message: "This field is required",
        });
        return;
      }

      onSubmit(data);
    });
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleClick();
    }
  };

  const handleChangeShowPass = () => {
    setShowpass(!showpass);
  };

  return (
    <div className="loginPage">
      {isLoading ? <Loading /> : null}

      <form
        onSubmit={handleSubmit(onSubmit)}
        onKeyDown={handleKeyDown}
        className="formLogin"
      >
        <h1>Đăng nhập</h1>
        <div className="group">
          <label>Tên đăng nhập</label>
          <input
            autoFocus
            type="text"
            placeholder="Tên đăng nhập"
            {...register("username", { required: true })}
          />
          {errors.username && (
            <p className="error">Tên đăng nhập không được để trống</p>
          )}
        </div>

        <div className="group">
          <label>Mật khẩu</label>
          <div className="group__password">
            <input
              type={showpass ? "text" : "password"}
              placeholder="Mật khẩu"
              {...register("password", { required: true })}
            />

            {showpass ? (
              <i
                className="fas fa-eye-slash"
                onClick={() => handleChangeShowPass()}
              ></i>
            ) : (
              <i
                className="fas fa-eye"
                onClick={() => handleChangeShowPass()}
              ></i>
            )}
          </div>

          {errors.password && (
            <p className="error">Mật khẩu không được để trống</p>
          )}

          <p className="forgot-pass">Quên mật khẩu?</p>
        </div>

        {showError && (
          <p className="error-login">
            <strong>Email</strong> hoặc <strong>mật khẩu</strong> của bạn không
            đúng
          </p>
        )}

        <button className="btn-login mt-5" type="button" onClick={handleClick}>
          Đăng nhập
        </button>
      </form>
    </div>
  );
}
