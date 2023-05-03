const Post = require('../model/post')
const express = require('express')
const auth = require('../middleware/auth')
const mongoose = require('mongoose')

const router = new express.Router()

router.post('/post',auth, async (req,res)=>{
    try{
        const post = new Post({
            ...req.body,
            userId: req.user._id
        })
        await post.save()
        res.status(201).send(post)
    }catch(error){
        res.status(500).send(error)
    }
})

router.get('/posts', async (req,res)=>{
    const query = []

    query.push({
        $lookup:
        {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "creator"
        }
    },{
        $lookup:
        {
            from: "comments",
            localField: "_id",
            foreignField: "postId",
            as: "comments"
        }
    })

    if(req.query.keyword && req.query.keyword !== '')
    {
        query.push({
            $match: { 
                $or :[
                    {
                        title : { $regex: req.query.keyword, $options: 'i' } 
                    },
                    {
                        body : { $regex: req.query.keyword, $options: 'i' } 
                    }
                ]
            }
        });
    }

    if(req.query.userId)
    {
        const userId = new mongoose.Types.ObjectId(req.query.userId)
        query.push({
            $match:{
                "userId" : userId
            }
        })
    }

    if(req.query.sortBy && req.query.sortOrder)
    {
        var sort = {};
        sort[req.query.sortBy] = (req.query.sortOrder === 'asc') ? 1 : -1;
        query.push({
            $sort: sort
        });
    }
    else
    {
        query.push({
            $sort: {createdAt:-1}
        });	
    }

    const page=(req.query.page)?parseInt(req.query.page):1;
	const perPage=(req.query.perPage)?parseInt(req.query.perPage):10;
	const skip=(page-1)*perPage;
    
    query.push({
        $skip:skip,
    });
    query.push({
        $limit:perPage,
    });

    query.push({ 
        $project : {
            "_id":1,
            "createdAt":1,
            "title": 1,
            "body":1,
            "creator._id":1 ,
            "creator.email":1 ,
            "creator.name":1,
            "comments._id":1,
            "comments.comment":1,
            "comments.userId":1,
        } 
    });

    try{
        const posts = await Post.aggregate(query)

        res.send(posts)
    }catch(error){
        res.status(500).send(error)
    }
})

router.get('/post/:id', async (req,res)=>{
    const _id = new mongoose.Types.ObjectId(req.params.id)
    const query = []

    query.push({
        $match:{
            _id
        }
    })

    query.push({
        $lookup:
        {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "creator"
        }
    },{
        $lookup:
        {
            from: "comments",
            localField: "_id",
            foreignField: "postId",
            as: "comments"
        }
    })

    query.push({ 
        $project : {
            "_id":1,
            "createdAt":1,
            "title": 1,
            "body":1,
            "creator._id":1 ,
            "creator.email":1 ,
            "creator.name":1,
            "comments._id":1,
            "comments.comment":1,
            "comments.userId":1,
        } 
    });

    try{
        const post = await Post.aggregate(query)
        if(!post)
        {
            return res.status(404).send()
        }
        res.send(post)
    }catch(error){
        res.status(500).send(error)
    }
})

module.exports = router