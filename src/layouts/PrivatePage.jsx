import Cookies from "js-cookie";
import LoginPage from "../pages/Login/LoginPage";
import MainLayout from "./MainLayout";

export default function PrivatePage({ children }) {
  const token = Cookies.get("token");

  if (token && token !== null) {
    return children;
  } else {
    return (
      <MainLayout>
        <LoginPage />
      </MainLayout>
    );
  }
}
