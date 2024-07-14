import axios from "axios";
import { logOut } from "../pages/Home/HomePage";

export default async function callApi(endpoint, method = "GET", data, headers) {
  try {
    return await axios({
      method: method,
      url: `${process.env.REACT_APP_API_URL}${endpoint}`,
      // url: `http://192.168.1.55:3000/api/v2/${endpoint}`,
      // url: `https://api.lanha.vn/api/v2/${endpoint}`,
      data: data,
      headers: headers,
    });
  } catch (error) {

    if (error.response) {
      if (error.response.status === 401) {
        logOut();
      }

      return error.response.data;
    } else if (error.request) {
    }
  }
}
