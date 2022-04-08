const mongoose = require('mongoose');
const brandSchema = new mongoose.Schema(
  {
    brand_name: String,
    description: String,
    logo:String,
    isActive:{type:Boolean,
    default:true}
  },
  { timestamps: true });

brandSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const Brand = mongoose.model('Brand', brandSchema);

module.exports = Brand;