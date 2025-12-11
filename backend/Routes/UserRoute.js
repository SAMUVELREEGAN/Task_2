const express = require('express')
const UserController = require('../Controllers/UserController')

const userRoute = express.Router()

userRoute.post('/register' , UserController.register)
userRoute.post("/login", UserController.login)
userRoute.post("/verify-otp", UserController.verifyOTP)
userRoute.post("/refresh", UserController.refresh)


module.exports = userRoute