const Todo = require('../model/todo')
const express = require('express')
const auth = require('../middleware/auth')
const mongoose = require('mongoose')

const router = new express.Router()

router.post('/todo', auth, async (req,res)=>{
    try{
        const todo = new Todo({
            ...req.body,
            userId: req.user._id
        })
        await todo.save()
        res.status(201).send(todo)
    }catch(error){
        res.status(500).send(error)
    }
})

// GET /todo?limit=2&skip=2?completed=true?sortBy=createdAt_asc
router.get('/todos', async (req,res)=>{
    const query = []

    query.push({
        $lookup:
        {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "creator"
        }
    })

    if(req.query.title && req.query.title !== '')
    {
        query.push({
            $match:  {
                title : { $regex: req.query.title, $options: 'i' } 
            }
        });
    }

    if(req.query.completed && req.query.completed !== '')
    {
        query.push({
            $match:  {
                completed : req.query.completed === 'true' ? true : false
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
            "completed":1,
            "creator._id":1 ,
            "creator.email":1 ,
            "creator.name":1
        } 
    });

    try{
        const todos = await Todo.aggregate(query)
        res.send(todos)
    }catch(error){
        res.status(500).send(error)
    }
})

router.get('/todo/:id', async (req,res)=>{
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
    })

    query.push({ 
        $project : {
            "_id":1,
            "createdAt":1,
            "title": 1,
            "completed":1,
            "creator._id":1 ,
            "creator.email":1 ,
            "creator.name":1
        } 
    });

    try{
        const todo = await Todo.aggregate(query)
        if(!todo)
        {
            return res.status(404).send()
        }
        res.send(todo)
    }catch(error){
        res.status(500).send(error)
    }
})

// This API is used to mark a todo as complete as well by sending completed : true
router.patch('/todo/:id', auth, async (req, res)=>{
    const _id = req.params.id

    const todo = await Todo.findOne({_id, userId:req.user._id})
    if(!todo)
    {
        return res.status(404).send()
    }

    const updates = Object.keys(req.body)
    const allowedFields = ["title", "completed"]

    const isValidation = updates.every((update)=>allowedFields.includes(update))

    if(!isValidation)
    {
        return res.status(400).send({error: "Invalid updates!"})
    }

    try{
        updates.forEach((update)=>todo[update] = req.body[update])
        await todo.save()
        res.send(todo)
    }catch(error){
        return res.status(400).send(error)
    }
})

router.delete('/todo/:id', auth, async (req, res)=>{
    const _id = req.params.id
    try{
        const todo = await Todo.findOneAndDelete({_id, userId: req.user._id})
        if(!todo)
        {
            return res.status(404).send()
        }

        res.send(todo)
    }catch(error){
        return res.status(400).send(error)
    }
})

module.exports = router