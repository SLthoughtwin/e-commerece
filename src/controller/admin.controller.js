const jwt = require('jsonwebtoken');
const { User, Category, Brand } = require('./../models/');
const { admin, seller, userRole } = require('./../config/');
const notifier = require('node-notifier');
const { accessToken, bcryptPasswordMatch, fields } = require('../services/');
const objectID = require('mongodb').ObjectId;
// const {fields } = require('./../services/')
const checkId = (req) => {
  if (req.params) {
    return req.params.id;
  } else {
    return req.body.id;
  }
};

exports.adminLogin = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      req.body.role = admin;
      // req.body.isApproved =
      const createAdmin = await User.create(req.body);
      const userId = createAdmin.id;
      const accesstoken = await accessToken(userId);
      return res.render('dashboard', { accesstoken });
      // return res.status(200).json({
      //   message: 'login1 successfully',
      //   accesstoken: accesstoken,
      //   success: true,
      // });
    } else {
      const foundAdmin = await User.findOne({ email: req.body.email });
      if (foundAdmin.role === 'admin') {
        const db_pass = foundAdmin.password;
        const user_pass = req.body.password;
        const match = await bcryptPasswordMatch(user_pass, db_pass);
        if (match === true) {
          const userId = foundAdmin.id;
          const accesstoken = await accessToken(userId);
          return res.render('dashboard', { accesstoken });
          // return res.status(200).json({
          //   success: true,
          //   accToken: accesstoken,
          //   message: 'login successfully',
          // });
        } else {
          notifier.notify('invalid login details');
          return res.redirect('back');
          // res.status(400).json({
          //   success: false,
          //   message: 'invalid login details',
          // });
        }
      } else {
        res.status(400).json({
          success: false,
          message: 'Role must be admin',
        });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: error.message,
      success: false,
    });
  }
};

exports.verifiedByAdmin = async (req, res) => {
  try {
    if (objectID.isValid(req.body.id) === false) {
      return res.status(400).json({
        message: 'id must be correct format',
        succes: false,
      });
    }
    const result = await User.findOne({ _id: req.body.id });
    if (!result) {
      return res.send('invalid user');
    }
    if (result.isApproved === false) {
      const admin = await User.updateOne(
        { _id: req.body.id },
        { isApproved: true },
      );
      return res.status(200).json({
        messsage: 'approve by admin',
      });
    }
    const admin = await User.updateOne(
      { _id: req.body.id },
      { isApproved: false },
    );
    return res.status(200).json({
      messsage: 'reject by admin',
    });
  } catch (err) {
    return res.status(400).json({
      messsage: err.message,
      success: false,
    });
  }
};

exports.getAllseller = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const { email = '' } = req.body;
    const allfields = fields(req);
    const result = await User.find(
      { email: { $regex: email, $options: '$i' }, role: seller },
      allfields,
    )
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    if (!result.length > 0) {
      return res.status(400).json({
        message: 'there is no seller yet',
        success: false,
      });
    }
    return res.status(200).json({
      message: 'getAllseller',
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
      success: false,
    });
  }
};

exports.getAllUser = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const { email = '' } = req.body;
    const allfields = fields(req);
    const result = await User.find(
      { email: { $regex: email, $options: '$i' }, role: userRole },
      allfields,
    )
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    if (!result.length > 0) {
      return res.status(400).json({
        message: 'there is no User yet',
        success: false,
      });
    }
    return res.status(200).json({
      message: 'getAllUser',
      data: result,
    });
  } catch (error) {
    return res.status(200).json({
      message: error.message,
      success: false,
    });
  }
};

exports.deleteSellerByAdmin = async (req, res) => {
  try {
    if (objectID.isValid(req.body.id) === false) {
      return res.status(400).json({
        message: 'id must be correct format',
        succes: false,
      });
    }
    const result = await User.findOneAndDelete({ _id: id });
    if (!result) {
      return res.status(404).json({
        message: 'invalid user',
        success: false,
      });
    }
    return res.status(404).json({
      message: 'seller delete successfully',
      success: true,
      data: result,
    });
  } catch (err) {
    res.status(400).json({
      messsage: err.message,
    });
  }
};
