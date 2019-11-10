const express = require('express')
    , router = express.Router()
    , cloudinaryConfig= require('../../config/cloudinaryConfig')

const usersCtrl = require('../../controllers/v1/usersController')
    , auth = require('../../middleware/auth')
    , upload = require('../../middleware/multer')

router.use('*', cloudinaryConfig)    

router.route('/signup')
    .post(usersCtrl.registerUser)

router.route('/login')
    .post(usersCtrl.authentication)

router.route('/')
    .get(usersCtrl.getUsers)

router.route('/uname/:username')
    .get(usersCtrl.getUser)

router.route('/search')
    .get(usersCtrl.findUsername)

router.route('/reset-password')
    .post(usersCtrl.resetPassword)

router.route('/reset/:token')
    .put(usersCtrl.changePassword)

router.route('/profile')
    .get(auth.isAuthenticated, usersCtrl.getProfile)
    .put(auth.isAuthenticated, usersCtrl.updateProfile)
    .delete(auth.isAuthenticated, usersCtrl.deleteUser)

router.route('/profile/upload')
    .put(auth.isAuthenticated, upload.single('profPict'), usersCtrl.updateProfPict)

module.exports = router