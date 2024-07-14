import Cookies from "js-cookie";
import React, { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../App";
import "./Profile.scss";

export default function Profile() {
  const imagesRow1 = [
    "./assets/images/test1.png",
    "./assets/images/test2.png",
    "./assets/images/test3.png",
    "./assets/images/test4.png",
  ];

  const imagesRow2 = [
    "./assets/images/Rectangle1.png",
  ];

  const imagesRow3 = [
    "./assets/images/test5.png",
    "./assets/images/test6.png",
    "./assets/images/test7.png",
  ];

  return (
    <div className="profile">
      <div className="row">
        <div className="col-md-3 position-relative">
          <img src="./assets/images/back_profile.png" alt="Description" className="background" />
          <img src="./assets/images/Avatar.png" alt="Overlay" className="overlay-image" />
          <div className="text-below-overlay">
            <p>Charlesdeluvio</p>
            <p>Charlesdeluvio@gmail.com</p>
          </div>
        </div>

        <div className="col-md-9 my-profile">
          <div className="row mt-2">
          <p className="my-profile-title">Thiết kế của tôi</p>
            {imagesRow1.map((imagePath, index) => (
              <div key={index} className="col-md-3 mt-2">
                <img src={imagePath} alt={`Image ${index}`} className="img-my-design" />
                <p className="">Dự án nháp</p>
              </div>
            ))}
          </div>

          <div className="row">
          <div className="col-md-3 mt-3">
            <div className="image-container">
              <img src="./assets/images/Rectangle1.png" alt="Overlay" className="img-my-design" />
              <div className="icon-overlay">
                <img src="./assets/images/iconAdd.svg" alt="Add icon" className="add-icon" />
                <div className="text-add-design">Thêm dự án</div>
              </div>
            </div>
          </div>
        </div>

              
          <div className="row">
          <p className="my-profile-title mt-4">Các mẫu đã lưu</p>
            {imagesRow3.map((imagePath, index) => (
              <div key={index} className="col-md-3">
                <img src={imagePath} alt={`Image ${index}`} className="img-my-design" />
                <p className="">Dự án nháp</p>
              </div>
            ))}
            <div className="col-md-3">
            <div className="image-container">
              <img src="./assets/images/Rectangle1.png" alt="Overlay" className="img-my-design" />
              <div className="icon-overlay">
                <img src="./assets/images/iconAdd.svg" alt="Add icon" className="add-icon" />
                <div className="text-add-design">Tham khảo thêm</div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
