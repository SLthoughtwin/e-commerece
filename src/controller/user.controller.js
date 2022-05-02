const { User } = require('./../models/');
const { userRole } = require('./../config/');
const cron = require('node-cron');
const ApiError = require('../config/apierror');
const { responseHandler } = require('../config/');
const {
  mailfunction,
  bcryptPasswordMatch,
  refreshTokenVarify,
  createOtp,
  accessToken,
  refreshToken,
  sendMsg,
  sendMsgBymail,
  verifyEmail,
} = require('../services/');

cron.schedule('0 1 * * *', async function () {
  const findUser = await User.find({ role: 'user', isVerified: true });
  const email = findUser.map((user) => {
    const mail = user.email;
    sendMsgBymail(mail);
    console.log(mail);
  });
});

exports.signUPUser = async (req, res, next) => {
  try {
    const verifyMail = verifyEmail(req);
    if (verifyMail === true) {
      const user = await User.findOne({
        email: req.body.email,
        phone: req.body.phone,
      });
      if (!user) {
        req.body.role = userRole;
        const email = req.body.email;
        const result = await User.create(req.body);
        const link = `http://localhost:5000/seller/${result.resetToken}`;
        await mailfunction(email, link)
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
          'invalid gmail formate please try this formate @gmail.com/yopmail.com',
        ),
      );
    }
  } catch (error) {
    return next(new ApiError(400, 'email/phone already exist'));
  }
};

exports.userLogin = async (req, res, next) => {
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
          return next(new ApiError(400, 'invalid email'));
        } else if (result.role === 'user') {
          if (result.isVerified === true) {
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
            return next(new ApiError(400, 'first verified your gmail'));
          }
        } else {
          return next(new ApiError(400, 'Role must be user'));
        }
      } else if (req.body.phone) {
        const result = await User.findOne({ phone: req.body.phone });
        if (result.otp === null) {
          const Otp = await createOtp(req, res);
          const setOtp = await User.findOneAndUpdate(
            { phone: req.body.phone },
            { otp: Otp, resetTime: Date.now() + 10 * 60000 },
          );
          return responseHandler(200, 'otp send to your number', res);
        } else {
          if (!result) {
            return next(new ApiError(400, 'invalid number'));
          } else if (result.role === 'user') {
            if (result.isVerified === true) {
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
                return next(new ApiError(400, 'first verify otp then login?'));
              }
            } else {
              return next(new ApiError(400, 'your email is not verified'));
            }
          } else {
            return next(new ApiError(400, 'Role must be user'));
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

exports.userVarified = async (req, res, next) => {
  try {
    const result = await User.findOne({ resetToken: req.params.token });
    if (result.isVerified == true) {
      if (result.resetTime >= Date.now()) {
        const result = await User.findOneAndUpdate(
          { resetToken: req.params.token },
          { isVerified: true, resetToken: '' },
        );
        await sendMsgBymail(result.email);
        return responseHandler(200, 'verified by mail', res);
      } else {
        return next(new ApiError(400, 'your verification time has expired'));
      }
    } else {
      return responseHandler(200, 'already  verified', res);
    }
  } catch (error) {
    return next(new ApiError(400, 'invalid user'));
  }
};

exports.userVerifiedOtp = async (req, res, next) => {
  try {
    const otp = req.body.otp;
    const contact = req.body.phone;

    const result = await User.findOne({ phone: contact });
    if (!result) {
      return next(new ApiError(400, 'invalid otp/number'));
    } else {
      if (result.resetTime <= Date.now()) {
        if (result.otp === otp) {
          const sellerresult = await User.updateOne(
            { phone: req.body.phone },
            { otp: true, resetToken: '' },
          );
          // await sendMsg(req);
          return responseHandler(200, 'varified otp', res);
        } else {
          return next(new ApiError(400, 'invalid user/otp'));
        }
      } else {
        return next(new ApiError(400, 'otp time has been expired'));
      }
    }
  } catch (error) {
    return next(new ApiError(400, 'invalid otp'));
  }
};

exports.logoutUser = async (req, res, next) => {
  try {
    const _id = req.body.id;
    const data = await User.findOne({ _id });
    if (!data) {
      res.status(400).json({
        statusCode: 400,
        message: 'invalid id',
      });
    } else {
      const result = await User.findByIdAndUpdate({ _id }, { otp: null });
      return responseHandler(200, 'logout successfully', res);
    }
  } catch (error) {
    return next(new ApiError(400, 'id lenght must be 24'));
  }
};

exports.createAccessRefreshTokenToUser = async (req, res, next) => {
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
      statusCode: 400,
      message: 'user not authenticated',
    });
  }
  const userToken = await User.findOne({ id: userId });
  if (!userToken) {
    return res.status(400).json({
      statusCode: 400,
      message: 'invalid user',
    });
  } else {
    // console.log('=============>', userId);
    const access_Token = await accessToken(userId);
    const refresh_Token = await refreshToken(userId);
    return res.status(200).json({
      statusCode: 200,
      accesstoken: access_Token,
      refrestToken: refresh_Token,
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const id = req.body.id;
    const result = await User.findOneAndUpdate({ _id: id }, req.body, {
      new: true,
    });
    if (!result) {
      return res.status(400).json({
        statusCode: 400,
        message: 'inavlid id',
      });
    }
    return res.status(200).json({
      statusCode: 200,
      message: 'profile update successfully',
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      statusCode: 400,
      message: 'Id lenght must be 24 character/invalid id format',
    });
  }
};
