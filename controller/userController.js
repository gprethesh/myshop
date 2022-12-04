const User = require("../model/User")
// utils for token
const cookieToken = require("../utils/cookieToken")
const cookielogin = require("../utils/cookielogin")
const mailhelper = require("../utils/nodemail")
const cloudinary = require('cloudinary').v2
const crypto = require("crypto")
const cookieRestPw = require("../utils/cookieresetpw")
const cookieupdatepw = require("../utils/cookieUpdatepw")

exports.signup = async (req, res) => {
    try {

        const { name, email, password } = req.body

        if (!name || !email || !password) {
            return res.status(400).json(`Name, Email, Password are Required`)
        }

        // Creting a varable to find EMAIL exist or not 
        const existingEmail = await User.findOne({ email: email.toLowerCase() })

        if (existingEmail) {
            return res.status(400).json({
                error: `User already exist`
            })
        }

        let imgurl
        try {
            const file = req.files.file
            // cloudinary config
            const result = await cloudinary.uploader.upload(file.tempFilePath, {
                folder: "img",
                width: 150,
                crop: "scale"
            })

            //cloudinary url for preview
            imgurl = result.url
            publicid = result.public_id

        } catch (error) {
            console.log(error);
            return res.status(400).send(`file cannot be found`)
        }

        // creating user and adding to db
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password,
            photo: {
                id: publicid,
                secure_url: imgurl,
            },
        })

        // sending res on successfull registration
        cookieToken(user, res)


    } catch (error) {
        console.log(error);

        if (error.errors) {
            if (error.errors.password) {
                return res.status(400).json(error.errors.password.message)
            }
            if (error.errors.email) {
                return res.status(400).json(error.errors.email.message)
            }
        } else {
            return res.status(400).json(error.message)
        }

    }
}

exports.login = async (req, res) => {

    try {

        const { email, password } = req.body

        if (!email || !password) {
            return res.status(404).json("Please Provide Email and Password")
        }

        const user = await User.findOne({ email: email.toLowerCase() }).select("+password")

        if (!user) {
            return res.status(404).json("Email or Password is incorrect")
        }

        // comparing password using method and post hook
        const checkpw = await user.IsValidatedPassword(password)

        // if not found
        if (!checkpw) {
            return res.status(404).json("Email or Password is incorrect")
        }

        // sending res on succesfull login
        cookielogin(user, res)

    } catch (error) {
        console.log(error);
        res.status(500).json({ "error": error.message })
    }
}

exports.logout = async (req, res) => {
    try {

        // destroying token
        res.clearCookie('token').json(`cookie cleared`)

        // res.cookie("token", null, {
        //     expires: new Date(Date.now()),
        //     httpOnly: true
        // }).json({
        //     succes: true,
        //     message: "Logged out"
        // })

    } catch (error) {
        console.log(error);
        res.status(500).json(error.message)
    }
}

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body

        if (!email) {
            return res.status(400).json({
                error: `Please provide an email`
            })
        }

        const user = await User.findOne({ email: email.toLowerCase() })

        if (!user) {
            return res.status(401).json({
                error: `Email is incorrect or invalid`
            })
        }

        const forgotTokengen = await user.getForgotPasswordToken()

        await user.save({ validateBeforeSave: false })

        const url = `${req.protocol}://${req.get("host")}/password/rest/${forgotTokengen}`

        const message = `HELLO, ${email}
        If the link does not work you can visit the page directly: ${url}`

        try {
            await mailhelper({
                toEmail: user.email,
                subject: `Myshop Forgot password - Email`,
                text: message
            },
            )

        } catch (error) {
            user.forgotPasswordToken = undefined
            user.forgotPasswordExpiry = undefined
            await user.save({ validateBeforeSave: false })

            console.log(`Erorr on mail:`, error);

            return res.status(400).json(error.message)

        }

        res.status(200).json({
            success: true,
            message: `Email has been sent to user ${user.email}`
        })
    } catch (error) {
        console.log(`whole error`, error);
        return res.status(400).json(error.message)
    }
}

exports.passwordReset = async (req, res) => {
    try {
        // fetching token from url
        const forgotToken = req.params.token

        // checking hash by encrypting
        const encryptedpw = crypto.createHash("sha256").update(forgotToken).digest("hex")

        // finding user from database based on encrypted pw and expirydate if greater than Date.now()
        const user = await User.findOne({
            encryptedpw,
            forgotPasswordExpiry: { $gt: Date.now() }
        })

        // sending error if token not found
        if (!user) {
            return res.status(400).json({
                error: `Token not found or expired`
            })
        }

        // fetching password and confirmpassword from body

        const { password, confirmpasword } = req.body

        // checking if pw is value is empty
        if (!password || !confirmpasword) {
            return res.status(404).json({
                error: `Please provide password`
            })
        }
        // checking if both password are same
        if (password !== confirmpasword) {
            return res.status(404).json({
                error: `Confirm password does not match!`
            })
        }


        try {
            // setting new password 
            user.password = password

            //clearing password token and exp token
            user.forgotPasswordToken = undefined
            user.forgotPasswordExpiry = undefined

            // saving password to database
            await user.save()

            // sending response of succes and token
            cookieRestPw(user, res)
        } catch (error) {
            console.log(error);
            res.status(400).json(error.message)
        }

    } catch (error) {
        console.log(error);
        res.status(400).json(error.message)
    }
}

exports.dashboard = async (req, res) => {
    try {
        // fetching it from isloggedin middleware
        const userid = req.user.id

        // finding by id and assiging it to user
        const user = await User.findById(userid)

        res.status(200).json({
            success: true,
            user
        })
    } catch (error) {
        console.log(error);
        res.status(500).json(error.message)
    }
}

exports.updatePassword = async (req, res) => {
    try {
        // fetching it from middleware
        const userId = req.user.id

        // fetchind it from db
        const user = await User.findById(userId).select("+password")

        // if user not found
        if (!user) {
            return res.status(401).json({
                error: `User not found`
            })
        }

        // geting password feilds from req.body
        const { oldpassword, newpassword, confirmpasword } = req.body

        // if password feilds are empty 
        if (!oldpassword || !newpassword || !confirmpasword) {
            return res.status(401).json({
                error: `Please provide the password`
            })
        }

        // confirm password using post-hook method
        const checkpw = await user.IsValidatedPassword(oldpassword)

        // check if old password is true or false
        if (!checkpw) {
            return res.status(401).json({
                error: `old password is incorrect`
            })
        }

        // check if password match
        if (newpassword !== confirmpasword) {
            return res.status(401).json({
                error: `Confirm password does not match`
            })
        }

        //assign new password to user.pasword
        user.password = newpassword

        // saving it to database
        await user.save()

        // sending cookies and success message
        cookieupdatepw(user, res)

    } catch (error) {
        console.log(error);
        res.status(400).json(error.message)
    }
}

exports.updateUserDetails = async (req, res) => {
    try {
        // getiing id from midddleware
        const userid = req.user.id

        // simple object with user provided new email and name
        const updateData = {
            name: req.body.name,
            email: req.body.email
        }
        console.log(updateData);
        // if email is not provided by user
        if (!updateData.email) {
            return res.status(401).json("Please provide email")
        }

        try {
            // if any file is sent by user then this statement will execute
            if (req.files) {
                //getiing id from userid above varable
                const user = await User.findByIdAndUpdate(userid)

                // get Photoid from database and assign to imageid
                const imageId = user.photo.id

                // function to delete photo from cloudinary using imageid
                await cloudinary.uploader.destroy(imageId)

                // assiging the received new image dataurl to file variable
                const file = req.files.file

                // cloudinary config to upload file
                const result = await cloudinary.uploader.upload(file.tempFilePath, {
                    folder: "img",
                    width: 150,
                    crop: "scale"
                })
                //cloudinary url and id for preview
                imgurl = result.url
                publicid = result.public_id

                // updaating object made eariler with photo property
                updateData.photo = {
                    id: publicid,
                    secure_url: imgurl
                }

            }
        } catch (error) {
            console.log(error);
            res.status(401).json(error.message)
        }
        // updating the user data into database
        const user = await User.findByIdAndUpdate(userid, updateData, {
            new: true,
            runValidators: true
        })

        // sending response on success
        res.status(201).json({
            success: true,
            message: `user details has been updated`,
            user
        })

    } catch (error) {
        console.log(error);
        res.status(401).json(error.message)
    }
}

exports.adminAllUser = async (req, res) => {
    try {
        const users = await User.find({})

        return res.status(200).json({
            success: true,
            users
        })


    } catch (error) {
        console.log(error);
        return res.status(401).json(error.message)
    }

}

exports.managerAllUser = async (req, res) => {
    try {
        const users = await User.find({ role: "user" })

        return res.status(200).json({
            success: true,
            users
        })


    } catch (error) {
        console.log(error);
        return res.status(401).json(error.message)
    }

}

exports.adminGetOneUser = async (req, res) => {
    try {
        const emailaddress = req.params.email

        const user = await User.findOne({ email: emailaddress })

        if (!user) {
            return res.status(400).json({
                error: `${emailaddress} not found in the result`
            })
        }

        res.status(201).json({
            success: true,
            user
        })
    } catch (error) {
        console.log(error);
        res.status(400).json(error.message)
    }
}

exports.adminUpdateOneUser = async (req, res) => {
    try {
        const emailaddress = req.params.email

        // simple object with user provided new email and name
        const updateData = {
            name: req.body.name,
            email: req.body.email,
            role: req.body.role
        }

        console.log(updateData);

        const user = await User.findOneAndUpdate({ email: emailaddress }, updateData, {
            new: true,
            runValidators: true
        })

        if (!user) {
            return res.status(400).json({
                error: `${emailaddress} not found in the result`
            })
        }

        res.status(201).json({
            success: true,
            user
        })
    } catch (error) {
        console.log(error);
        res.status(400).json(error.message)
    }
}

exports.adminDeleteOneUser = async (req, res) => {
    try {
        const deleteuser = req.params.email
        const user = await User.findOne({ email: deleteuser })

        if (!user) {
            return res.status(200).json({
                error: `${deleteuser} not found!`
            })
        }

        // get Photoid from database and assign to imageid
        const imageId = user.photo.id

        // function to delete photo from cloudinary using imageid
        await cloudinary.uploader.destroy(imageId)

        await user.remove()

        res.status(201).json({
            success: true,
            message: `User was successfully removed!`
        })

    } catch (error) {
        console.log(error);
        res.status(400).json(error.message)
    }
}


