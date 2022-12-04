const express = require("express")
const router = express.Router()

// calling this from controller 
const { home, dummy } = require("../controller/homeController")

// Main path of routers
router.route("/g").get(home)

// Main path of routers
router.route("/d").get(dummy)

module.exports = router