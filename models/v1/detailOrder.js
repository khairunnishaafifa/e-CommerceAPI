const mongoose = require('mongoose')

const schema = mongoose.Schema

var detailOrderSchema = new schema(
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
        price: {
            type: Number,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        subTotal: {
            type: Number,
            required: true
        }
    },
    {
        collection: 'detailOrders'
    }
)

var detailOrder = mongoose.model('detailOrder', detailOrderSchema);

module.exports = detailOrder