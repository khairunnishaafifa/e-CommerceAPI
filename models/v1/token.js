const mongoose = require('mongoose')

const schema = mongoose.Schema

var tokenSchema = new schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'user'
        },
        token: {
            type: String,
            required: true
        }
    }
)

var token = mongoose.model('token', tokenSchema)

module.exports = token