const request = require('supertest')
const app = require('../src/app')
const User = require('../src/model/user')
const { userOne, setUpDBForTest } = require('./fixtures/db')

beforeEach(setUpDBForTest)

test('Sign up user', async ()=>{
    const response = await request(app)
    .post('/user')
    .send({
        name: 'New',
        email: 'new@gmail.com',
        username: 'new123',
        phone: '1234567890',
        address: 'earth',
        password: 'pass@1234'
    })
    .expect(201)

    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()
    expect(response.body).toMatchObject({
        user: {
            name: 'New',
            email: 'new@gmail.com',
            username: 'new123',
            phone: '1234567890',
            address: 'earth'
        },
        token: user.tokens[0].token
    })
    expect(user.password).not.toBe('pass@1234')
})

test('login user', async ()=>{
    const response = await request(app)
    .post('/login')
    .send({
        email: userOne.email,
        password: userOne.password
    })
    .expect(200)

    const user = await User.findById(response.body.user._id)
    expect(response.body.token).toBe(user.tokens[1].token)
})

test('login user fail', async ()=>{
    await request(app)
    .post('/login')
    .send({
        email: userOne.email,
        password: "1234"
    })
    .expect(500)
})

test('logout user', async ()=>{
    await request(app)
    .post('/logout')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
})

test('Get other users profile details', async() =>{
    await request(app)
    .get('/users')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
})

test('Get other users profile details with pagination, sorting & filter', async() =>{
    const response = await request(app)
    .get('/users?sortBy=name&sortOrder=asc&page=1&perPage=1&title=test')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

    expect(response.body.length).toBe(1)
})