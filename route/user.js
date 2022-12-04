const express = require("express")
const router = express.Router()

//calling the controllers
const { signup, login, logout, forgotPassword, passwordReset, dashboard, updatePassword, updateUserDetails, adminAllUser, managerAllUser, adminGetOneUser, adminUpdateOneUser, adminDeleteOneUser } = require("../controller/userController")
// calling middleware
const { customRole } = require("../middleware/customrole")
const { isLoggedIn } = require("../middleware/isloggedin")


// Main path of routers
router.route("/signup").post(signup)
router.route("/login").post(login)
router.route("/logout").get(logout)
router.route("/forgotpassword").post(forgotPassword)
router.route("/password/rest/:token").post(passwordReset)
router.route("/dashboard").get(isLoggedIn, dashboard)
router.route("/update/password").post(isLoggedIn, updatePassword)
router.route("/update/userdata").post(isLoggedIn, updateUserDetails)

// admin routes
router.route("/admin/users").get(isLoggedIn, customRole("admin"), adminAllUser)
router.route("/manager/users").get(isLoggedIn, customRole("manager"), managerAllUser)
router.route("/admin/user/:email").get(isLoggedIn, customRole("admin"), adminGetOneUser).put(isLoggedIn, customRole("admin"), adminUpdateOneUser).delete(isLoggedIn, customRole("admin"), adminDeleteOneUser)



module.exports = router