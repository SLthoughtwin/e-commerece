const jwt = require('jsonwebtoken');
const { User, Category, Brand, Product } = require('./../models/');
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
      const findAdmin = await User.findOne({ role: admin });
      if (findAdmin) {
        return res.status(400).json({
          statusCode:400,
          message: 'admin already exist',
        });
      }
      req.body.role = admin;
      req.body.isApproved = true
      req.body.isVerified = true
      // const {email,password,} = req.body
      const createAdmin = await User.create(req.body);
      const userId = createAdmin.id;
      const accesstoken = await accessToken(userId);
      return res.status(200).json({
        statusCode:200,
        message: 'login1 successfully',
        data: accesstoken,
      });
    }
    const db_pass = user.password;
    const user_pass = req.body.password;
    const match = await bcryptPasswordMatch(user_pass, db_pass);
    if (match === true && req.body.email === user.email) {
      const userId = user.id;
      const accesstoken = await accessToken(userId);
      return res.status(200).json({
        statusCode:200,
        message: 'login successfully',
        data: accesstoken,
      });
    } else {
      return res.status(400).json({
        statusCode:400,
        message: 'invalid login details',
      });
    }
  } catch (error) {
    console.log(error)
    return res.status(400).json({
      statusCode:400,
      message: error.message,
    });
  }
};

exports.approvedAndRejectSellerByAdmin = async (req, res) => {
  try {
    if (objectID.isValid(req.body.id) === false) {
      return res.status(400).json({
        message: 'id must be correct format',
        
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
        statusCode:200,
        messsage: 'approve by admin',
      });
    }
    const admin = await User.updateOne(
      { _id: req.body.id },
      { isApproved: false },
    );
    return res.status(200).json({
      statusCode:200,
      messsage: 'reject by admin',
    });
  } catch (err) {
    return res.status(400).json({
      statusCode:400,
      messsage: err.message,
      
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
        statusCode:400,
        message: 'there is no seller yet',
      });
    }
    return res.status(200).json({
      statusCode:200,
      message: 'getAllseller',
      data: result,
    });
  } catch (error) {
    return (400).json({
      statusCode:400,
      message: error.message,
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
        statusCode:400,
        message: 'there is no User yet',
      });
    }
    return res.status(200).json({
      statusCode:200,
      message: 'getAllUser',
      data: result,
    });
  } catch (error) {
    return res.status(200).json({
      statusCode:200,
      message: error.message,
    });
  }
};

exports.deleteSellerByAdmin = async (req, res) => {
  try {
    if (objectID.isValid(req.body.id) === false) {
      return res.status(400).json({
        statusCode:400,
        message: 'id must be correct format',
      });
    }
    const result = await User.findOneAndDelete({ _id: id });
    if (!result) {
      return res.status(404).json({
        statusCode:400,
        message: 'invalid user',
      });
    }
    return res.status(404).json({
      statusCode:200,
      message: 'seller delete successfully',
      data: result,
    });
  } catch (err) {
    res.status(400).json({
      statusCode:400,
      messsage: err.message,
    });
  }
};

exports.productApprovedAndRejectByadmin = async (req, res) => {
  try {
    if (objectID.isValid(req.body.id) === false) {
      return res.status(400).json({
        statusCode:400,
        message: 'id must be correct format',
      });
    }
    const result = await Product.findOne({ _id: req.body.id });
    if (!result) {
      return res.status(400).json({
        statusCode:400,
        message: 'invalid user',
      });
    }
    if (result.isApprovedByadmin === false) {
      const admin = await Product.updateOne(
        { _id: req.body.id },
        { isApprovedByadmin: true },
      );
      return res.status(200).json({
        statusCode:200,
        messsage: 'approve by admin',
      });
    }
    const admin = await Product.updateOne(
      { _id: req.body.id },
      { isApprovedByadmin: false },
    );
    return res.status(200).json({
      statusCode:200,
      messsage: 'reject by admin',
    });

  } catch (error) {
    return res.status(400).json({
      statusCode:400,
      message: error.message,
    });
  }
};
