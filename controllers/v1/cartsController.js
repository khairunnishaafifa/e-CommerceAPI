const mongoose = require('mongoose')

const cart = require('../../models/v1/cart')
    , product = require('../../models/v1/product')
    , count = require('../../helpers/count')
    , { successResponse, errorResponse } = require('../../helpers/response')

exports.insertCart = async (req, res) => {

    var { product_id, quantity } = req.body

    var addCart = new cart({
        _id: new mongoose.Types.ObjectId(),
        customer_id: userId,
        product_id, quantity
    })

    var existProduct = await cart.findOne({ customer_id: userId, product_id })
    var stock = await product.findOne({ _id: product_id })

    if (existProduct) {

        var addQty = Number(existProduct.quantity) + Number(quantity)

        if (addQty > stock.stock) {
            return res.status(422).json(
                errorResponse('Insufficient stock')
            )
        }

        cart.findOneAndUpdate(
            { customer_id: userId, product_id },
            { quantity: addQty },
            { 'new': true, runValidators: true })
            .then(result => {
                return res.status(200).json(
                    successResponse('Product successfully added to Cart', result)
                )
            })
            .catch(err => {
                return res.status(422).json(
                    errorResponse('Request is not quite right', err.message, 422)
                )
            })
    } else {
        
        if (quantity > stock.stock) {
            return res.status(422).json(
                errorResponse('Insufficient stock')
            )
        }

        addCart.save()
            .then(result => {
                return res.status(201).json(
                    successResponse('Product successfully added to Cart', result)
                )
            })
            .catch(err => {
                return res.status(422).json(
                    errorResponse('Request is not quite right', err.message, 422)
                )
            })
    }
}

exports.getCart = (req, res) => {

    cart.find({ customer_id: userId })
        .populate({ path: 'product_id', select: 'name price' })
        .select('-__v')
        .then(cart => {

            if (cart.length === 0) {
                return res.status(404).json(
                    errorResponse('Your cart is currently empty', cart)
                )
            }

            var result = count.total(cart)

            return res.status(200).json(
                successResponse('Done', result)
            )
        })
}

exports.updateCart = async (req, res) => {

    var quantity = req.body.quantity

    cart.findOne({ _id: req.params.id })
        .then(result => {
            product.findOne({ _id: result.product_id })
                .then(stock => {
                    if (quantity > stock.stock) {
                        return res.status(422).json(
                            errorResponse('Insufficient stock')
                        )
                    }

                    cart.findOneAndUpdate(
                        { _id: req.params.id, customer_id: userId },
                        { quantity },
                        { 'new': true, runValidators: true })
                        .exec()
                        .then(() => {
                            return res.status(200).json(
                                successResponse('Cart updated successfully')
                            )
                        })
                        .catch(err => {
                            return res.status(422).json(
                                errorResponse('Request is not quite right', err.message, 422)
                            )
                        })
                })
        })
}

exports.deleteCart = (req, res) => {

    cart.findOneAndDelete({ _id: req.params.id, customer_id: userId })
        .exec()
        .then(() => {
            return res.status(200).json(
                successResponse('Cart deleted successfully')
            )
        })
}