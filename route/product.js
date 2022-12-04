const express = require("express")

const router = express.Router()

const { addProduct, findAllProduct, getSingleProduct, adminfindAllProduct, adminProductUpdate, adminProductDelete, addReview, deleteReview, findProductReview } = require("../controller/productController")
const { customRole } = require("../middleware/customrole")
const { isLoggedIn } = require("../middleware/isloggedin")

// User
router.route("/products").get(isLoggedIn, findAllProduct)
router.route("/aproduct/:id").get(isLoggedIn, getSingleProduct)
router.route("/product/addreview").post(isLoggedIn, addReview)
router.route("/product/deletereview").post(isLoggedIn, deleteReview)
router.route("/product/deletereview").post(isLoggedIn, deleteReview)
router.route("/product/findreview").get(isLoggedIn, findProductReview)


// Admin
router.route("/admin/addproduct").post(isLoggedIn, customRole("admin"), addProduct)
router.route("/admin/products").get(isLoggedIn, customRole("admin"), adminfindAllProduct)
router.route("/admin/product/:id").put(isLoggedIn, customRole("admin"), adminProductUpdate).delete(isLoggedIn, customRole("admin"), adminProductDelete)



module.exports = router