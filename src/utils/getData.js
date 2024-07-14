import Cookies from "js-cookie";
import callApi from "./callApi";

export const getModuleDetail = async (id, trademarkId) => {
  if (id) {
    const token = Cookies.get("token");

    const headers = {
      authorization: `Bearer ${token}`,
    };

    try {
      let res;
      if (trademarkId === undefined) {
        res = await callApi(`module/${id}`, "GET", null, headers);
      } else {
        res = await callApi(
          `module/${id}?trademark_id=${trademarkId}`,
          "GET",
          null,
          headers
        );
      }

      if (res.status === 200) {
        return res.data.data;
      } else {
        console.error(`Error: ${res.status} - ${res.statusText}`);
      }
    } catch (err) {
      console.error(err);
    }
  }
};

export const getPriceDetail = async (materialId, typeModuleId, trademarkId) => {
  const token = Cookies.get("token");

  const headers = {
    authorization: `Bearer ${token}`,
  };

  try {
    const res = await callApi(
      `price-type/item?material_id=${materialId}&type_module_id=${typeModuleId}&trademark_id=${trademarkId}`,
      "GET",
      null,
      headers
    );

    if (res.status === 200) {
      console.log(res.data.data);
      return res.data.data;
    } else {
      console.error(`Error: ${res.status} - ${res.statusText}`);
    }
  } catch (err) {
    console.error(err);
  }
};

export const getTabDetail = async (groupId, mainId, trademarkId) => {
  const token = Cookies.get("token");

  const headers = {
    authorization: `Bearer ${token}`,
  };

  try {
    const res = await callApi(
      `type-modules/product_config?group_id=${groupId}&main_id=${mainId}&trademark_id=${trademarkId}`,
      "GET",
      null,
      headers
    );

    if (res.status === 200) {
      console.log(res.data.data);
      return res.data.data;
    } else {
      console.error(`Error: ${res.status} - ${res.statusText}`);
    }
  } catch (err) {
    console.error(err);
  }
};

export const getListMaterial = async (id, trademarkId) => {
  if (id) {
    const token = Cookies.get("token");

    const headers = {
      authorization: `Bearer ${token}`,
    };

    try {
      const res = await callApi(
        `material-textures?type_module_id=${id}&trademark_id=${trademarkId}`,
        "GET",
        null,
        headers
      );

      if (res.status === 200) {
        return res.data.data;
      } else {
        console.error(`Error: ${res.status} - ${res.statusText}`);
      }
    } catch (err) {
      console.error(err);
    }
  }
};

export const getSubModuleDetail = async (id, trademarkId) => {
  if (id) {
    const token = Cookies.get("token");

    const headers = {
      authorization: `Bearer ${token}`,
    };

    try {
      const res = await callApi(
        `submodule/${id}?trademarkId=${trademarkId}`,
        "GET",
        null,
        headers
      );

      if (res.status === 200) {
        return res.data.data;
      } else {
        console.error(`Error: ${res.status} - ${res.statusText}`);
      }
    } catch (err) {
      console.error(err);
    }
  }
};

export const getListWifeModule = async (id) => {
  if (id) {
    const token = Cookies.get("token");

    const headers = {
      authorization: `Bearer ${token}`,
    };

    try {
      const res = await callApi(`module/${id}`, "GET", null, headers);

      if (res.data) {
        return res.data.data.listWifeModule;
      } else {
        console.error(`Error: ${res.status} - ${res.statusText}`);
      }
    } catch (err) {
      console.error(err);
    }
  }
};

export const getListTexture = async (materialId, trademarkId) => {
  if (materialId && trademarkId) {
    const token = Cookies.get("token");

    const headers = {
      authorization: `Bearer ${token}`,
    };

    try {
      const res = await callApi(
        `material/${materialId}?trademarkId=${trademarkId}`,
        "GET",
        null,
        headers
      );

      if (res.status === 200) {
        if (res.data.data.customColor !== true) {
          return res.data.data.listTexture;
        } else {
          return undefined;
        }
      } else {
        console.error(`Error: ${res.status} - ${res.statusText}`);
      }
    } catch (err) {
      console.error(err);
    }
  }
};

export const getDesignUnit = async (data, typeProduct) => {
  let listSize = data?.listSize || null;
  // if (listSize === null) {
  //   if (typeProduct === "655439b81e40bc6231eb1042") {
  //     listSize = [
  //       { typeSize: "STWL", value: data.STWL },
  //       { typeSize: "STWR", value: data.STWR },
  //       { typeSize: "STD", value: data.STD },
  //       { typeSize: "STD", value: data.STD },
  //       { typeSize: "SUWL", value: data.SUWL },
  //       { typeSize: "SUWR", value: data.SUWR },
  //       { typeSize: "SUD", value: data.SUD },
  //       { typeSize: "STH", value: data.STH },
  //     ];
  //   } else {
  //     listSize = [
  //       { typeSize: "STWL", value: data.STWL },
  //       { typeSize: "STWR", value: data.STWR },
  //       { typeSize: "STD", value: data.STD },
  //       { typeSize: "STH", value: data.STH },
  //       { typeSize: "SUWL", value: data.SUWL },
  //       { typeSize: "SUWR", value: data.SUWR },
  //       { typeSize: "SUD", value: data.SUD },
  //       { typeSize: "STH", value: data.STH },
  //     ];
  //   }
  // }

  const token = Cookies.get("token");

  const headers = {
    authorization: `Bearer ${token}`,
  };

  const res = await callApi(
    `product/registry?product_id=${typeProduct}`,
    "GET",
    {
      listSize: listSize,
      typeProduct,
    },
    headers
  );

  // const jsonData = JSON.stringify({
  //   listSize: listSize,
  //   typeProduct,
  // });

  console.log(res);

  const jsonData = JSON.stringify(res.data.data);

  localStorage.setItem("productInfo", jsonData);

  return res;
};

export const getDesignUnitChange = async (data, typeProduct) => {
  let listSize;
  if (typeProduct === 7) {
    listSize = [
      { typeSize: "STWL", value: data.trenTrai },
      { typeSize: "STWR", value: data.duoiPhai },
      { typeSize: "STD", value: data.trenSau },
      { typeSize: "STH", value: data.trenCao },
      { typeSize: "SUWL", value: data.duoiTrai },
      { typeSize: "SUWR", value: data.duoiPhai },
      { typeSize: "SUD", value: data.duoiSau },
      { typeSize: "STH", value: data.duoiCao },
    ];
  } else {
    listSize = [
      { typeSize: "STWL", value: data.trenTrai },
      { typeSize: "STWR", value: data.trenPhai },
      { typeSize: "STD", value: data.trenSau },
      { typeSize: "STH", value: data.trenCao },
      { typeSize: "SUWL", value: data.duoiTrai },
      { typeSize: "SUWR", value: data.duoiPhai },
      { typeSize: "SUD", value: data.duoiSau },
      { typeSize: "STH", value: data.duoiCao },
    ];
  }

  const token = Cookies.get("token");

  const headers = {
    authorization: `Bearer ${token}`,
  };

  const res = await callApi(
    `product/registry?product_id=${typeProduct}`,
    "GET",
    {
      listSize: listSize,
      typeProduct,
    },
    headers
  );

  const jsonData = JSON.stringify(res.data.data);
  localStorage.setItem("checkChange", true);

  return res;
};
