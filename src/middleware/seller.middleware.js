const { asscesstoken, refreshtoken } = require('../config/');
const jwt = require('jsonwebtoken');
const { User } = require('../models/');
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { cloud_name, cloud_key, cloud_secret } = require('../config/');
const ApiError = require('../config/apierror');
const objectID = require('mongodb').ObjectId;

const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.fieldname + path.extname(file.originalname));
  },
});
const uploads = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == 'image/png' ||
      file.mimetype == 'image/jpg' ||
      file.mimetype == 'image/jpeg'
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
  },
}).array('avatar', 5);

exports.uploadImage = (req, res, next) => {
  uploads(req, res, (error) => {
    if (!error) {
      if (req.files === undefined) {
        next();
      } else {
        const array = [];
        for (i of req.files) {
          if (!array.includes(i.originalname)) {
            array.push(i.originalname);
          } else {
            return next(new ApiError(400, 'same file are not allow'));
          }
        }
        next();
      }
    } else {
      return next(new ApiError(400, error.message));
    }
  });
};

exports.uploadImage1 = (req, res, next) => {
  uploads(req, res, (error) => {
    if (!error) {
      if (req.files === undefined || req.files.length === 0) {
        req.files = [];
        next();
      } else {
        if (req.files.length == 1) {
          next();
        } else {
          return next(new ApiError(400, 'Only single file is allow'));
        }
      }
    } else {
      return next(new ApiError(400, error.message));
    }
  });
};

exports.checkFilter = (req, res) => {
  const { filter } = req.query;
  const array = [
    'title',
    'categoryId',
    'brandId',
    'price',
    'images',
    'description',
  ];
  const newfilter = filterfunc(filter);
  if (!newfilter) {
    return { createBy: req.userid };
  } else {
    const arr2 = Object.keys(JSON.parse(filter));
    const newFilter = Object.assign(
      { createBy: req.userid },
      JSON.parse(filter),
    );
    const found = array.some((r) => arr2.includes(r));
    if (!found) {
      return false;
    } else {
      return newFilter;
    }
  }
};
function filterfunc(temp) {
  try {
    JSON.parse(temp);
  } catch (error) {
    return false;
  }
  return true;
}

exports.uploadfileInCloud = async (req, folder = 'image-directory') => {
  cloudinary.config({
    cloud_name: cloud_name,
    api_key: cloud_key,
    api_secret: cloud_secret,
    secure: true,
  });
  const fileName = req.files[0].path;
  const result = await cloudinary.uploader.upload(
    fileName,
    {
      folder: folder,
      use_filename: true,
    },
    (result, error) => {},
  );
  return result;
};

exports.uploadfile = async (req, folder = 'newFolder', next) => {
  if (req.files) {
    const imageArray = req.files;
    cloudinary.config({
      cloud_name: cloud_name,
      api_key: cloud_key,
      api_secret: cloud_secret,
      secure: true,
    });
    let imgarray = [];
    for (x of imageArray) {
      const fileName = x.destination + '/' + x.filename;
      await cloudinary.uploader.upload(
        fileName,
        {
          folder,
          use_filename: true,
        },
        function (error, result) {
          imgarray.push({
            image_url: result.url,
            cloud_public_id: result.public_id,
          });
        },
      );
    }
    req.imgarray = imgarray;
    next();
  } else {
    next();
  }
};

exports.deleteImageFromCloud = async (cloud_id) => {
  cloudinary.config({
    cloud_name: cloud_name,
    api_key: cloud_key,
    api_secret: cloud_secret,
    secure: true,
  });
  await cloudinary.uploader.destroy(cloud_id, function (error, result) {
    // console.log(error,result );
  });
};

exports.uploadFileToCloud = async (req, folder = 'newFolder') => {
  if (req.files) {
    const imageArray = req.files;
    cloudinary.config({
      cloud_name: cloud_name,
      api_key: cloud_key,
      api_secret: cloud_secret,
      secure: true,
    });
    let imgarray = [];
    for (x of imageArray) {
      const fileName = x.destination + '/' + x.filename;
      await cloudinary.uploader.upload(
        fileName,
        {
          folder,
          use_filename: true,
        },
        function (error, result) {
          imgarray.push({
            image_url: result.url,
            cloud_public_id: result.public_id,
          });
        },
      );
    }
    return (req.imgarray = imgarray);
  } else {
    return undefined;
  }
};

exports.checkIdFormat = async (req, res, next) => {
  if (objectID.isValid(req.params.id) === false) {
    return next(new ApiError(400, 'id must be correct format'));
  }
  next();
};

(exports.accessTokenVarify = (req, res, next) => {
  const chickToken = (req) => {
    if (req.query.token) {
      return req.query.token;
    } else if (req.headers.authorization) {
      const authHeader = req.headers.authorization;
      const bearerToken = authHeader?.split(' ');
      return bearerToken[1];
    } else {
      return false;
    }
  };
  const token = chickToken(req);
  if (token === false) {
    const checkRoute = this.checkPublicRole(req);
    if (!checkRoute) {
      return next(new ApiError(400, 'A token is required for authentication'));
    } else {
      next();
    }
  } else {
    jwt.verify(token, asscesstoken, async (error, payload) => {
      if (error) {
        return next(new ApiError(400, 'invalid token'));
      } else {
        const userid = payload.aud;
        const result = await User.findOne({ _id: userid });
        if (!result) {
          return next(new ApiError(400, 'no user found this token'));
        }
        req.user = result;
        req.userid = payload.aud;
        req.uid = result.role;
        next();
      }
    });
  }
}),
exports.checkRole =
  (...roles) =>
  (req, res, next) => {
    const role = req.user.role;
    if (!roles.includes(role)) {
      return next(new ApiError(400, `you are not authorized ${role} to access this api`));
    }
    return next();
  };
const publicUrl = [
  {
    baseUrl: '/v1/product',
    method: 'GET',
  },
];
exports.checkPublicRole = (req) => {
  req.user = { role: 'public' };
  return publicUrl.find((element) => {
    return element.baseUrl === req.baseUrl && element.method === req.method;
  });
};
// return next(new ApiError(400,'admin already exist'))
// return responseHandler(200,"login successfully",res,accesstoken)
