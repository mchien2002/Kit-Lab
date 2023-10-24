import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import { BrowserRouter, Route, Router, Routes } from "react-router-dom";
import "./App.scss";
import MainLayout from "./layouts/MainLayout";
import routers from "./routers/router";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <div>
      <Toaster position="top-right" reverseOrder={false} />

      <BrowserRouter>
        <Routes>
          {routers.map((route, index) => (
            <Route
              key={index}
              path={route.path}
              element={
                route.private === true || route.path === "/custom-design" ? (
                  route.element
                ) : (
                  <MainLayout>{route.element}</MainLayout>
                )
              }
            />
          ))}
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
