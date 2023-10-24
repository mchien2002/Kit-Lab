import uploadFile from "../../utils/uploadfile";

export const uploadFileAction = (file, token, folder='') => {
  const get = async () => {
    const data = {};
    data.return = "JSON";
    data[data.name || "fileupload"] = file;
    const formData = new FormData();
    for (const key in data) {
      formData.append(key, data[key]);
    }
    try {
      const res = await uploadFile(
        `api/uploadfile?json=1${folder && `&folder=${folder}`}&access_token=${token}`,
        formData
      );
      return res.fileUrl;
    } catch (error) {
      console.log(error);
    }
  };
  return get;
};
