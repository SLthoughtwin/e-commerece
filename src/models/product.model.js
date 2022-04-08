const mongoose = require('mongoose');
const productSchema = new mongoose.Schema(
  {
    createBy: {
      type: mongoose.Schema.Types.String,
      ref: "User"
  },
    title:String,
    categoryId  :{
      type: mongoose.Schema.Types.String,
      ref: "Category"
  },
    brandId: {
      type: mongoose.Schema.Types.String,
      ref: "Brand"
  },
    price:Number,
    image: {
      type: mongoose.Schema.Types.String,
      ref: "CloudId"
  },
    isAvailable :{
      type: Boolean,
      default: true
    },
    rating:String,
    description:String,
    isApproved:{
      type: Boolean,
      default: false
    },
  },
  { timestamps: true });

productSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const Product = mongoose.model('Product', productSchema);


const CloudIdSchema = new mongoose.Schema(
  {
    product_id :String,
    cloud_public_id : String,
    image: [{image_url:String,
      cloud_public_id:String}],
    isActive: {
      type: String,
      default: true
    }
  },
  { timestamps: true });

productSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const CloudId = mongoose.model('CloudId', CloudIdSchema);


module.exports = {CloudId,Product};
