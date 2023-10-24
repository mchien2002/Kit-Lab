import CustomDesign from "../pages/CustomDesign/CustomDesign";
import HomePage from "../pages/Home/HomePage";
import LoginPage from "../pages/Login/LoginPage";
import SizeInfo from "../pages/SizeInfo/SizeInfo";

const routers = [
  {
    path: "/",
    element: <HomePage />,
    private: false,
  },
  {
    path: "/size-info",
    element: <SizeInfo />,
    private: false,
  },
  {
    path: "/custom-design",
    element: <CustomDesign />,
    private: false,
  },
  {
    path: "/login",
    element: <LoginPage />,
    private: false,
  },
  //   {
  //     path: "/*",
  //     element: <PageNotFound />,
  //     private: false,
  //   },
];

export default routers;
