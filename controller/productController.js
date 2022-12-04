// const fileUpload = require('express-fileupload')
// const { find } = require('../model/Product')
const Product = require('../model/Product')
const User = require('../model/User')
const Whereclause = require('../utils/wherecaluse')
const cloudinary = require('cloudinary').v2

// add product by admin
exports.addProduct = async (req, res) => {
    try {
        let result
        let imageArray = []

        const { stock, brand, category, price, name } = req.body

        if (!stock || !brand || !category || !price || !name) {
            return res.status(400).json({
                "error": [
                    "Path `stock` is required.",
                    "Path `brand` is required.",
                    "Please select the category from - Shirt1, Shirt2, Shirt3, Shirt4",
                    "Please provide a Product Price",
                    "Please provide a Product Name"
                ]
            })
        }

        try {
            const file = req.files.file
            if (!file) {
                return res.status(400).json({
                    success: false,
                    message: `Product Images are required`
                })
            }

            if (file.length > 1) {
                for (let i = 0; i < file.length; i++) {

                    // cloudinary config
                    result = await cloudinary.uploader.upload(file[i].tempFilePath, {
                        folder: "products"
                    })
                    console.log(`RESULT:`, result);
                    //cloudinary url for preview
                    imageArray.push({
                        id: result.public_id,
                        secure_url: result.secure_url
                    })
                }
            } else {

                result = await cloudinary.uploader.upload(file.tempFilePath, {
                    folder: "products"
                })
                //cloudinary url for preview
                imageArray.push({
                    id: result.public_id,
                    secure_url: result.secure_url
                })
            }
        } catch (error) {
            console.log(error);
            return res.status(400).json({
                error: `file cannot be found`
            })
        }

        // populating the db with imagearray data
        req.body.photos = imageArray;
        // adding current UserId to Product user feild (Using isloggedin middelewaee)
        req.body.user = req.user.id;

        // creating the product using body
        const product = await Product.create(req.body)

        res.status(200).json({
            success: true,
            product
        })

    } catch (error) {
        console.log(error);
        // checking validation
        if (error.name === "ValidationError") {
            const message = Object.values(error.errors).map(value => value.message);
            return res.status(400).json({
                error: message
            })
        }
        return res.status(400).json(error.message)
    }
}

// find all product using search query
exports.findAllProduct = async (req, res) => {
    try {
        let resultPerPage = 5
        const query = req.query

        console.log(`THE QUERY`, query);

        // if object is empty
        if (Object.keys(query).length === 0 && query.constructor === Object) {
            return res.status(400).json({
                error: `Type something`
            })
        }
        const productsObj = new Whereclause(Product.find(), query).search().filter();

        let products = await productsObj.base.clone()

        const totalProductFound = products.length

        productsObj.pager(resultPerPage)

        let currentPageNow = productsObj.bigQ.page

        products = await productsObj.base

        res.status(200).json({
            products,
            TotalProducts: totalProductFound,
            PageNo: currentPageNow

        })
    } catch (error) {
        console.log(error);
        res.status(400).json(error.message)
    }
}

// Get single product through parmas
exports.getSingleProduct = async (req, res) => {
    try {
        const productId = (req.params.id).trim()

        if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                error: `Product not found with valid ObjectId: ${productId}`
            })
        }
        const product = await Product.findById(productId)

        if (!product) {
            return res.status(400).json({
                error: `Product not found with valid ObjectId: ${productId}`
            })
        }

        res.status(200).json({
            success: true,
            product
        })

    } catch (error) {
        console.log(error);
        // checking validation
        if (error.name === "ValidationError") {
            const message = Object.values(error.errors).map(value => value.message);
            return res.status(400).json({
                error: message
            })
        }
        return res.status(400).json(error.message)
    }
}

exports.addReview = async (req, res) => {
    try {
        // fetching from body
        const { rating, comment, productId } = req.body

        if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                error: `Product id is not found or invalid: ${productId}`
            })
        }

        // checking if exist or not in body 
        if (!rating || !comment || !productId) {
            return res.status(400).json({
                error: `rating, comment, productId or any of the feild is missing or invalid`
            })
        }

        if (rating == 1 || rating == 2 || rating == 3 || rating == 4 || rating == 5) {

            // creating a object called as review
            const review = {
                user: req.user._id,
                name: req.user.name,
                rating: Number(rating),
                comment
            }

            // finding it on db
            const product = await Product.findById(productId)

            console.log(`Product data`, product);

            // check if product exist
            if (!product) {
                return res.status(400).json({
                    error: `Product not found or missing`
                })
            }

            // checking if alredy Reviewed using JavaScrpt 
            const alreadyRewviewd = product.reviews.find(
                // looping through product.reviews db // also using toString() method because of beson
                (rev) => rev.user.toString() === review.user.toString()
            )


            // if already reviewed tghen do this
            if (alreadyRewviewd) {
                // loop through alreday existing review and update comments and ratings given from req.body or review object
                product.reviews.forEach((e) => {
                    // checking if review is is of same user or not
                    if (e.user.toString() === review.user.toString()) {
                        e.comment = review.comment,
                            e.rating = review.rating
                    }
                })
                console.log(`THIS alreadyRewviewd IS RUNNING NOW`);
            } else {
                // else push the review obj to reviews
                product.reviews.push(review)
                // also update numberOfRatings with no of reviews in product
                product.numberOfRatings = product.reviews.length
                console.log(`FIRST TIME REVIEW RUNNING`);
            }

            // updating product rating using reduce() method. 
            /* [reduce method just calculates sum of total numbers, here currentval.rating which is product.reviews.rating(in db) is adding all the numbers in db and then divided by number of reviews in db to find the average rating ] */
            const justok = product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) /
                product.reviews.length;

            console.log(justok);
            // savaing it db
            product.save({ validateBeforeSave: false })

            const data = {
                ProductReview: product.reviews,
                numberOfRatings: product.numberOfRatings,
                rating: product.rating
            }

            data.ProductReview.user = undefined

            // response
            res.status(200).json({
                success: true,
                data
            })
        } else {
            res.status(400).json({
                error: `Rating should be between 1-5`
            })
        }


    } catch (error) {
        console.log(error);
        // checking validation
        if (error.name === "ValidationError") {
            const message = Object.values(error.errors).map(value => value.message);
            return res.status(400).json({
                error: message
            })
        }
        return res.status(400).json(error.message)
    }
}

exports.deleteReview = async (req, res) => {
    try {
        // fetching from body
        const { productId } = req.query

        // checking bson
        if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                error: `Product id is not found or invalid: ${productId}`
            })
        }

        // finding it on db
        const product = await Product.findById(productId)

        // check if product exist
        if (!product) {
            return res.status(400).json({
                error: `Product not found or missing`
            })
        }

        // filter it out
        const reviews = product.reviews.filter((rev) => rev.user.toString() !== req.user._id.toString())

        console.log(`reviews:`, reviews);
        // update tatings 
        const numberOfRatings = reviews.length

        // updating product rating using reduce() method. 
        const rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) /
            product.reviews.length;

        // update it on db
        await Product.findByIdAndUpdate(productId, {
            reviews,
            rating,
            numberOfRatings,
        }, {
            new: true,
            runValidators: true,
            useFindAndModify: false
        })

        // response
        res.status(200).json({
            success: true
        })
    } catch (error) {
        console.log(error);
        // checking validation
        if (error.name === "ValidationError") {
            const message = Object.values(error.errors).map(value => value.message);
            return res.status(400).json({
                error: message
            })
        }
        return res.status(400).json(error.message)
    }
}

exports.findProductReview = async (req, res) => {
    try {
        const { id } = req.query

        if (!id) {
            return res.status(400).json({
                error: `Please provide a Product id`
            })
        }

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                error: `Product id is not found or invalid: ${id}`
            })
        }

        const product = new Whereclause(Product.findById(), id).review();

        console.log();
        let products = await product.base.clone()

        // const product = await Product.findById(id)

        console.log(products[0].reviews);

        res.status(200).json({
            success: true,
            review: products[0].reviews
        })
    } catch (error) {
        console.log(error);
        // checking validation
        if (error.name === "ValidationError") {
            const message = Object.values(error.errors).map(value => value.message);
            return res.status(400).json({
                error: message
            })
        }
        return res.status(400).json(error.message)
    }
}

// Admin find all products
exports.adminfindAllProduct = async (req, res) => {
    try {
        let resultPerPage = 5
        const productsObj = new Whereclause(Product.find(), req.query).filter();

        let products = await productsObj.base.clone()

        const totalProductFound = products.length

        productsObj.pager(resultPerPage)

        let currentPageNow = productsObj.bigQ.page

        products = await productsObj.base

        res.status(200).json({
            products,
            TotalProducts: totalProductFound,
            PageNo: currentPageNow

        })
    } catch (error) {
        console.log(error);
        res.status(400).json(error.message)
    }
}

exports.adminProductUpdate = async (req, res) => {
    try {

        // get product id
        const productId = req.params.id

        if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                error: `Product not found with valid ObjectId: ${productId}`
            })
        }
        // find product id from db
        const product = await Product.findById(productId)

        if (!product) {
            return res.status(400).json({
                error: `Product not found with valid ObjectId: ${productId}`
            })
        }

        // result and image array - global scope
        let result
        let imageArray = []

        // checking requied feild
        const { stock, brand, category, price, name } = req.body

        if (!stock || !brand || !category || !price || !name) {
            return res.status(400).json({
                "error": [
                    "Path `stock` is required.",
                    "Path `brand` is required.",
                    "Please select the category from - Shirt1, Shirt2, Shirt3, Shirt4",
                    "Please provide a Product Price",
                    "Please provide a Product Name"
                ]
            })
        }

        // if files are found 
        if (req.files) {
            // delete files from cloudinary using product.photos.id with forloop
            for (let i = 0; i < product.photos.id.length; i++) {
                let deleteimg = await cloudinary.uploader.destroy(product.photos[i].id)
            }
            try {
                // reassign file
                const file = req.files.file

                // check the length of files given if more than 1 then execute this code
                if (file.length > 1) {
                    for (let i = 0; i < file.length; i++) {

                        // cloudinary config
                        result = await cloudinary.uploader.upload(file[i].tempFilePath, {
                            folder: "products"
                        })
                        //cloudinary url for preview
                        imageArray.push({
                            id: result.public_id,
                            secure_url: result.secure_url
                        })
                    }
                } else {

                    // if there is only one file use this method to upload
                    result = await cloudinary.uploader.upload(file.tempFilePath, {
                        folder: "products"
                    })
                    //cloudinary url for preview
                    imageArray.push({
                        id: result.public_id,
                        secure_url: result.secure_url
                    })
                }
                // populating the db with imagearray data
                req.body.photos = imageArray;
            } catch (error) {
                console.log(error);
                return res.status(400).json({
                    error: `file cannot be found`
                })
            }
        }

        // updating in db using ProductId with data from body
        const data = await Product.findByIdAndUpdate(productId, req.body, {
            new: true,
            runValidators: true
        })

        res.status(200).json({
            message: `Success`,
            data,
        })

    } catch (error) {
        console.log(error);
        // checking validation
        if (error.name === "ValidationError") {
            const message = Object.values(error.errors).map(value => value.message);
            return res.status(400).json({
                error: message
            })
        }
        return res.status(400).json(error.message)

    }
}

exports.adminProductDelete = async (req, res) => {
    try {

        // get product id
        const productId = req.params.id

        if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                error: `Product not found with valid ObjectId: ${productId}`
            })
        }
        // find product id from db
        const product = await Product.findById(productId)

        if (!product) {
            return res.status(400).json({
                error: `Product not found with valid ObjectId: ${productId}`
            })
        }


        // delete files from cloudinary using product.photos.id with forloop
        for (let i = 0; i < product.photos.id.length; i++) {
            await cloudinary.uploader.destroy(product.photos[i].id)
        }

        // delete product from db
        await product.remove()

        res.status(200).json({
            message: `Success`,
            message: `Product was deleted`,
        })


    } catch (error) {
        console.log(error);
        // checking validation
        if (error.name === "ValidationError") {
            const message = Object.values(error.errors).map(value => value.message);
            return res.status(400).json({
                error: message
            })
        }
        return res.status(400).json(error.message)

    }
}