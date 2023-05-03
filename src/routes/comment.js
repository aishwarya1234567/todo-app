const Comment = require('../model/comment')
const express = require('express')
const auth = require('../middleware/auth')

const router = new express.Router()

router.post('/comment/post/:id', auth, async (req,res)=>{
    try{
        const comment = new Comment({
            ...req.body,
            postId: req.params.id,
            userId: req.user._id
        })
        await comment.save()
        res.status(201).send(comment)
    }catch(error){
        res.status(500).send(error)
    }
})

module.exports = router