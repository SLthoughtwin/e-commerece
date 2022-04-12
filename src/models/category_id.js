const mongoose = require('mongoose');
const categorySchema = new mongoose.Schema(
  {
    category_name: String,
    description: String,
    image:String,
    imageId:String,
    isActive:{type:Boolean,
      default:true}
  },
  { timestamps: true });

categorySchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;