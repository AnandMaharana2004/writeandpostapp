require("dotenv").config();
const express = require("express")
const app = express()
const cookieParser = require("cookie-parser")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const path = require("path")

const userModel = require("./models/user.model")
const postModel = require("./models/post.model");
const { render } = require("ejs");

const port = process.env.port
const secret = process.env.secret

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
    let user = await userModel.findOne({email : req.usercookie.email}).populate("posts")
    res.render("profile", {user})
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
                let token = jwt.sign({email, userid : oldUser._id}, `${secret}`)
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
            let token = jwt.sign({email, userid : user._id}, `${secret}`)
            res.cookie("token",token)
            res.redirect("/profile")
        })
    })
})

app.get('/logout',function(req, res){
    res.cookie("token", "")
    res.redirect("/")
})

app.post('/post', cheakLogedin ,async function(req, res){
    let {content } = req.body
    let user = await userModel.findOne({email : req.usercookie.email})
    let post = await postModel.create({
        user : user._id,
        content 
    })
    user.posts.push(post._id)
    await user.save()
    res.redirect("/profile")

})

app.get('/edit/:id', cheakLogedin ,async function(req, res){
    let post =  await postModel.findOne({_id : req.params.id}).populate("user")
    res.render("edit", {post})
 })

 app.post('/updatePost/:id', cheakLogedin, async function(req, res){
    let updatedPost = await postModel.findOneAndUpdate({_id : req.params.id}, {content : req.body.content})
    res.redirect("/profile")
 })

app.get('/like/:id',cheakLogedin,async function(req, res){
    let post = await postModel.findOne({_id : req.params.id})

    if(post.likes.indexOf(req.usercookie.userid) === -1){
        post.likes.push(req.usercookie.userid)
    }
    else {
        post.likes.splice(post.likes.indexOf(req.usercookie.userid),1);
    }
    await post.save()
    res.redirect("/profile")
    // console.log(post.likes)
})

function cheakLogedin(req, res, next){
    let token = req.cookies.token
    if(token === ""){
        res.redirect("/")
    }
    else{
        let data = jwt.verify(token, `${secret}`)
        req.usercookie = data 
        next()
    }
}

app.listen(`${port}`)
