var jwt = require('jsonwebtoken')

exports.isAuthenticated = (req, res, next) => {
  var token = req.headers.authorization.split('Bearer ')[1]

  if (token) {
    jwt.verify(token, process.env.SECRET_KEY, function (err, decoded) {

      if (err) {
        return res.status(403).json({
          message: 'Failed to authenticate token'
        })
      } 
      
      else {
        req.decoded = decoded
        userId = decoded._id
        roleUser = decoded.role
        next()
      }
    })
  }
  
  else {
    return res.status(403).send({
      message: 'No token provided'
    })
  }
}