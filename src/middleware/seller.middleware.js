const Joi = require('joi');
const { asscesstoken, refreshtoken } = require('../config/');
const jwt = require('jsonwebtoken');
const { User } = require('../models/');
const multer = require('multer');
const path = require('path')
const cloudinary = require('cloudinary').v2;
const { cloud_name , cloud_key, cloud_secret} = require('../config/');
const { includes, filter } = require('lodash');
const { array } = require('joi');
// const res = require('express/lib/response');


const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.fieldname + path.extname(file.originalname))
  },
})
const uploads = multer({ storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
      cb(null, true);
    } else {
      cb(null, false);
      return cb( new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
  }
}).array("avatar",5)

exports.uploadImage = (req, res, next) => {
  
  uploads(req, res, (error) => {
    if (!error) {
      if(req.files === undefined){
        next()
      }else{
        const array = []
        for(i of req.files){
            if(!array.includes(i.originalname)){
              array.push(i.originalname)
            }
            else{
              return res.status(404).json({
                message: "same file are not allow",
                succes: false
              })
            }
        }
        next()
      }
    }
    else {
     return res.status(400).json({ status: 400, message: error.message, success: false })
    }
  })
}


exports.uploadImage1 = (req, res, next) => {
  
  uploads(req, res, (error) => {
    if (!error) {
      if(req.files.length===0 || req.files === undefined){
        next()
      }else{
        
        if(req.files.length == 1){
           next()
        }else{
          return res.status(404).json({
            message: "Only single file is allow",
            succes: false
          })
        }
      }
    }
    else {
     return res.status(400).json({ status: 400, message: error.message, success: false })
    }
  })
}

exports.checkFilter = (req,res)=>{
  const { filter } = req.query;
  const array = [
    'title',
    'categoryId',
    'brandId',
    'price',
    'images',
    'description',
  ];
  const newfilter = filterfunc(filter)
  if(!newfilter){
    return  { createBy: req.userid }
  }
  else{
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

}
function filterfunc(temp){
 try{
  JSON.parse(temp)
 }catch(error){
   return false
 }
 return true
}

exports.uploadfile = async(req,res,next)=>{
  if(req.files){
    const imageArray = req.files
    cloudinary.config({
      cloud_name: cloud_name,
      api_key: cloud_key,
      api_secret: cloud_secret,
      secure: true
    });
    const imgarray = []
    for(x of imageArray){
    const fileName = x.destination+"/"+x.filename
    await cloudinary.uploader.upload(fileName,{
      folder: 'test-directory',
      use_filename: true
     }, function( error,result) {
      imgarray.push({
        image_url:result.url,
        cloud_public_id:result.public_id
      })
    });
  }
  req.imgarray=imgarray
    next()
  }else{
    next()
  }

}

exports.deleteImageFromCloud = async(cloud_id)=>{
  cloudinary.config({
    cloud_name: cloud_name,
    api_key: cloud_key,
    api_secret: cloud_secret,
    secure: true
  });
  await cloudinary.uploader.destroy(cloud_id, function( error,result) {console.log(result,error)});
}



(exports.signUpSellerValidation = (req, res, next) => {
  const validateUser = (user) => {
    const JoiSchema = Joi.object({
      fullName: Joi.string().min(3).max(30).required().trim(),
      email: Joi.string().email().required().trim(),
      phone: Joi.number().required(),
      password: Joi.string().min(6).max(30).required().trim(),
    }).or('fullName', 'email', 'phone');
    return JoiSchema.validate(user);
  };

  const response = validateUser(req.body);
  if (response.error) {
    res.status(400).json({
      message: response.error.details[0].message,
      status: 400,
      success: false,
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
      }).options({ abortEarly: false });
      return JoiSchema.validate(user);
    };
    const response = loginUser(req.body);
    if (response.error) {
      res.status(400).json({
        message: response.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      next();
    }
  });
  
  (exports.accessTokenVarify = (req, res, next) => {

  //   if(!req.query.token){
  //     return res.status(400).json({
  //       message: 'A token is required for authentication',
  //       status: 400,
  //       success: false
  //    })
  //  }

  const chickToken = (req)=>{
    if(req.query.token){
      return req.query.token
    }else if(req.headers.authorization){
      const authHeader = req.headers.authorization;
      const bearerToken = authHeader.split(' ');
      return bearerToken[1];
    }else{
      return false
    }
  }
  const token = chickToken(req);
  if (token === false) {
    return res.status(400).json({
      message: 'A token is required for authentication',
      status: 400,
      success: false,
    });
  } else {
    // const authHeader = req.headers.authorization;
    // const bearerToken = authHeader.split(' ');
    // const token = bearerToken[1];
    jwt.verify(token, asscesstoken, async (error, payload) => {
      if (error) {
        res.status(400).json({
          message: 'invalid token',
          status: 400,
          success: false,
        });
      } else {
        const userid = payload.aud;
        const result = await User.findOne({_id:userid})
        // console.log(result)
        req.userid = payload.aud;
        req.uid = result.role
        next();
      }
    });
  }
}),
exports.adderssValidation = (req, res, next) => {
    const validateUser = (user) => {
      const JoiSchema = Joi.object({
        fullName: Joi.string().max(30).required().trim(),
        phone: Joi.string().required(),
        country: Joi.string().required().trim(),
        state: Joi.string().required().trim(),
        city: Joi.string().required().trim(),
        street: Joi.string().required().trim(),
        pincode: Joi.number().required().trim(),
        landmark: Joi.string().required().trim(),
        houseNo: Joi.string().required().trim(),
        addressType: Joi.string().required().trim(),
      }).or('fullName', 'phone');
      return JoiSchema.validate(user);
    };

    const response = validateUser(req.body);
    if (response.error) {
      res.status(400).json({
        message: response.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      next();
    }
  },

  exports.profileValidation = (req, res, next) => {
    const validateUser = (user) => {
      const JoiSchema = Joi.object({
        sellerId: Joi.string().required().trim(),
        GST: Joi.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/).trim(),
        docProve: Joi.string().required().trim()
      }).or('sellerId');
      return JoiSchema.validate(user);
    };

    const response = validateUser(req.body);
    if (response.error) {
      res.status(400).json({
        message: response.error.details[0].message,
        status: 400,
        success: false,
      });
    } else {
      next();
    }
  }


exports.checkRole = (...roles) =>
  (req, res, next) => {
  const { uid } = req;
  if (!roles.includes(uid)) {
    return res.status(404).json({
      message: "you are not admin/seller",
      succes: false
    })
  }
  return next();
};

exports.productValidation = (req, res, next) => {
  const validateUser = (user) => {
    const JoiSchema = Joi.object({
      title: Joi.string().min(3).max(30).required().trim(),
      price: Joi.number().required(),
      categoryId: Joi.string().required().trim(),
      brandId: Joi.string().required().trim(),
      description: Joi.string().max(200).trim(),
      avatar:Joi.string(),
      rateing: Joi.string()
    }).or("categoryId", 'brandId');
    return JoiSchema.validate(user);
  };

  const response = validateUser(req.body);
  if (response.error) {
    res.status(400).json({
      message: response.error.details[0].message,
      status: 400,
      success: false,
    });
  } else {
    next();
  }
},


exports.productUpdateValidation = (req, res, next) => {
  const validateUser = (user) => {
    const JoiSchema = Joi.object({
      title: Joi.string().min(3).max(30),
      price: Joi.number(),
      categoryId: Joi.string(),
      brandId: Joi.string(),
      description: Joi.string().max(200),
      rateing: Joi.string()
    });
    return JoiSchema.validate(user);
  };

  const response = validateUser(req.body);
  if (response.error) {
    res.status(400).json({
      message: response.error.details[0].message,
      status: 400,
      success: false,
    });
  } else {
    next();
  }
}
