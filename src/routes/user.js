const User = require('../model/user')
const express = require('express')
const auth = require('../middleware/auth')

const router = new express.Router()

router.post('/user', async (req,res)=>{
    const user = new User(req.body)
    try{
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    }catch(error){
        res.status(500).send(error)
    }
})

router.post('/login', async (req,res)=>{
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password)
        if(!user)
        {
            return res.status(404).send()
        }
        const token = await user.generateAuthToken()
        res.send({user, token})
    }catch(error){
        res.status(500).send(error)
    }
})

router.post('/logout', auth, async (req, res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((token)=>token.token !== req.token)

        await req.user.save()
        res.send()
    }catch(error){
        res.status(500).send(error)
    }
})

router.get('/users', auth, async (req, res)=>{
    const query = []

    if(req.query.keyword && req.query.keyword !== '')
    {
        query.push({
            $match: { 
                $or :[
                    {
                        username : { $regex: req.query.keyword, $options: 'i' } 
                    },
                    {
                        name : { $regex: req.query.keyword, $options: 'i' } 
                    },
                    {
                        phone : { $regex: req.query.keyword, $options: 'i' } 
                    },
                    {
                        email : { $regex: req.query.keyword, $options: 'i' } 
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
                "_id" : userId
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
            "name": 1,
            "email":1,
            "address":1,
            "phone":1,
        } 
    });

    try{
        const users = await User.aggregate(query)

        res.send(users)
    }catch(error){
        res.status(500).send(error)
    }
})

module.exports = router