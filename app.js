const express = require("express")
const app = express()
const cookieParser = require("cookie-parser")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const path = require("path")

const userModel = require("./models/user.model")
const postModel = require("./models/post.model")

app.use(express.json())
app.use(express.urlencoded({extended : true}))
app.use(express.static(path.join(__dirname, "public")))
app.use(cookieParser())

app.set("view engine", "ejs")

app.get('/' ,function(req, res){
    res.render("index")
})
app.get('/create',function(req, res){
    res.render("create")
})
app.get('/profile', cheakLogedin , async function(req, res){
    res.render("profile")
    // res.send(req.usercookie)
})

app.post('/login' ,async function(req, res){
    let {email, password} = req.body
    let oldUser = await userModel.findOne({email})
    if(!oldUser){
        res.send("something went wrong")
        console.log("email encorrect")
    }
    else{
        bcrypt.compare(password , oldUser.password,function(err, result){
            if(result){
                let token = jwt.sign({email, userid : oldUser._id}, "asss")
                res.cookie("token",token)
                res.redirect("profile")
            }
            else {
                res.send("something went wrong")
            }
        })
    }
})

app.post('/create', function(req, res){
    let {name, email, password, age} = req.body
    bcrypt.genSalt(10,function(err, salt){
        bcrypt.hash(password,salt ,async function(err,hash){
            let user = await userModel.create({
                email,
                password:hash,
                name,
                age
            })
            let token = jwt.sign({email, userid : user._id}, "asss")
            res.cookie("token",token)
            res.redirect("profile")
        })
    })
})

app.get('/logout',function(req, res){
    res.cookie("token", "")
    res.redirect("/")
})

function cheakLogedin(req, res, next){
    let token = req.cookies.token
    if(token === ""){
        res.redirect("/")
    }
    else{
        let data = jwt.verify(token, "asss")
        req.usercookie = data 
        next()
    }
}


app.listen("3000")