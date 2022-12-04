const mongoose = require("mongoose")

const connectDB = async () => {
    await mongoose.connect(process.env.DB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
        .then(console.log(`Datbase connected Successfully`))
        .catch(err => {
            console.log(`Error with DB:`, err);
            process.exit(1);
        })
}

module.exports = connectDB