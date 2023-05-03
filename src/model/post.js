const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    body: {
        type: String,
        required: true,
        trim: true
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
},{
    timestamps: true
})

postSchema.virtual('comments', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'postId'
})

const Post = mongoose.model('Post', postSchema)

module.exports = Post