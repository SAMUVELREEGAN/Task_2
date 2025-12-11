const db = require('../Configs/db_config')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')

let refreshTokens = []

function genrateOTP(){
    return Math.floor(1000 + Math.random() * 9000).toString()
}

async function sendOTPEmail(email, otp) {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    })

    await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: "Verification OTP",
        html: `<h2>OTP: <b>${otp}</b></h2>`
    })
}

exports.register = async(req,res)=>{
    const {ph_num,email,password,role_id} = req.body
    try{
        const [exist] = await db.query('SELECT * FROM user WHERE email=?' , [email])
        if(exist.length>0){
            return res.status(400).json({message:"Email already exists"})
        }
        const hash_password = await bcrypt.hash(password, 10) 

        await db.query("INSERT INTO user (role_id , ph_num , email, password) VALUES (?,?,?,?)" , [role_id,ph_num,email,hash_password] )

        res.json({message:"User Registered Successfully"})
    }catch(error){
        console.log(error)
        res.status(500).json({message:"Server error"})
    }
}

exports.login = async(req,res)=>{
    const {ph_num , email, password} = req.body

    try{
        let userRow

        if(email){
            [userRow] = await db.query('SELECT * FROM user WHERE email=?' , [email])
        }else if(ph_num){
            [userRow] = await db.query('SELECT * FROM user WHERE ph_num=?' , [ph_num])
        }

        const user = userRow[0]

        if(!user){
            return res.status(404).json({message:"User not found"})
        }
        if (!password || !user.password) {
            return res.status(400).json({ message: "Password missing or not set" })
        }


        const match = await bcrypt.compare(password,user.password)
        if(!match){
            return res.status(400).json({ message: "Incorrect password" })
        }
        
        const otp = genrateOTP()

        const verify_token = jwt.sign({id:user.id , otp} ,process.env.ACCESS_SECRET,{expiresIn:"1m"})

        await db.query("UPDATE user SET verify_token=? WHERE id=?", [
            verify_token, user.id
        ])

        setTimeout(async () => {
            try {
                await db.query("UPDATE user SET verify_token=NULL WHERE id=?", [user.id])
                console.log(`${user.id} 1 min`)
            } catch(err) {
                console.log("Error deleting expired verify_token:", err)
            }
        }, 2 * 60 * 1000) 

        if (email) {
            await sendOTPEmail(email, otp)
        } else if (ph_num) {
            console.log(`OTP (${ph_num}): ${otp}`)
        }

        return res.json({ message: "OTP sent successfully", verify_token})

    }catch (err) {
        console.log(err)
        res.status(500).json({ message: "Server Error" })
    }
}

exports.verifyOTP = async (req,res)=>{
    const {email,ph_num,otp} =req.body
    
    try{
        let userRow

        if(email){
            [userRow] = await db.query("SELECT * FROM user WHERE email=?", [email])
        }else if(ph_num){
            [userRow] = await db.query("SELECT * FROM user WHERE ph_num=?",[ph_num])
        }

        const user = userRow[0]

        if (!user)
            return res.status(404).json({ message: "User not found" })

        if (!user.verify_token)
            return res.status(400).json({ message: "Resend OTP" })

        let decode

        try{
            decode = jwt.verify(user.verify_token , process.env.ACCESS_SECRET)
        }catch(error){

            await db.query("UPDATE user SET verify_token=NULL WHERE id=?", [user.id])
            return res.status(400).json({message:"Invalid or expired OTP"})
        }

        if(decode.otp.toString() !== otp.toString()){
            return res.status(400).json({message:"Incorrect OTP"})
        }


        await db.query("UPDATE user SET verify_token=NULL WHERE id=?", [user.id])

        const accessToken = jwt.sign({ id: user.id },process.env.ACCESS_SECRET,{ expiresIn: "30m" })

        const refreshToken = jwt.sign({ id: user.id },process.env.REFRESH_SECRET,{ expiresIn: "1h" })

        refreshTokens.push(refreshToken)

        return res.json({message: "Login successfully",accessToken,refreshToken})

    }catch(error){
        console.log(error)
        res.status(500).json({ message: "Server Error" })
    }
}

exports.refresh = (req, res) => {
    const { token } = req.body

    if (!token)
        return res.status(401).json({ message: "Refresh token missing" })

    if (!refreshTokens.includes(token))
        return res.status(403).json({ message: "Invalid refresh token" })

    try {
        const decoded = jwt.verify(token, process.env.REFRESH_SECRET)

        const newAccessToken = jwt.sign(
            { id: decoded.id },
            process.env.ACCESS_SECRET,
            { expiresIn: "30m" }
        )

        res.json({ accessToken: newAccessToken })

    } catch (err) {
        return res.status(403).json({ message: "Refresh token expired" })
    }
}

exports.logout = (req, res) => {
    const { token } = req.body

    refreshTokens = refreshTokens.filter((t) => t !== token)

    res.json({ message: "Logged out" })
}
