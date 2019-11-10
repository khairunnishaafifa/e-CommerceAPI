const express = require('express')
    , router = express.Router()
    , cloudinaryConfig = require('../../config/cloudinaryConfig')

const productsCtrl = require('../../controllers/v1/productsControllers')
    , auth = require('../../middleware/auth')
    , upload = require('../../middleware/multer')

router.use('*', cloudinaryConfig)

router.route('/add')
    .post(auth.isAuthenticated, upload.single('productPict'), productsCtrl.addProduct)

router.route('/')
    .get(productsCtrl.getProducts)

router.route('/search')
    .get(productsCtrl.findProducts)

router.route('/id/:id')
    .get(productsCtrl.findProductById)
    .put(auth.isAuthenticated, productsCtrl.updateProduct)
    .delete(auth.isAuthenticated, productsCtrl.deleteProduct)

router.route('/merchant/:id')
    .get(productsCtrl.findProductByMerchant)

router.route('/pict/:id')
    .put(auth.isAuthenticated, upload.single('productPict'), productsCtrl.updateProductPict)

module.exports = router