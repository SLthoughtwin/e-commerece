const mongoose = require('mongoose');
const sellerSchema = new mongoose.Schema(
  {
    sellerId:String,
    GST: String,
    docProve: String,
    isKYC: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true },
);

const SellerProfile = mongoose.model('SellerProfile', sellerSchema);

module.exports = SellerProfile;
