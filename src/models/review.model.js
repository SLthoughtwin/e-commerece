const mongoose = require('mongoose')

const reviewSchema = mongoose.Schema({
    productId: String,
    comments: [{
        userId: String,
        content: String,
        votes: Number
    }],
    image: [{image_url:String,
        cloud_public_id:String}],
},{ timestamps: true })

const Review = mongoose.model('Review',reviewSchema);

module.exports = Review