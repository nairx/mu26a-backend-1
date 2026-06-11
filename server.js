import express from "express"
import mongoose from "mongoose"
const app = express()
app.use(express.json())
app.listen(8081, () => console.log("Server started"))
mongoose.connect("mongodb://localhost:27017/mytestdb1")
const userSchema = mongoose.Schema({
    name: "String",
    email: "String",
    password: "String",
    role: "String",
})
const userModel = mongoose.model("User", userSchema)
app.post("/users/register", async (req, res) => {
    const user = await userModel.create(req.body)
    res.json(user)
})
app.post("/users/login", async (req, res) => {
    const { email, password } = req.body
    const user = await userModel.findOne({ email, password })
    if (user) {
        res.json(user)
    }
    else {
        res.json({ message: "User not found" })
    }
})
app.get("/users",async (req,res)=>{
    const users = await userModel.find()
    res.json(users)
})
