import express from "express"
import mongoose from "mongoose"
import jwt from "jsonwebtoken"
import cors from "cors"
import bcrypt from "bcrypt"
const SECRET = "hello123"
const app = express()
app.use(express.json())
app.use(cors())
app.listen(8081, () => console.log("Server started"))
mongoose.connect("mongodb://localhost:27017/mytestdb1")
const userSchema = mongoose.Schema({
    name: "String",
    email: "String",
    password: "String",
    role: "String",
})
const userModel = mongoose.model("User", userSchema)

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization
        const token = authHeader.split(" ")[1]
        const user = await jwt.verify(token, SECRET)
        req.user = user
        next()
    }
    catch (error) {
        res.json({ message: "Unauthorized" })
    }
}

const authorize = (...roles) => {
    return (req, res, next) => {
        if (roles.includes(req.user.role)) {
            next()
        }
        else {
            res.json({ message: "Access Denied" })
        }
    }
}

app.post("/users/register", async (req, res) => {
    console.log(req.body)
    const hashpassword = await bcrypt.hash(req.body.password, 10)
    req.body.password = hashpassword
    const user = await userModel.create(req.body)
    res.json(user)
})
app.post("/users/login", async (req, res) => {
    const { email, password } = req.body
    const user = await userModel.findOne({ email })
    if (user) {
        const chkPassword = await bcrypt.compare(password, user.password)
        if (chkPassword) {
            const obj = { id: user._id, name: user.name, email: user.email, role: user.role }
            const token = await jwt.sign(obj, SECRET, { expiresIn: "1hr" })
            res.json({ ...obj, token,success:true })
        }
        else {
            res.json({ message: "Invalid Password",success:false })
        }
    }
    else {
        res.json({ message: "User not found",success:false })
    }
})
app.get("/users", authenticate, authorize("admin"), async (req, res) => {
    const users = await userModel.find()
    res.json(users)
})
