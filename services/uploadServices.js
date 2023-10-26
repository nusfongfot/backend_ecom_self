const cloudinary = require("../utils/cloudinary");

exports.upload = async (path, publicId) => {
  const option = {
    use_filename: true,
    unique_filename: false,
    overwrite: true,
    folder: "Products",
  };
  if (publicId) {
    // "" == false
    option.public_id = publicId;
  }
  const res = await cloudinary.uploader.upload(path, option);
  return res.secure_url;
};

exports.getPublicId = (secureUrl) => {
  const splitUrl = secureUrl.split("/"); // ["https:","","res.cloudinary.com",...,"cr4mxeqx5zb8rlakpfkg.jpg"]
  const publicId = splitUrl[splitUrl.length - 1].split(".")[0]; // ["cr4mxeqx5zb8rlakpfkg","jpg"]
  return publicId;
};

exports.uploads = (file, folderOnCloud) => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await cloudinary.uploader.upload(file, {
        resource_type: "auto",
        folder: folderOnCloud,
      });

      if (result && !result.error) {
        resolve({
          url: result.secure_url,
          id: result.public_id,
        });
      } else {
        reject(new Error("An error occurred during upload."));
      }
    } catch (error) {
      reject(error);
    }
  });
};
