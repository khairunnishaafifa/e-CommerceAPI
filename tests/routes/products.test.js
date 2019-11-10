const mongoose = require('mongoose')
    , chaiHttp = require('chai-http')
    , chai = require('chai')
    , fs = require('fs')
    , faker = require('faker')

const server = require('../../app')
    , product = require('../../models/v1/product')

const expect = chai.expect
chai.use(chaiHttp)

let token, tokenCust, productId, merchantId
    , fakeToken = faker.random.uuid()
    , file = './public/images/nodejs.png'
    , wrongFile = './app.js'


describe('Add Products By Merchant', () => {

    before(done => {
        chai.request(server)
            .post('/users/signup')
            .send({
                username: 'khairunnishafifa',
                email: faker.internet.email(),
                password: 'Nasha1898;',
                role: 'Merchant'
            })
            .end(() => {
                product.deleteMany({},
                    { new: true }
                ).exec(() => {
                    done()
                })
            })
    })

    beforeEach(done => {
        chai.request(server)
            .post('/users/login')
            .send({
                username: 'khairunnishafifa',
                password: 'Nasha1898;',
            })
            .end((err, res) => {
                token = res.header.authorization
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
            .set('authorization', token)
            .end(function (err, res) {
                merchantId = res.body.result.merchant_id
                expect(res).to.have.status(201)
                expect(res).to.be.an('object')
                expect(res.body.success).to.be.true
                expect(res.body.message).to.be.a('string')
                expect(res.body.result).to.be.an('object')
                done()
            })
    })

    it("add product with invalid format of category should show FAILED", function (done) {
        chai.request(server)
            .post('/products/add')
            .field({
                name: faker.commerce.productName(),
                category: 'Unknown',
                price: faker.commerce.price(),
                stock: '24'
            })
            .attach('productPict', fs.readFileSync(`${file}`), 'nodejs.png')
            .set('authorization', token)
            .end(function (err, res) {
                expect(res).to.have.status(422)
                expect(res).to.be.an('object')
                expect(res.body.success).to.be.false
                expect(res.body.message).to.be.a('string')
                done()
            })
    })

    it("add product with wrong type file should show FAILED", function (done) {
        chai.request(server)
            .post('/products/add')
            .field({
                name: faker.commerce.productName(),
                category: 'Other',
                price: faker.commerce.price(),
                stock: '24'
            })
            .attach('productPict', fs.readFileSync(`${wrongFile}`), 'app.js')
            .set('authorization', token)
            .end(function (err, res) {
                expect(res).to.have.status(415)
                expect(res).to.be.an('object')
                expect(res.body.success).to.be.false
                expect(res.body.message).to.be.a('string')
                done()
            })
    })

    it("add product without photo should show FAILED", function (done) {
        chai.request(server)
            .post('/products/add')
            .field({
                name: faker.commerce.productName(),
                category: 'Grocery',
                price: faker.commerce.price(),
                stock: '24'
            })
            .set('authorization', token)
            .end(function (err, res) {
                expect(res).to.have.status(428)
                expect(res).to.be.an('object')
                expect(res.body.success).to.be.false
                expect(res.body.message).to.be.a('string')
                done()
            })
    })

    it("add product with invalid token should show FAILED", function (done) {
        chai.request(server)
            .post('/products/add')
            .field({
                name: faker.commerce.productName(),
                category: 'Grocery',
                price: faker.commerce.price(),
                stock: '24'
            })
            .attach('productPict', fs.readFileSync(`${file}`), 'nodejs.png')
            .set('authorization', ``)
            .end(function (err, res) {
                expect(res).to.have.status(403)
                expect(res).to.be.an('object')
                expect(res.body.message).to.be.a('string')
                done()
            })
    })
})

describe('Add Products By Customer', () => {

    before(done => {
        chai.request(server)
            .post('/users/signup')
            .send({
                username: 'customer',
                email: faker.internet.email(),
                password: 'Nasha1898;',
                role: 'Customer'
            })
            .end(() => {
                done()
            })
    })

    beforeEach(done => {
        chai.request(server)
            .post('/users/login')
            .send({
                username: 'customer',
                password: 'Nasha1898;',
            })
            .end((err, res) => {
                tokenCust = res.header.authorization
                done()
            })
    })

    it("add product should show FAILED", function (done) {
        chai.request(server)
            .post('/products/add')
            .field({
                name: faker.commerce.productName(),
                category: 'Grocery',
                price: faker.commerce.price(),
                stock: '24'
            })
            .attach('productPict', fs.readFileSync(`${file}`), 'nodejs.png')
            .set('authorization', tokenCust)
            .end(function (err, res) {
                expect(res).to.have.status(401)
                expect(res).to.be.an('object')
                expect(res.body.success).to.be.false
                expect(res.body.message).to.be.a('string')
                done()
            })
    })
})

describe('Get Products', () => {

    it("get all products should show OK", function (done) {
        chai.request(server)
            .get('/products')
            .end(function (err, res) {
                productId = res.body.result[0]._id
                expect(res).to.have.status(200)
                expect(res).to.be.an('object')
                expect(res.body.success).to.be.true
                expect(res.body.message).to.be.a('string')
                expect(res.body.result).to.be.an('array')
                done()
            })
    })

    it("find products by name should show OK", function (done) {
        chai.request(server)
            .get('/products/search')
            .send({
                name: faker.name.firstName()
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

    it("find products by ID should show OK", function (done) {
        chai.request(server)
            .get(`/products/id/${productId}`)
            .end(function (err, res) {
                expect(res).to.have.status(200)
                expect(res).to.be.an('object')
                expect(res.body.success).to.be.true
                expect(res.body.message).to.be.a('string')
                expect(res.body.result).to.be.an('object')
                done()
            })
    })

    it("find products by unexist ID should show FAILED", function (done) {
        chai.request(server)
            .get(`/products/id/abc`)
            .end(function (err, res) {
                expect(res).to.have.status(404)
                expect(res).to.be.an('object')
                expect(res.body.success).to.be.false
                expect(res.body.message).to.be.a('string')
                done()
            })
    })

    it("find products by merchant should show OK", function (done) {
        chai.request(server)
            .get(`/products/merchant/${merchantId}`)
            .end(function (err, res) {
                expect(res).to.have.status(200)
                expect(res).to.be.an('object')
                expect(res.body.success).to.be.true
                expect(res.body.message).to.be.a('string')
                expect(res.body.result).to.be.an('object')
                done()
            })
    })

    it("find products with unexisted merchant ID should show FAILED", function (done) {
        chai.request(server)
            .get(`/products/merchant/abc`)
            .end(function (err, res) {
                expect(res).to.have.status(404)
                expect(res).to.be.an('object')
                expect(res.body.success).to.be.false
                expect(res.body.message).to.be.a('string')
                done()
            })
    })
})

describe('Update Product', function () {

    it("update product should show OK", function (done) {
        chai.request(server)
            .put(`/products/id/${productId}`)
            .send({
                name: faker.commerce.productName()
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

    it("update product by customers should show FAILED", function (done) {
        chai.request(server)
            .put(`/products/id/${productId}`)
            .send({
                name: faker.commerce.productName()
            })
            .set('authorization', tokenCust)
            .end(function (err, res) {
                expect(res).to.have.status(401)
                expect(res).to.be.an('object')
                expect(res.body.success).to.be.false
                expect(res.body.message).to.be.a('string')
                done()
            })
    })

    it("update product with invalid format should show FAILED", function (done) {
        chai.request(server)
            .put(`/products/id/${productId}`)
            .send({
                price: faker.random.word()
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

    it("update product with invalid token should show FAILED", function (done) {
        chai.request(server)
            .put(`/products/id/${productId}`)
            .send({
                name: faker.commerce.productName()
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
            .put(`/products/id/${productId}`)
            .send({
                name: faker.commerce.productName()
            })
            .set('authorization', ``)
            .end(function (err, res) {
                expect(res).to.have.status(403)
                expect(res).to.be.an('object')
                expect(res.body.message).to.be.a('string')
                done()
            })
    })

    it("update product picture should show OK", function (done) {
        chai.request(server)
            .put(`/products/pict/${productId}`)
            .set('authorization', token)
            .attach('productPict', fs.readFileSync(`${file}`), 'nodejs.png')
            .end(function (err, res) {
                expect(res).to.have.status(200)
                expect(res).to.be.an('object')
                expect(res.body.success).to.be.true
                expect(res.body.message).to.be.a('string')
                done()
            })
    })

    it("update product picture by customers should show FAILED", function (done) {
        chai.request(server)
            .put(`/products/pict/${productId}`)
            .set('authorization', tokenCust)
            .attach('productPict', fs.readFileSync(`${file}`), 'nodejs.png')
            .end(function (err, res) {
                expect(res).to.have.status(401)
                expect(res).to.be.an('object')
                expect(res.body.success).to.be.false
                expect(res.body.message).to.be.a('string')
                done()
            })
    })

    it("update product picture with no file should show FAILED", function (done) {
        chai.request(server)
            .put(`/products/pict/${productId}`)
            .set('authorization', token)
            .end(function (err, res) {
                expect(res).to.have.status(428)
                expect(res).to.be.an('object')
                expect(res.body.success).to.be.false
                expect(res.body.message).to.be.a('string')
                done()
            })
    })

    it("update product picture with invalid token should show FAILED", function (done) {
        chai.request(server)
            .put(`/products/pict/${productId}`)
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
            .put(`/products/pict/${productId}`)
            .set('authorization', token)
            .attach('productPict', fs.readFileSync(`${wrongFile}`), 'app.js')
            .end(function (err, res) {
                expect(res).to.have.status(415)
                expect(res).to.be.an('object')
                expect(res.body.success).to.be.false
                expect(res.body.message).to.be.a('string')
                done()
            })
    })
})

describe('Delete Product', function () {

    after(done => {
        mongoose.connection.db.dropDatabase()
        done()
    })

    it("delete product should show OK", function (done) {
        chai.request(server)
            .delete(`/products/id/${productId}`)
            .set('authorization', token)
            .end(function (err, res) {
                expect(res).to.have.status(200)
                expect(res).to.be.an('object')
                expect(res.body.success).to.be.true
                expect(res.body.message).to.be.a('string')
                done()
            })
    })

    it("delete product by customers should show FAILED", function (done) {
        chai.request(server)
            .delete(`/products/id/${productId}`)
            .set('authorization', tokenCust)
            .end(function (err, res) {
                expect(res).to.have.status(401)
                expect(res).to.be.an('object')
                expect(res.body.success).to.be.false
                expect(res.body.message).to.be.a('string')
                done()
            })
    })

    it("delete product with invalid token should show FAILED", function (done) {
        chai.request(server)
            .delete(`/products/id/${productId}`)
            .set('authorization', fakeToken)
            .end(function (err, res) {
                expect(res).to.have.status(403)
                expect(res).to.be.an('object')
                expect(res.body.message).to.be.a('string')
                done()
            })
    })
})