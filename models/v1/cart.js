const mongoose = require('mongoose')

const schema = mongoose.Schema

var cartSchema = new schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        customer_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'user'
        },
        product_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'product'
        },
        quantity: {
            type: Number,
            default: '1'
        }
    },
    {
        collection: 'carts'
    }
)

var cart = mongoose.model('cart', cartSchema);

module.exports = cart