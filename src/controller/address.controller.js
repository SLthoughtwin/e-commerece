const { UserAddress, User } = require('../models/');
const lodash = require('lodash');
const axios = require('axios').default;
const objectID = require('mongodb').ObjectId;

exports.createAddress = async (req, res) => {

  try{

  if (objectID.isValid(req.params.id) === false) {
    return res.status(400).json({
      message: 'id must be correct format',
      succes: false,
    });
  }
  const result = await User.findOne({ phone: req.body.phone });
  if (!result) {
    return res.status(400).json({
      message: 'please enter register number',
      succes: false,
    });
  }
  const findUser = await UserAddress.findOne({ phone: req.body.phone });
  if (!findUser) {
    req.body.userid = result.id;
    req.body.isDefault = true;
    const create = await UserAddress.create(req.body);
    return res.status(200).json({
      message: 'address  create successfully',
      succes: true,
    });
  } else {
    req.body.userid = result.id;
    const create = await UserAddress.create(req.body);
    return res.status(200).json({
      message: 'address  create successfully',
      succes: true,
    });
  }
}catch(error){
  return res.status(400).json({
    message: error.message,
    succes: false,
  });
}
};

exports.updateAddress = async (req, res) => {
  try {

    if (objectID.isValid(req.body.id) === false) {
      return res.status(400).json({
        message: 'id must be correct format',
        succes: false,
      });
    }
    const id = req.body.id;
    const result = await UserAddress.findOneAndUpdate({ _id: id }, req.body, {
      new: true,
    });
    if (!result) {
      return res.status(400).json({
        message: 'inavlid id',
        succes: false,
      });
    }
    return res.status(200).json({
      message: 'address update successfully',
      succes: true,
      updateadd: result,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
      succes: false,
    });
  }
};

exports.showAddress = async (req, res) => {
  try {

    if (objectID.isValid(req.body.id) === false) {
      return res.status(400).json({
        message: 'id must be correct format',
        succes: false,
      });
    }
    const user = await User.findOne({ _id: req.body.id });
    if (!user) {
      return res.status(400).json({
        message: 'inavlid id',
        succes: false,
      });
    }
    const result = await UserAddress.find({ userid: req.body.id });
    return res.status(200).json({
      message: 'address found successfully',
      succes: true,
      address: result,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
      succes: false,
    });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    if (objectID.isValid(req.body.id) === false) {
      return res.status(400).json({
        message: 'id must be correct format',
        succes: false,
      });
    }
    let result = await UserAddress.findByIdAndDelete({ _id: req.body.id });
    if (!result) {
      return res.status(400).json({
        message: 'inavlid id',
        succes: false,
      });
    }
    if (result.isDefault === true) {
      const findUser = await UserAddress.findOneAndUpdate(
        { phone: result.phone },
        { isDefault: true },
      );
    }
    return res.status(200).json({
      message: 'address delete successfully',
      succes: true,
      address: result,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
      succes: false,
    });
  }
};

exports.axiosTest = async (req, res) => {
  await axios
    .get('https://countriesnow.space/api/v0.1/countries/states')
    .then((response) => {
      res.status(200).json({ message: response.data });
    })
    .catch((error) => {
      res.send('error');
    });
};
