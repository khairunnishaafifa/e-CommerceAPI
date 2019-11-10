const mongoose = require('mongoose')
    , multer = require('multer')
    , cloudinary = require('cloudinary')
    , datauri = require('datauri')

const product = require('../../models/v1/product')
    , user = require('../../models/v1/user')
    , { successResponse, errorResponse } = require('../../helpers/response')

exports.addProduct = async (req, res) => {

    if (roleUser === 'Customer') {
        return res.status(401).json(
            errorResponse('You does not have access rights to the content')
        )
    }

    const uploader = multer().single('image')

    var { name, description, category, price, stock } = req.body
        , fileUp = req.file

    if (!fileUp) {
        return res.status(428).json(
            errorResponse('No file received')
        )
    }

    const dUri = new datauri()

    uploader(req, res, (err) => {
        var file = dUri.format(`${req.file.originalname}-${Date.now()}`, req.file.buffer)

        cloudinary.uploader.upload(file.content)
            .then(data => {
                var productPict = data.secure_url

                var newProduct = new product({
                    _id: new mongoose.Types.ObjectId(),
                    name, description, category,
                    price, stock, productPict,
                    merchant_id: userId
                })

                newProduct.save()
                    .then(result => {

                        user.updateOne(
                            { _id: userId },
                            { $push: { listProducts: newProduct._id } }
                        ).exec()
                            .then(() => {
                                return res.status(201).json(
                                    successResponse('Product successfully saved', result)
                                )
                            })
                    })
                    .catch(err => {
                        return res.status(422).json(
                            errorResponse('Request is not quite right', err.message, 422)
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

exports.getProducts = (req, res) => {

    product.find()
        .sort({ created: -1 })
        .populate({ path: 'merchant_id', select: 'username profPict -_id' })
        .select('-__v')
        .exec()
        .then(result => {

            return res.status(200).json(
                successResponse('Done', result)
            )
        })
}

exports.findProducts = (req, res) => {

    product.find({
        name: { $regex: '.*' + req.body.name + '.*' }
    })
        .limit(10)
        .sort('name')
        .populate({ path: 'merchant_id', select: 'username profPict -_id' })
        .select('-__v')
        .then(result => {

            return res.status(200).json(
                successResponse('Done', result)
            )
        })
}

exports.findProductById = (req, res) => {

    product.findOne({
        _id: req.params.id
    })
        .populate({ path: 'merchant_id', select: 'username profPict -_id' })
        .select('-__v')
        .then(result => {
            return res.status(200).json(
                successResponse('Done', result)
            )
        })
        .catch(err => {
            return res.status(404).json(
                errorResponse('Product not found')
            )
        })
}

exports.findProductByMerchant = (req, res) => {

    user.findOne({
        _id: req.params.id
    })
        .populate({ path: 'listProducts', select: '-__v' })
        .select('profPict listProducts username -_id')
        .then(result => {
            return res.status(200).json(
                successResponse('Done', result)
            )
        })
        .catch(err => {
            return res.status(404).json(
                errorResponse('Product not found')
            )
        })
}

exports.updateProduct = async (req, res) => {

    if (roleUser === 'Customer') {
        return res.status(401).json(
            errorResponse('You does not have access rights to the content')
        )
    }

    product.updateOne(
        { _id: req.params.id, merchant_id: userId },
        { $set: req.body },
        { new: true })
        .exec()
        .then(() => {
            return res.status(200).json(
                successResponse('Product updated successfully')
            )
        })
        .catch(err => {
            return res.status(422).json(
                errorResponse('Request is not quite right', err.message, 422)
            )
        })
}

exports.updateProductPict = (req, res) => {

    if (roleUser === 'Customer') {
        return res.status(401).json(
            errorResponse('You does not have access rights to the content')
        )
    }

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
                    product.findOneAndUpdate(
                        { _id: req.params.id, merchant_id: userId },
                        { $set: { productPict: data.secure_url } },
                        { new: true })
                        .exec()
                        .then(() => {
                            return res.status(200).json(
                                successResponse('Product picture updated successfully')
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

exports.deleteProduct = (req, res) => {

    if (roleUser === 'Customer') {
        return res.status(401).json(
            errorResponse('You does not have access rights to the content')
        )
    }

    product.deleteOne({
        _id: req.params.id,
        merchant_id: userId
    })
        .exec()
        .then(() => {
            user.updateOne(
                { _id: userId },
                { $pull: { listProducts: req.params.id } }
            ).exec()
                .then(() => {
                    return res.status(200).json(
                        successResponse('Product deleted successfully')
                    )
                })
        })
}