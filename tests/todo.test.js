const request = require('supertest')
const app = require('../src/app')
const Todo = require('../src/model/todo')
const {
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
    setUpDBForTest
} = require('./fixtures/db')

beforeEach(setUpDBForTest)

test('Should create a todo', async ()=>{
    const response = await request(app)
    .post('/todo')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        'title' : 'Todo from test'
    })
    .expect(201)

    const todo = await Todo.findById(response.body._id)
    expect(todo).not.toBeNull()
    expect(response.body).toMatchObject({
        'title' : 'Todo from test',
        'completed' : false
    })
})

test('Get all todos with pagination, sorting & title filter', async() =>{
    const response = await request(app)
    .get('/todos?sortBy=title&sortOrder=asc&page=1&perPage=1&title=first')
    .send()
    .expect(200)

    expect(response.body.length).toBe(1)
})

test('Get all todos with userId and completed filter', async() =>{
    const response = await request(app)
    .get('/todos?completed=false&userId=' + userOneId)
    .send()
    .expect(200)

    expect(response.body.length).toBe(2)
})

test('Get todo with a given ID', async() =>{
    const response = await request(app)
    .get('/todo/' + todoTwoId)
    .send()
    .expect(200)

    expect(response.body).not.toBeNull()
})

test('Edit todo with a given ID', async() =>{
    const response = await request(app)
    .patch('/todo/' + todoTwoId)
    .send({"completed": true})
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .expect(200)

    const todo = await Todo.findById(response.body._id)
    expect(todo).not.toBeNull()
    expect(todo.completed).toBe(true)
})

test('Delete todo with a given ID', async() =>{
    await request(app)
    .delete('/todo/' + todoThreeId)
    .send()
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .expect(200)
})