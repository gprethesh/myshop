const express = require("express")
require("dotenv").config()
const cookieParser = require('cookie-parser')
const fileUpload = require("express-fileupload")
const morgan = require('morgan')
const connectDB = require("./config/db")
const cloudinary = require('cloudinary').v2
const randomstring = require("randomstring");


const app = express()

// connect database
connectDB()


app.set("view engine", "ejs")

// Middleware
app.use(express.json())
app.use(cookieParser())
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/"
}))
app.use(express.urlencoded({ extended: true }))
app.use(morgan('tiny'))


// cloudinary configurations
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_KEY_SECRET,
    secure: true
});

// calling route to app
const homeRouter = require("./route/home")
const userRouter = require("./route/user")
const product = require("./route/product")
const payment = require("./route/payments")
const order = require("./route/order")

//calling path of routers
app.use("/", homeRouter)
app.use("/", userRouter)
app.use("/", product)
app.use("/", payment)
app.use("/", order)

app.get("/signup", (req, res) => {
    res.render("signup")
})

app.get("/login", (req, res) => {

    res.render("login")
})

app.get("/dashboardx", (req, res) => {

    res.render("dashboard")
})

module.exports = app
