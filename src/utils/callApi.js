import axios from "axios";

export default async function callApi(endpoint, method = "GET", data, headers) {
  try {
    // console.log(process.env.API_URL);
    return await axios({
      method: method,
      url: `https://api.lanha.vn/api/v1/${endpoint}`,
      // url: `https://1a23-113-173-231-37.ngrok-free.app/api/v1/${endpoint}`,
      data: data,
      headers: headers,
    });
  } catch (error) {
    if (error.response) {
      return error.response.data;
    } else if (error.request) {
    } else {
    }
  }
}
