
const cookieupdatepw = async (user, res) => {

    const token = user.getJwtToken()

    const options = {
        expires: new Date(Date.now() + process.env.TOKEN_DATE * 24 * 60 * 60 * 1000),
        httpOnly: true
    }

    const userEmail = user.email
    const user_Id = user._id
    const message = `${userEmail} has successfully updated the password`

    res.status(200).cookie("token", token, options).json({ message, user_Id, userEmail, token })
}

module.exports = cookieupdatepw