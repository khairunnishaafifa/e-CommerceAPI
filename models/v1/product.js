const mongoose = require('mongoose')

const schema = mongoose.Schema

var productSchema = new schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    name: {
      type: String,
      required: [true, "It's required"],
    },
    description: String,
    merchant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
    },
    category: {
      type: String,
      enum: ['Other', 'Books', 'Fashion', 'Electronics', 'Grocery'],
      default: 'Other'
    },
    price: {
      type: Number,
      required: true
    },
    productPict: {
      type: String,
      required: true
    },
    stock: {
      type: Number,
      required: true
    }
  },
  {
    collection: 'products'
  }
)

var product = mongoose.model('product', productSchema);

module.exports = product