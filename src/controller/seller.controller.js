const { User ,SellerProfile} = require('./../models/');
const { seller } = require('./../config/');
const { refreshTokenVarify } = require('./../services/');
const cloudinary = require('cloudinary').v2
const { cloud_name , cloud_key, cloud_secret} = require('../config/')
const {
  mailfunction,
  bcryptPasswordMatch,
  createOtp,
  accessToken,
  refreshToken,
  sendMsg,
  sendMsgBymail,
  verifyEmail,
  createToken
} = require('../services/');
const {html}= require('../template/template');
const { updateUser } = require('.');
const { result } = require('lodash');
// const { SellerProfile, User } = require('../models/');

exports.signUPSeller = async (req, res) => {
  try {
    const verifyMail = verifyEmail(req);
    if (verifyMail === true) {
      const user = await User.findOne({
        email: req.body.email,
        phone: req.body.phone,
      });
      if (!user) {
        req.body.role = seller;
        const email = req.body.email;
        const result = await User.create(req.body);
        const link = `http://localhost:8080/auth/seller/${result.resetToken}`;
        // const link = await createToken(result.email);
        await mailfunction(email,html(link))
          .then((response) => {
            res.status(201).json({
              success: true,
              message: 'check your mail to verified :)',
            });
            console.log('check your mail to verified');
          })
          .catch((err) => {
            console.log(err)
            res.status(400).json({
              success: false,
              message: 'mail not send :)',
            });
          });
      } else {
        res.status(400).json({
          message: 'email/phone already exist',
          success: false,
        });
      }
    } else {
      res.status(400).json({
        message:
          'invalid gmail formate please try this formate souarbh@gmail.com/yopmail.com',
        success: false,
      });
    }
  } catch (error) {
    res.status(400).json({
      message: 'email/phone already exist......',
      success: false,
    });
  }
};
// const link = `http://localhost:8080/seller/${result.resetToken}`;
// module.exports = {link};

exports.sellerLogin = async (req, res) => {
  try {
    const returnUser = async (req) => {
      if (req.body.phone) {
        const user = await User.findOne({ phone: req.body.phone });
        return user;
      } else {
        const user = await User.findOne({ email: req.body.email });
        return user;
      }
    };
    const user = await returnUser(req);
    if (user != null) {
      if (req.body.email) {
        const result = await User.findOne({ email: req.body.email });
        if (!result) {
          res.status(400).json({
            message: 'invalid email',
          });
        } else if (result.role === 'seller') {
          if (result.isVerified === true) {
            if (result.isApproved === true) {
              const db_pass = result.password;
              const user_pass = req.body.password;
              const match = await bcryptPasswordMatch(user_pass, db_pass);
              if (match === true) {
                const userId = result.id;
                const accesstoken = await accessToken(userId);
                const refreshtoken = await refreshToken(userId);
                return res.status(200).json({
                  success: true,
                  accToken: accesstoken,
                  refreshtoken: refreshtoken,
                  message: 'login successfully',
                });
              } else {
                res.status(400).json({
                  success: false,
                  message: 'invalid login details',
                });
              }
            } else {
              res.status(400).json({
                success: false,
                message: 'you are not approved by admin',
              });
            }
          } else {
            res.status(400).json({
              success: false,
              message: 'you are not verified by ',
            });
          }
        } else {
          res.status(400).json({
            success: false,
            message: 'role must be seller',
          });
        }
      } else if (req.body.phone) {
        const result = await User.findOne({ phone: req.body.phone });
        if (result.otp === null) {
          const Otp = await createOtp(req, res);
          const setOtp = await User.findOneAndUpdate(
            { phone: req.body.phone },
            { otp: Otp },
          );
          res.status(200).json({
            success: true,
            message: 'otp send to your number',
          });
        } else {
          if (!result) {
            res.status(400).json({
              message: 'invalid number ',
            });
          } else if (result.role === 'seller') {
            if (result.isVerified === true) {
              if (result.isApproved === true) {
                if (result.otp == 'true') {
                  const db_pass = result.password;
                  const user_pass = req.body.password;
                  const match = await bcryptPasswordMatch(user_pass, db_pass);
                  if (match === true) {
                    const userId = result.id;
                    const accesstoken = await accessToken(userId);
                    const refreshtoken = await refreshToken(userId);
                    return res.status(200).json({
                      success: true,
                      accessToken: accesstoken,
                      refreshtoken: refreshtoken,
                      message: 'login successfully',
                    });
                  } else {
                    res.status(400).json({
                      success: false,
                      message: 'invalid login details',
                    });
                  }
                } else {
                  res.status(400).json({
                    success: false,
                    message: 'first verify otp then login.....?',
                  });
                }
              } else {
                res.status(400).json({
                  success: false,
                  message: 'you are not approved by admin ',
                });
              }
            } else {
              res.status(400).json({
                success: false,
                message: 'your email is not verified ',
              });
            }
          } else {
            res.status(400).json({
              success: false,
              message: 'role must be seller',
            });
          }
        }
      }
    } else {
      res.status(400).json({
        success: false,
        message: 'user not found',
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'this phone number are not registerd in twilio sms',
    });
  }
};

exports.sellerVarified = async (req, res) => {
  const result = await User.findOne({ resetToken: req.params.token });
  if (result.isVerified === false) {

    if (result.resetTime >= Date.now()) {
      const result = await User.findOneAndUpdate(
        { resetToken: req.params.token },
        { isVerified: true },
      );

      // sendMsgBymail(result.email);
      return res.status(200).json({
        message: 'verified by mail',
        success: true,
      });
    } else {
      return res.status(400).json({
        message: 'your verification time has expired ',
        success: false,
      });
    }
  } else {
    return res.status(200).json({
      message: 'allready verified',
      success: true,
    });
  }
};

exports.verifiedOtp = async (req, res) => {
  const otp = req.body.otp;
  const contact = req.body.phone;

  const result = await User.findOne({ phone: contact });
  if (!result) {
    return res.send('invalid otp/number');
  } else {
    // if(result.resetTime <= Date.now()){

    if (result.otp === otp) {
      const sellerresult = await User.updateOne(
        { phone: req.body.phone },
        { otp: true, resetToken: '' },
      );
      // await sendMsg(req);

      res.status(200).json({
        message: 'varified otp',
      });
    } else {
      res.status(400).json({
        message: 'invalid user/otp ',
      });
    }
    // }else{
    //   res.status(400).json({
    //     message: "otp time has expired",
    //     success: false
    //   })
    // }
  }
};

exports.logoutSelller = async (req, res) => {
  try {
    const _id = req.body.id;
    const data = await User.findOne({ _id });
    if (!data) {
      res.status(400).json({
        success: false,
        message: 'invalid id',
      });
    } else {
      const result = await User.findByIdAndUpdate({ _id }, { otp: null });
      res.status(200).json({
        message: 'logout successfully',
        success: true,
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'id lenght must be 24/invalid id',
    });
  }
};




exports.createProfile = async (req, res) => {
  try{
      const result = await User.findOne({ _id: req.body.sellerId });
      if (!result) {
        return res.status(400).json({
          message: 'please insert valid sellerId',
          succes: false,
        });
      }
      const findProfile = await SellerProfile.findOne({ sellerId: req.body.sellerId });
      if (findProfile) {
       updateProfile(req,res)
      }else{
          const createProfile = await SellerProfile.create(req.body)
          return res.status(200).json({
            createProfile:createProfile,
            message: 'create profile successfully',
            succes: true,
          });
      }
  }catch(error){
      return res.status(400).json({
          message: 'Id lenght must be 24 character/invalid id format',
          succes: false,
        });
  }

};

updateProfile = async (req, res) => {
  try{
      const id = req.body.sellerId;
      const fullName = req.body.fullName
      if(fullName){
        updateUserProfileTable(id,fullName)
      }
      const result = await SellerProfile.findOneAndUpdate({ sellerId: id }, req.body, {
        new: true,
      });
      if (!result) {
        return res.status(400).json({
          message: 'inavlid id',
          succes: false,
        });
      }
      return res.status(200).json({
        message: 'profile update successfully',
        succes: true,
        updateadd: result,
      });
  }catch(error){
      return res.status(400).json({
          message: 'Id lenght must be 24 character/invalid id format',
          succes: false,
        });
  }

};

updateUserProfileTable = async (id,fullName)=>{

  const result = await User.findOneAndUpdate({ sellerId: id }, req.body, {
    new: true,
  });
  
}

exports.createAccessRefreshToken = async (req, res) => {
  const refreshVarify = req.body.token;
  const paylod = refreshTokenVarify(refreshVarify);
  console.log('$$$$$$$$#####', paylod);
  if (!paylod) {
    return res.status(400).send('invalid user');
  }
  const userId = paylod.aud;
  console.log('=============>', userId);
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'user not authenticated',
    });
  }
  const userToken = await User.findOne({ id: userId });
  if (!userToken) {
    return res.status(400).json({
      success: false,
      message: 'invalid user',
    });
  } else {
    console.log('=============>', userId);
    const access_Token = await accessToken(userId);
    const refresh_Token = await refreshToken(userId);
    return res.status(400).json({
      accesstoken: access_Token,
      refrestToken: refresh_Token,
    });
  }
};
