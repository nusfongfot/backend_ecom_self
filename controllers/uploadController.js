const UploadServices = require("../services/uploadServices");
const fs = require("fs");

exports.uploadSingleImage = async (req, res, next) => {
  try {
    let secureUrl;
    if (req.file) {
      secureUrl = await UploadServices.upload(req.file.path);
    }
    res.status(200).json({
      res_code: "0000",
      secureUrl,
      message: "Images uploaded successfully",
    });
  } catch (error) {
    next(error);
    console.log(error);
  } finally {
    //remove file from device
    // if (req.file) {
    //   fs.unlinkSync(req.file.path);
    // }
  }
};

exports.uploadMultipleImages = async (req, res, next) => {
  const uploader = async (path) =>
    await UploadServices.uploads(path, "Products");
  const urls = [];
  const files = req.files;

  try {
    for (const file of files) {
      const { path } = file;
      const newPath = await uploader(path);
      urls.push(newPath);
    }

    return res.status(200).json({
      res_code: "0000",
      message: "Images uploaded successfully",
      data: urls,
    });
  } catch (error) {
    next(error);
    console.error("Error: ", error);
  } finally {
    // if (req.files) {
    //   for (const file of req.files) {
    //     if (file.path) {
    //       fs.unlinkSync(file.path);
    //     }
    //   }
    // }
  }
};
