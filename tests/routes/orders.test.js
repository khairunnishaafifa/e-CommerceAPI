const mongoose = require('mongoose')
    , chaiHttp = require('chai-http')
    , chai = require('chai')
    , fs = require('fs')
    , faker = require('faker')

const server = require('../../app')
    , user = require('../../models/v1/user')

const expect = chai.expect
chai.use(chaiHttp)

let tokenMerc, tokenCust, productId, cartId
    , fakeToken = faker.random.uuid()
    , file = './public/images/nodejs.png'

describe('Preliminary', () => {

    before(done => {
        user.deleteMany({})
            .then(() => {
                done()
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
                name: faker.commerce.productName(),
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
                done()
            })
    })
})

describe('Create Order', () => {

    it("create order should show OK", function (done) {
        chai.request(server)
            .post('/orders')
            .set('authorization', tokenCust)
            .end(function (err, res) {
                expect(res).to.have.status(201)
                expect(res).to.be.an('object')
                expect(res.body.success).to.be.true
                expect(res.body.message).to.be.a('string')
                expect(res.body.result).to.be.an('object')
                done()
            })
    })

    it("insert product to cart should show OK", function (done) {
        chai.request(server)
            .post('/carts')
            .send({
                product_id: productId,
                quantity: '10'
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

    it("update quantity of product should show OK", function (done) {
        chai.request(server)
            .put(`/products/id/${productId}`)
            .send({
                stock: '1'
            })
            .set('authorization', tokenMerc)
            .end(function (err, res) {
                expect(res).to.have.status(200)
                expect(res).to.be.an('object')
                expect(res.body.success).to.be.true
                expect(res.body.message).to.be.a('string')
                done()
            })
    })

    it("create order with insufficient stocks of product should show FAILED", function (done) {
        chai.request(server)
            .post('/orders')
            .set('authorization', tokenCust)
            .end(function (err, res) {
                expect(res).to.have.status(422)
                expect(res).to.be.an('object')
                expect(res.body.success).to.be.false
                expect(res.body.message).to.be.a('string')
                done()
            })
    })

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

    it("create order when cart is empty should show FAILED", function (done) {
        chai.request(server)
            .post('/orders')
            .set('authorization', tokenCust)
            .end(function (err, res) {
                expect(res).to.have.status(404)
                expect(res).to.be.an('object')
                expect(res.body.success).to.be.false
                expect(res.body.message).to.be.a('string')
                done()
            })
    })

    it("create order without token should show FAILED", function (done) {
        chai.request(server)
            .post('/orders')
            .set('authorization', '')
            .end(function (err, res) {
                expect(res).to.have.status(403)
                expect(res).to.be.an('object')
                expect(res.body.message).to.be.a('string')
                done()
            })
    })

    it("create order with invalid token should show FAILED", function (done) {
        chai.request(server)
            .post('/orders')
            .set('authorization', fakeToken)
            .end(function (err, res) {
                expect(res).to.have.status(403)
                expect(res).to.be.an('object')
                expect(res.body.message).to.be.a('string')
                done()
            })
    })

})

describe('Get History Order', () => {

    after(done => {
        mongoose.connection.db.dropDatabase()
        done()
    })

    it("show history order should show OK", function (done) {
        chai.request(server)
            .get('/orders')
            .set('authorization', tokenCust)
            .end(function (err, res) {
                expect(res).to.have.status(200)
                expect(res).to.be.an('object')
                expect(res.body.success).to.be.true
                expect(res.body.message).to.be.a('string')
                expect(res.body.result).to.be.an('array')
                done()
            })
    })

    it("show history order without token should show FAILED", function (done) {
        chai.request(server)
            .get('/orders')
            .set('authorization', '')
            .end(function (err, res) {
                expect(res).to.have.status(403)
                expect(res).to.be.an('object')
                expect(res.body.message).to.be.a('string')
                done()
            })
    })

    it("show history order with invalid token should show FAILED", function (done) {
        chai.request(server)
            .get('/orders')
            .set('authorization', fakeToken)
            .end(function (err, res) {
                expect(res).to.have.status(403)
                expect(res).to.be.an('object')
                expect(res.body.message).to.be.a('string')
                done()
            })
    })
})
