const request = require('supertest')
const app = require('../src/app')
const Comment = require('../src/model/comment')
const {
    userOneId,
    userOne,
    userTwoId,
    userTwo,
    postOne,
    postOneId,
    setUpDBForTest
} = require('./fixtures/db')

beforeEach(setUpDBForTest)

test('Should comment on a post', async ()=>{
    const response = await request(app)
    .post('/comment/post/' + postOneId)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
        'comment' : 'Comment from test'
    })
    .expect(201)

    const comment = await Comment.findById(response.body._id)
    expect(comment.comment).toBe('Comment from test')
})