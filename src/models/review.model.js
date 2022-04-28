const mongoose = require('mongoose')

const reviewSchema = mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    comments: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        content: String,
        rating: Number
    }],
    image: {type:[{image_url:String,
        cloud_public_id:String}]},
},{ timestamps: true })

const Review = mongoose.model('Review',reviewSchema);

module.exports = Review