const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require("./Models/User")
const Joi = require("@hapi/joi")
const checkToken =  require("./Middleware/token")
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json({ type: 'application/json' }))
app.use(bodyParser.raw());
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test_db', { useNewUrlParser: true })
app.listen(3000,()=>{
    console.log("Cổng 3000")
})
app.post("/login", async (reqs,res)=>{
    // Kiểm tra email
    const userLogin = await User.findOne({email: reqs.body.email});
    if(!userLogin) return res.status(400).send("Không tìm thấy email")
    console.log(userLogin)
     // Kiểm tra password
    const passLogin = await bcrypt.compare(reqs.body.password, userLogin.password);
    if(!passLogin) return res.status(400).send("Mật khẩu không hợp lệ")

    const token = jwt.sign({_id: userLogin._id}, 'daylatoken')
    res.header("token", token).send(token);
})
app.post("/register",async (reqs,res)=>{
    console.log(reqs.body)
    const validatRegister = Joi.object({
        name: Joi.string()
                 .min(4)
                 .required(),
        email: Joi.string()
                   .email()
                   .min(6)
                   .required(),
        password: Joi.string()
                   .min(6)
                   .required(),
    })
    const{ error } = validatRegister.validate(reqs.body)
    console.log("-----Lỗi "+error)
    if(error){
        return res.status(400).send(error.details[0].message)
    }
    const salt = await bcrypt.genSalt(10);
    const hashPass = await bcrypt.hash(reqs.body.password,salt)
    const newUser = new User();
    newUser.name = reqs.body.name
    newUser.email = reqs.body.email
    newUser.password = hashPass
    try{
        const User = await newUser.save()
        res.send(User);
    }catch(err){
        res.status(400).send(err);
    }
})
/////Check token
app.post('/', checkToken, (req, res)=>{
    res.send("Chào mừng bạn đến với website của mình. Chúc bạn một ngày vui vẻ")
})

