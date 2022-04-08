const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const { crypto_string } = require('../services/');

const addressSchema = new mongoose.Schema(
  {
    fullName: String,
    phone: {
      type: String,
    },
    country: {
      type: String,
    },
    state: {
      type: String,
    },
    city: {
      type: String,
      default: null,
    },
    street: String,
    pincode: Number,
    landmark: String,
    houseNo: String,
    addressType: String,
    resetTime: Date,
    userid: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

addressSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const UserAddress = mongoose.model('UserAddress', addressSchema);

module.exports = UserAddress;
