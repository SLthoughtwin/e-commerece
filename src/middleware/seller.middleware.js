const Joi = require('joi');
const { asscesstoken, refreshtoken } = require('../config/');
const jwt = require('jsonwebtoken');
const { User } = require('../models/');
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { cloud_name, cloud_key, cloud_secret } = require('../config/');
const { includes, filter, split } = require('lodash');
const { array, valid, required } = require('joi');
// const res = require('express/lib/response');

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
            return res.status(404).json({
              message: 'same file are not allow',
            });
          }
        }
        next();
      }
    } else {
      return res.status(400).json({ statusCode: 400, message: error.message });
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
          return res.status(404).json({
            message: 'Only single file is allow',
          });
        }
      }
    } else {
      return res.status(400).json({
        statusCode: 400,
        message: error.message,
      });
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

exports.uploadfile = async (req, folder="newFolder", next) => {
  if (req.files) {
    const imageArray = req.files;
    cloudinary.config({
      cloud_name: cloud_name,
      api_key: cloud_key,
      api_secret: cloud_secret,
      secure: true,
    });
    let imgarray = [] ;
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

(exports.signUpSellerValidation = (req, res, next) => {
  const validateUser = (user) => {
    const JoiSchema = Joi.object({
      fullName: Joi.string().min(3).max(30).required().trim(),
      email: Joi.string().email().required().trim(),
      phone: Joi.number().min(10).required(),
      password: Joi.string().min(6).max(30).required().trim(),
    }).or('fullName', 'email', 'phone');
    return JoiSchema.validate(user);
  };

  const response = validateUser(req.body);
  if (response.error) {
    res.status(400).json({
      statusCode: 400,
      message: response.error.details[0].message,
    });
  } else {
    next();
  }
}),
  (exports.loginsellerValidation = (req, res, next) => {
    const loginUser = (user) => {
      const JoiSchema = Joi.object({
        phone: Joi.string().trim(),
        email: Joi.string().email().min(5).max(50).trim(),
        password: Joi.string().trim(),
      }).or('phone', 'email');
      return JoiSchema.validate(user);
    };
    const response = loginUser(req.body);
    if (response.error) {
      res.status(400).json({
        statusCode: 400,
        message: response.error.details[0].message,
      });
    } else {
      next();
    }
  });

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
  const checkRoute =  this.checkPublicRole(req)
  if(!checkRoute){
    return res.status(400).json({
      statusCode: 400,
      message: 'A token is required for authentication',
    });
  }else{
    next()
  }
    // return res.status(400).json({
    //   statusCode: 400,
    //   message: 'A token is required for authentication',
    // });
  } else {
    // const authHeader = req.headers.authorization;
    // const bearerToken = authHeader.split(' ');
    // const token = bearerToken[1];
    jwt.verify(token, asscesstoken, async (error, payload) => {
      if (error) {
        res.status(400).json({
          statusCode: 400,
          message: 'invalid token',
        });
      } else {
        const userid = payload.aud;
        const result = await User.findOne({ _id: userid });
        if(!result){
          return res.status(400).json({
            statusCode: 400,
            message : "no user found this token"
          })
        }
        req.user =result
        req.userid = payload.aud;
        req.uid = result.role;
        next();
      }
    });
  }
}),
  (exports.adderssValidation = (req, res, next) => {
    const validateUser = (user) => {
      const JoiSchema = Joi.object({
        phone: Joi.number().min(10).required(),
        country: Joi.string().required(),
        state: Joi.string().required(),
        city: Joi.string().required(),
        street: Joi.string().required(),
        pincode: Joi.number().min(6).required(),
        landmark: Joi.string().required(),
        houseNo: Joi.string().required(),
        addressType: Joi.string().required(),
      }).or('phone');
      return JoiSchema.validate(user);
    };

    const response = validateUser(req.body);
    if (response.error) {
      res.status(400).json({
        statusCode: 400,
        message: response.error.details[0].message,
      });
    } else {
      next();
    }
  }),
  (exports.profileValidation = (req, res, next) => {
    const validateUser = (user) => {
      const JoiSchema = Joi.object({
        sellerId: Joi.string().required().trim(),
        GST: Joi.string()
          .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
          .trim(),
        docProve: Joi.string().required().trim(),
      }).or('sellerId');
      return JoiSchema.validate(user);
    };

    const response = validateUser(req.body);
    if (response.error) {
      res.status(400).json({
        statusCode: 400,
        message: response.error.details[0].message,
      });
    } else {
      next();
    }
  });

exports.checkRole =
  (...roles) =>
  (req, res, next) => {
    const role = req.user.role;
    if (!roles.includes(role)) {
      return res.status(404).json({
        statusCode: 400,
        message: `you are not authorised ${role} to access this api`,
      });
    }
    return next();
  };

(exports.productValidation = (req, res, next) => {
  const payment = req.body.paymentType?.split(',');
  req.body.paymentType = payment;
  const validateUser = (user) => {
    const JoiSchema = Joi.object({
      title: Joi.string().min(3).max(30).required().trim(),
      price: Joi.number().required(),
      categoryId: Joi.string().required().trim(),
      brandId: Joi.string().required().trim(),
      paymentType: Joi.array().items(
        Joi.string().valid('COD').valid('NB').valid('UPI'),
      ),
      description: Joi.string().max(200).trim(),
      avatar: Joi.string(),
      rateing: Joi.string(),
    }).or('categoryId', 'brandId');
    return JoiSchema.validate(user);
  };

  const response = validateUser(req.body);
  if (response.error) {
    res.status(400).json({
      statusCode: 400,
      message: response.error.details[0].message,
    });
  } else {
    next();
  }
}),
  (exports.productUpdateValidation = (req, res, next) => {
    const payment = req.body.paymentType.split(',');
    req.body.paymentType = payment;
    const validateUser = (user) => {
      const JoiSchema = Joi.object({
        title: Joi.string().min(3).max(30),
        price: Joi.number(),
        categoryId: Joi.string(),
        brandId: Joi.string(),
        description: Joi.string().max(200),
        paymentType: Joi.array().items(
          Joi.string().valid('COD').valid('NB').valid('UPI'),
        ),
        rateing: Joi.string(),
      });
      return JoiSchema.validate(user);
    };

    const response = validateUser(req.body);
    if (response.error) {
      res.status(400).json({
        statusCode: 400,
        message: response.error.details[0].message,
      });
    } else {
      next();
    }
  });

exports.addCartValidation = (req, res, next) => {
  const validateUser = (user) => {
    const JoiSchema = Joi.object({
      products: Joi.array().items(
        Joi.object({
          productId: Joi.string().hex().length(24),
          quantity: Joi.number().strict(),
        }),
      ),
    }).or('products');
    return JoiSchema.validate(user);
  };

  const response = validateUser(req.body);
  if (response.error) {
    res.status(400).json({
      statusCode: 400,
      message: response.error.details[0].message,
    });
  } else {
    next();
  }
};

exports.incrementCartValidation = (req, res, next) => {
  const validateUser = (user) => {
    const JoiSchema = Joi.object({
      value:Joi.string().required().valid('increment',"decrement"),
    });
    return JoiSchema.validate(user);
  };
  const response = validateUser(req.query);
  if (response.error) {
    res.status(400).json({
      statusCode: 400,
      message: response.error.details[0].message,
    });
  } else {
    next();
  }
};

const publicUrl = [{
  baseUrl:'/v1/product',
  method:'GET'}]
  exports.checkPublicRole = (req)=>{
    req.user = {role:"public"}
   return publicUrl.find((element)=> {
    return element.baseUrl === req.baseUrl && element.method === req.method
  })
  }


  exports.reviewValidation = (req, res, next) => {
        req.body.productId = req.params.id
        const JoiSchema = Joi.object({
        productId:Joi.string().hex().length(24).messages({'string.hex':"id must be correct format"}).required(),
        comments:Joi.string().min(6).max(150).required(),
        rating:Joi.number().min(1).max(5).required(),
        avatar: Joi.string()
      });
      const response =  JoiSchema.validate(req.body);
    if (response.error) {
      const msg =  response.error.details[0].message.replace(/[^a-zA-Z0-9]/g," ")
      res.status(400).json({
        statusCode: 400,
        message:msg
      });
    } else {
      next();
    }
  }

  exports.reviewDeleteValidation = (req, res, next) => {
    req.body.reviewId = req.params.id
    const JoiSchema = Joi.object({
    reviewId:Joi.string().hex().length(24).messages({'string.hex':"id must be correct format"}).required(),
  });
  const response =  JoiSchema.validate(req.body);
if (response.error) {
  const msg =  response.error.details[0].message.replace(/[^a-zA-Z0-9]/g," ")
  res.status(400).json({
    statusCode: 400,
    message:msg
  });
} else {
  next();
}
}


exports.editReviewValidation = (req, res, next) => {
  req.body.reviewId = req.params.id
  const JoiSchema = Joi.object({
  reviewId:Joi.string().hex().length(24).messages({'string.hex':"id must be correct format"}).required(),
  comments:Joi.string().min(6).max(300),
  rating:Joi.number().min(1).max(5),
  avatar: Joi.string()
});
const response =  JoiSchema.validate(req.body);
if (response.error) {
const msg =  response.error.details[0].message.replace(/[^a-zA-Z0-9]/g," ")
res.status(400).json({
  statusCode: 400,
  message:msg
});
} else {
next();
}
}


exports.uploadFileToCloud= async (req,folder="newFolder") => {
  if (req.files) {
    const imageArray = req.files;
    cloudinary.config({
      cloud_name: cloud_name,
      api_key: cloud_key,
      api_secret: cloud_secret,
      secure: true,
    });
    let imgarray = [] ;
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
   return req.imgarray = imgarray;
  } else {
    return undefined
  }
};

exports.populate = async(...rest)=>{
   
}
