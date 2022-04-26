const { UserAddress, User } = require('../models/');
const lodash = require('lodash');
const axios = require('axios').default;
const objectID = require('mongodb').ObjectId;

exports.createAddress = async (req, res) => {
  try {
    const result = await User.findOne({ phone: req.body.phone });
    if (!result) {
      return res.status(400).json({
        statusCode: 400,
        message: 'please enter register number',
      });
    }
    const findUser = await UserAddress.findOne({ phone: req.body.phone });
    if (!findUser) {
      req.body.userId = result.id;
      req.body.isDefault = true;
      const create = await UserAddress.create(req.body);
      return (200).json({
        statusCode: 200,
        message: 'address  create successfully',
        data: create,
      });
    } else {
      req.body.userid = result.id;
      const create = await UserAddress.create(req.body);
      return res.status(200).json({
        statusCode: 200,
        message: 'address  create successfully',
        data: create,
      });
    }
  } catch (error) {
    return res.status(400).json({
      statusCode: 400,
      message: error.message,
    });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    if (objectID.isValid(req.body.id) === false) {
      return (400).json({
        statusCode: 400,
        message: 'id must be correct format',
      });
    }
    const id = req.body.id;
    const result = await UserAddress.findOneAndUpdate({ _id: id }, req.body, {
      new: true,
    });
    if (!result) {
      return (400).json({
        statusCode: 400,
        message: 'inavlid id',
      });
    }
    return (200).json({
      statusCode: 200,
      message: 'address update successfully',
      data: result,
    });
  } catch (error) {
    return (400).json({
      statusCode: 400,
      message: error.message,
    });
  }
};

exports.showAddress = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.userid });
    if (!user) {
      return (400).json({
        statusCode: 400,
        message: 'inavlid id',
      });
    }
    const result = await UserAddress.find({ userId: req.userid });
    return (200).json({
      statusCode: 200,
      message: 'address found successfully',
      data: result,
    });
  } catch (error) {
    return (400).json({
      statusCode: 400,
      message: error.message,
    });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    if (objectID.isValid(req.body.id) === false) {
      return (400).json({
        statusCode: 400,
        message: 'id must be correct format',
      });
    }
    let result = await UserAddress.findByIdAndDelete({ _id: req.body.id });
    if (!result) {
      return (400).json({
        statusCode: 400,
        message: 'inavlid id',
      });
    }
    if (result.isDefault === true) {
      const findUser = await UserAddress.findOneAndUpdate(
        { phone: result.phone },
        { isDefault: true },
      );
    }
    return (200).json({
      statusCode: 200,
      message: 'address delete successfully',
      data: result,
    });
  } catch (error) {
    return (400).json({
      statusCode: 400,
      message: error.message,
    });
  }
};

exports.axiosTest = async (req, res) => {
  await axios
    .get('https://countriesnow.space/api/v0.1/countries/states')
    .then((response) => {
      (200).json({ message: response.data });
    })
    .catch((error) => {
      res.send('error');
    });
};
