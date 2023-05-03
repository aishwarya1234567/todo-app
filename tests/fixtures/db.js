const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const User = require('../../src/model/user')
const Todo = require('../../src/model/todo')
const Post = require('../../src/model/post')

const userOneId = new mongoose.Types.ObjectId()
const userTwoId = new mongoose.Types.ObjectId()
const todoOneId = new mongoose.Types.ObjectId()
const todoTwoId = new mongoose.Types.ObjectId()
const todoThreeId = new mongoose.Types.ObjectId()
const postOneId = new mongoose.Types.ObjectId()
const postTwoId = new mongoose.Types.ObjectId()
const postThreeId = new mongoose.Types.ObjectId()

const userOne = {
    _id : userOneId,
    name: 'Test1',
    email: 'test1@gmail.com',
    username: 'test123',
    phone: '123456',
    address: 'demo 1',
    password: 'pass@1234',
    tokens: [{
        token: jwt.sign({_id : userOneId}, process.env.JWT_TOKEN)
    }]
}

const userTwo = {
    _id : userTwoId,
    name: 'Test2',
    email: 'test2@gmail.com',
    username: 'test298',
    phone: '567890',
    address: 'demo 2',
    password: 'pass@5678',
    tokens: [{
        token: jwt.sign({_id : userTwoId}, process.env.JWT_TOKEN)
    }]
}

const todoOne = {
    _id : todoOneId,
    title : 'First',
    userId : userOneId
}

const todoTwo = {
    _id : todoTwoId,
    title : 'Second',
    userId : userOneId
}

const todoThree = {
    _id : todoThreeId,
    title : 'Third',
    userId : userTwoId
}

const postOne = {
    _id : postOneId,
    title : 'First post',
    body : 'First body',
    userId : userOneId
}

const postTwo = {
    _id : postTwoId,
    title : 'Second post',
    body : 'Second body',
    userId : userOneId
}

const postThree = {
    _id : postThreeId,
    title : 'Third post',
    body : 'Third body',
    userId : userTwoId
}

const setUpDBForTest = async ()=>{
    await User.deleteMany()
    await Todo.deleteMany()
    await Post.deleteMany()
    await new User(userOne).save()
    await new User(userTwo).save()
    await new Todo(todoOne).save()
    await new Todo(todoTwo).save()
    await new Todo(todoThree).save()
    await new Post(postOne).save()
    await new Post(postTwo).save()
    await new Post(postThree).save()
}

module.exports = {
    userOneId,
    userOne,
    userTwoId,
    userTwo,
    todoOne,
    todoOneId,
    todoTwo,
    todoTwoId,
    todoThree,
    todoThreeId,
    postOne,
    postOneId,
    postTwo,
    postTwoId,
    postThree,
    postThreeId,
    setUpDBForTest
}