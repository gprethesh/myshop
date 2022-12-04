const mongoose = require("mongoose")

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide a Product Name"],
        maxlength: [40, "Name should be under 40 characters"],
        trim: true
    },
    price: {
        type: Number,
        required: [true, "Please provide a Product Price"],
        maxlength: [10, "Name should be under 10 digits"],
    },
    photos: [
        {
            id: {
                type: String,
                required: true
            },
            secure_url: {
                type: String,
                required: true
            },
        }
    ],
    category: {
        type: String,
        required: [true, "Please select the category from - Shirt1, Shirt2, Shirt3, Shirt4"],
        enum: {
            values: ["Shirt1", "Shirt2", "Shirt3", "Shirt4"],
            message: "Please select the category from - Shirt1, Shirt2, Shirt3, Shirt4"
        }
    },
    brand: {
        type: String,
        required: true,
    },
    stock: {
        type: Number,
        required: true,
    },
    rating: {
        type: Number,
        default: 0
    },
    numberOfRatings: {
        type: Number,
        default: 0
    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: "User",
                required: true
            },
            name: {
                type: String,
                required: true
            },
            rating: {
                type: Number,
                required: true
            },
            comment: {
                type: String,
                required: true
            },
        }
    ],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },
    createAt: {
        type: Date,
        default: Date.now
    }
})

// name,
// price,
// images[],
// categories,
// brand,
// stocks,
// ratings,
// numberOfRatings,
// user
// reviews[userid, name, email, rating, comment]
// createdAt


module.exports = mongoose.model("Product", productSchema)