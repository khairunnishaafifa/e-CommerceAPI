const mongoose = require('mongoose')
    , bcrypt = require('bcryptjs')
    , jwt = require('jsonwebtoken')
    , multer = require('multer')
    , cloudinary = require('cloudinary')
    , datauri = require('datauri')

const user = require('../../models/v1/user')
    , Token = require('../../models/v1/token')
    , { successResponse, errorResponse } = require('../../helpers/response')
    , { sendVerification } = require('../../services/nodemailer')

exports.registerUser = async (req, res) => {

    var { username, email, password, role } = req.body

    var userExist = await user.findOne(
        { email }
    )

    if (userExist) {
        return res.status(409).json(
            errorResponse('User already registered')
        )
    }

    var newUser = new user({
        _id: new mongoose.Types.ObjectId(),
        username, email, password, role
    })

    newUser.save()
        .then(result => {
            return res.status(201).json(
                successResponse('User successfully saved',
                    res = {
                        username: result.username,
                        email: result.email,
                    })
            )
        })
        .catch(err => {
            return res.status(422).json(
                errorResponse('Request is not quite right', err.message, 422)
            )
        })
}

exports.authentication = async (req, res, next) => {

    const userExist = await user.findOne({
        username: req.body.username
    })

    if (!userExist) {
        return res.status(404).json({
            message: 'User not registered'
        })
    }

    const data = {
        _id: userExist._id,
        role: userExist.role
    }

    bcrypt.compare(req.body.password, userExist.password)
        .then((result) => {

            if (result) {
                var token = jwt.sign(data, process.env.SECRET_KEY, {
                    algorithm: 'HS256',
                    expiresIn: "900000"
                })

                res.setHeader('Authorization', `Bearer ${token}`)

                return res.status(200).json(
                    successResponse('Login success', token)
                )
            } else {
                return res.status(401).json(
                    errorResponse('Password Incorrect')
                )
            }

        })
        .catch((err) => {
            next(err)
        })
}

exports.getUsers = (req, res) => {

    user.find()
        .sort({ created: -1 })
        .select('-password -__v -_id')
        .exec()
        .then(result => {

            return res.status(200).json(
                successResponse('Done', result)
            )
        })
}

exports.getUser = (req, res) => {

    var username = req.params.username

    user.findOne({
        username
    }).select('-password -__v -_id -email')
        .exec()
        .then(result => {

            if (!result) {
                return res.status(404).json(
                    errorResponse('User not found')
                )
            }

            return res.status(200).json(
                successResponse('Done', result)
            )
        })
}

exports.findUsername = async (req, res) => {

    var username = req.body.username

    user.find({
        username: { $regex: '.*' + username + '.*' }
    }).limit(10)
        .sort('username')
        .select('-password -__v -_id -email')
        .then(result => {

            return res.status(200).json(
                successResponse('Done', result)
            )
        })
}

exports.getProfile = (req, res) => {

    user.findOne({ _id: userId })
        .select('-password -__v -_id')
        .exec()
        .then(result => {
            return res.status(200).json(
                successResponse('Done', result)
            )
        })
}

exports.updateProfile = (req, res) => {

    user.findOneAndUpdate(
        { _id: userId },
        { $set: req.body },
        { 'new': true, runValidators: true, context: 'query' })
        .exec()
        .then(() => {
            return res.status(200).json(
                successResponse('User updated successfully')
            )
        })
        .catch(err => {
            return res.status(422).json(
                errorResponse('Request is not quite right', err.message, 422)
            )
        })
}

exports.updateProfPict = (req, res) => {

    const uploader = multer().single('image')
    var fileUp = req.file

    if (!fileUp) {
        return res.status(428).send({
            success: false,
            message: 'No file received'
        })

    } else {

        const dUri = new datauri()

        uploader(req, res, err => {
            var file = dUri.format(`${req.file.originalname}-${Date.now()}`, req.file.buffer)

            cloudinary.uploader.upload(file.content)
                .then(data => {
                    user.findOneAndUpdate(
                        { _id: userId },
                        { $set: { profPict: data.secure_url } },
                        { new: true })
                        .exec()
                        .then(() => {
                            return res.status(200).json(
                                successResponse('Profile picture updated successfully')
                            )
                        })
                })
                .catch(err => {
                    res.status(415).json(
                        errorResponse(err.message)
                    )
                })
        })
    }
}

exports.deleteUser = (req, res) => {

    user.deleteOne({
        _id: userId
    })
        .exec()
        .then(() => {
            return res.status(200).json(
                successResponse('User deleted successfully')
            )
        })
}

exports.resetPassword = async (req, res, next) => {
    const email = req.body.email;

    const userExist = await user.findOne({ email })

    if (!userExist) {
        return res.status(404).json(errorResponse('Email not registered'))
    }

    const token = jwt.sign({ _id: userExist._id, email: email }, process.env.SECRET_KEY, {
        algorithm: 'HS256',
        expiresIn: "900000"
    })

    const data = {
        subject: 'Reset Password',
        username: userExist.username,
        token: token
    }

    const newToken = new Token({
        user_id: userExist._id,
        token: token
    })

    newToken.save()
        .then(() => {
            sendVerification(email, data, res)
        })
}

exports.changePassword = async (req, res, next) => {
    const token = req.params.token
    const password = req.body.password

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY)

        const checkPassword = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,30}$/.test(password)

        if (checkPassword === false) {
            return res.status(422).json(
                errorResponse('Request is not quite right')
            )
        }

        var tokenExist = await Token.findOne({ user_id: decoded._id, token: token })

        if (!tokenExist) {
            return res.status(401).json(
                errorResponse('Token already used, generate new one')
            )
        }

        bcrypt.hash(password, 10, (err, hash) => {
            user.findOneAndUpdate(
                { _id: decoded._id },
                { $set: { password: hash } },
                { new: true })
                .exec()
                .then(() => {
                    Token.findOneAndDelete(
                        { user_id: decoded._id, token: token },
                    )
                        .exec()
                        .then(() => {
                            return res.status(200).json(
                                successResponse('Password updated successfully'))
                        })
                })

        })
    }

    catch (err) {
        return res.status(401).json(
            errorResponse('The access token provided is invalid.', err.message, 401)
        )
    }
}