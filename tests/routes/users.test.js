const mongoose = require('mongoose')
    , chaiHttp = require('chai-http')
    , chai = require('chai')
    , fs = require('fs')
    , faker = require('faker')

const server = require('../../app')
    , user = require('../../models/v1/user')

const expect = chai.expect
chai.use(chaiHttp)

let token, username, resetToken
    , fakeToken = faker.random.uuid()
    , file = './public/images/nodejs.png'
    , wrongFile = './app.js'


describe('Register User', function () {

    before(done => {
        user.deleteMany({},
            { new: true }
        ).exec(() => {
            done()
        })
    })

    it("add user should show OK", function (done) {
        chai.request(server)
            .post('/users/signup')
            .send({
                username: 'khairunnishafifa',
                email: 'khairunnishaliyyafifa@gmail.com',
                password: 'Nasha1898;',
                role: 'Customer'
            })
            .end(function (err, res) {
                expect(res).to.have.status(201)
                expect(res).to.be.an('object')
                expect(res.body.success).to.be.true
                expect(res.body.message).to.be.a('string')
                expect(res.body.result).to.be.an('object')
                done()
            })
    })

    it("add user with exist email should show FAILED", function (done) {
        chai.request(server)
            .post('/users/signup')
            .send({
                username: 'khairunnisha',
                email: 'khairunnishaliyyafifa@gmail.com',
                password: 'Nasha1898;',
                role: 'Customer'
            })
            .end(function (err, res) {
                expect(res).to.have.status(409)
                expect(res).to.be.an('object')
                expect(res.body.success).to.be.false
                expect(res.body.message).to.be.a('string')
                done()
            })
    })

    it("add user with exist username should show FAILED", function (done) {
        chai.request(server)
            .post('/users/signup')
            .send({
                username: 'khairunnishafifa',
                email: 'khairunnishaliyy@gmail.com',
                password: 'Nasha1898;',
                role: 'Customer'
            })
            .end(function (err, res) {
                expect(res).to.have.status(422)
                expect(res).to.be.an('object')
                expect(res.body.success).to.be.false
                expect(res.body.message).to.be.a('string')
                done()
            })
    })

    it("add user with invalid format password should show FAILED", function (done) {
        chai.request(server)
            .post('/users/signup')
            .send({
                username: 'khairunnishafifa',
                email: 'khairunnishaliyy@gmail.com',
                password: 'nasha1898',
                role: 'Customer'
            })
            .end(function (err, res) {
                expect(res).to.have.status(422)
                expect(res).to.be.an('object')
                expect(res.body.success).to.be.false
                expect(res.body.message).to.be.a('string')
                done()
            })
    })

    it("add user with invalid format email should show FAILED", function (done) {
        chai.request(server)
            .post('/users/signup')
            .send({
                username: 'khairunnishafifa',
                email: 'khairunnishaliyy',
                password: 'Nasha1898;',
                role: 'Customer'
            })
            .end(function (err, res) {
                expect(res).to.have.status(422)
                expect(res).to.be.an('object')
                expect(res.body.success).to.be.false
                expect(res.body.message).to.be.a('string')
                done()
            })
    })

    it("add user with invalid format role should show FAILED", function (done) {
        chai.request(server)
            .post('/users/signup')
            .send({
                username: 'khairunnishafifa',
                email: 'khairunnishaliyy@gmail.com',
                password: 'Nasha1898;',
                role: 'User'
            })
            .end(function (err, res) {
                expect(res).to.have.status(422)
                expect(res).to.be.an('object')
                expect(res.body.success).to.be.false
                expect(res.body.message).to.be.a('string')
                done()
            })
    })
})

describe('Authentication User', function () {

    it("login should show OK", function (done) {
        chai.request(server)
            .post('/users/login')
            .send({
                username: 'khairunnishafifa',
                password: 'Nasha1898;'
            })
            .end(function (err, res) {
                token = res.header.authorization
                expect(res).to.have.status(200)
                expect(res).to.be.an('object')
                expect(res.body.success).to.be.true
                expect(res.body.message).to.be.a('string')
                expect(res.body.result).to.be.a('string')
                done()
            })
    })

    it("login with unregistered username should show FAILED", function (done) {
        chai.request(server)
            .post('/users/login')
            .send({
                username: 'khairunnishaafifa',
                password: 'Nasha1898;'
            })
            .end(function (err, res) {
                expect(res).to.have.status(404)
                expect(res).to.be.an('object')
                expect(res.body.message).to.be.a('string')
                done()
            })
    })

    it("login with wrong password should show FAILED", function (done) {
        chai.request(server)
            .post('/users/login')
            .send({
                username: 'khairunnishafifa',
                password: 'nasha18989'
            })
            .end(function (err, res) {
                expect(res).to.have.status(401)
                expect(res).to.be.an('object')
                expect(res.body.success).to.be.false
                expect(res.body.message).to.be.a('string')
                done()
            })
    })

    it("login with no password should show FAILED", function (done) {
        chai.request(server)
            .post('/users/login')
            .send({
                username: 'khairunnishafifa'
            })
            .end(function (err, res) {
                expect(res).to.have.status(500)
                expect(res).to.be.an('object')
                done()
            })
    })
})

describe('Get User', function () {

    it("get all user should show OK", function (done) {
        chai.request(server)
            .get('/users')
            .end(function (err, res) {
                username = res.body.result[0].username
                expect(res).to.have.status(200)
                expect(res).to.be.an('object')
                expect(res.body.success).to.be.true
                expect(res.body.message).to.be.a('string')
                expect(res.body.result).to.be.an('array')
                done()
            })
    })

    it("get one user should show OK", function (done) {
        chai.request(server)
            .get(`/users/uname/${username}`)
            .end(function (err, res) {
                expect(res).to.have.status(200)
                expect(res).to.be.an('object')
                expect(res.body.success).to.be.true
                expect(res.body.message).to.be.a('string')
                expect(res.body.result).to.be.an('object')
                done()
            })
    })

    it("show one user with unexisted username should show FAILED", function (done) {
        chai.request(server)
            .get(`/users/uname/who`)
            .end(function (err, res) {
                expect(res).to.have.status(404)
                expect(res).to.be.an('object')
                expect(res.body.success).to.be.false
                expect(res.body.message).to.be.a('string')
                done()
            })
    })

    it("get users by username should show OK", function (done) {
        chai.request(server)
            .get(`/users/search`)
            .send({
                username: "nisha"
            })
            .end(function (err, res) {
                expect(res).to.have.status(200)
                expect(res).to.be.an('object')
                expect(res.body.success).to.be.true
                expect(res.body.message).to.be.a('string')
                expect(res.body.result).to.be.an('array')
                done()
            })
    })

    it("get own profile should show OK", function (done) {
        chai.request(server)
            .get('/users/profile')
            .set('authorization', token)
            .end(function (err, res) {
                expect(res).to.have.status(200)
                expect(res).to.be.an('object')
                expect(res.body.success).to.be.true
                expect(res.body.message).to.be.a('string')
                expect(res.body.result).to.be.an('object')
                done()
            })
    })

    it("show own profile with invalid token should show FAILED", function (done) {
        chai.request(server)
            .get('/users/profile')
            .set('authorization', fakeToken)
            .end(function (err, res) {
                expect(res).to.have.status(403)
                expect(res).to.be.an('object')
                expect(res.body.message).to.be.a('string')
                done()
            })
    })

    it("show own profile without token should show FAILED", function (done) {
        chai.request(server)
            .get('/users/profile')
            .set('authorization', ``)
            .end(function (err, res) {
                expect(res).to.have.status(403)
                expect(res).to.be.an('object')
                expect(res.body.message).to.be.a('string')
                done()
            })
    })
})

describe('Update User', function () {

    it("update own profile should show OK", function (done) {
        chai.request(server)
            .put('/users/profile')
            .send({
                email: 'khairunnishaliyyafifa@gmail.com'
            })
            .set('authorization', token)
            .end(function (err, res) {
                expect(res).to.have.status(200)
                expect(res).to.be.an('object')
                expect(res.body.success).to.be.true
                expect(res.body.message).to.be.a('string')
                done()
            })
    })

    it("update own profile with invalid format email should show FAILED", function (done) {
        chai.request(server)
            .put('/users/profile')
            .send({
                email: 'khairunnishaliyyafifa'
            })
            .set('authorization', token)
            .end(function (err, res) {
                expect(res).to.have.status(422)
                expect(res).to.be.an('object')
                expect(res.body.success).to.be.false
                expect(res.body.message).to.be.a('string')
                done()
            })
    })

    it("update own profile with invalid format password should show FAILED", function (done) {
        chai.request(server)
            .put('/users/profile')
            .send({
                password: 'nasha'
            })
            .set('authorization', token)
            .end(function (err, res) {
                expect(res).to.have.status(422)
                expect(res).to.be.an('object')
                expect(res.body.success).to.be.false
                expect(res.body.message).to.be.a('string')
                done()
            })
    })

    it("update profile with invalid token should show FAILED", function (done) {
        chai.request(server)
            .put('/users/profile')
            .send({
                email: 'khairunnisha.afifa@gmail.com'
            })
            .set('authorization', fakeToken)
            .end(function (err, res) {
                expect(res).to.have.status(403)
                expect(res).to.be.an('object')
                expect(res.body.message).to.be.a('string')
                done()
            })
    })

    it("update profile without token should show FAILED", function (done) {
        chai.request(server)
            .put('/users/profile')
            .send({
                email: 'khairunnisha.afifa@gmail.com'
            })
            .set('authorization', ``)
            .end(function (err, res) {
                expect(res).to.have.status(403)
                expect(res).to.be.an('object')
                expect(res.body.message).to.be.a('string')
                done()
            })
    })

    it("update profile picture should show OK", function (done) {
        chai.request(server)
            .put('/users/profile/upload')
            .set('authorization', token)
            .attach('profPict', fs.readFileSync(`${file}`), 'nodejs.png')
            .end(function (err, res) {
                expect(res).to.have.status(200)
                expect(res).to.be.an('object')
                expect(res.body.success).to.be.true
                expect(res.body.message).to.be.a('string')
                done()
            })
    })

    it("update profile picture with wrong type of file should show FAILED", function (done) {
        chai.request(server)
            .put('/users/profile/upload')
            .set('authorization', token)
            .end(function (err, res) {
                expect(res).to.have.status(428)
                expect(res).to.be.an('object')
                expect(res.body.success).to.be.false
                expect(res.body.message).to.be.a('string')
                done()
            })
    })

    it("update profile picture with invalid token should show FAILED", function (done) {
        chai.request(server)
            .put('/users/profile/upload')
            .set('authorization', fakeToken)
            .end(function (err, res) {
                expect(res).to.have.status(403)
                expect(res).to.be.an('object')
                expect(res.body.message).to.be.a('string')
                done()
            })
    })

    it("update profile picture with wrong type file should show FAILED", function (done) {
        chai.request(server)
            .put('/users/profile/upload')
            .set('authorization', token)
            .attach('profPict', fs.readFileSync(`${wrongFile}`), 'app.js')
            .end(function (err, res) {
                expect(res).to.have.status(415)
                expect(res).to.be.an('object')
                expect(res.body.success).to.be.false
                expect(res.body.message).to.be.a('string')
                done()
            })
    })
})

describe('Reset Password', function () {
    
    it("send verification for reset password to email should show OK", function (done) {
        chai.request(server)
            .post('/users/reset-password')
            .send({
                email: 'khairunnishaliyyafifa@gmail.com'
            })
            .end(function (err, res) {
                resetToken = res.body.token
                expect(res).to.have.status(200)
                expect(res).to.be.an('object')
                expect(res.body.message).to.be.a('string')
                done()
            })
    })

    it("send verification for reset password to unexist email should show FAILED", function (done) {
        chai.request(server)
            .post('/users/reset-password')
            .send({
                email: 'khairunnishafifa@gmail.com'
            })
            .end(function (err, res) {
                expect(res).to.have.status(404)
                expect(res).to.be.an('object')
                expect(res.body.message).to.be.a('string')
                done()
            })
    })

    it("change password with invalid token should show FAILED", function (done) {
        chai.request(server)
            .put(`/users/reset/${fakeToken}`)
            .send({
                password: '1898Nasha;'
            })
            .end(function (err, res) {
                expect(res).to.have.status(401)
                expect(res).to.be.an('object')
                expect(res.body.message).to.be.a('string')
                done()
            })
    })

    it("change password should show OK", function (done) {
        chai.request(server)
            .put(`/users/reset/${resetToken}`)
            .send({
                password: '1898Nasha;'
            })
            .end(function (err, res) {
                expect(res).to.have.status(200)
                expect(res).to.be.an('object')
                expect(res.body.success).to.be.true
                expect(res.body.message).to.be.a('string')
                done()
            })
    })

    it("change password with invalid format password should show FAILED", function (done) {
        chai.request(server)
            .put(`/users/reset/${resetToken}`)
            .send({
                password: 'nasha'
            })
            .end(function (err, res) {
                expect(res).to.have.status(422)
                expect(res).to.be.an('object')
                expect(res.body.success).to.be.false
                expect(res.body.message).to.be.a('string')
                done()
            })
    })

    it("change password with used token should show FAILED", function (done) {
        chai.request(server)
            .put(`/users/reset/${resetToken}`)
            .send({
                password: '1898Nasha;'
            })
            .end(function (err, res) {
                expect(res).to.have.status(401)
                expect(res).to.be.an('object')
                expect(res.body.success).to.be.false
                expect(res.body.message).to.be.a('string')
                done()
            })
    })
})

describe('Delete User', function () {

    after(done => {
        mongoose.connection.db.dropDatabase()
        done()
    })

    it("it should delete own profile", function (done) {
        chai.request(server)
            .delete('/users/profile')
            .set('authorization', token)
            .end(function (err, res) {
                expect(res).to.have.status(200)
                expect(res).to.be.an('object')
                expect(res.body.success).to.be.true
                expect(res.body.message).to.be.a('string')
                done()
            })
    })

    it("delete profile with invalid token should show FAILED", function (done) {
        chai.request(server)
            .delete('/users/profile')
            .set('authorization', fakeToken)
            .end(function (err, res) {
                expect(res).to.have.status(403)
                expect(res).to.be.an('object')
                expect(res.body.message).to.be.a('string')
                done()
            })
    })
})