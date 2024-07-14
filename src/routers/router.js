
import CustomDesign from "../pages/CustomDesign/CustomDesign";
import HomePage from "../pages/Home/HomePage";
import LoginPage from "../pages/Login/LoginPage";
import Profile from "../pages/Profile/Profile";
import SelectBg from "../pages/SelectBg/SelectBg";
import SizeInfo from "../pages/SizeInfo/SizeInfo";
import VirtualDesign from "../pages/VirtualDesign/VirtualDesign";

const routers = [
  {
    path: "/",
    element: <HomePage />,
    private: false,
    isChild: true,
  },
  {
    path: "/size-info",
    element: <SizeInfo />,
    private: true,
    isChild: true,
  },
  {
    path: "/custom-design",
    element: <CustomDesign />,
    private: true,
    isChild: false,
  },
  {
    path: "/login",
    element: <LoginPage />,
    private: false,
    isChild: true,
  },
  {
    path: "/profile",
    element: <Profile />,
    private: true,
    isChild: true,
  },
  {
    path: "/select-bg",
    element: <SelectBg />,
    private: true,
    isChild: true,
  },
  {
    path: "/virtual",
    element: <VirtualDesign />,
    private: true,
    isChild: false,
  },
  //   {
  //     path: "/*",
  //     element: <PageNotFound />,
  //     private: false,
  //   },
];

export default routers;
