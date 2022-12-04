const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const randomstring = require("randomstring");
const crypto = require('crypto')

// mongoose schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide a Name"],
        maxlength: [40, "Name should be under 40 characters"]
    },
    email: {
        type: String,
        required: [true, "Please provide an Email"],
        validate: [validator.isEmail, "Enter Email in correct Format"],
        unique: [true, "Email you provided has already been used"],
        lowercase: true
    },
    password: {
        type: String,
        required: [true, "Please provide an Password"],
        minlength: [6, "Password must of atleast 6 characters"],
        select: false
    },
    role: {
        type: String,
        default: "user"
    },
    photo: {
        id: {
            type: String,
            required: true,
        },
        secure_url: {
            type: String,
            required: true,
        },
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
})


// encrypt pw with PRE-HOOKS
userSchema.pre("save", async function (next) {
    // it will check if password is not modified then return next()
    if (!this.isModified('password')) {
        return next();
    }
    // this will encrypt pw
    this.password = await bcrypt.hash(this.password, 10)
})

// comparing the password with given password using POST-HOOKS
userSchema.methods.IsValidatedPassword = async function (givenPassword) {

    return await bcrypt.compare(givenPassword, this.password)
}

// sign jwt token while login using POST-HOOKS
userSchema.methods.getJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWTSECRETWORD,
        // {
        //     expiresIn: process.env.JWTEXPIRY
        // }
    )
}


// forgotPasswordToken using POST-HOOKS
userSchema.methods.getForgotPasswordToken = async function () {
    // generate randomnstring and store to var
    const forgotToken = randomstring.generate();

    // store crypto hash version of forgottoken using .update  (TODO: MAKE SURE TO REQUIRE CRYPTO)
    this.forgotPasswordToken = crypto.createHash("sha256").update(forgotToken).digest("hex")

    // store forgotpassword token expiry in database
    this.forgotPasswordExpiry = Date.now() + 20 * 60 * 1000

    return forgotToken
}

module.exports = mongoose.model("User", userSchema)