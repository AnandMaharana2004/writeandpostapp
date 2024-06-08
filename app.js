const express = require("express")
const app = express()
const cookieParser = require("cookie-parser")
const jwt = require("jsonwebtoken")
const path = require("path")

app.use(express.json())
app.use(express.urlencoded({extended : true}))
app.use(express.static(path.join(__dirname, "public")))
app.use(cookieParser())

app.set("view engine", "ejs")

app.get('/',function(req, res){
    res.render("index")
})
app.get('/create',function(req, res){
    res.render("create")
})
app.get('/profile',function(req, res){
    res.render("profile")
})

app.listen("3000")