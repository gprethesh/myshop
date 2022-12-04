const express = require("express")


const router = express.Router()
const { sendStripeKey, sendRazorpayKey, captureStripePayments, captureRazorpayPayments } = require("../controller/paymentController")
const { isLoggedIn } = require("../middleware/isloggedin")


// user
router.route("/stripekey").get(isLoggedIn, sendStripeKey)
router.route("/razorpaykey").get(isLoggedIn, sendRazorpayKey)
router.route("/stripepayment").post(isLoggedIn, captureStripePayments)
router.route("/razorpaypayment").post(isLoggedIn, captureRazorpayPayments)



module.exports = router