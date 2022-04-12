const mongoose = require('mongoose');
const addCartSchema = new mongoose.Schema(
  {
    productId: {
        type: mongoose.Schema.Types.String,
        ref: "Product"
    },
    quantity: {
        type: Number,
        default: 1
    },
    userId:{
        type: mongoose.Schema.Types.String,
        ref: "User"
    }
  },
  { timestamps: true });

addCartSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const addCart = mongoose.model('addCart', addCartSchema);

module.exports = addCart;