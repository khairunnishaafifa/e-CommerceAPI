exports.successResponse = (message, data) => {
    return ({
        success: true,
        message: message,
        result: data
    })
}

exports.errorResponse = (message, err, code) => {
    return ({
        success: false,
        code: code,
        message: message,
        result: err
    })
}