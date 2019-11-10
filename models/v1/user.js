const mongoose = require('mongoose')
    , uniqueValidator = require('mongoose-unique-validator')
    , immutablePlugin = require('mongoose-immutable-plugin')
    , bcrypt = require('bcryptjs')
const saltRounds = 10;

const schema = mongoose.Schema

var userSchema = new schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    username: {
      type: String,
      unique: [true, "Not avalaible"],
      required: [true, "It's required"],
      lowercase: true,
      immutable: true,
      validate: [
        function(username) {
          return /^\S*$/.test(username)
        },
        'Username cannot contain spaces'
      ]
    },
    email: {
      type: String,
      required: [true, "It's required"],
      unique: true,
      lowercase: true,
      validate: [
        function (email) {
            return /^[a-zA-Z0-9.!#$%&’*+\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email)
        },
        'Email should contain @mail.com'
      ]
    },
    password: {
      type: String,
      required: true,
      validate: [
        function (password) {
          return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,30}$/.test(password)
        },
        'Password should contain at least one uppercase and lowercase letter, one number digit, and one special character. Password must be between 8 and 30 characters.'
      ]
    },
    profPict: {
      type: String,
      default: 'https://res.cloudinary.com/khairunnishafifa/image/upload/v1568441110/eCommerceApps/user-icon-jpg-18_k9fibo.jpg'
    },
    role: {
      type: String,
      enum: ['Merchant', 'Customer'],
      immutable: true,
      required: true
    },
    listProducts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'product'
    }],
    listOrders: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'historyOrder'
    }]
  },
  {
    collection: 'users'
  }
)

userSchema.pre('save', function (next) {
  this.password = bcrypt.hashSync(this.password, saltRounds);
  next()
})

userSchema.plugin(immutablePlugin, { message: 'Error, expected {PATH} cant be modify.' })
userSchema.plugin(uniqueValidator, { message: 'Error, expected {PATH} to be unique.' })
var user = mongoose.model('user', userSchema);

module.exports = user