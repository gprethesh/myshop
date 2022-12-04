const express = require("express")
const router = express.Router()

// calling this from controller 
const { home, dummy } = require("../controller/homeController")


router.route("/").get(home)
router.route("/").get(dummy)

module.exports = router