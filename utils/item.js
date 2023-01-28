const mongoose = require('mongoose')

const Schema = mongoose.Schema
const itemSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    imgUrl:{
        type:String,
        required:false
    },
    qty:{
        type:Number,
        required:true
    },
    description:{
        type:String,
        required:false
    }
})

const Item = mongoose.model('Item',itemSchema)

exports.errorHandler = (err,req,res,next)=>{
    if(err){
        res.redirect('/')
        console.log(err)
        next()
    }
}

module.exports = Item
