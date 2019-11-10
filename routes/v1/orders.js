const express = require('express')
    , router = express.Router()

const orderCtrl = require('../../controllers/v1/ordersControllers')
    , auth = require('../../middleware/auth')

router.route('/')
    .post(auth.isAuthenticated, orderCtrl.createOrder)
    .get(auth.isAuthenticated, orderCtrl.historyOrder)

module.exports = router