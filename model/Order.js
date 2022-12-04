const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema({
    shippingInfo: {
        address: {
            type: String,
            required: [true, "Address is a required feild"]
        },
        city: {
            type: String,
            required: [true, "City is a required feild"]
        },
        state: {
            type: String,
            required: [true, "State is a required feild"]
        },
        country: {
            type: String,
            required: [true, "Country is a required feild"]
        },
        postalCode: {
            type: Number,
            required: [true, "Postal Code is a required feild"]
        },
        phoneNo: {
            type: Number,
            required: [true, "Phone Number is a required feild"]
        },
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    orderItems: [
        {
            name: {
                type: String,
                required: [true, "Product Name is a required feild"]
            },
            quantity: {
                type: Number,
                required: [true, "Quantityis a required feild"]
            },
            image: {
                type: String,
                required: [true, "Image is a required feild"]
            },
            price: {
                type: Number,
                required: [true, "Price is a required feild"]
            },
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: [true, "Product is a required feild"]
            },
        }
    ],
    paymentInfo: {
        id: {
            type: String,
        },
    },
    taxAmount: {
        type: Number,
        required: [true, "TaxAmount is a required feild"]
    },
    shippingAmount: {
        type: Number,
        required: [true, "Shipping Amount is a required feild"]
    },
    totalAmount: {
        type: Number,
        required: [true, "Total Amount is a required feild"]
    },
    orderStatus: {
        type: String,
        required: true,
        default: "processing"
    },
    deliveredAt: {
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model("Order", orderSchema)


