const request = require('supertest')
const app = require('../src/app')
const Post = require('../src/model/post')
const {
    userOneId,
    userOne,
    userTwoId,
    userTwo,
    postOne,
    postOneId,
    postTwo,
    postTwoId,
    postThree,
    postThreeId,
    setUpDBForTest
} = require('./fixtures/db')

beforeEach(setUpDBForTest)

test('Should create a post', async ()=>{
    const response = await request(app)
    .post('/post')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        'title' : 'post from test',
        'body' : 'Demo body'
    })
    .expect(201)

    const post = await Post.findById(response.body._id)
    expect(post).not.toBeNull()
    expect(response.body).toMatchObject({
        'title' : 'post from test',
        'body' : 'Demo body'
    })
})

test('Get all posts with pagination, sorting & keyword filter', async() =>{
    const response = await request(app)
    .get('/posts?sortBy=title&sortOrder=asc&page=1&perPage=1&keyword=first')
    .send()
    .expect(200)

    expect(response.body.length).toBe(1)
})

test('Get all posts with userId filter', async() =>{
    const response = await request(app)
    .get('/posts?userId=' + userOneId)
    .send()
    .expect(200)

    expect(response.body.length).toBe(2)
})

test('Get post with a given ID', async() =>{
    const response = await request(app)
    .get('/post/' + postTwoId)
    .send()
    .expect(200)

    expect(response.body).not.toBeNull()
})