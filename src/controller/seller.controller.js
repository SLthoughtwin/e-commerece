const { User, SellerProfile } = require('./../models/');
const { seller } = require('./../config/');
const { refreshTokenVarify } = require('./../services/');
const ApiError = require('../config/apierror');
const { responseHandler } = require('../config/');
const {
  mailfunction,
  bcryptPasswordMatch,
  createOtp,
  accessToken,
  refreshToken,
  sendMsg,
  sendMsgBymail,
  verifyEmail,
} = require('../services/');
const { html } = require('../template/template');

exports.signUPSeller = async (req, res, next) => {
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
        const link = `http://localhost:5000/auth/seller/${result.resetToken}`;
        await mailfunction(email, html(link))
          .then((response) => {
            console.log('check your mail to verified');
            return responseHandler(200, 'check your mail to verified', res);
          })
          .catch((err) => {
            return next(new ApiError(400, 'mail not send'));
          });
      } else {
        return next(new ApiError(400, 'email/phone already exist'));
      }
    } else {
      return next(
        new ApiError(
          400,
          'invalid gmail formate please try this formate souarbh@gmail.com/yopmail.com',
        ),
      );
    }
  } catch (error) {
    return next(new ApiError(400, 'email/phone already exist'));
  }
};

exports.sellerLogin = async (req, res, next) => {
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
            statusCode: 400,
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
                return responseHandler(
                  200,
                  'login successfully',
                  res,
                  accesstoken,
                );
              } else {
                return next(new ApiError(400, 'invalid login details'));
              }
            } else {
              return next(new ApiError(400, 'you are not approved by admin'));
            }
          } else {
            return next(new ApiError(400, 'you are not verified by mail'));
          }
        } else {
          return next(new ApiError(400, 'role must be seller'));
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
            statusCode: 200,
            message: 'otp send to your number',
          });
          return responseHandler(200, 'otp send to your number', res);
        } else {
          if (!result) {
            return next(new ApiError(400, 'invalid number'));
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
                    return responseHandler(
                      200,
                      'login successfully',
                      res,
                      accesstoken,
                    );
                  } else {
                    return next(new ApiError(400, 'invalid login details'));
                  }
                } else {
                  return next(
                    new ApiError(400, 'first verify otp then login?'),
                  );
                }
              } else {
                return next(new ApiError(400, 'you are not approved by admin'));
              }
            } else {
              return next(new ApiError(400, 'your email is not verified'));
            }
          } else {
            return next(new ApiError(400, 'role must be seller'));
          }
        }
      }
    } else {
      return next(new ApiError(400, 'user not found'));
    }
  } catch (error) {
    return next(
      new ApiError(400, 'this phone number are not registerd in twilio sms'),
    );
  }
};

exports.sellerVarified = async (req, res, next) => {
  const result = await User.findOne({ resetToken: req.params.token });
  if (result.isVerified === false) {
    if (result.resetTime >= Date.now()) {
      const result = await User.findOneAndUpdate(
        { resetToken: req.params.token },
        { isVerified: true },
      );
      await sendMsgBymail(result.email);
      return responseHandler(200, 'verified by mail', res);
    } else {
      return next(new ApiError(400, 'your verification time has expired'));
    }
  } else {
    return responseHandler(200, 'allready verified', res);
  }
};

exports.verifiedOtp = async (req, res, next) => {
  const otp = req.body.otp;
  const contact = req.body.phone;

  const result = await User.findOne({ phone: contact });
  if (!result) {
    return next(new ApiError(400, 'invalid otp/number'));
  } else {
    if (result.otp === otp) {
      const sellerresult = await User.updateOne(
        { phone: req.body.phone },
        { otp: true, resetToken: '' },
      );
      // await sendMsg(req)
      return responseHandler(200, 'varified otp', res);
    } else {
      return next(new ApiError(400, 'invalid user/otp'));
    }
  }
};

exports.logoutSelller = async (req, res, next) => {
  try {
    const _id = req.body.id;
    const data = await User.findOne({ _id });
    if (!data) {
      return next(new ApiError(400, 'invalid id'));
    } else {
      const result = await User.findByIdAndUpdate({ _id }, { otp: null });
      return responseHandler(200, 'logout successfully', res);
    }
  } catch (error) {
    return next(new ApiError(400, 'id lenght must be 24/invalid id'));
  }
};

exports.createProfile = async (req, res, next) => {
  try {
    const result = await User.findOne({ _id: req.body.sellerId });
    if (!result) {
      return next(new ApiError(400, 'please insert valid sellerId'));
    }
    const findProfile = await SellerProfile.findOne({
      sellerId: req.body.sellerId,
    });
    if (findProfile) {
      updateProfile(req, res);
    } else {
      const createProfile = await SellerProfile.create(req.body);
      return responseHandler(
        201,
        'create profile successfully',
        res,
        createProfile,
      );
    }
  } catch (error) {
    return next(
      new ApiError(400, 'Id lenght must be 24 character/invalid id format'),
    );
  }
};

updateProfile = async (req, res, next) => {
  try {
    const id = req.body.sellerId;
    const fullName = req.body.fullName;
    if (fullName) {
      updateUserProfileTable(id, fullName);
    }
    const result = await SellerProfile.findOneAndUpdate(
      { sellerId: id },
      req.body,
      {
        new: true,
      },
    );
    if (!result) {
      return res.status(400).json({
        statusCode: 400,
        message: 'inavlid id',
      });
    }
    return responseHandler(200, 'profile update successfully', res, result);
  } catch (error) {
    return next(
      new ApiError(400, 'Id lenght must be 24 character/invalid id format'),
    );
  }
};

updateUserProfileTable = async (id, fullName) => {
  const result = await User.findOneAndUpdate({ sellerId: id }, req.body, {
    new: true,
  });
};

exports.createAccessRefreshToken = async (req, res, next) => {
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
      message: 'user not authenticated',
    });
  }
  const userToken = await User.findOne({ id: userId });
  if (!userToken) {
    return res.status(400).json({
      message: 'invalid user',
    });
  } else {
    console.log('=============>', userId);
    const access_Token = await accessToken(userId);
    const refresh_Token = await refreshToken(userId);
    return res.status(400).json({
      statusCode: 400,
      accesstoken: access_Token,
      refrestToken: refresh_Token,
    });
  }
};
