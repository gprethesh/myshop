const Product = require('../model/Product')
const Order = require("../model/Order")


exports.createOrder = async (req, res) => {
    try {
        const productId = req.params.id

        if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                error: `Product id is not found or invalid: ${productId}`
            })
        }

        if (!productId) {
            return res.status(400).json({
                error: `Product not fouund`
            })
        }

        const product = await Product.findById(productId)

        if (product.stock <= 0) {
            return res.status(201).json({
                mesaage: `OUT OF STOCK`
            })
        }
        const pName = product.name
        const pPhoto = product.photos[0].secure_url
        const pPrice = product.price
        const pId = product._id

        if (!product) {
            return res.status(400).json({
                error: `Product not fouund`
            })
        }


        const { shippingInfo,
            orderItems,
            paymentInfo,
            taxAmount,
            shippingAmount,
            totalAmount,
            orderStatus } = req.body

        const data = await Order.create({
            shippingInfo,
            orderItems: [
                {
                    name: pName,
                    image: pPhoto,
                    price: pPrice,
                    product: pId,
                    quantity: orderItems[0].quantity
                }
            ],
            paymentInfo,
            taxAmount,
            shippingAmount,
            totalAmount,
            orderStatus,
            user: req.user._id,
        })

        res.status(200).json({
            success: true,
            data
        })
    } catch (error) {
        console.log(error);
        // checking validation
        if (error.name === "ValidationError") {
            const message = Object.values(error.errors).map(value => value.message);
            return res.status(400).json({
                error: message
            })
        }
        return res.status(400).json(error.message)
    }

}

exports.getOneOrder = async (req, res) => {
    try {
        const orderId = req.params.id

        if (!orderId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                error: `Order id is not found or invalid: ${orderId}`
            })
        }

        if (!orderId) {
            return res.status(400).json({
                error: `Order id is empty`
            })
        }

        const order = await Order.findById(orderId).populate("user", "name email")

        if (!order) {
            return res.status(400).json({
                error: `Order id not found`
            })
        }

        res.status(200).json({
            success: true,
            order
        })


    } catch (error) {
        // checking validation
        if (error.name === "ValidationError") {
            const message = Object.values(error.errors).map(value => value.message);
            return res.status(400).json({
                error: message
            })
        }
        return res.status(400).json(error.message)
    }
}

exports.getMyOrders = async (req, res) => {
    try {
        const userId = req.user._id

        if (!userId) {
            return res.status(400).json({
                error: `User id is empty`
            })
        }

        const order = await Order.find({ user: userId })

        if (!order) {
            return res.status(400).json({
                mesaage: `No orders found`
            })
        }

        res.status(200).json({
            success: true,
            order
        })


    } catch (error) {
        // checking validation
        if (error.name === "ValidationError") {
            const message = Object.values(error.errors).map(value => value.message);
            return res.status(400).json({
                error: message
            })
        }
        return res.status(400).json(error.message)
    }
}

exports.AdminGetAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()

        res.status(200).json({
            success: true,
            orders
        })
    } catch (error) {
        // checking validation
        if (error.name === "ValidationError") {
            const message = Object.values(error.errors).map(value => value.message);
            return res.status(400).json({
                error: message
            })
        }
        return res.status(400).json(error.message)
    }
}


exports.AdminUpdateOrder = async (req, res) => {
    try {
        const { status, orderid } = req.body

        if (!orderid || !status) {
            return res.status(404).json({
                error: `Please provide order id & staus`
            })
        }
        if (!orderid.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                error: `Order id is not found or invalid: ${orderid}`
            })
        }

        const order = await Order.findById(orderid)

        if (!order) {
            return res.status(400).json({
                message: `Order not found`
            })
        }

        if (order.orderStatus === "delivered") {
            return res.status(400).json({
                mesaage: `The order was delivered`
            })
        }

        const updateorderstatus = async (productid, quantity) => {
            const product = await Product.findById(productid)

            product.stock = product.stock - quantity

            await product.save()
        }

        order.orderItems.forEach(p => {
            updateorderstatus(p.product, p.quantity)
        })

        order.orderStatus = status

        console.log(`order.status`, order.status);

        await order.save({ validateBeforeSave: false })

        res.status(200).json({
            success: true,
            order
        })
    } catch (error) {
        // checking validation
        if (error.name === "ValidationError") {
            const message = Object.values(error.errors).map(value => value.message);
            return res.status(400).json({
                error: message
            })
        }
        return res.status(400).json(error.message)
    }
}

exports.AdminDeleteOrder = async (req, res) => {
    try {
        const { orderid } = req.body

        if (!orderid) {
            return res.status(404).json({
                error: `Please provide order id`
            })
        }
        if (!orderid.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                error: `Order id is not found or invalid: ${orderid}`
            })
        }

        const order = await Order.findById(orderid)

        if (!order) {
            return res.status(400).json({
                message: `Order not Foun or deleted already`
            })
        }

        await order.remove()

        res.status(200).json({
            success: true,
            message: `Order has been deleted succesfully ${orderid}`
        })
    } catch (error) {
        // checking validation
        if (error.name === "ValidationError") {
            const message = Object.values(error.errors).map(value => value.message);
            return res.status(400).json({
                error: message
            })
        }
        return res.status(400).json(error.message)
    }
}
