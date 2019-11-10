const mongoose = require('mongoose')
    , chaiHttp = require('chai-http')
    , chai = require('chai')
    , fs = require('fs')
    , faker = require('faker')

const server = require('../../app')
    , cart = require('../../models/v1/cart')
    , user = require('../../models/v1/user')

const expect = chai.expect
chai.use(chaiHttp)

let tokenMerc, tokenCust, productId, cartId
    , fakeToken = faker.random.uuid()
    , file = './public/images/nodejs.png'

describe('Preliminary', () => {

    before(done => {
        user.deleteMany({},
            { new: true }
        ).exec(() => {
            cart.deleteMany({},
                { new: true }
            ).exec(() => {
                done()
            })
        })
    })

    it("add user with role 'Merchant' should show OK", function (done) {
        chai.request(server)
            .post('/users/signup')
            .send({
                username: 'khairunnishafifa',
                email: faker.internet.email(),
                password: 'Nasha1898;',
                role: 'Merchant'
            })
            .end(function (err, res) {
                expect(res).to.have.status(201)
                expect(res).to.be.an('object')
                done()
            })
    })

    it("add user with role 'Customer' should show OK", function (done) {
        chai.request(server)
            .post('/users/signup')
            .send({
                username: 'customer',
                email: faker.internet.email(),
                password: 'Nasha1898;',
                role: 'Customer'
            })
            .end(function (err, res) {
                expect(res).to.have.status(201)
                expect(res).to.be.an('object')
                done()
            })
    })

    it("log in user with role 'Merchant' should show OK", function (done) {
        chai.request(server)
            .post('/users/login')
            .send({
                username: 'khairunnishafifa',
                password: 'Nasha1898;'
            })
            .end(function (err, res) {
                tokenMerc = res.header.authorization
                expect(res).to.have.status(200)
                expect(res).to.be.an('object')
                done()
            })
    })

    it("log in user with role 'Customer' should show OK", function (done) {
        chai.request(server)
            .post('/users/login')
            .send({
                username: 'customer',
                password: 'Nasha1898;'
            })
            .end(function (err, res) {
                tokenCust = res.header.authorization
                expect(res).to.have.status(200)
                expect(res).to.be.an('object')
                done()
            })
    })

    it("add product should show OK", function (done) {
        chai.request(server)
            .post('/products/add')
            .field({
                name: faker.commerce.productName() ,
                category: 'Grocery',
                price: faker.commerce.price(),
                stock: '24'
            })
            .attach('productPict', fs.readFileSync(`${file}`), 'nodejs.png')
            .set('authorization', tokenMerc)
            .end(function (err, res) {
                productId = res.body.result._id
                expect(res).to.have.status(201)
                expect(res).to.be.an('object')
                done()
            })
    })
})

describe('Insert Product To Cart', () => {

    it("insert product to cart with invalid format of quantity should show FAILED", function (done) {
        chai.request(server)
            .post('/carts')
            .send({
                product_id: productId,
                quantity: faker.random.word()
            })
            .set('authorization', tokenCust)
            .end(function (err, res) {
                expect(res).to.have.status(422)
                expect(res).to.be.an('object')
                expect(res.body.success).to.be.false
                expect(res.body.message).to.be.a('string')
                done()
            })
    })

    it("insert product to cart if value of quantity more than value of stock should show FAILED", function (done) {
        chai.request(server)
            .post('/carts')
            .send({
                product_id: productId,
                quantity: '25'
            })
            .set('authorization', tokenCust)
            .end(function (err, res) {
                expect(res).to.have.status(422)
                expect(res).to.be.an('object')
                expect(res.body.success).to.be.false
                expect(res.body.message).to.be.a('string')
                done()
            })
    })

    it("insert product to cart should show OK", function (done) {
        chai.request(server)
            .post('/carts')
            .send({
                product_id: productId,
                quantity: '5'
            })
            .set('authorization', tokenCust)
            .end(function (err, res) {
                cartId = res.body.result._id
                expect(res).to.have.status(201)
                expect(res).to.be.an('object')
                expect(res.body.success).to.be.true
                expect(res.body.message).to.be.a('string')
                expect(res.body.result).to.be.an('object')
                done()
            })
    })

    it("insert same product to cart should show OK", function (done) {
        chai.request(server)
            .post('/carts')
            .send({
                product_id: productId,
                quantity: '10'
            })
            .set('authorization', tokenCust)
            .end(function (err, res) {
                cartId = res.body.result._id
                expect(res).to.have.status(200)
                expect(res).to.be.an('object')
                expect(res.body.success).to.be.true
                expect(res.body.message).to.be.a('string')
                expect(res.body.result).to.be.an('object')
                done()
            })
    })

    it("insert product to cart without token should show FAILED", function (done) {
        chai.request(server)
            .post('/carts')
            .send({
                product_id: productId,
                quantity: '5'
            })
            .set('authorization', `Bearer ${fakeToken}`)
            .end(function (err, res) {
                expect(res).to.have.status(403)
                expect(res).to.be.an('object')
                expect(res.body.message).to.be.a('string')
                done()
            })
    })

    it("insert product to cart with invalid token should show FAILED", function (done) {
        chai.request(server)
            .post('/carts')
            .send({
                product_id: productId,
                quantity: '5'
            })
            .set('authorization', fakeToken)
            .end(function (err, res) {
                expect(res).to.have.status(403)
                expect(res).to.be.an('object')
                expect(res.body.message).to.be.a('string')
                done()
            })
    })

    it("insert product to cart if value of quantity more than value of stock should show FAILED", function (done) {
        chai.request(server)
            .post('/carts')
            .send({
                product_id: productId,
                quantity: '25'
            })
            .set('authorization', tokenCust)
            .end(function (err, res) {
                expect(res).to.have.status(422)
                expect(res).to.be.an('object')
                expect(res.body.success).to.be.false
                expect(res.body.message).to.be.a('string')
                done()
            })
    })

    it("insert product to cart with invalid format of quantity should show FAILED", function (done) {
        chai.request(server)
            .post('/carts')
            .send({
                product_id: productId,
                quantity: faker.random.word()
            })
            .set('authorization', tokenCust)
            .end(function (err, res) {
                expect(res).to.have.status(422)
                expect(res).to.be.an('object')
                expect(res.body.success).to.be.false
                expect(res.body.message).to.be.a('string')
                done()
            })
    })
})

describe('Get Cart', () => {

    it("show cart should show OK", function (done) {
        chai.request(server)
            .get('/carts')
            .set('authorization', tokenCust)
            .end(function (err, res) {
                expect(res).to.have.status(200)
                expect(res).to.be.an('object')
                expect(res.body.success).to.be.true
                expect(res.body.message).to.be.a('string')
                expect(res.body.result).to.be.an('object')
                done()
            })
    })

    it("show cart without token should show FAILED", function (done) {
        chai.request(server)
            .get('/carts')
            .set('authorization', '')
            .end(function (err, res) {
                expect(res).to.have.status(403)
                expect(res).to.be.an('object')
                expect(res.body.message).to.be.a('string')
                done()
            })
    })

    it("show cart with invalid token should show FAILED", function (done) {
        chai.request(server)
            .get('/carts')
            .set('authorization', fakeToken)
            .end(function (err, res) {
                expect(res).to.have.status(403)
                expect(res).to.be.an('object')
                expect(res.body.message).to.be.a('string')
                done()
            })
    })

})

describe('Update Cart', () => {

    it("update cart should show OK", function (done) {
        chai.request(server)
            .put(`/carts/id/${cartId}`)
            .send({
                quantity: '10'
            })
            .set('authorization', tokenCust)
            .end(function (err, res) {
                expect(res).to.have.status(200)
                expect(res).to.be.an('object')
                expect(res.body.success).to.be.true
                expect(res.body.message).to.be.a('string')
                done()
            })
    })

    it("update cart with value of quantity more than value of stock should show FAILED", function (done) {
        chai.request(server)
            .put(`/carts/id/${cartId}`)
            .send({
                quantity: '25'
            })
            .set('authorization', tokenCust)
            .end(function (err, res) {
                expect(res).to.have.status(422)
                expect(res).to.be.an('object')
                expect(res.body.success).to.be.false
                expect(res.body.message).to.be.a('string')
                done()
            })
    })

    it("update cart with invalid format of quantity should show FAILED", function (done) {
        chai.request(server)
            .put(`/carts/id/${cartId}`)
            .send({
                quantity: faker.random.word()
            })
            .set('authorization', tokenCust)
            .end(function (err, res) {
                expect(res).to.have.status(422)
                expect(res).to.be.an('object')
                expect(res.body.success).to.be.false
                expect(res.body.message).to.be.a('string')
                done()
            })
    })

    it("update cart without token should show FAILED", function (done) {
        chai.request(server)
            .put(`/carts/id/${cartId}`)
            .send({
                quantity: '10'
            })
            .set('authorization', '')
            .end(function (err, res) {
                expect(res).to.have.status(403)
                expect(res).to.be.an('object')
                expect(res.body.message).to.be.a('string')
                done()
            })
    })

    it("update cart with invalid token should show FAILED", function (done) {
        chai.request(server)
            .put(`/carts/id/${cartId}`)
            .send({
                quantity: '10'
            })
            .set('authorization', fakeToken)
            .end(function (err, res) {
                expect(res).to.have.status(403)
                expect(res).to.be.an('object')
                expect(res.body.message).to.be.a('string')
                done()
            })
    })

})

describe('Delete Cart', () => {

    it("delete cart should show OK", function (done) {
        chai.request(server)
            .delete(`/carts/id/${cartId}`)
            .set('authorization', tokenCust)
            .end(function (err, res) {
                expect(res).to.have.status(200)
                expect(res).to.be.an('object')
                expect(res.body.success).to.be.true
                expect(res.body.message).to.be.a('string')
                done()
            })
    })

    it("delete cart without token should show FAILED", function (done) {
        chai.request(server)
            .delete(`/carts/id/${cartId}`)
            .set('authorization', '')
            .end(function (err, res) {
                expect(res).to.have.status(403)
                expect(res).to.be.an('object')
                expect(res.body.message).to.be.a('string')
                done()
            })
    })

    it("delete cart with invalid token should show FAILED", function (done) {
        chai.request(server)
            .delete(`/carts/id/${cartId}`)
            .set('authorization', fakeToken)
            .end(function (err, res) {
                expect(res).to.have.status(403)
                expect(res).to.be.an('object')
                expect(res.body.message).to.be.a('string')
                done()
            })
    })
})

describe('Get Empty Cart', () => {

    after(done => {
        mongoose.connection.db.dropDatabase()
        done()
    })

    it("show empty cart should show FAILED", function (done) {
        chai.request(server)
            .get('/carts')
            .set('authorization', tokenCust)
            .end(function (err, res) {
                expect(res).to.have.status(404)
                expect(res).to.be.an('object')
                expect(res.body.success).to.be.false
                expect(res.body.message).to.be.a('string')
                done()
            })
    })
})