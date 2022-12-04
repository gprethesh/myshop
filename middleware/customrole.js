exports.customRole = (...roles) => {
    return async (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(400).json({
                error: `You dont have access to this section`
            })
        }

        next()
    }

}