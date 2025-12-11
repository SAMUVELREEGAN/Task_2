const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const dotenv = require('dotenv')
const db = require('./Configs/db_config');

dotenv.config();
const PORT = process.env.PORT

const server = express()
server.use(cors({
    origin: "http://localhost:3000", 
    credentials: true,
}))

server.use(bodyParser.json())
server.use(require('./Routes/UserRoute'))
server.use(require('./Routes/AllCategoryRoute'))


server.listen(PORT , ()=>{console.log(`Server Listen ${PORT}`)})