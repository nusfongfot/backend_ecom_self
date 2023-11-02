const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../utils/cloudinary");

const fileFilter = (req, file, cb) => {
  if (file.mimetype == "image/jpeg" || file.mimetype == "image/png") {
    cb(null, true);
  } else {
    cb({ message: "Unsupported File Format" }, false);
  }
};

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "public/images");
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Math.round(Math.random() * 1e9);
//     cb(
//       null,
//       file.fieldname + "-" + uniqueSuffix + "." + file.mimetype.split("/")[1]
//     );
//   },
// });

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "Products", // Specify the folder in Cloudinary
  },
});

const upload = multer({
  storage: storage,
  limits: { fieldSize: 1024 * 1024 },
  fileFilter: fileFilter,
});

module.exports = upload;
