const jwt = require('jsonwebtoken')

const userAuth = (req,res,next) =>{
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]

    if (!token) return res.status(401).json({ msg: "Token missing" })

    jwt.verify(token, process.env.ACCESS_SECRET, (err, user) => {
        if (err) return res.status(403).json({ msg: "Invalid token" })

        req.user = user
        next()
    })

}


module.exports = userAuth