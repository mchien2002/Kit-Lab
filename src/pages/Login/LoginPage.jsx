import React, { useState } from "react";
import "./LoginPage.scss";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { getTokenUserAction } from "../../store/actions/user.actions";
import callApi from "../../utils/callApi";
import Cookie from "js-cookie";
import { useNavigate } from "react-router-dom";
import Loading from "../../components/Loading/Loading";

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState();
  const [showpass, setShowpass] = useState(false);

  const login = async (data) => {
    try {
      setIsLoading(true);
      const res = await callApi(`customer/login`, "POST", data);

      if (res.data) {
        console.log(">>>> " + JSON.stringify(res.data));
        Cookie.set("token", res.data.data.token);

        navigate("/");
      } else {
        alert("Đăng nhập không thành công");
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
    console.log(data);
    login(data);
    // dispatch(getTokenUserAction(data.username, data.password));
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

  const handleKeyPress = (event) => {
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

      <form onSubmit={handleSubmit(onSubmit)} className="formLogin">
        <h1>Đăng nhập</h1>
        <div className="group">
          <label>Email</label>
          <input
            autoFocus
            onKeyPress={handleKeyPress}
            type="text"
            placeholder="Email"
            {...register("username", { required: true })}
          />
          {errors.username && (
            <p className="error">Email không được để trống</p>
          )}
        </div>

        <div className="group">
          <label>Mật khẩu</label>
          <div className="group__password">
            <input
              onKeyPress={handleKeyPress}
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

        <button className="btn-login mt-5" type="button" onClick={handleClick}>
          Đăng nhập
        </button>
      </form>
    </div>
  );
}
