const stripe = require('stripe')(process.env.STRIPE_SECRET)
const Razorpay = require('razorpay');
const randomstring = require("randomstring");

exports.sendStripeKey = async (req, res) => {
    try {
        res.status(200).json({
            stripeKey: process.env.STRIPE_KEY
        })
    } catch (error) {
        console.log(error);
        res.status(400).json(error.message)
    }
}

exports.captureStripePayments = async (req, res) => {
    try {
        const { amount } = req.body
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'inr',
            automatic_payment_methods: { enabled: true },
            metadata: { integration_check: "accept_a_payment" }
        })

        res.status(200).json({
            success: true,
            client_secret: paymentIntent.client_secret,
            id: paymentIntent.id
        })

    } catch (error) {
        console.log(error);
        res.status(400).json(error.message)
    }
}

exports.sendRazorpayKey = async (req, res) => {
    try {
        res.status(200).json({
            razorpayKey: process.env.RAZORPAYKEY
        })
    } catch (error) {
        console.log(error);
        res.status(400).json(error.message)
    }
}

exports.captureRazorpayPayments = async (req, res) => {
    try {

        const { amount } = req.body
        var instance = new Razorpay({ key_id: process.env.RAZORPAYKEY, key_secret: process.env.RAZORPAY_API_KEY })

        const myOrders = await instance.orders.create({
            amount: amount,
            currency: "INR",
            receipt: randomstring.generate()
        })

        res.status(200).json({
            success: true,
            amount,
            myOrders
        })

    } catch (error) {
        console.log(error);
        res.status(400).json(error.message)
    }
}