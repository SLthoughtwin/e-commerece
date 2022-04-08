const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const { crypto_string } = require('../services/');

const userSchema = new mongoose.Schema(
  {
    fullName: String,
    photoUrl: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      unique: true,
    },
    email: {
      type: String,
      unique: true,
    },
    role: {
      type: String,
      enum: ['admin', 'seller', 'user'],
    },
    otp: {
      type: String,
      default: null,
    },
    image:String,
    password: String,
    aboutUs: String,
    resetToken: String,
    resetTime: Date,
    isActive: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deleteAt: {
      type: Boolean,
      default: null,
    },
  },
  { timestamps: true },
);

userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

userSchema.pre('save', async function (next) {
  const token = crypto_string();
  this.resetToken = token;
  this.resetTime = new Date(Date.now()+(10*60000))
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
