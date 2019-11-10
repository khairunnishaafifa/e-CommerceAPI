const mongoose = require('mongoose')

const cart = require('../../models/v1/cart')
    , detailOrder = require('../../models/v1/detailOrder')
    , order = require('../../models/v1/order')
    , product = require('../../models/v1/product')
    , user = require('../../models/v1/user')
    , { successResponse, errorResponse } = require('../../helpers/response')

exports.createOrder = async (req, res) => {

    var userCart = await cart.find({ customer_id: userId })
        .populate({ path: 'product_id', select: 'name price' })
        .select('-__v')

    var length = userCart.length

    if (length === 0) {
        return res.status(404).json(
            errorResponse('Your cart is currently empty', userCart)
        )
    }

    var listCart = []
        , total = 0

    for (var i = 0; i < length; i++) {
        var { name, price, _id } = userCart[i].product_id
        var quantity = userCart[i].quantity

        var stock = await product.findOne(_id)

        if (quantity > stock.stock) {
            return res.status(422).json(
                errorResponse(`Insufficient stocks of ${name}`)
            )
        }

        var data = {
            _id: new mongoose.Types.ObjectId(),
            customer_id: userId,
            product_id: _id,
            quantity: quantity,
            price,
            subTotal: price * (quantity)
        }

        listCart.push(data)
        total += data.subTotal
    }

    var saveDetailOrder = await detailOrder.create(listCart)

    var detail_order = []
        , currentStock = 0

    for (var i = 0; i < length; i++) {
        detail_order.push(saveDetailOrder[i]._id)
        var { price, _id } = userCart[i].product_id

        stock = await product.findOne(_id)
        currentStock = Number(stock.stock) - Number(userCart[i].quantity)

        await product.findOneAndUpdate(
            { _id },
            { stock: currentStock },
            { new: true }
        )
    }

    var newOrder = new order({
        _id: new mongoose.Types.ObjectId(),
        customer_id: userId,
        detail_order, total,
    })

    await newOrder.save()
    await cart.deleteMany({ customer_id: userId })
    user.updateOne(
        { _id: userId },
        { $push: { listOrders: newOrder._id } }
    ).exec()
        .then(() => {
            return res.status(201).json(
                successResponse('Order success', newOrder)
            )
        })
}

exports.historyOrder = (req, res) => {
    order.find({ customer_id: userId })
        .populate('detail_order')
        .select('-__v')
        .then(order => {
            return res.status(200).json(
                successResponse('Done', order)
            )
        })
}