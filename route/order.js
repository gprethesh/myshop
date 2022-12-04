const express = require("express")
const router = express.Router()
const { createOrder, getOneOrder, getMyOrders, AdminGetAllOrders, AdminUpdateOrder, AdminDeleteOrder } = require("../controller/orderController")
const { customRole } = require("../middleware/customrole")
const { isLoggedIn } = require("../middleware/isloggedin")

// user routes
router.route("/myorders").get(isLoggedIn, getMyOrders)
router.route("/order/create/:id").put(isLoggedIn, createOrder)
router.route("/order/findone/:id").get(isLoggedIn, getOneOrder)

// admin routes
router.route("/admin/orders").get(isLoggedIn, customRole("admin"), AdminGetAllOrders)
router.route("/admin/order/update").put(isLoggedIn, customRole("admin"), AdminUpdateOrder)
router.route("/admin/order/delete").delete(isLoggedIn, customRole("admin"), AdminDeleteOrder)

module.exports = router