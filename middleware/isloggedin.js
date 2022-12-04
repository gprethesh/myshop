const User = require("../model/User")
const jwt = require("jsonwebtoken")

exports.isLoggedIn = async (req, res, next) => {

    const tokenFind = () => {
        try {
            // check if token found in cookies
            if (req.cookies.token) {
                return req.cookies.token
            }
            // check if token found body
            if (req.body.token) {
                return req.body.token
            }
            //check if token found in header
            if (req.header("Authorization")) {
                return req.header("Authorization").replace("Bearer ", "")
            }
        } catch (error) {
            console.log(error);
        }

    }
    const token = tokenFind()

    if (!token) {
        return res.status(400).json({
            error: `Please login to access this page`
        })
    }

    try {
        // decoding the token with scerect key
        const decoded = jwt.verify(token, process.env.JWTSECRETWORD)

        // injecting my own property
        req.user = await User.findById(decoded.id)

        next()
    } catch (error) {
        console.log(error);

        if (error.name === "JsonWebTokenError") {
            res.status(401).json({
                error: `Unauthorized`
            })
        } else {
            res.status(500).json(error.message)
        }
    }

}


