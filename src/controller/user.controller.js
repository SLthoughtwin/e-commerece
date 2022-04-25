const { User } = require('./../models/');
const { userRole } = require('./../config/');
const cron = require('node-cron');
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

exports.signUPUser = async (req, res) => {
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
            res.status(201).json({
              statusCode: 200,
              message: 'check your mail to verified :)',
            });
            console.log('check your mail to verified');
          })
          .catch((err) => {
            res.status(400).json({
              statusCode: 400,
              message: 'mail not send :)',
            });
          });
      } else {
        res.status(400).json({
          statusCode: 400,
          message: 'email/phone already exist',
        });
      }
    } else {
      res.status(400).json({
        statusCode: 400,
        message:
          'invalid gmail formate please try this formate @gmail.com/yopmail.com',
      });
    }
  } catch (error) {
    res.status(400).json({
      statusCode: 400,
      message: 'email/phone already exist',
    });
  }
};

exports.userLogin = async (req, res) => {
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
        } else if (result.role === 'user') {
          if (result.isVerified === true) {
            const db_pass = result.password;
            const user_pass = req.body.password;
            const match = await bcryptPasswordMatch(user_pass, db_pass);
            if (match === true) {
              const userId = result.id;
              const accesstoken = await accessToken(userId);
              const refreshtoken = await refreshToken(userId);
              return res.status(200).json({
                statusCode: 200,
                message: 'login successfully',
                name: result.fullName,
                accToken: accesstoken,
                refreshtoken: refreshtoken,
              });
            } else {
              res.status(400).json({
                statusCode: 400,
                message: 'invalid login details',
              });
            }
          } else {
            res.status(400).json({
              statusCode: 400,
              message: 'first verified your gmail',
            });
          }
        } else {
          res.status(400).json({
            statusCode: 400,
            message: 'Role must be user',
          });
        }
      } else if (req.body.phone) {
        const result = await User.findOne({ phone: req.body.phone });
        if (result.otp === null) {
          const Otp = await createOtp(req, res);
          const setOtp = await User.findOneAndUpdate(
            { phone: req.body.phone },
            { otp: Otp, resetTime: Date.now() + 10 * 60000 },
          );
          res.status(200).json({
            statusCode: 200,
            message: 'otp send to your number',
          });
        } else {
          if (!result) {
            res.status(400).json({
              statusCode: 200,
              message: 'invalid number ',
            });
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
                  return res.status(200).json({
                    statusCode: 200,
                    message: 'login successfully',
                    name: result.fullName,
                    accessToken: accesstoken,
                    refreshtoken: refreshtoken,
                  });
                } else {
                  res.status(400).json({
                    statusCode: 400,
                    message: 'invalid login details',
                  });
                }
              } else {
                res.status(400).json({
                  statusCode: 400,
                  message: 'first verify otp then login.....?',
                });
              }
            } else {
              res.status(400).json({
                statusCode: 400,
                message: 'your email is not verified',
              });
            }
          } else {
            res.status(400).json({
              statusCode: 400,
              message: 'Role must be user',
            });
          }
        }
      }
    } else {
      res.status(400).json({
        statusCode: 400,
        message: 'user not found',
      });
    }
  } catch (error) {
    res.status(400).json({
      statusCode: 400,
      message: 'this phone number are not registerd in twilio sms',
    });
  }
};

exports.userVarified = async (req, res) => {
  try {
    const result = await User.findOne({ resetToken: req.params.token });
    if (result.isVerified == true) {
      if (result.resetTime >= Date.now()) {
        const result = await User.findOneAndUpdate(
          { resetToken: req.params.token },
          { isVerified: true, resetToken: '' },
        );

        sendMsgBymail(result.email);
        return res.status(200).json({
          statusCode: 200,
          message: 'verified by mail',
        });
      } else {
        return res.status(400).json({
          statusCode: 400,
          message: 'your verification time has expired ',
        });
      }
    } else {
      return res.status(200).json({
        statusCode: 200,
        message: 'already  verified',
      });
    }
  } catch (error) {
    res.status(400).json({
      statusCode: 200,
      message: 'invalid user',
    });
  }
};

exports.userVerifiedOtp = async (req, res) => {
  try {
    const otp = req.body.otp;
    const contact = req.body.phone;

    const result = await User.findOne({ phone: contact });
    if (!result) {
      return res.status(200).json({
        statusCode: 200,
        message: 'invalid otp/number',
      });
    } else {
      if (result.resetTime <= Date.now()) {
        if (result.otp === otp) {
          const sellerresult = await User.updateOne(
            { phone: req.body.phone },
            { otp: true, resetToken: '' },
          );
          // await sendMsg(req);

          res.status(200).json({
            statusCode: 200,
            message: 'varified otp',
          });
        } else {
          res.status(400).json({
            statusCode: 400,
            message: 'invalid user/otp ',
          });
        }
      } else {
        res.status(400).json({
          statusCode: 400,
          message: 'otp time has been expired',
        });
      }
    }
  } catch (error) {
    res.status(400).json({
      statusCode: 400,
      message: 'invalid otp',
    });
  }
};

exports.logoutUser = async (req, res) => {
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
      res.status(200).json({
        statusCode: 400,
        message: 'logout successfully',
      });
    }
  } catch (error) {
    res.status(400).json({
      statusCode: 400,
      message: 'id lenght must be 24',
    });
  }
};

exports.createAccessRefreshTokenToUser = async (req, res) => {
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
