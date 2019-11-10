exports.total = (cart) => {

    var listCart = []
        , total = 0
        , length = cart.length

    for (var i = 0; i < length; i++) {
        var { name, price, _id } = cart[i].product_id

        var data = {
            _id: cart[i]._id,
            product_id: _id,
            quantity: cart[i].quantity,
            name, price,
            subTotal: price * (cart[i].quantity)
        }

        listCart.push(data)
        total += data.subTotal
    }

    var result = {
        customer_id: cart[0].customer_id,
        total: total,
        listCart: listCart
    }
    return result
}