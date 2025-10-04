const cookieParser = require("cookie-parser")
const express=require("express")
const app=express()

const chatRoutes=require("./routes/chat.routes")
const authRoutes=require("./routes/auth.routes")

app.use(express.json())
app.use(cookieParser())

app.use('/api/auth',authRoutes)
app.use('/api/chat',chatRoutes)
module.exports=app