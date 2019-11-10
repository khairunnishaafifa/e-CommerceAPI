const mongoose = require('mongoose')

const schema = mongoose.Schema

var orderSchema = new schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        customer_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'user'
        },
        detail_order: [{
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'detailOrder'
        }],
        total: {
            type: Number,
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        }
    },
    {
        collection: 'orders'
    }
)

var order = mongoose.model('order', orderSchema);

module.exports = order