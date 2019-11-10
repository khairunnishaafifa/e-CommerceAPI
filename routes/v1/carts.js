const express = require('express')
    , router = express.Router()

const cartsCtrl = require('../../controllers/v1/cartsController')
    , auth = require('../../middleware/auth')

router.route('/')
    .post(auth.isAuthenticated, cartsCtrl.insertCart)
    .get(auth.isAuthenticated, cartsCtrl.getCart)

router.route('/id/:id')
    .put(auth.isAuthenticated, cartsCtrl.updateCart)
    .delete(auth.isAuthenticated, cartsCtrl.deleteCart)

module.exports = router