// main content
exports.home = (req, res) => {

    res.status(200).json({
        suceess: true,
        greeting: `Hello Greetings`
    })
}

// main content
exports.dummy = (req, res) => {
    res.status(200).json([{
        name: `George`,
        data: `YoYo`
    }, {
        name: `Prethesh`,
        data: `bro`
    }])
}