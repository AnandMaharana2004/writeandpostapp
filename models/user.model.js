const db_name = process.env.DB_NAME
const mongoose = require("mongoose")

mongoose.connect(`mongodb://127.0.0.1:27017/${db_name}`);

const userSchema = mongoose.Schema({
    name : {
        type : String,
        require : true
    },
    email : {
        type : String,
        require : true
    },
    password : {
        type : String,
        require : true
    },
    age : {
        type : Number,
        require : true
    },
    profilepic : {
        type : String,
        default : "default.png"
    },
    posts : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "post"
        }
    ]
})

module.exports = mongoose.model("user",userSchema)