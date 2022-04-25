const mongoose = require('mongoose');
const addCartSchema = new mongoose.Schema(
  {
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product'
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
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