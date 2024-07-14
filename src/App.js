import "bootstrap/dist/css/bootstrap.min.css";
import Cookies from "js-cookie";
import React, { createContext, useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.scss";
import MainLayout from "./layouts/MainLayout";
import PrivatePage from "./layouts/PrivatePage";
import routers from "./routers/router";

export const AppContext = createContext();

function App() {
  const [isLogin, setIsLogin] = useState(false);
  const [projectDetail, setProjectDetail] = useState([]);
  const [productInfo, setProductInfo] = useState(null);
  const [canInside, setCanInside] = useState(false);

  const token = Cookies.get("token");
  useEffect(() => {
    if (token) {
      setIsLogin(true);
    } else {
      setIsLogin(false);
    }
  }, [token]);

  const value = {
    productInfo,
    setProductInfo,
    projectDetail,
    setProjectDetail,
    canInside,
    setCanInside,
    isLogin,
    setIsLogin,
  };

  if (process.env.NODE_ENV === "production") {
    console.log = () => {};
    console.error = () => {};
    console.debug = () => {};
  }

  return (
    <AppContext.Provider value={value}>
      <Toaster position="top-right" reverseOrder={false} />

      <BrowserRouter>
        <Routes>
          {routers.map((route, index) => (
            <Route
              key={index}
              path={route.path}
              element={
                route.private === true ? (
                  route.isChild ? (
                    <PrivatePage>
                      <MainLayout>{route.element}</MainLayout>
                    </PrivatePage>
                  ) : (
                    <PrivatePage>{route.element}</PrivatePage>
                  )
                ) : (
                  <MainLayout>{route.element}</MainLayout>
                )
              }
            />
          ))}
        </Routes>
      </BrowserRouter>
    </AppContext.Provider>
  );
}

export default App;
