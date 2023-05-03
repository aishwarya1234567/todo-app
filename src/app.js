const express = require('express')
require('./db/mongoose')
const userRouter = require('./routes/user')
const todoRouter = require('./routes/todo')
const postRouter = require('./routes/post')
const commentRouter = require('./routes/comment')
const app = express()

app.use(express.json())
app.use(userRouter)
app.use(todoRouter)
app.use(postRouter)
app.use(commentRouter)

module.exports = app
