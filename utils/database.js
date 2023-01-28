const mongoose = require('mongoose')

const connection = mongoose.createConnection('mongodb://127.0.0.1:27017/local',{
    useNewUrlParser: true
})

const UserSchema = new mongoose.Schema({
    username:String,
    hash:String,
    salt:String
})

const User = connection.model('User',UserSchema)

module.exports = User